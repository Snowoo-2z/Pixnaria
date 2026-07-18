const { decodeSession, parseCookies, readBody, sendJson } = require('../_utils');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function configured() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

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
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: { ...headers(options.headers || {}) }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || `Supabase error ${response.status}`);
  return data;
}

function adminFor(login) {
  return ['snowoo-2z', 'snowoo'].includes(String(login || '').toLowerCase());
}

function toClientProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.github_username,
    githubUsername: row.github_username,
    githubId: row.github_id,
    displayName: row.display_name,
    bio: row.bio || '',
    avatarData: row.avatar_url || null,
    avatarInitial: (row.display_name || row.github_username || '?').charAt(0).toUpperCase(),
    avatarColor: row.role === 'creator' || row.role === 'admin' ? 'creator' : 'default',
    role: row.role,
    badges: row.badges || [],
    joinedAt: row.joined_at,
    githubConnected: true
  };
}

async function getOrCreateProfile(session) {
  if (!session?.github) throw new Error('GitHub login required');
  const githubId = String(session.github.id);
  let rows = await sb(`/profiles?github_id=eq.${encodeURIComponent(githubId)}&select=*`);
  if (rows[0]) return rows[0];

  const isAdmin = adminFor(session.github.login);
  rows = await sb('/profiles?select=*', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      github_id: githubId,
      github_username: session.github.login,
      display_name: session.github.login,
      bio: isAdmin ? 'Creator of Pixnaria' : '',
      avatar_url: null,
      role: isAdmin ? 'creator' : 'user',
      badges: isAdmin ? ['Creator', 'Admin'] : []
    })
  });
  return rows[0];
}

module.exports = async function handler(req, res) {
  if (!configured()) return sendJson(res, 200, { configured: false, profile: null });

  const session = decodeSession(parseCookies(req).pixnaria_session);
  if (!session?.github) return sendJson(res, 401, { error: 'GitHub login required' });

  try {
    if (req.method === 'GET') {
      const profile = await getOrCreateProfile(session);
      return sendJson(res, 200, { configured: true, profile: toClientProfile(profile), raw: profile });
    }

    if (req.method === 'POST') {
      const current = await getOrCreateProfile(session);
      const body = JSON.parse((await readBody(req)) || '{}');
      const displayName = String(body.displayName || current.display_name).trim();
      if (!/^[A-Za-z0-9_-]+$/.test(displayName)) {
        return sendJson(res, 400, { error: 'Display name can only contain letters, numbers, _ and -' });
      }
      const update = {
        display_name: displayName,
        bio: String(body.bio || '').slice(0, 240),
        updated_at: new Date().toISOString()
      };
      if (body.avatarData !== undefined) update.avatar_url = body.avatarData || null;

      const rows = await sb(`/profiles?id=eq.${current.id}&select=*`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(update)
      });
      return sendJson(res, 200, { configured: true, profile: toClientProfile(rows[0]), raw: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
