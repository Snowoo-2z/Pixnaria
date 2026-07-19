const PixnariaStudioPage = (() => {
  let id = null;
  let data = null;
  const $ = (selector) => document.querySelector(selector);

  async function api(path, options = {}) {
    const res = await fetch(path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...options });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Request failed ${res.status}`);
    return json;
  }

  function setStatus(message, type = '') { const n = $('[data-studio-status]'); if (n) { n.textContent = message; n.className = `auth-status ${type}`.trim(); } }
  function projectCard(project) { const href = `project.html?repo=${encodeURIComponent(project.githubRepo)}`; return `<a class="profile-project-card" href="${href}">${projectPreview(project)}<div><h3>${project.title}</h3><small>♥ ${project.likes || 0} · ★ ${project.favorites || 0}</small></div></a>`; }

  function render() {
    const studio = data.studio;
    $('[data-studio-icon]').textContent = studio.name.charAt(0).toUpperCase();
    $('[data-studio-name]').textContent = studio.name;
    $('[data-studio-description]').textContent = studio.description || 'Pixnaria studio.';
    $('[data-studio-projects]').innerHTML = data.projects.length ? data.projects.map(projectCard).join('') : '<div class="scratch-empty">No projects in this studio yet.</div>';
    $('[data-studio-members]').innerHTML = data.members.map((m) => `<li>${m.profile?.display_name || m.profile?.github_username || 'Member'} · ${m.role}</li>`).join('') || '<li>No members yet.</li>';
    $('[data-add-studio-project]').hidden = !data.permissions?.canManage;
    $('[data-join-studio]').hidden = data.permissions?.joined;
    $('[data-leave-studio]').hidden = !data.permissions?.joined || data.permissions?.role === 'owner';
  }

  async function load() {
    id = new URLSearchParams(location.search).get('id');
    if (!id) return setStatus('Missing studio id.', 'error');
    setStatus('Loading studio…');
    data = await api(`/api/supabase/studios?id=${encodeURIComponent(id)}`);
    setStatus('Studio loaded.', 'success');
    render();
  }

  async function action(payload) {
    data = await api('/api/supabase/studios', { method: 'POST', body: JSON.stringify({ studioId: id, ...payload }) });
    render();
  }

  function bind() {
    $('[data-join-studio]')?.addEventListener('click', () => action({ action: 'join' }).catch((e) => setStatus(e.message, 'error')));
    $('[data-leave-studio]')?.addEventListener('click', () => action({ action: 'leave' }).catch((e) => setStatus(e.message, 'error')));
    $('[data-add-studio-project]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const repo = new FormData(event.currentTarget).get('repo');
      action({ action: 'add_project', repo }).then(() => event.currentTarget.reset()).catch((e) => setStatus(e.message, 'error'));
    });
  }

  function init() { if (!$('[data-studio-page]')) return; bind(); load().catch((e) => setStatus(e.message, 'error')); }
  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaStudioPage.init);
