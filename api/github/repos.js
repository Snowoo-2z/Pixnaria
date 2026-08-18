const { decodeSession, parseCookies, readBody, sendJson } = require('../_utils');
const store = require('../_store');
const { gitdb } = store;

async function ensureDataProfile(session) {
  if (!gitdb.configured() || !session?.github) return null;
  return store.getOrCreateProfile(session);
}

async function indexProjectInDataStore(session, repo, title, description) {
  if (!gitdb.configured()) return;
  const profile = await ensureDataProfile(session);
  await store.upsertProject({
    owner: session.github.login,
    repo: repo.name,
    ownerId: profile?.id || null,
    title,
    description
  });
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
      const pixnariaRepos = repos.filter((repo) => repo.name.startsWith('pixnaria-'));
      await Promise.allSettled(pixnariaRepos.map((repo) => indexProjectInDataStore(
        session,
        repo,
        repo.name.replace(/^pixnaria-/i, '').replace(/-/g, ' ') || repo.name,
        repo.description || 'Pixnaria project.'
      )));
      return sendJson(res, 200, {
        repos: pixnariaRepos.map((repo) => ({ name: repo.name, full_name: repo.full_name, html_url: repo.html_url, updated_at: repo.updated_at, description: repo.description }))
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
      await indexProjectInDataStore(session, repo, title, description);

      return sendJson(res, 200, { repo: { name: repo.name, full_name: repo.full_name, html_url: repo.html_url, description: repo.description } });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
