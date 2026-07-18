const PixnariaAdmin = (() => {
  let state = { configured: false, reports: [], users: [], projects: [], news: [], stats: {} };

  const $ = (selector) => document.querySelector(selector);

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed ${response.status}`);
    return data;
  }

  function setStatus(message, type = '') {
    const node = $('[data-admin-status]');
    if (!node) return;
    node.textContent = message;
    node.className = `auth-status ${type}`.trim();
  }

  function openTab(name) {
    document.querySelectorAll('[data-admin-tab]').forEach((button) => button.classList.toggle('active', button.dataset.adminTab === name));
    document.querySelectorAll('[data-admin-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.adminPanel === name));
  }

  async function load() {
    setStatus('Loading Supabase admin data…');
    try {
      state = await api('/api/supabase/admin');
      if (!state.configured) setStatus(state.error || 'Supabase is not configured.', 'error');
      else setStatus('Supabase admin data loaded.', 'success');
      render();
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  async function action(payload) {
    try {
      state = await api('/api/supabase/admin', { method: 'POST', body: JSON.stringify(payload) });
      setStatus('Action saved.', 'success');
      render();
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  function renderStats() {
    $('[data-stat-reports]').textContent = state.stats?.openReports ?? 0;
    $('[data-stat-users]').textContent = state.stats?.users ?? 0;
    $('[data-stat-mods]').textContent = state.stats?.moderators ?? 0;
    $('[data-stat-featured]').textContent = state.stats?.featured ?? 0;
  }

  function renderReports() {
    const list = $('[data-report-list]');
    if (!list) return;
    list.innerHTML = state.reports.length ? state.reports.map((report) => `
      <li class="admin-list-item">
        <span>
          <strong>${report.target_type}: ${report.target_id}</strong>
          <small>Reporter: ${report.reporter_username} · ${new Date(report.created_at).toLocaleString()}</small>
          <small>Reason: ${report.reason}</small>
          <small>Status: ${report.status}</small>
        </span>
        <span class="admin-actions">
          <button class="button button--ghost button--small" type="button" data-resolve-report="${report.id}">Resolve</button>
          <button class="button button--ghost button--small" type="button" data-reject-report="${report.id}">Reject</button>
        </span>
      </li>
    `).join('') : '<li class="admin-list-item"><span><strong>No reports</strong><small>Everything is clean.</small></span></li>';

    list.querySelectorAll('[data-resolve-report]').forEach((button) => button.addEventListener('click', () => action({ action: 'resolve_report', reportId: button.dataset.resolveReport })));
    list.querySelectorAll('[data-reject-report]').forEach((button) => button.addEventListener('click', () => action({ action: 'reject_report', reportId: button.dataset.rejectReport })));
  }

  function renderUsers() {
    const list = $('[data-user-list]');
    if (!list) return;
    const reason = () => $('[data-ban-reason]')?.value || 'Rule violation';
    const days = () => Number($('[data-ban-days]')?.value || 7);
    list.innerHTML = state.users.length ? state.users.map((user) => `
      <li class="admin-list-item">
        <span>
          <strong>${user.display_name} <small>@${user.github_username}</small></strong>
          <small>Role: ${user.role} · Joined ${new Date(user.joined_at).toLocaleDateString()}</small>
          ${user.active_ban ? `<small>Ban: ${user.active_ban.type} · ${user.active_ban.reason}</small>` : ''}
        </span>
        <span class="admin-actions">
          <span class="pill ${user.role !== 'user' ? 'pill--featured' : ''}">${user.role}</span>
          <button class="button button--ghost button--small" data-temp-ban="${user.id}">Temp ban</button>
          <button class="button button--ghost button--small danger" data-perm-ban="${user.id}">Perm ban</button>
          <button class="button button--ghost button--small" data-unban="${user.id}">Unban</button>
        </span>
      </li>
    `).join('') : '<li class="admin-list-item"><span><strong>No users</strong></span></li>';

    list.querySelectorAll('[data-temp-ban]').forEach((button) => button.addEventListener('click', () => action({ action: 'ban', userId: button.dataset.tempBan, type: 'temporary', reason: reason(), endsAt: new Date(Date.now() + days() * 86400000).toISOString() })));
    list.querySelectorAll('[data-perm-ban]').forEach((button) => button.addEventListener('click', () => action({ action: 'ban', userId: button.dataset.permBan, type: 'permanent', reason: reason() })));
    list.querySelectorAll('[data-unban]').forEach((button) => button.addEventListener('click', () => action({ action: 'unban', userId: button.dataset.unban })));
  }

  function renderModerators() {
    const list = $('[data-moderator-list]');
    if (!list) return;
    const mods = state.users.filter((user) => ['moderator', 'admin', 'creator'].includes(user.role));
    list.innerHTML = mods.map((user) => `
      <li class="admin-list-item"><span><strong>${user.github_username}</strong><small>${user.role}</small></span><span class="admin-actions">${user.role === 'moderator' ? `<button class="button button--ghost button--small danger" data-remove-mod="${user.id}">Remove</button>` : '<span class="pill pill--featured">Protected</span>'}</span></li>
    `).join('') || '<li class="admin-list-item"><span><strong>No moderators</strong></span></li>';
    list.querySelectorAll('[data-remove-mod]').forEach((button) => button.addEventListener('click', () => action({ action: 'set_role', userId: button.dataset.removeMod, role: 'user' })));
  }

  function renderProjects() {
    const list = $('[data-featured-list]');
    if (!list) return;
    list.innerHTML = state.projects.length ? state.projects.map((project) => `
      <li class="admin-list-item">
        <span><strong>${project.title}</strong><small>${project.github_owner}/${project.github_repo}</small></span>
        <span class="admin-actions"><button class="button button--ghost button--small" data-feature-project="${project.id}" data-featured="${project.featured ? '0' : '1'}">${project.featured ? 'Unfeature' : 'Feature'}</button></span>
      </li>
    `).join('') : '<li class="admin-list-item"><span><strong>No indexed projects</strong></span></li>';
    list.querySelectorAll('[data-feature-project]').forEach((button) => button.addEventListener('click', () => action({ action: 'feature_project', projectId: button.dataset.featureProject, featured: button.dataset.featured === '1' })));
  }

  function renderNews() {
    const list = $('[data-news-admin-list]');
    if (!list) return;
    list.innerHTML = (state.news || []).map((item) => `
      <li class="admin-list-item"><span><strong>${item.title_en || item.title_fr || 'News'}</strong><small>${item.category} · ${item.published ? 'Published' : 'Draft'}</small></span></li>
    `).join('') || '<li class="admin-list-item"><span><strong>No news</strong></span></li>';
  }

  function renderLog() {
    const log = $('[data-admin-log]');
    if (!log) return;
    log.textContent = JSON.stringify({ reports: state.reports.length, users: state.users.length, projects: state.projects.length }, null, 2);
  }

  function render() {
    renderStats();
    renderReports();
    renderUsers();
    renderModerators();
    renderProjects();
    renderNews();
    renderLog();
  }

  function bind() {
    document.querySelectorAll('[data-admin-tab]').forEach((button) => button.addEventListener('click', () => openTab(button.dataset.adminTab)));
    $('[data-refresh-admin]')?.addEventListener('click', load);
    $('[data-add-moderator-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = new FormData(event.currentTarget).get('username').trim();
      action({ action: 'set_role', username, role: 'moderator' });
      event.currentTarget.reset();
    });
    $('[data-add-news-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      action({ action: 'create_news', title: data.get('title'), content: data.get('content'), category: data.get('category'), published: data.get('published') === 'on', pinned: data.get('pinned') === 'on' });
      event.currentTarget.reset();
    });
  }

  function init() {
    if (!$('[data-admin-page]')) return;
    bind();
    load();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaAdmin.init);
