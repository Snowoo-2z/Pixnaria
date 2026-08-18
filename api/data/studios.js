const { readBody, sendJson } = require('../_utils');
const store = require('../_store');
const { gitdb } = store;

async function studioPayload(id, viewerProfile = null) {
  const studio = await store.findStudio(id);
  if (!studio) throw new Error('Studio not found');

  const [members, links] = await Promise.all([
    store.studioMembers(studio.id),
    store.studioProjectLinks(studio.id)
  ]);

  const profileIds = [...new Set(members.map((m) => m.user_id).filter(Boolean))];
  const projectIds = [...new Set(links.map((p) => p.project_id).filter(Boolean))];

  const profiles = profileIds.length ? await store.listAllProfilesById(profileIds) : [];
  const { rows: allProjects } = await gitdb.readTable('projects');
  const projectById = Object.fromEntries(allProjects.filter((p) => projectIds.includes(p.id)).map((p) => [p.id, p]));
  const profileById = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const viewerMember = viewerProfile ? members.find((m) => m.user_id === viewerProfile.id) : null;

  return {
    studio,
    members: members.map((member) => ({ ...member, profile: profileById[member.user_id] ? store.profileDto(profileById[member.user_id]) : null })),
    projects: links.map((entry) => {
      const p = projectById[entry.project_id];
      if (!p) return null;
      return { ...store.projectDto(p), addedAt: entry.added_at };
    }).filter(Boolean),
    permissions: {
      joined: Boolean(viewerMember),
      role: viewerMember?.role || null,
      canManage: ['owner', 'manager'].includes(viewerMember?.role) || Boolean(viewerProfile && viewerProfile.id === studio.owner_id)
    }
  };
}

async function listStudios() {
  const studios = await store.listStudioRows();
  const ownerIds = [...new Set(studios.map((s) => s.owner_id).filter(Boolean))];
  const owners = ownerIds.length ? await store.listAllProfilesById(ownerIds) : [];
  const ownerById = Object.fromEntries(owners.map((p) => [p.id, p]));

  const [{ rows: members }, { rows: links }] = await Promise.all([
    gitdb.readTable('studio_members'),
    gitdb.readTable('studio_projects')
  ]);

  return studios
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 60)
    .map((studio) => ({
      ...studio,
      owner: ownerById[studio.owner_id] ? store.profileDto(ownerById[studio.owner_id]) : null,
      members_count: members.filter((m) => m.studio_id === studio.id).length,
      projects_count: links.filter((p) => p.studio_id === studio.id).length
    }));
}

module.exports = async function handler(req, res) {
  if (!gitdb.configured()) return sendJson(res, 200, { configured: false, studios: [], message: 'Pixnaria data store is not configured.' });

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);

    if (req.method === 'GET') {
      const id = url.searchParams.get('id');
      let viewer = null;
      try { viewer = await store.requireProfile(req); } catch {}
      if (id) return sendJson(res, 200, { configured: true, ...(await studioPayload(id, viewer)) });
      return sendJson(res, 200, { configured: true, studios: await listStudios() });
    }

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
    const profile = await store.requireProfile(req);
    const body = JSON.parse((await readBody(req)) || '{}');

    if (body.action === 'create') {
      const name = String(body.name || '').trim().slice(0, 60);
      if (!name) throw new Error('Studio name required');
      const studio = await store.createStudio({ ownerId: profile.id, name, description: String(body.description || '').slice(0, 500) });
      return sendJson(res, 200, { ok: true, studio, ...(await studioPayload(studio.id, profile)) });
    }

    if (body.action === 'join') {
      await store.joinStudio(body.studioId, profile.id);
      return sendJson(res, 200, { ok: true, ...(await studioPayload(body.studioId, profile)) });
    }

    if (body.action === 'leave') {
      await store.leaveStudio(body.studioId, profile.id);
      return sendJson(res, 200, { ok: true, ...(await studioPayload(body.studioId, profile)) });
    }

    if (body.action === 'add_project') {
      const payload = await studioPayload(body.studioId, profile);
      if (!payload.permissions.canManage) throw new Error('You cannot manage this studio');
      const [owner, repo] = String(body.repo || '').split('/');
      if (!owner || !repo) throw new Error('Invalid project source');
      const project = await store.findProject(owner, repo);
      if (!project) throw new Error('Project not indexed yet');
      await store.addProjectToStudio(body.studioId, project.id);
      return sendJson(res, 200, { ok: true, ...(await studioPayload(body.studioId, profile)) });
    }

    return sendJson(res, 400, { error: 'Unknown action' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
