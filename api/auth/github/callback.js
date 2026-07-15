const {
  callbackUrl,
  cookie,
  encodeSession,
  exchangeCodeForToken,
  fetchGitHubUser,
  parseCookies,
  publicBaseUrl,
  redirect
} = require('../../_utils');

module.exports = async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(req);
  const expected = cookies.pixnaria_oauth_state;

  if (!code || !state || !expected || state !== expected) {
    return redirect(res, `${publicBaseUrl(req)}/auth.html?github=error`);
  }

  try {
    const token = await exchangeCodeForToken(code, callbackUrl(req));
    const gh = await fetchGitHubUser(token);
    const session = encodeSession({
      githubToken: token,
      github: {
        id: gh.id,
        login: gh.login,
        name: gh.name,
        html_url: gh.html_url,
        avatar_url: gh.avatar_url
      },
      createdAt: Date.now()
    });

    res.setHeader('Set-Cookie', [
      cookie('pixnaria_session', session, { maxAge: 60 * 60 * 24 * 30, secure: req.headers.host !== 'localhost:8000' }),
      'pixnaria_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    ]);
    return redirect(res, `${publicBaseUrl(req)}/auth.html?github=connected`);
  } catch (error) {
    console.error(error);
    return redirect(res, `${publicBaseUrl(req)}/auth.html?github=error`);
  }
};
