const { clearCookie, sendJson } = require('../_utils');

module.exports = async function handler(req, res) {
  res.setHeader('Set-Cookie', clearCookie('pixnaria_session'));
  return sendJson(res, 200, { ok: true });
};
