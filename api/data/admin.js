const { readBody, sendJson } = require('../_utils');
const store = require('../_store');
const { gitdb } = store;

async function dashboard() {
  const [{ rows: profiles }, { rows: reports }, { rows: bans }, { rows: projects }, news] = await Promise.all([
    gitdb.readTable('profiles'),
    gitdb.readTable('reports'),
    gitdb.readTable('bans'),
    gitdb.readTable('projects'),
    store.listNews({ onlyPublished: false })
  ]);

  const profilesById = Object.fromEntries(profiles.map((row) => [row.id, row]));
  const projectsById = Object.fromEntries(projects.map((row) => [row.id, row]));
  const activeBans = bans.filter((ban) => ban.active);
  const bansByUser = Object.fromEntries(activeBans.map((ban) => [ban.user_id, ban]));

  const sortedProfiles = [...profiles].sort((a, b) => new Date(b.joined_at) - new Date(a.joined_at));
  const sortedReports = [...reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const sortedProjects = [...projects].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  return {
    profiles: sortedProfiles,
    reports: sortedReports.map((report) => ({
      ...report,
      reporter_username: profilesById[report.reporter_id]?.github_username || 'Unknown',
      resolver_username: profilesById[report.resolved_by]?.github_username || null,
      target_project: projectsById[report.target_id] || null
    })),
    bans: activeBans,
    users: sortedProfiles.map((profile) => ({ ...profile, active_ban: bansByUser[profile.id] || null })),
    projects: sortedProjects,
    news: news.slice(0, 50),
    stats: {
      openReports: reports.filter((r) => r.status === 'open').length,
      users: profiles.length,
      moderators: profiles.filter((p) => ['moderator', 'admin', 'creator'].includes(p.role)).length,
      featured: projects.filter((p) => p.featured).length
    }
  };
}

module.exports = async function handler(req, res) {
  if (!gitdb.configured()) return sendJson(res, 200, { configured: false, error: 'Pixnaria data store is not configured.' });

  try {
    const adminProfile = await store.requireAdminProfile(req);

    if (req.method === 'GET') {
      return sendJson(res, 200, { configured: true, ...(await dashboard()) });
    }

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
    const body = JSON.parse((await readBody(req)) || '{}');

    if (body.action === 'resolve_report' || body.action === 'reject_report') {
      const status = body.action === 'resolve_report' ? 'resolved' : 'rejected';
      await store.resolveReport(body.reportId, status, adminProfile.id);
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'ban') {
      const user = body.userId ? await store.findProfileById(body.userId) : await store.findProfileByUsername(body.username);
      if (!user) throw new Error('User not found');
      if (store.isAdmin(user.github_username)) throw new Error('Cannot ban Pixnaria creator');
      await store.createBan({ userId: user.id, type: body.type, reason: body.reason, endsAt: body.endsAt, createdBy: adminProfile.id });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'unban') {
      const user = body.userId ? await store.findProfileById(body.userId) : await store.findProfileByUsername(body.username);
      if (!user) throw new Error('User not found');
      await store.liftBan(user.id);
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'set_role') {
      const user = body.userId ? await store.findProfileById(body.userId) : await store.findProfileByUsername(body.username);
      if (!user) throw new Error('User not found');
      const role = ['user', 'moderator', 'admin', 'creator'].includes(body.role) ? body.role : 'user';
      const badges = role === 'moderator' ? ['Moderator'] : role === 'user' ? [] : user.badges;
      await store.updateProfile(user.id, { role, badges });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'feature_project') {
      await store.patchProject(body.projectId, { featured: Boolean(body.featured) });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    if (body.action === 'create_news') {
      await store.createNews({ ...body, createdBy: adminProfile.id });
      return sendJson(res, 200, { ok: true, ...(await dashboard()) });
    }

    return sendJson(res, 400, { error: 'Unknown action' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
