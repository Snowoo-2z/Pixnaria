const { decodeSession, parseCookies, readBody, sendJson } = require('../_utils');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function configured() { return Boolean(SUPABASE_URL && SERVICE_KEY); }

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
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { ...options, headers: { ...headers(options.headers || {}) } });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || `Supabase error ${response.status}`);
  return data;
}

function isAdmin(login) { return ['snowoo-2z', 'snowoo'].includes(String(login || '').toLowerCase()); }

async function profileFromSession(req) {
  const session = decodeSession(parseCookies(req).pixnaria_session);
  if (!session?.github) throw new Error('GitHub login required');
  const githubId = String(session.github.id);
  let rows = await sb(`/profiles?github_id=eq.${encodeURIComponent(githubId)}&select=*`);
  if (rows[0]) return rows[0];
  const admin = isAdmin(session.github.login);
  rows = await sb('/profiles?select=*', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      github_id: githubId,
      github_username: session.github.login,
      display_name: session.github.login,
      bio: admin ? 'Creator of Pixnaria' : '',
      role: admin ? 'creator' : 'user',
      badges: admin ? ['Creator', 'Admin'] : []
    })
  });
  return rows[0];
}

async function studioPayload(id, viewerProfile = null) {
  const rows = await sb(`/studios?id=eq.${encodeURIComponent(id)}&select=*`);
  const studio = rows[0];
  if (!studio) throw new Error('Studio not found');

  const [members, studioProjects] = await Promise.all([
    sb(`/studio_members?studio_id=eq.${studio.id}&select=*&order=joined_at.asc`),
    sb(`/studio_projects?studio_id=eq.${studio.id}&select=*&order=added_at.desc`)
  ]);

  const profileIds = [...new Set(members.map((m) => m.user_id).filter(Boolean))];
  const projectIds = [...new Set(studioProjects.map((p) => p.project_id).filter(Boolean))];

  const profiles = profileIds.length ? await sb(`/profiles?id=in.(${profileIds.map(encodeURIComponent).join(',')})&select=id,github_username,display_name,avatar_url,role,badges`) : [];
  const projects = projectIds.length ? await sb(`/projects?id=in.(${projectIds.map(encodeURIComponent).join(',')})&select=*`) : [];
  const profileById = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));

  const viewerMember = viewerProfile ? members.find((m) => m.user_id === viewerProfile.id) : null;

  return {
    studio,
    members: members.map((member) => ({ ...member, profile: profileById[member.user_id] || null })),
    projects: studioProjects.map((entry) => {
      const p = projectById[entry.project_id];
      if (!p) return null;
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        author: p.github_owner,
        likes: p.likes_count || 0,
        favorites: p.favorites_count || 0,
        views: p.views_count || 0,
        featured: p.featured,
        githubRepo: `${p.github_owner}/${p.github_repo}`,
        addedAt: entry.added_at
      };
    }).filter(Boolean),
    permissions: {
      joined: Boolean(viewerMember),
      role: viewerMember?.role || null,
      canManage: ['owner', 'manager'].includes(viewerMember?.role) || (viewerProfile && viewerProfile.id === studio.owner_id)
    }
  };
}

async function listStudios() {
  const studios = await sb('/studios?select=*&order=updated_at.desc&limit=60');
  const ownerIds = [...new Set(studios.map((s) => s.owner_id).filter(Boolean))];
  const owners = ownerIds.length ? await sb(`/profiles?id=in.(${ownerIds.map(encodeURIComponent).join(',')})&select=id,github_username,display_name,avatar_url`) : [];
  const ownerById = Object.fromEntries(owners.map((p) => [p.id, p]));

  const result = [];
  for (const studio of studios) {
    const members = await sb(`/studio_members?studio_id=eq.${studio.id}&select=studio_id`);
    const projects = await sb(`/studio_projects?studio_id=eq.${studio.id}&select=studio_id`);
    result.push({
      ...studio,
      owner: ownerById[studio.owner_id] || null,
      members_count: members.length,
      projects_count: projects.length
    });
  }
  return result;
}

module.exports = async function handler(req, res) {
  if (!configured()) return sendJson(res, 200, { configured: false, studios: [], message: 'Supabase is not configured' });

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);

    if (req.method === 'GET') {
      const id = url.searchParams.get('id');
      let viewer = null;
      try { viewer = await profileFromSession(req); } catch {}
      if (id) return sendJson(res, 200, { configured: true, ...(await studioPayload(id, viewer)) });
      return sendJson(res, 200, { configured: true, studios: await listStudios() });
    }

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
    const profile = await profileFromSession(req);
    const body = JSON.parse((await readBody(req)) || '{}');

    if (body.action === 'create') {
      const name = String(body.name || '').trim().slice(0, 60);
      if (!name) throw new Error('Studio name required');
      const rows = await sb('/studios?select=*', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ owner_id: profile.id, name, description: String(body.description || '').slice(0, 500) })
      });
      const studio = rows[0];
      await sb('/studio_members', { method: 'POST', body: JSON.stringify({ studio_id: studio.id, user_id: profile.id, role: 'owner' }) });
      return sendJson(res, 200, { ok: true, studio, ...(await studioPayload(studio.id, profile)) });
    }

    if (body.action === 'join') {
      await sb('/studio_members', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify({ studio_id: body.studioId, user_id: profile.id, role: 'member' }) });
      return sendJson(res, 200, { ok: true, ...(await studioPayload(body.studioId, profile)) });
    }

    if (body.action === 'leave') {
      await sb(`/studio_members?studio_id=eq.${body.studioId}&user_id=eq.${profile.id}`, { method: 'DELETE' });
      return sendJson(res, 200, { ok: true, ...(await studioPayload(body.studioId, profile)) });
    }

    if (body.action === 'add_project') {
      const payload = await studioPayload(body.studioId, profile);
      if (!payload.permissions.canManage) throw new Error('You cannot manage this studio');
      const [owner, repo] = String(body.repo || '').split('/');
      if (!owner || !repo) throw new Error('Invalid project source');
      const projectRows = await sb(`/projects?github_owner=eq.${encodeURIComponent(owner)}&github_repo=eq.${encodeURIComponent(repo)}&select=*`);
      const project = projectRows[0];
      if (!project) throw new Error('Project not indexed yet');
      await sb('/studio_projects', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify({ studio_id: body.studioId, project_id: project.id }) });
      return sendJson(res, 200, { ok: true, ...(await studioPayload(body.studioId, profile)) });
    }

    return sendJson(res, 400, { error: 'Unknown action' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
