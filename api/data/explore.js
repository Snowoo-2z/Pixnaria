const { sendJson } = require('../_utils');
const store = require('../_store');
const { gitdb } = store;

module.exports = async function handler(_req, res) {
  if (!gitdb.configured()) return sendJson(res, 200, { configured: false, projects: [] });

  try {
    const { rows } = await gitdb.readTable('projects');
    const projects = rows
      .filter((row) => row.visibility === 'public')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 60)
      .map(store.projectDto);
    return sendJson(res, 200, { configured: true, projects });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
