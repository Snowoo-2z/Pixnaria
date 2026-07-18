const { sendJson } = require('../_utils');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function configured() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

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

module.exports = async function handler(req, res) {
  if (!configured()) return sendJson(res, 200, { configured: false, projects: [] });

  try {
    const rows = await sb('/projects?visibility=eq.public&select=*&order=updated_at.desc&limit=60');
    const projects = rows.map((row) => ({
      id: row.id,
      title: row.title,
      author: row.github_owner,
      tag: row.featured ? 'Featured' : 'Game',
      description: row.description || 'Pixnaria GitHub project.',
      likes: row.likes_count || 0,
      favorites: row.favorites_count || 0,
      views: row.views_count || 0,
      color: row.featured ? 'magenta' : 'violet',
      featured: Boolean(row.featured),
      githubRepo: `${row.github_owner}/${row.github_repo}`,
      githubUrl: `https://github.com/${row.github_owner}/${row.github_repo}`,
      updatedAt: row.updated_at
    }));
    return sendJson(res, 200, { configured: true, projects });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
