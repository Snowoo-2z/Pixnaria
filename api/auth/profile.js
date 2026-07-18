const { cookie, decodeSession, encodeSession, parseCookies, readBody, sendJson } = require('../_utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  const cookies = parseCookies(req);
  const session = decodeSession(cookies.pixnaria_session);
  if (!session?.github) return sendJson(res, 401, { error: 'GitHub login required' });

  const body = JSON.parse((await readBody(req)) || '{}');
  const displayName = String(body.displayName || session.github.login).trim();
  if (!/^[A-Za-z0-9_-]+$/.test(displayName)) {
    return sendJson(res, 400, { error: 'Display name can only contain letters, numbers, _ and -' });
  }

  const isSnowoo = ['snowoo-2z', 'snowoo'].includes(session.github.login.toLowerCase());
  const user = {
    id: isSnowoo ? 'user_snowoo' : `pix_${session.github.id}`,
    username: session.github.login,
    githubUsername: session.github.login,
    githubId: session.github.id,
    githubProfileUrl: session.github.html_url,
    displayName,
    bio: String(body.bio || '').slice(0, 240),
    avatarData: body.avatarData || null,
    avatarInitial: displayName.charAt(0).toUpperCase() || 'P',
    avatarColor: isSnowoo ? 'creator' : 'default',
    role: isSnowoo ? 'creator' : 'user',
    badges: isSnowoo ? ['Creator', 'Admin'] : [],
    authProvider: 'github',
    githubConnected: true,
    joinedAt: new Date().toISOString().slice(0, 10)
  };

  const nextSession = encodeSession({ ...session, pixnariaProfile: user });
  res.setHeader('Set-Cookie', cookie('pixnaria_session', nextSession, { maxAge: 60 * 60 * 24 * 30, secure: req.headers.host !== 'localhost:8000' }));
  return sendJson(res, 200, { user });
};
