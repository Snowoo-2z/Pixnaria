/**
 * Public "wall" messages — visible on every Pixnaria profile page, stored in
 * the GitHub-backed data store (data/wall_messages.json on the
 * `pixnaria-data` branch). Not private DMs: anyone can read a profile's
 * wall, and any logged-in Pixnaria user can post on it (unless banned).
 */
const { readBody, sendJson } = require('../_utils');
const store = require('../_store');
const { gitdb } = store;

module.exports = async function handler(req, res) {
  if (!gitdb.configured()) return sendJson(res, 200, { configured: false, messages: [] });

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);

    if (req.method === 'GET') {
      const username = url.searchParams.get('username');
      if (!username) return sendJson(res, 400, { error: 'Missing username' });
      const profile = await store.findProfileByUsername(username);
      if (!profile) return sendJson(res, 200, { configured: true, messages: [] });

      const messages = await store.listWallMessages(profile.id, 60);
      const authorIds = [...new Set(messages.map((m) => m.author_id))];
      const authors = authorIds.length ? await store.listAllProfilesById(authorIds) : [];
      const authorById = Object.fromEntries(authors.map((a) => [a.id, a]));

      return sendJson(res, 200, {
        configured: true,
        messages: messages.map((message) => {
          const author = authorById[message.author_id];
          return {
            id: message.id,
            content: message.content,
            createdAt: message.created_at,
            author: author ? {
              username: author.github_username,
              displayName: author.display_name,
              avatarData: author.avatar_url || null,
              avatarColor: ['creator', 'admin'].includes(author.role) ? 'creator' : 'default'
            } : { username: 'unknown', displayName: 'Former Pixnaria user' }
          };
        })
      });
    }

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

    const profile = await store.requireProfile(req);
    const ban = await store.activeBanFor(profile.id);
    if (ban) throw new Error('Your account is currently banned from posting messages.');

    const body = JSON.parse((await readBody(req)) || '{}');

    if (body.action === 'delete') {
      await store.deleteWallMessage(body.messageId, profile);
      return sendJson(res, 200, { ok: true });
    }

    const username = String(body.username || '').trim();
    const content = String(body.content || '').trim();
    if (!username) throw new Error('Missing target username');
    if (!content || content.length > 500) throw new Error('Message must be between 1 and 500 characters.');

    const targetProfile = await store.findProfileByUsername(username);
    if (!targetProfile) throw new Error('This user has no Pixnaria profile yet.');

    const message = await store.postWallMessage({ profileId: targetProfile.id, authorId: profile.id, content });
    return sendJson(res, 200, {
      ok: true,
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.created_at,
        author: {
          username: profile.github_username,
          displayName: profile.display_name,
          avatarData: profile.avatar_url || null,
          avatarColor: ['creator', 'admin'].includes(profile.role) ? 'creator' : 'default'
        }
      }
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
