const { decodeSession, parseCookies, sendJson } = require('../_utils');

function headers(token) {
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Pixnaria'
  };
}

async function github(path, token) {
  const response = await fetch(`https://api.github.com${path}`, { headers: headers(token) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub API error ${response.status}`);
  return data;
}

function decodeBase64Content(file) {
  if (!file?.content) return null;
  return Buffer.from(String(file.content).replace(/\n/g, ''), 'base64').toString('utf8');
}

async function getFile(owner, repo, filePath, token) {
  try {
    const file = await github(`/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, token);
    return { path: filePath, text: decodeBase64Content(file), sha: file.sha, html_url: file.html_url };
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const full = url.searchParams.get('repo') || '';
  const [owner, repo] = full.split('/');
  if (!owner || !repo) return sendJson(res, 400, { error: 'Missing repo parameter. Use ?repo=owner/name' });

  const session = decodeSession(parseCookies(req).pixnaria_session);
  const token = session?.githubToken || null;

  try {
    const repoData = await github(`/repos/${owner}/${repo}`, token);
    const [projectFile, sceneFile, settingsFile, readmeFile] = await Promise.all([
      getFile(owner, repo, 'pixnaria.project.json', token),
      getFile(owner, repo, 'pixnaria.scene.json', token),
      getFile(owner, repo, 'pixnaria.settings.json', token),
      getFile(owner, repo, 'README.md', token)
    ]);

    const parseJson = (file) => {
      if (!file?.text) return null;
      try { return JSON.parse(file.text); } catch { return null; }
    };

    return sendJson(res, 200, {
      repo: {
        owner,
        name: repo,
        full_name: repoData.full_name,
        html_url: repoData.html_url,
        description: repoData.description,
        updated_at: repoData.updated_at,
        stargazers_count: repoData.stargazers_count,
        forks_count: repoData.forks_count,
        open_issues_count: repoData.open_issues_count
      },
      pixnaria: {
        project: parseJson(projectFile),
        scene: parseJson(sceneFile),
        settings: parseJson(settingsFile),
        readme: readmeFile?.text || ''
      },
      files: {
        project: Boolean(projectFile),
        scene: Boolean(sceneFile),
        settings: Boolean(settingsFile),
        readme: Boolean(readmeFile)
      }
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
