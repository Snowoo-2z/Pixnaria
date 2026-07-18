const { decodeSession, parseCookies, readBody, sendJson } = require('../_utils');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function supabase(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || `Supabase error ${response.status}`);
  return data;
}

async function ensureSupabaseProfile(session) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !session?.github) return null;
  const githubId = String(session.github.id);
  let rows = await supabase(`/profiles?github_id=eq.${encodeURIComponent(githubId)}&select=*`);
  if (rows?.[0]) return rows[0];
  const isAdmin = ['snowoo-2z', 'snowoo'].includes(String(session.github.login).toLowerCase());
  rows = await supabase('/profiles?select=*', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      github_id: githubId,
      github_username: session.github.login,
      display_name: session.github.login,
      bio: isAdmin ? 'Creator of Pixnaria' : '',
      role: isAdmin ? 'creator' : 'user',
      badges: isAdmin ? ['Creator', 'Admin'] : []
    })
  });
  return rows?.[0] || null;
}

async function indexProjectInSupabase(session, repo, title, description) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;
  const profile = await ensureSupabaseProfile(session);
  const existing = await supabase(`/projects?github_owner=eq.${encodeURIComponent(session.github.login)}&github_repo=eq.${encodeURIComponent(repo.name)}&select=*`);
  const payload = {
    owner_id: profile?.id || null,
    github_owner: session.github.login,
    github_repo: repo.name,
    title,
    description,
    visibility: 'public',
    updated_at: new Date().toISOString()
  };
  if (existing?.[0]) {
    await supabase(`/projects?id=eq.${existing[0].id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  } else {
    await supabase('/projects', { method: 'POST', body: JSON.stringify(payload) });
  }
}


function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Pixnaria'
  };
}

function slugify(value) {
  return String(value || 'pixnaria-project')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'pixnaria-project';
}

async function github(token, path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: { ...githubHeaders(token), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub API error ${response.status}`);
  return data;
}

async function putFile(token, owner, repo, filePath, content, message) {
  return github(token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: Buffer.from(content).toString('base64') })
  });
}

function starterProject(title, owner) {
  return {
    project: JSON.stringify({ name: title, author: owner, engine: 'Pixnaria Custom 2D Engine', formatVersion: 1 }, null, 2),
    scene: JSON.stringify({ rootNodeId: 'scene', nodes: [{ id: 'scene', name: 'Scene', type: 'Node2D', parent: null, props: { x: 0, y: 0 } }] }, null, 2),
    settings: JSON.stringify({ dimensions: { width: 1280, height: 720 }, background: '#090712', physics: { gravity: 1350, jumpForce: 560 } }, null, 2),
    readme: `# ${title}\n\nCreated with Pixnaria.\n\nOpen source Pixnaria project repository.\n`
  };
}

module.exports = async function handler(req, res) {
  const cookies = parseCookies(req);
  const session = decodeSession(cookies.pixnaria_session);
  if (!session?.githubToken || !session?.github) return sendJson(res, 401, { error: 'GitHub login required' });

  try {
    if (req.method === 'GET') {
      const repos = await github(session.githubToken, '/user/repos?visibility=public&affiliation=owner&sort=updated&per_page=100');
      return sendJson(res, 200, {
        repos: repos
          .filter((repo) => repo.name.startsWith('pixnaria-'))
          .map((repo) => ({ name: repo.name, full_name: repo.full_name, html_url: repo.html_url, updated_at: repo.updated_at, description: repo.description }))
      });
    }

    if (req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const title = String(body.title || 'Pixnaria Project').trim();
      const repoName = slugify(body.repoName || `pixnaria-${title}`);
      const description = String(body.description || `Pixnaria project: ${title}`).slice(0, 240);

      const repo = await github(session.githubToken, '/user/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: repoName, description, private: false, auto_init: true })
      });

      const files = starterProject(title, session.github.login);
      await putFile(session.githubToken, session.github.login, repo.name, 'pixnaria.project.json', files.project, 'Add Pixnaria project metadata');
      await putFile(session.githubToken, session.github.login, repo.name, 'pixnaria.scene.json', files.scene, 'Add Pixnaria scene');
      await putFile(session.githubToken, session.github.login, repo.name, 'pixnaria.settings.json', files.settings, 'Add Pixnaria settings');
      await putFile(session.githubToken, session.github.login, repo.name, 'README.md', files.readme, 'Update README for Pixnaria');
      await indexProjectInSupabase(session, repo, title, description);

      return sendJson(res, 200, { repo: { name: repo.name, full_name: repo.full_name, html_url: repo.html_url, description: repo.description } });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
