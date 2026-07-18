const PixnariaProfilePage = (() => {
  const USERNAME_RE = /^[A-Za-z0-9_-]+$/;
  let currentUser = null;
  let viewedUser = null;
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

  function localUser() {
    try { return JSON.parse(localStorage.getItem('pixnaria_mock_user') || 'null'); }
    catch { return null; }
  }

  function isAdminName(name) {
    return ['snowoo-2z', 'snowoo'].includes(String(name || '').toLowerCase());
  }

  function normalizeSessionUser(data) {
    if (data?.pixnariaProfile) return data.pixnariaProfile;
    if (!data?.github) return null;
    const gh = data.github;
    const admin = isAdminName(gh.login);
    return {
      id: admin ? 'user_snowoo' : `pix_${gh.id}`,
      username: gh.login,
      githubUsername: gh.login,
      githubId: gh.id,
      githubProfileUrl: gh.html_url,
      displayName: gh.login,
      bio: '',
      avatarInitial: gh.login.charAt(0).toUpperCase(),
      avatarColor: admin ? 'creator' : 'default',
      role: admin ? 'creator' : 'user',
      badges: admin ? ['Creator', 'Admin'] : [],
      joinedAt: new Date().toISOString().slice(0, 10),
      githubConnected: true
    };
  }

  async function loadCurrentUser() {
    try {
      const res = await fetch('/api/supabase/profile', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          localStorage.setItem('pixnaria_mock_user', JSON.stringify(data.profile));
          return data.profile;
        }
      }
    } catch {}

    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        const user = normalizeSessionUser(data);
        if (user) localStorage.setItem('pixnaria_mock_user', JSON.stringify(user));
        return user;
      }
    } catch {}
    return localUser();
  }

  function avatar(user, big = true) {
    const cls = big ? 'profile-big-avatar' : '';
    if (user?.avatarData) return `<span class="avatar avatar--${user.avatarColor || 'default'} ${cls}"><img src="${user.avatarData}" alt="${user.displayName || user.username}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></span>`;
    const initial = (user?.displayName || user?.username || '?').charAt(0).toUpperCase();
    return `<span class="avatar avatar--${user?.avatarColor || 'default'} ${cls}">${initial}</span>`;
  }

  function isOwnProfile() {
    if (!currentUser || !viewedUser) return false;
    return String(currentUser.githubUsername || currentUser.username).toLowerCase() === String(viewedUser.githubUsername || viewedUser.username).toLowerCase();
  }

  function renderProjects() {
    const grid = $('[data-profile-projects]');
    if (!grid) return;
    grid.innerHTML = PIXNARIA_PROJECTS.slice(0, 3).map((project) => `
      <a class="profile-project-mini" href="project.html">
        ${projectPreview(project)}
        <div><h3>${project.title}</h3><small>♥ ${project.likes} · ★ ${project.favorites}</small></div>
      </a>
    `).join('');
  }

  function renderEditPanel() {
    const panel = $('[data-profile-edit-panel]');
    if (!panel) return;
    panel.hidden = !isOwnProfile();
    if (!isOwnProfile()) return;
    $('[data-edit-display]').value = viewedUser.displayName || viewedUser.username;
    $('[data-edit-bio]').value = viewedUser.bio || '';
    $('[data-edit-avatar-preview]').innerHTML = avatar(viewedUser, false);
  }

  function render() {
    $('[data-profile-avatar]').innerHTML = avatar(viewedUser);
    $('[data-profile-name]').textContent = viewedUser.displayName || viewedUser.username;
    $('[data-profile-username]').textContent = `@${viewedUser.githubUsername || viewedUser.username}`;
    $('[data-profile-bio]').textContent = viewedUser.bio || 'No description yet.';
    $('[data-profile-badges]').innerHTML = (viewedUser.badges || []).map((badge) => `<span class="pill pill--featured">${badge}</span>`).join('') || '<span class="pill">Creator</span>';
    const gh = $('[data-profile-github]');
    if (gh && viewedUser.githubProfileUrl) gh.href = viewedUser.githubProfileUrl;
    renderProjects();
    renderEditPanel();
  }

  function bindEdit() {
    $('[data-edit-avatar]')?.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 1024 * 1024) {
        alert('Avatar limit: 1 MB before compression.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        avatarData = String(reader.result);
        $('[data-edit-avatar-preview]').innerHTML = `<span class="avatar"><img src="${avatarData}" alt="Avatar preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></span>`;
      };
      reader.readAsDataURL(file);
    });

    $('[data-save-profile-edit]')?.addEventListener('click', async () => {
      const displayName = $('[data-edit-display]').value.trim() || viewedUser.username;
      const bio = $('[data-edit-bio]').value.trim();
      if (!USERNAME_RE.test(displayName)) {
        alert('Display name can only contain letters, numbers, _ and -.');
        return;
      }
      try {
        const data = await api('/api/supabase/profile', {
          method: 'POST',
          body: JSON.stringify({ displayName, bio, avatarData: avatarData || viewedUser.avatarData || null })
        });
        currentUser = data.profile || data.user;
        viewedUser = currentUser;
        localStorage.setItem('pixnaria_mock_user', JSON.stringify(currentUser));
        render();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  async function init() {
    if (!$('[data-user-profile-page]')) return;
    currentUser = await loadCurrentUser();
    const requested = usernameFromPath();
    if (!currentUser && !requested) {
      location.href = 'auth.html';
      return;
    }
    if (requested && (!currentUser || requested.toLowerCase() !== String(currentUser.githubUsername || currentUser.username).toLowerCase())) {
      viewedUser = { username: requested, githubUsername: requested, displayName: requested, bio: 'Pixnaria creator profile.', badges: isAdminName(requested) ? ['Creator', 'Admin'] : [], avatarInitial: requested.charAt(0).toUpperCase(), avatarColor: isAdminName(requested) ? 'creator' : 'default', githubProfileUrl: `https://github.com/${requested}` };
    } else {
      viewedUser = currentUser;
    }
    bindEdit();
    render();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaProfilePage.init);
