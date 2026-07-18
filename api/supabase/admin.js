const { decodeSession, parseCookies, readBody, sendJson } = require('../_utils');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function configured() { return Boolean(SUPABASE_URL && SERVICE_KEY); }
function isAdmin(login) { return ['snowoo-2z', 'snowoo'].includes(String(login || '').toLowerCase()); }

function headers(extra = {}) {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

async function sb(path, options = {}) {
  if (!configured()) throw new Error('Supabase is not configured');
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: { ...headers(options.headers || {}) }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || `Supabase error ${response.status}`);
  return data;
}

async function requireAdmin(req) {
  const session = decodeSession(parseCookies(req).pixnaria_session);
  if (!session?.github || !isAdmin(session.github.login)) throw new Error('Admin access required');
  let rows = await sb(`/profiles?github_id=eq.${encodeURIComponent(String(session.github.id))}&select=*`);
  if (rows[0]) return { session, profile: rows[0] };
  rows = await sb('/profiles?select=*', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      github_id: String(session.github.id),
      github_username: session.github.login,
      display_name: session.github.login,
      bio: 'Creator of Pixnaria',
      role: 'creator',
      badges: ['Creator', 'Admin']
    })
  });
  return { session, profile: rows[0] };
}

function byId(rows) {
  return Object.fromEntries((rows || []).map((row) => [row.id, row]));
}

async function dashboard() {
  const [profiles, reports, bans, projects, news] = await Promise.all([
    sb('/profiles?select=*&order=joined_at.desc&limit=200'),
    sb('/reports?select=*&order=created_at.desc&limit=200'),
    sb('/bans?select=*&active=eq.true&order=starts_at.desc&limit=200'),
    sb('/projects?select=*&order=updated_at.desc&limit=200'),
    sb('/news?select=*&order=created_at.desc&limit=50')
  ]);
  const profilesById = byId(profiles);
  const projectsById = byId(projects);
  const bansByUser = Object.fromEntries((bans || []).map((ban) => [ban.user_id, ban]));

  return {
    profiles,
    reports: reports.map((report) => ({
      ...report,
      reporter_username: profilesById[report.reporter_id]?.github_username || 'Unknown',
      resolver_username: profilesById[report.resolved_by]?.github_username || null,
      target_project: projectsById[report.target_id] || null
    })),
    bans,
    users: profiles.map((profile) => ({ ...profile, active_ban: bansByUser[profile.id] || null })),
    projects,
    news,
    stats: {
      openReports: reports.filter((r) => r.status === 'open').length,
      users: profiles.length,
      moderators: profiles.filter((p) => ['moderator', 'admin', 'creator'].includes(p.role)).length,
      featured: projects.filter((p) => p.featured).length
    }
  };
}

async function findProfile(identifier) {
  if (!identifier) return null;
  let rows = await sb(`/profiles?id=eq.${encodeURIComponent(identifier)}&select=*`);
  if (rows[0]) return rows[0];
  rows = await sb(`/profiles?github_username=eq.${encodeURIComponent(identifier)}&select=*`);
  return rows[0] || null;
}

module.exports = async function handler(req, res) {
  if (!configured()) return sendJson(res, 200, { configured: false, error: 'Supabase is not configured' });

  try {
    const { profile: adminProfile } = await requireAdmin(req);

    if (req.method === 'GET') {
      return sendJson(res, 200, { configured: true, ...(await dashboard()) });
    }

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
    const body = JSON.parse((await readBody(req)) || '{}');

    if (body.action === 'resolve_report' || body.action === 'reject_report') {
      const status = body.action === 'resolve_report' ? 'resolved' : 'rejected';
      await sb(`/reports?id=eq.${encodeURIComponent(body.reportId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, resolved_at: new Date().toISOString(), resolved_by: adminProfile.id })
      });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'ban') {
      const user = await findProfile(body.userId || body.username);
      if (!user) throw new Error('User not found');
      if (isAdmin(user.github_username)) throw new Error('Cannot ban Pixnaria creator');
      await sb('/bans', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          type: body.type === 'permanent' ? 'permanent' : 'temporary',
          reason: String(body.reason || 'Rule violation').slice(0, 240),
          ends_at: body.type === 'permanent' ? null : (body.endsAt || new Date(Date.now() + 7 * 86400000).toISOString()),
          created_by: adminProfile.id,
          active: true
        })
      });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'unban') {
      const user = await findProfile(body.userId || body.username);
      if (!user) throw new Error('User not found');
      await sb(`/bans?user_id=eq.${user.id}&active=eq.true`, { method: 'PATCH', body: JSON.stringify({ active: false }) });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'set_role') {
      const user = await findProfile(body.userId || body.username);
      if (!user) throw new Error('User not found');
      const role = ['user', 'moderator', 'admin', 'creator'].includes(body.role) ? body.role : 'user';
      const badges = role === 'moderator' ? ['Moderator'] : role === 'user' ? [] : user.badges;
      await sb(`/profiles?id=eq.${user.id}`, { method: 'PATCH', body: JSON.stringify({ role, badges, updated_at: new Date().toISOString() }) });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'feature_project') {
      await sb(`/projects?id=eq.${encodeURIComponent(body.projectId)}`, { method: 'PATCH', body: JSON.stringify({ featured: Boolean(body.featured), updated_at: new Date().toISOString() }) });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'create_news') {
      await sb('/news', {
        method: 'POST',
        body: JSON.stringify({
          title_en: body.titleEn || body.title || 'Pixnaria update',
          title_fr: body.titleFr || body.title || 'Actualité Pixnaria',
          content_en: body.contentEn || body.content || '',
          content_fr: body.contentFr || body.content || '',
          category: body.category || 'announcement',
          published: Boolean(body.published),
          pinned: Boolean(body.pinned),
          important: Boolean(body.important),
          created_by: adminProfile.id
        })
      });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    return sendJson(res, 400, { error: 'Unknown action' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
