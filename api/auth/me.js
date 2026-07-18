const { decodeSession, parseCookies, sendJson } = require('../_utils');

module.exports = async function handler(req, res) {
  const cookies = parseCookies(req);
  const session = decodeSession(cookies.pixnaria_session);
  if (!session?.github) return sendJson(res, 401, { authenticated: false });
  return sendJson(res, 200, {
    authenticated: true,
    github: session.github,
    pixnariaProfile: session.pixnariaProfile || null
  });
};
