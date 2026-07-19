const { decodeSession, parseCookies, sendJson } = require('../_utils');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function configured() { return Boolean(SUPABASE_URL && SERVICE_KEY); }
function adminFor(login) { return ['snowoo-2z', 'snowoo'].includes(String(login || '').toLowerCase()); }

async function sb(path, options = {}) {
  if (!configured()) throw new Error('Supabase is not configured');
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || `Supabase error ${response.status}`);
  return data;
}

function profileDto(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.github_username,
    githubUsername: row.github_username,
    displayName: row.display_name,
    bio: row.bio || '',
    avatarData: row.avatar_url || null,
    avatarInitial: (row.display_name || row.github_username || '?').charAt(0).toUpperCase(),
    avatarColor: ['creator', 'admin'].includes(row.role) ? 'creator' : 'default',
    role: row.role,
    badges: row.badges || [],
    joinedAt: row.joined_at,
    githubProfileUrl: `https://github.com/${row.github_username}`
  };
}

function projectDto(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.github_owner,
    tag: row.featured ? 'Featured' : 'Project',
    description: row.description || 'Pixnaria project.',
    likes: row.likes_count || 0,
    favorites: row.favorites_count || 0,
    views: row.views_count || 0,
    color: row.featured ? 'magenta' : 'violet',
    featured: Boolean(row.featured),
    githubRepo: `${row.github_owner}/${row.github_repo}`,
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}

module.exports = async function handler(req, res) {
  if (!configured()) return sendJson(res, 200, { configured: false, profile: null, projects: [] });

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const username = url.searchParams.get('username');
    if (!username) return sendJson(res, 400, { error: 'Missing username' });

    let rows = await sb(`/profiles?github_username=eq.${encodeURIComponent(username)}&select=*`);
    let profile = rows[0] || null;

    // If the requested user is the connected user and doesn't exist yet, create them.
    if (!profile) {
      const session = decodeSession(parseCookies(req).pixnaria_session);
      if (session?.github?.login?.toLowerCase() === username.toLowerCase()) {
        const isAdmin = adminFor(session.github.login);
        rows = await sb('/profiles?select=*', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            github_id: String(session.github.id),
            github_username: session.github.login,
            display_name: session.github.login,
            bio: isAdmin ? 'Creator of Pixnaria' : '',
            role: isAdmin ? 'creator' : 'user',
            badges: isAdmin ? ['Creator', 'Admin'] : []
          })
        });
        profile = rows[0] || null;
      }
    }

    const projects = await sb(`/projects?github_owner=eq.${encodeURIComponent(username)}&visibility=eq.public&select=*&order=updated_at.desc&limit=24`);
    const featured = projects.find((project) => project.featured) || projects[0] || null;

    return sendJson(res, 200, {
      configured: true,
      profile: profileDto(profile) || {
        username,
        githubUsername: username,
        displayName: username,
        bio: '',
        avatarInitial: username.charAt(0).toUpperCase(),
        avatarColor: adminFor(username) ? 'creator' : 'default',
        role: adminFor(username) ? 'creator' : 'user',
        badges: adminFor(username) ? ['Creator', 'Admin'] : [],
        githubProfileUrl: `https://github.com/${username}`
      },
      projects: projects.map(projectDto),
      featured: featured ? projectDto(featured) : null,
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
