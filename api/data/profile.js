const { readBody, sendJson } = require('../_utils');
const store = require('../_store');
const { gitdb } = store;

module.exports = async function handler(req, res) {
  if (!gitdb.configured()) return sendJson(res, 200, { configured: false, profile: null });

  const session = store.sessionFromReq(req);
  if (!session?.github) return sendJson(res, 401, { error: 'GitHub login required' });

  try {
    if (req.method === 'GET') {
      const profile = await store.getOrCreateProfile(session);
      return sendJson(res, 200, { configured: true, profile: store.profileDto(profile), raw: profile });
    }

    if (req.method === 'POST') {
      const current = await store.getOrCreateProfile(session);
      const body = JSON.parse((await readBody(req)) || '{}');
      const displayName = String(body.displayName || current.display_name).trim();
      if (!/^[A-Za-z0-9_-]+$/.test(displayName)) {
        return sendJson(res, 400, { error: 'Display name can only contain letters, numbers, _ and -' });
      }
      const update = {
        display_name: displayName,
        bio: String(body.bio || '').slice(0, 240)
      };
      if (body.avatarData !== undefined) update.avatar_url = body.avatarData || null;

      const updated = await store.updateProfile(current.id, update);
      return sendJson(res, 200, { configured: true, profile: store.profileDto(updated), raw: updated });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
