const { decodeSession, parseCookies, readBody, sendJson } = require('../_utils');

function headers(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Pixnaria'
  };
}

async function github(token, path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: { ...headers(token), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub API error ${response.status}`);
  return data;
}

async function getSha(token, owner, repo, filePath) {
  try {
    const file = await github(token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`);
    return file.sha;
  } catch {
    return null;
  }
}

async function putFile(token, owner, repo, filePath, content, message) {
  const sha = await getSha(token, owner, repo, filePath);
  const body = { message, content: Buffer.from(content).toString('base64') };
  if (sha) body.sha = sha;
  return github(token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  const session = decodeSession(parseCookies(req).pixnaria_session);
  if (!session?.githubToken || !session?.github) return sendJson(res, 401, { error: 'GitHub login required' });

  try {
    const body = JSON.parse((await readBody(req)) || '{}');
    const [owner, repo] = String(body.repo || '').split('/');
    if (!owner || !repo) return sendJson(res, 400, { error: 'Invalid repo. Use owner/repo.' });
    if (owner.toLowerCase() !== session.github.login.toLowerCase()) {
      return sendJson(res, 403, { error: 'You can only save to repositories owned by your GitHub account.' });
    }

    const project = body.project;
    if (!project?.scene?.nodes) return sendJson(res, 400, { error: 'Invalid Pixnaria project payload.' });

    const metadata = {
      name: project.metadata?.name || repo.replace(/^pixnaria-/i, ''),
      author: session.github.login,
      engine: 'Pixnaria Custom 2D Engine',
      language: project.metadata?.language || 'Python',
      visibility: 'public',
      formatVersion: project.formatVersion || 1,
      updatedAt: new Date().toISOString()
    };

    const scene = {
      rootNodeId: project.scene.rootNodeId || 'scene',
      selectedNodeId: project.scene.selectedNodeId || project.scene.rootNodeId || 'scene',
      nodes: project.scene.nodes
    };

    const settings = project.settings || {
      dimensions: { width: 1280, height: 720 },
      background: '#090712',
      physics: { gravity: 1350, jumpForce: 560 }
    };

    const readme = `# ${metadata.name}\n\nCreated with Pixnaria.\n\nRepository: ${owner}/${repo}\n\nOpen this project on Pixnaria to edit the scene, nodes and scripts.\n`;

    await putFile(session.githubToken, owner, repo, 'pixnaria.project.json', JSON.stringify(metadata, null, 2), 'Update Pixnaria project metadata');
    await putFile(session.githubToken, owner, repo, 'pixnaria.scene.json', JSON.stringify(scene, null, 2), 'Update Pixnaria scene');
    await putFile(session.githubToken, owner, repo, 'pixnaria.settings.json', JSON.stringify(settings, null, 2), 'Update Pixnaria settings');
    await putFile(session.githubToken, owner, repo, 'README.md', readme, 'Update Pixnaria README');

    if (project.scripts && typeof project.scripts === 'object') {
      for (const [filename, content] of Object.entries(project.scripts)) {
        const safeName = filename.replace(/[^A-Za-z0-9_.-]/g, '_');
        await putFile(session.githubToken, owner, repo, `scripts/${safeName}`, String(content), `Update script ${safeName}`);
      }
    }

    return sendJson(res, 200, { ok: true, repo: `${owner}/${repo}`, updatedAt: metadata.updatedAt });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
