const PixnariaProfilePage = (() => {
  const USERNAME_RE = /^[A-Za-z0-9_-]+$/;
  let currentUser = null;
  let viewed = null;
  let avatarData = null;

  const $ = (selector) => document.querySelector(selector);

  function usernameFromPath() {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] === 'user' && parts[1]) return decodeURIComponent(parts[1]);
    return null;
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

  function setStatus(message, type = '') {
    const node = $('[data-profile-status]');
    if (!node) return;
    node.textContent = message;
    node.className = `auth-status ${type}`.trim();
  }

  function isOwnProfile() {
    if (!currentUser || !viewed?.profile) return false;
    return String(currentUser.githubUsername || currentUser.username).toLowerCase() === String(viewed.profile.githubUsername || viewed.profile.username).toLowerCase();
  }

  function avatar(user, big = true) {
    const cls = big ? 'profile-big-avatar' : '';
    if (user?.avatarData) return `<span class="avatar avatar--${user.avatarColor || 'default'} ${cls}"><img src="${user.avatarData}" alt="${user.displayName || user.username}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></span>`;
    const initial = (user?.displayName || user?.username || '?').charAt(0).toUpperCase();
    return `<span class="avatar avatar--${user?.avatarColor || 'default'} ${cls}">${initial}</span>`;
  }

  function projectCard(project) {
    const href = project.githubRepo ? `project.html?repo=${encodeURIComponent(project.githubRepo)}` : 'project.html';
    return `
      <a class="profile-project-card" href="${href}">
        ${projectPreview(project)}
        <div><h3>${project.title}</h3><small>♥ ${project.likes || 0} · ★ ${project.favorites || 0}</small></div>
      </a>
    `;
  }

  function featuredCard(project) {
    if (!project) return `<div class="scratch-empty">No featured project yet.</div>`;
    const href = project.githubRepo ? `project.html?repo=${encodeURIComponent(project.githubRepo)}` : 'project.html';
    return `
      <a class="profile-featured-project" href="${href}">
        ${projectPreview(project)}
        <div><span class="pill pill--featured">Featured Project</span><h3>${project.title}</h3><p>${project.description || ''}</p></div>
      </a>
    `;
  }

  async function loadCurrentUser() {
    try {
      const data = await api('/api/data/profile');
      if (data.profile) return data.profile;
    } catch {}
    try {
      const data = await api('/api/auth/me');
      if (data.pixnariaProfile) return data.pixnariaProfile;
      if (data.github) {
        const admin = ['snowoo-2z', 'snowoo'].includes(String(data.github.login).toLowerCase());
        return {
          username: data.github.login,
          githubUsername: data.github.login,
          displayName: data.github.login,
          githubProfileUrl: data.github.html_url,
          avatarInitial: data.github.login.charAt(0).toUpperCase(),
          avatarColor: admin ? 'creator' : 'default',
          role: admin ? 'creator' : 'user',
          badges: admin ? ['Creator', 'Admin'] : []
        };
      }
    } catch {}
    return null;
  }

  async function loadViewedProfile() {
    const requested = usernameFromPath();
    currentUser = await loadCurrentUser();
    const username = requested || currentUser?.githubUsername || currentUser?.username;
    if (!username) {
      location.href = 'auth.html';
      return;
    }
    setStatus('Loading profile…');
    viewed = await api(`/api/data/user?username=${encodeURIComponent(username)}`);
    setStatus('Profile loaded.', 'success');
    await loadWall();
  }

  let wallMessages = [];

  async function loadWall() {
    try {
      const data = await api(`/api/data/messages?username=${encodeURIComponent(viewed.profile.githubUsername || viewed.profile.username)}`);
      wallMessages = data.messages || [];
    } catch { wallMessages = []; }
    renderWall();
  }

  function wallAvatar(author) {
    if (author?.avatarData) return `<span class="avatar avatar--${author.avatarColor || 'default'}" style="width:28px;height:28px;font-size:.8rem"><img src="${author.avatarData}" alt="${author.displayName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></span>`;
    const initial = (author?.displayName || author?.username || '?').charAt(0).toUpperCase();
    return `<span class="avatar avatar--${author?.avatarColor || 'default'}" style="width:28px;height:28px;font-size:.8rem">${initial}</span>`;
  }

  function renderWall() {
    const list = $('[data-wall-list]');
    if (!list) return;
    if (!wallMessages.length) {
      list.innerHTML = '<li class="list-item"><span><small>No messages yet. Be the first to write something.</small></span></li>';
    } else {
      list.innerHTML = wallMessages.map((message) => `
        <li class="list-item" data-message-id="${message.id}">
          <span style="display:flex;align-items:center;gap:.5rem">
            ${wallAvatar(message.author)}
            <span><strong>${message.author.displayName || message.author.username}</strong><small>${message.content}</small></span>
          </span>
          <span class="admin-actions">
            <small>${new Date(message.createdAt).toLocaleDateString()}</small>
            ${(currentUser && (store_sameUser(currentUser, message.author) || isOwnProfile())) ? `<button class="button button--ghost button--small" type="button" data-delete-message="${message.id}">Delete</button>` : ''}
          </span>
        </li>
      `).join('');
      list.querySelectorAll('[data-delete-message]').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await api('/api/data/messages', { method: 'POST', body: JSON.stringify({ action: 'delete', messageId: button.dataset.deleteMessage }) });
            await loadWall();
          } catch (error) { setStatus(error.message, 'error'); }
        });
      });
    }
    const form = $('[data-wall-form]');
    if (form) form.hidden = !currentUser;
  }

  function store_sameUser(user, author) {
    return String(user.githubUsername || user.username || '').toLowerCase() === String(author.username || '').toLowerCase();
  }

  function bindWall() {
    $('[data-wall-form]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const textarea = form.querySelector('textarea');
      const content = textarea.value.trim();
      if (!content) return;
      try {
        await api('/api/data/messages', {
          method: 'POST',
          body: JSON.stringify({ username: viewed.profile.githubUsername || viewed.profile.username, content })
        });
        textarea.value = '';
        await loadWall();
      } catch (error) { setStatus(error.message, 'error'); }
    });
  }

  function renderEditPanel() {
    document.querySelectorAll('[data-own-only]').forEach((node) => node.hidden = !isOwnProfile());
    const panel = $('[data-profile-edit-panel]');
    if (!panel) return;
    panel.hidden = !isOwnProfile();
    if (!isOwnProfile()) return;
    $('[data-edit-display]').value = viewed.profile.displayName || viewed.profile.username;
    $('[data-edit-bio]').value = viewed.profile.bio || '';
    $('[data-edit-avatar-preview]').innerHTML = avatar(viewed.profile, false);
  }

  function render() {
    const profile = viewed.profile;
    $('[data-profile-avatar]').innerHTML = avatar(profile);
    $('[data-profile-name]').textContent = profile.displayName || profile.username;
    $('[data-profile-username]').textContent = `@${profile.githubUsername || profile.username}`;
    $('[data-profile-bio]').textContent = profile.bio || 'No description yet.';
    $('[data-profile-badges]').innerHTML = (profile.badges || []).map((badge) => `<span class="pill pill--featured">${badge}</span>`).join('') || '<span class="pill">Creator</span>';
    $('[data-profile-source]').href = profile.githubProfileUrl || '#';
    $('[data-stat-projects]').textContent = viewed.stats?.projects || 0;
    $('[data-stat-likes]').textContent = viewed.stats?.likes || 0;
    $('[data-stat-favorites]').textContent = viewed.stats?.favorites || 0;
    $('[data-stat-views]').textContent = viewed.stats?.views || 0;
    $('[data-profile-featured]').innerHTML = featuredCard(viewed.featured);
    $('[data-profile-projects]').innerHTML = viewed.projects?.length ? viewed.projects.map(projectCard).join('') : '<div class="scratch-empty">No shared projects yet.</div>';
    $('[data-working-on]').textContent = viewed.projects?.[0] ? `Working on ${viewed.projects[0].title}.` : 'Building Pixnaria projects.';
    $('[data-profile-activity]').innerHTML = `<li>Joined Pixnaria</li>${viewed.projects?.slice(0, 3).map((p) => `<li>Shared ${p.title}</li>`).join('') || ''}`;
    renderEditPanel();
  }

  function bindEdit() {
    $('[data-edit-avatar]')?.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 1024 * 1024) return alert('Avatar limit: 1 MB before compression.');
      const reader = new FileReader();
      reader.onload = () => {
        avatarData = String(reader.result);
        $('[data-edit-avatar-preview]').innerHTML = `<span class="avatar"><img src="${avatarData}" alt="Avatar preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></span>`;
      };
      reader.readAsDataURL(file);
    });

    $('[data-save-profile-edit]')?.addEventListener('click', async () => {
      const displayName = $('[data-edit-display]').value.trim() || viewed.profile.username;
      const bio = $('[data-edit-bio]').value.trim();
      if (!USERNAME_RE.test(displayName)) return alert('Display name can only contain letters, numbers, _ and -.');
      try {
        const data = await api('/api/data/profile', {
          method: 'POST',
          body: JSON.stringify({ displayName, bio, avatarData: avatarData || viewed.profile.avatarData || null })
        });
        viewed.profile = data.profile;
        currentUser = data.profile;
        localStorage.setItem('pixnaria_mock_user', JSON.stringify(data.profile));
        render();
        setStatus('Profile saved.', 'success');
      } catch (error) {
        setStatus(error.message, 'error');
      }
    });
  }

  async function init() {
    if (!$('[data-user-profile-page]')) return;
    bindEdit();
    bindWall();
    try {
      await loadViewedProfile();
      render();
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaProfilePage.init);
