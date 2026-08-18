const { sendJson } = require('../_utils');
const store = require('../_store');
const { gitdb } = store;

module.exports = async function handler(req, res) {
  if (!gitdb.configured()) return sendJson(res, 200, { configured: false, profile: null, projects: [] });

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const username = url.searchParams.get('username');
    if (!username) return sendJson(res, 400, { error: 'Missing username' });

    let profile = await store.findProfileByUsername(username);

    // If the requested user is the connected user and doesn't exist yet, create them.
    if (!profile) {
      const session = store.sessionFromReq(req);
      if (session?.github?.login && store.sameUsername(session.github.login, username)) {
        profile = await store.getOrCreateProfile(session);
      }
    }

    const { rows: allProjects } = await gitdb.readTable('projects');
    const projects = allProjects
      .filter((row) => store.sameUsername(row.github_owner, username) && row.visibility === 'public')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 24);
    const featured = projects.find((project) => project.featured) || projects[0] || null;

    return sendJson(res, 200, {
      configured: true,
      profile: store.profileDto(profile) || {
        username,
        githubUsername: username,
        displayName: username,
        bio: '',
        avatarInitial: username.charAt(0).toUpperCase(),
        avatarColor: store.isAdmin(username) ? 'creator' : 'default',
        role: store.isAdmin(username) ? 'creator' : 'user',
        badges: store.isAdmin(username) ? ['Creator', 'Admin'] : [],
        githubProfileUrl: `https://github.com/${username}`
      },
      projects: projects.map(store.projectDto),
      featured: featured ? store.projectDto(featured) : null,
      stats: {
        projects: projects.length,
        likes: projects.reduce((sum, p) => sum + (p.likes_count || 0), 0),
        favorites: projects.reduce((sum, p) => sum + (p.favorites_count || 0), 0),
        views: projects.reduce((sum, p) => sum + (p.views_count || 0), 0)
      }
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
