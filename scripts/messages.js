const PixnariaMessages = (() => {
  const $ = (selector) => document.querySelector(selector);

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

  function setStatus(message, type = '') {
    const node = $('[data-messages-status]');
    if (!node) return;
    node.textContent = message;
    node.className = `auth-status ${type}`.trim();
  }

  function avatarSpan(author) {
    if (author?.avatarData) return `<span class="avatar avatar--${author.avatarColor || 'default'}" style="width:28px;height:28px;font-size:.8rem"><img src="${author.avatarData}" alt="${author.displayName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></span>`;
    const initial = (author?.displayName || author?.username || '?').charAt(0).toUpperCase();
    return `<span class="avatar avatar--${author?.avatarColor || 'default'}" style="width:28px;height:28px;font-size:.8rem">${initial}</span>`;
  }

  function renderWall(messages) {
    const list = $('[data-wall-list]');
    if (!list) return;
    list.innerHTML = messages.length ? messages.map((message) => `
      <div class="list-item">
        <span style="display:flex;align-items:center;gap:.5rem">${avatarSpan(message.author)}<span><strong>${message.author.displayName || message.author.username}</strong><small>${message.content}</small></span></span>
        <small>${new Date(message.createdAt).toLocaleDateString()}</small>
      </div>
    `).join('') : '<div class="list-item"><span><small>No messages on your wall yet.</small></span></div>';
  }

  function renderActivity(username, projects) {
    const list = $('[data-activity-list]');
    if (!list) return;
    if (!projects.length) {
      list.innerHTML = '<div class="list-item"><span><small>Publish a Pixnaria project to see activity here.</small></span></div>';
      return;
    }
    list.innerHTML = projects.map((project) => `
      <div class="list-item">
        <span><strong>${project.title}</strong><small>♥ ${project.likes || 0} · ★ ${project.favorites || 0} · 👁 ${project.views || 0}</small></span>
        <a class="button button--ghost button--small" href="project.html?repo=${encodeURIComponent(project.githubRepo)}">Open</a>
      </div>
    `).join('');
  }

  async function load() {
    setStatus('Loading your messages…');
    try {
      const me = await api('/api/auth/me');
      const username = me.pixnariaProfile?.githubUsername || me.github?.login;
      if (!username) throw new Error('GitHub login required');
      $('[data-view-profile-link]').href = `/user/${encodeURIComponent(username)}`;

      const admin = ['snowoo-2z', 'snowoo'].includes(String(username).toLowerCase());
      document.querySelectorAll('[data-admin-only]').forEach((node) => node.hidden = !admin);

      const [wallData, userData] = await Promise.all([
        api(`/api/data/messages?username=${encodeURIComponent(username)}`),
        api(`/api/data/user?username=${encodeURIComponent(username)}`)
      ]);

      renderWall(wallData.messages || []);
      renderActivity(username, userData.projects || []);
      setStatus('Up to date.', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  function init() {
    if (!$('[data-messages-page]')) return;
    load();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaMessages.init);
