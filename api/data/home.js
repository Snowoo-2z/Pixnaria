const { sendJson } = require('../_utils');
const store = require('../_store');
const { gitdb } = store;

module.exports = async function handler(_req, res) {
  if (!gitdb.configured()) {
    return sendJson(res, 200, { configured: false, featured: [], trending: [], recent: [], studios: [], news: [] });
  }

  try {
    const [{ rows: projects }, news, studioRows] = await Promise.all([
      gitdb.readTable('projects'),
      store.listNews({ onlyPublished: true, onlyHome: true }),
      store.listStudioRows()
    ]);

    const publicProjects = projects
      .filter((row) => row.visibility === 'public')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const featured = publicProjects.filter((row) => row.featured).slice(0, 8);

    const trending = [...publicProjects]
      .sort((a, b) => ((b.likes_count || 0) * 3 + (b.favorites_count || 0) * 4 + (b.views_count || 0)) - ((a.likes_count || 0) * 3 + (a.favorites_count || 0) * 4 + (a.views_count || 0)))
      .slice(0, 12);

    return sendJson(res, 200, {
      configured: true,
      featured: featured.map(store.projectDto),
      trending: trending.map(store.projectDto),
      recent: publicProjects.slice(0, 12).map(store.projectDto),
      studios: studioRows.slice(0, 8).map((studio) => ({
        id: studio.id,
        name: studio.name,
        description: studio.description || '',
        iconUrl: studio.icon_url || null,
        updatedAt: studio.updated_at
      })),
      news: news.slice(0, 8).map((item) => ({
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
