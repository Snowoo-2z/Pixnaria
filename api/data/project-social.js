const { readBody, sendJson } = require('../_utils');
const store = require('../_store');
const { gitdb } = store;

function splitRepo(full) {
  const [owner, repo] = String(full || '').split('/');
  if (!owner || !repo) throw new Error('Invalid repo');
  return { owner, repo };
}

async function socialPayload(owner, repo, viewerProfile) {
  const project = await store.findProject(owner, repo);
  if (!project) return { configured: true, project: null, likes: 0, favorites: 0, comments: [], viewerLiked: false, viewerFavorited: false };

  const [comments, { rows: likeRows }, { rows: favRows }] = await Promise.all([
    store.listComments(project.id, 30),
    gitdb.readTable('project_likes'),
    gitdb.readTable('project_favorites')
  ]);

  const userIds = [...new Set(comments.map((comment) => comment.user_id).filter(Boolean))];
  const profiles = userIds.length ? await store.listAllProfilesById(userIds) : [];
  const profileById = Object.fromEntries(profiles.map((profile) => [profile.id, profile]));

  return {
    configured: true,
    project,
    likes: project.likes_count || 0,
    favorites: project.favorites_count || 0,
    views: project.views_count || 0,
    viewerLiked: viewerProfile ? likeRows.some((r) => r.project_id === project.id && r.user_id === viewerProfile.id) : false,
    viewerFavorited: viewerProfile ? favRows.some((r) => r.project_id === project.id && r.user_id === viewerProfile.id) : false,
    comments: comments.map((comment) => ({
      ...comment,
      author: profileById[comment.user_id]?.display_name || profileById[comment.user_id]?.github_username || 'Pixnaria user'
    }))
  };
}

module.exports = async function handler(req, res) {
  if (!gitdb.configured()) return sendJson(res, 200, { configured: false, project: null, likes: 0, favorites: 0, comments: [] });

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const method = req.method;

    if (method === 'GET') {
      const { owner, repo } = splitRepo(url.searchParams.get('repo'));
      let viewer = null;
      try { viewer = await store.requireProfile(req); } catch {}
      return sendJson(res, 200, await socialPayload(owner, repo, viewer));
    }

    if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
    const profile = await store.requireProfile(req);
    const body = JSON.parse((await readBody(req)) || '{}');
    const { owner, repo } = splitRepo(body.repo);
    const project = await store.getOrCreateProject({ owner, repo, ownerId: null, title: body.title, description: body.description || '' });

    if (body.action === 'like') {
      const { count } = await store.toggleReaction('project_likes', project.id, profile.id);
      await store.patchProject(project.id, { likes_count: count });
      return sendJson(res, 200, await socialPayload(owner, repo, profile));
    }

    if (body.action === 'favorite') {
      const { count } = await store.toggleReaction('project_favorites', project.id, profile.id);
      await store.patchProject(project.id, { favorites_count: count });
      return sendJson(res, 200, await socialPayload(owner, repo, profile));
    }

    if (body.action === 'comment') {
      const content = String(body.content || '').trim();
      if (!/^[A-Za-zÀ-ÿ0-9 _.,!?'-]{1,240}$/.test(content)) throw new Error('Invalid comment content');
      await store.addComment({ projectId: project.id, userId: profile.id, content });
      return sendJson(res, 200, await socialPayload(owner, repo, profile));
    }

    if (body.action === 'delete_comment') {
      await store.deleteComment(body.commentId, profile);
      return sendJson(res, 200, await socialPayload(owner, repo, profile));
    }

    if (body.action === 'report') {
      await store.createReport({ reporterId: profile.id, targetType: 'project', targetId: `${owner}/${repo}`, reason: body.reason || 'Project report' });
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 400, { error: 'Unknown action' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
