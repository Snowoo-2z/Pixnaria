const { sendJson } = require('../_utils');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function configured() { return Boolean(SUPABASE_URL && SERVICE_KEY); }

async function sb(path) {
  if (!configured()) throw new Error('Supabase is not configured');
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || `Supabase error ${response.status}`);
  return data;
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

module.exports = async function handler(_req, res) {
  if (!configured()) {
    return sendJson(res, 200, { configured: false, featured: [], trending: [], recent: [], studios: [], news: [] });
  }

  try {
    const [projects, featured, news, studios] = await Promise.all([
      sb('/projects?visibility=eq.public&select=*&order=updated_at.desc&limit=48'),
      sb('/projects?visibility=eq.public&featured=eq.true&select=*&order=updated_at.desc&limit=8'),
      sb('/news?published=eq.true&show_on_home=eq.true&select=*&order=pinned.desc,created_at.desc&limit=8'),
      sb('/studios?select=*&order=updated_at.desc&limit=8')
    ]);

    const trending = [...projects]
      .sort((a, b) => ((b.likes_count || 0) * 3 + (b.favorites_count || 0) * 4 + (b.views_count || 0)) - ((a.likes_count || 0) * 3 + (a.favorites_count || 0) * 4 + (a.views_count || 0)))
      .slice(0, 12)
      .map(projectDto);

    return sendJson(res, 200, {
      configured: true,
      featured: featured.map(projectDto),
      trending,
      recent: projects.slice(0, 12).map(projectDto),
      studios: studios.map((studio) => ({
        id: studio.id,
        name: studio.name,
        description: studio.description || '',
        iconUrl: studio.icon_url || null,
        updatedAt: studio.updated_at
      })),
      news: news.map((item) => ({
        id: item.id,
        title: item.title_en || item.title_fr || 'Pixnaria update',
        content: item.content_en || item.content_fr || '',
        category: item.category,
        pinned: item.pinned,
        important: item.important,
        createdAt: item.created_at
      }))
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
