const { decodeSession, parseCookies, readBody, sendJson } = require('../_utils');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function configured() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

function sbHeaders(extra = {}) {
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
    headers: { ...sbHeaders(options.headers || {}) }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || `Supabase error ${response.status}`);
  return data;
}

function splitRepo(full) {
  const [owner, repo] = String(full || '').split('/');
  if (!owner || !repo) throw new Error('Invalid repo');
  return { owner, repo };
}

async function getProfile(session) {
  if (!session?.github) throw new Error('GitHub login required');
  const githubId = String(session.github.id);
  let rows = await sb(`/profiles?github_id=eq.${encodeURIComponent(githubId)}&select=*`);
  if (rows[0]) return rows[0];

  const isAdmin = ['snowoo-2z', 'snowoo'].includes(String(session.github.login).toLowerCase());
  rows = await sb('/profiles?select=*', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      github_id: githubId,
      github_username: session.github.login,
      display_name: session.github.login,
      bio: '',
      role: isAdmin ? 'creator' : 'user',
      badges: isAdmin ? ['Creator', 'Admin'] : []
    })
  });
  return rows[0];
}

async function getOrCreateProject({ owner, repo, title = null, description = '' }) {
  let rows = await sb(`/projects?github_owner=eq.${encodeURIComponent(owner)}&github_repo=eq.${encodeURIComponent(repo)}&select=*`);
  if (rows[0]) return rows[0];
  rows = await sb('/projects?select=*', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      github_owner: owner,
      github_repo: repo,
      title: title || repo.replace(/^pixnaria-/i, '').replace(/-/g, ' ') || repo,
      description,
      visibility: 'public'
    })
  });
  return rows[0];
}

async function countRows(table, projectId) {
  const rows = await sb(`/${table}?project_id=eq.${projectId}&select=project_id`);
  return rows.length;
}

async function socialPayload(owner, repo) {
  const projectRows = await sb(`/projects?github_owner=eq.${encodeURIComponent(owner)}&github_repo=eq.${encodeURIComponent(repo)}&select=*`);
  const project = projectRows[0] || null;
  if (!project) return { configured: true, project: null, likes: 0, favorites: 0, comments: [] };
  const comments = await sb(`/project_comments?project_id=eq.${project.id}&deleted=eq.false&select=id,content,created_at,user_id&order=created_at.desc&limit=30`);
  const userIds = [...new Set(comments.map((comment) => comment.user_id).filter(Boolean))];
  let profiles = [];
  if (userIds.length) {
    profiles = await sb(`/profiles?id=in.(${userIds.map(encodeURIComponent).join(',')})&select=id,github_username,display_name,avatar_url`);
  }
  const profileById = Object.fromEntries(profiles.map((profile) => [profile.id, profile]));
  return {
    configured: true,
    project,
    likes: project.likes_count || 0,
    favorites: project.favorites_count || 0,
    views: project.views_count || 0,
    comments: comments.map((comment) => ({ ...comment, author: profileById[comment.user_id]?.display_name || profileById[comment.user_id]?.github_username || 'Pixnaria user' }))
  };
}

module.exports = async function handler(req, res) {
  if (!configured()) return sendJson(res, 200, { configured: false, project: null, likes: 0, favorites: 0, comments: [] });

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const method = req.method;

    if (method === 'GET') {
      const { owner, repo } = splitRepo(url.searchParams.get('repo'));
      return sendJson(res, 200, await socialPayload(owner, repo));
    }

    if (method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
    const session = decodeSession(parseCookies(req).pixnaria_session);
    const profile = await getProfile(session);
    const body = JSON.parse((await readBody(req)) || '{}');
    const { owner, repo } = splitRepo(body.repo);
    const project = await getOrCreateProject({ owner, repo, title: body.title, description: body.description || '' });

    if (body.action === 'like') {
      await sb('/project_likes', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify({ project_id: project.id, user_id: profile.id }) });
      const count = await countRows('project_likes', project.id);
      await sb(`/projects?id=eq.${project.id}`, { method: 'PATCH', body: JSON.stringify({ likes_count: count, updated_at: new Date().toISOString() }) });
      return sendJson(res, 200, await socialPayload(owner, repo));
    }

    if (body.action === 'favorite') {
      await sb('/project_favorites', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates' }, body: JSON.stringify({ project_id: project.id, user_id: profile.id }) });
      const count = await countRows('project_favorites', project.id);
      await sb(`/projects?id=eq.${project.id}`, { method: 'PATCH', body: JSON.stringify({ favorites_count: count, updated_at: new Date().toISOString() }) });
      return sendJson(res, 200, await socialPayload(owner, repo));
    }

    if (body.action === 'comment') {
      const content = String(body.content || '').trim();
      if (!/^[A-Za-zÀ-ÿ0-9 _.,!?'-]{1,240}$/.test(content)) throw new Error('Invalid comment content');
      await sb('/project_comments', { method: 'POST', body: JSON.stringify({ project_id: project.id, user_id: profile.id, content }) });
      return sendJson(res, 200, await socialPayload(owner, repo));
    }

    if (body.action === 'report') {
      await sb('/reports', { method: 'POST', body: JSON.stringify({ reporter_id: profile.id, target_type: 'project', target_id: `${owner}/${repo}`, reason: String(body.reason || 'Project report').slice(0, 240) }) });
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 400, { error: 'Unknown action' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
