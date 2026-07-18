const PixnariaProjectPage = (() => {
  let repoFullName = null;
  let projectData = null;
  let socialData = { configured: false, likes: 0, favorites: 0, comments: [] };

  const $ = (selector) => document.querySelector(selector);

  function repoFromUrl() {
    const params = new URLSearchParams(location.search);
    return params.get('repo');
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

  function markdownSummary(text = '') {
    return text
      .replace(/^# .+$/m, '')
      .replace(/```[\s\S]*?```/g, '')
      .trim()
      .slice(0, 900) || 'No README description yet.';
  }

  function titleFromRepo(repo) {
    return projectData?.pixnaria?.project?.name
      || repo?.name?.replace(/^pixnaria-/i, '').split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
      || 'Pixnaria Project';
  }

  function setStatus(message, type = '') {
    const node = $('[data-project-status]');
    if (!node) return;
    node.textContent = message;
    node.className = `auth-status ${type}`.trim();
  }

  async function loadProject() {
    repoFullName = repoFromUrl();
    if (!repoFullName) {
      setStatus('No GitHub repository selected. Open a project from Explorer or My Projects.', 'error');
      document.querySelectorAll('[data-project-loaded]').forEach((node) => node.hidden = true);
      return;
    }

    setStatus(`Loading ${repoFullName} from GitHub…`);
    projectData = await api(`/api/github/project?repo=${encodeURIComponent(repoFullName)}`);
    await loadSocial();
    render();
    setStatus('Project loaded from GitHub.', 'success');
  }

  async function loadSocial() {
    try {
      socialData = await api(`/api/supabase/project-social?repo=${encodeURIComponent(repoFullName)}`);
    } catch (error) {
      socialData = { configured: false, likes: 0, favorites: 0, comments: [], error: error.message };
    }
  }

  function render() {
    const repo = projectData.repo;
    const title = titleFromRepo(repo);
    const description = projectData.pixnaria.project?.description || repo.description || markdownSummary(projectData.pixnaria.readme);
    const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleString() : 'Unknown';

    document.querySelectorAll('[data-project-title]').forEach((node) => node.textContent = title);
    $('[data-project-repo]').textContent = repo.full_name;
    $('[data-project-description]').textContent = description;
    $('[data-project-updated]').textContent = updated;
    $('[data-project-github]').href = repo.html_url;
    $('[data-inside]').href = `editor.html?repo=${encodeURIComponent(repo.full_name)}`;
    $('[data-project-stars]').textContent = repo.stargazers_count || 0;
    $('[data-project-forks]').textContent = repo.forks_count || 0;
    $('[data-project-likes]').textContent = socialData.likes || 0;
    $('[data-project-favorites]').textContent = socialData.favorites || 0;

    const files = $('[data-project-files]');
    files.innerHTML = Object.entries(projectData.files).map(([key, exists]) => `
      <li class="clean-row"><span><strong>${key}</strong><small>${exists ? 'Found in repository' : 'Missing'}</small></span><span class="pill ${exists ? 'pill--featured' : ''}">${exists ? 'OK' : 'Missing'}</span></li>
    `).join('');

    renderCredits();
    renderComments();
  }

  function renderCredits() {
    const list = $('[data-credits-list]');
    const credits = projectData.pixnaria.project?.credits || [];
    if (!credits.length) {
      list.innerHTML = `<li class="clean-row"><span><strong>${projectData.repo.owner}</strong><small>Repository owner</small></span></li>`;
      return;
    }
    list.innerHTML = credits.map((credit) => `
      <li class="clean-row"><span><strong>${credit.name || credit}</strong><small>${credit.role || 'Contribution'}</small></span></li>
    `).join('');
  }

  function renderComments() {
    const list = $('[data-comment-list]');
    const note = $('[data-social-note]');
    if (note) note.textContent = socialData.configured ? 'Community data is stored in Supabase.' : 'Supabase is not configured yet.';
    const comments = socialData.comments || [];
    list.innerHTML = comments.length ? comments.map((comment) => `
      <li class="comment-item"><span><strong>Pixnaria user</strong><small>${comment.content}</small></span><small>${new Date(comment.created_at).toLocaleDateString()}</small></li>
    `).join('') : `<li class="comment-item"><span><strong>No comments yet</strong><small>Be the first to comment.</small></span></li>`;
  }

  async function socialAction(action, extra = {}) {
    if (!repoFullName || !projectData) return;
    try {
      socialData = await api('/api/supabase/project-social', {
        method: 'POST',
        body: JSON.stringify({
          action,
          repo: repoFullName,
          title: titleFromRepo(projectData.repo),
          description: projectData.repo.description || '',
          ...extra
        })
      });
      render();
      setStatus(`${action} saved.`, 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  function bind() {
    $('[data-like]')?.addEventListener('click', () => socialAction('like'));
    $('[data-favorite]')?.addEventListener('click', () => socialAction('favorite'));
    $('[data-report]')?.addEventListener('click', () => socialAction('report', { reason: 'Reported from project page' }));
    $('[data-comment-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = event.currentTarget.querySelector('input');
      const content = input.value.trim();
      if (!content) return;
      socialAction('comment', { content });
      input.value = '';
    });
  }

  function init() {
    if (!$('[data-project-page]')) return;
    bind();
    loadProject().catch((error) => setStatus(error.message, 'error'));
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaProjectPage.init);
