/**
 * Pixnaria "GitDB" — a tiny JSON database that lives entirely inside the
 * Pixnaria GitHub repository (no external database service required).
 *
 * Every "table" (profiles, projects, likes, comments, reports, bans, news,
 * studios, wall messages...) is stored as a JSON array in a file under
 * `data/<table>.json`, committed to a dedicated branch (by default
 * `pixnaria-data`) so day-to-day writes (likes, comments, wall posts...)
 * never touch `main` or trigger a redeploy.
 *
 * Writes use the GitHub Contents API with optimistic concurrency: we read
 * the current file (and its blob `sha`), apply the mutation in memory, then
 * PUT it back referencing that `sha`. If another request wrote in between,
 * GitHub returns a 409/422 and we retry with the freshly read file.
 *
 * Requires a server-side GitHub token (`DATA_GITHUB_TOKEN`) belonging to a
 * maintainer with write access to the repository. This is intentionally
 * separate from the GitHub OAuth app used for visitor login — visitors
 * never need push access to the repo for the site to work.
 */

const DATA_OWNER = process.env.DATA_REPO_OWNER || 'Snowoo-2z';
const DATA_REPO = process.env.DATA_REPO_NAME || 'Pixnaria';
const DATA_BRANCH = process.env.DATA_REPO_BRANCH || 'pixnaria-data';
const DATA_TOKEN = process.env.DATA_GITHUB_TOKEN || '';

function configured() {
  return Boolean(DATA_TOKEN);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ghHeaders(extra = {}) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${DATA_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Pixnaria-DataStore',
    ...extra
  };
}

async function gh(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: { ...ghHeaders(options.headers || {}) }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub API error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

let branchEnsured = false;
async function ensureBranch() {
  if (branchEnsured) return;
  try {
    await gh(`/repos/${DATA_OWNER}/${DATA_REPO}/git/ref/heads/${DATA_BRANCH}`);
  } catch (error) {
    if (error.status !== 404) throw error;
    try {
      const repoInfo = await gh(`/repos/${DATA_OWNER}/${DATA_REPO}`);
      const base = await gh(`/repos/${DATA_OWNER}/${DATA_REPO}/git/ref/heads/${repoInfo.default_branch || 'main'}`);
      await gh(`/repos/${DATA_OWNER}/${DATA_REPO}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${DATA_BRANCH}`, sha: base.object.sha })
      });
    } catch (createError) {
      // Another concurrent request already created the branch — that's fine.
      if (createError.status !== 422) throw createError;
    }
  }
  branchEnsured = true;
}

function tablePath(name) {
  return `data/${name}.json`;
}

async function readTable(name) {
  if (!configured()) throw new Error('Pixnaria data store is not configured (missing DATA_GITHUB_TOKEN).');
  await ensureBranch();
  try {
    const file = await gh(`/repos/${DATA_OWNER}/${DATA_REPO}/contents/${tablePath(name)}?ref=${encodeURIComponent(DATA_BRANCH)}`);
    const text = Buffer.from(file.content, 'base64').toString('utf8');
    let rows = [];
    try { rows = JSON.parse(text || '[]'); } catch { rows = []; }
    return { rows: Array.isArray(rows) ? rows : [], sha: file.sha };
  } catch (error) {
    if (error.status === 404) return { rows: [], sha: null };
    throw error;
  }
}

async function writeTable(name, rows, message, sha) {
  const body = {
    message,
    content: Buffer.from(JSON.stringify(rows, null, 2) + '\n').toString('base64'),
    branch: DATA_BRANCH
  };
  if (sha) body.sha = sha;
  return gh(`/repos/${DATA_OWNER}/${DATA_REPO}/contents/${tablePath(name)}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

/**
 * Read-modify-write a table with automatic retry on write conflicts.
 * `mutator(rows)` must return `{ rows, result }` (next full array to persist)
 * or `{ skip: true, result }` when nothing needs to be written.
 */
async function updateTable(name, mutator, message) {
  if (!configured()) throw new Error('Pixnaria data store is not configured (missing DATA_GITHUB_TOKEN).');
  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const { rows, sha } = await readTable(name);
    const outcome = await mutator(rows.slice());
    if (outcome.skip) return outcome.result;
    try {
      await writeTable(name, outcome.rows, message, sha);
      return outcome.result;
    } catch (error) {
      lastError = error;
      if (error.status === 409 || error.status === 422) {
        await sleep(120 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }
  throw lastError || new Error('Failed to update Pixnaria data (conflict).');
}

function generateId(prefix = 'id') {
  const random = require('node:crypto').randomBytes(9).toString('base64url');
  return `${prefix}_${random}`;
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = {
  configured,
  readTable,
  writeTable,
  updateTable,
  generateId,
  nowIso,
  DATA_OWNER,
  DATA_REPO,
  DATA_BRANCH
};
