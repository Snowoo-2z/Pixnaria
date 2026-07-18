const PixnariaEditorGitHubSync = (() => {
  let repoFullName = null;
  let loaded = false;

  const $ = (selector) => document.querySelector(selector);

  function repoFromUrl() {
    const params = new URLSearchParams(location.search);
    return params.get('repo');
  }

  function log(message) {
    window.PixnariaEditorPreview?.writeEditorLog?.(`[github] ${message}`);
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  }

  function composeProject(data) {
    const projectMeta = data.pixnaria.project || {};
    const scene = data.pixnaria.scene || { rootNodeId: 'scene', selectedNodeId: 'scene', nodes: [] };
    const settings = data.pixnaria.settings || { dimensions: { width: 1280, height: 720 }, background: '#090712', physics: { gravity: 1350, jumpForce: 560 } };

    return {
      pixnariaFormat: 'pixna-json-prototype',
      formatVersion: projectMeta.formatVersion || 1,
      metadata: {
        name: projectMeta.name || data.repo.name.replace(/^pixnaria-/i, ''),
        author: projectMeta.author || data.repo.owner,
        language: projectMeta.language || 'Python',
        visibility: 'public',
        engine: 'Pixnaria Custom 2D Engine'
      },
      scene: {
        rootNodeId: scene.rootNodeId || 'scene',
        selectedNodeId: scene.selectedNodeId || scene.rootNodeId || 'scene',
        nodes: Array.isArray(scene.nodes) ? scene.nodes : []
      },
      scripts: {},
      assets: [],
      settings
    };
  }

  function updateRepoBadge() {
    const badge = $('[data-editor-repo-badge]');
    if (badge) badge.textContent = repoFullName ? `GitHub · ${repoFullName}` : 'Local project';
  }

  async function load() {
    repoFullName = repoFromUrl();
    updateRepoBadge();
    if (!repoFullName) return;

    try {
      log(`loading ${repoFullName}`);
      const data = await api(`/api/github/project?repo=${encodeURIComponent(repoFullName)}`);
      const project = composeProject(data);
      const ok = window.PixnariaEditorPreview?.loadProjectFromExternal?.(project);
      if (!ok) throw new Error('Editor refused project payload');
      loaded = true;
      log(`loaded ${repoFullName}`);
      updateRepoBadge();
    } catch (error) {
      log(`load failed: ${error.message}`);
    }
  }

  async function save() {
    repoFullName ||= repoFromUrl();
    if (!repoFullName) {
      log('no GitHub repo in URL; saved locally only');
      return false;
    }
    try {
      const project = window.PixnariaEditorPreview?.getProjectForEngine?.();
      if (!project) throw new Error('Editor project not available');
      log(`saving ${repoFullName}`);
      const data = await api('/api/github/save', {
        method: 'POST',
        body: JSON.stringify({ repo: repoFullName, project })
      });
      loaded = true;
      log(`saved ${data.repo} at ${new Date(data.updatedAt).toLocaleTimeString()}`);
      return true;
    } catch (error) {
      log(`save failed: ${error.message}`);
      return false;
    }
  }

  function init() {
    repoFullName = repoFromUrl();
    updateRepoBadge();
    window.PixnariaEditorGitHubSync = { save, load, get repo() { return repoFullName; }, get loaded() { return loaded; } };
    load();
  }

  return { init, save, load };
})();

document.addEventListener('DOMContentLoaded', PixnariaEditorGitHubSync.init);
