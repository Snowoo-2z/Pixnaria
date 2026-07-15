const { callbackUrl, cookie, env, randomId, redirect, sendJson } = require('../../_utils');

module.exports = async function handler(req, res) {
  const clientId = env('GITHUB_CLIENT_ID');
  if (!clientId || !env('GITHUB_CLIENT_SECRET')) {
    return sendJson(res, 500, {
      error: 'GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel environment variables.'
    });
  }

  const state = randomId();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl(req),
    scope: 'read:user public_repo',
    state,
    allow_signup: 'true'
  });

  res.setHeader('Set-Cookie', cookie('pixnaria_oauth_state', state, { maxAge: 900, secure: req.headers.host !== 'localhost:8000' }));
  return redirect(res, `https://github.com/login/oauth/authorize?${params.toString()}`);
};
