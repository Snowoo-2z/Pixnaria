const PixnariaStudios = (() => {
  let studios = [];
  const $ = (selector) => document.querySelector(selector);

  async function api(path, options = {}) {
    const res = await fetch(path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed ${res.status}`);
    return data;
  }

  function setStatus(message, type = '') {
    const node = $('[data-studios-status]');
    if (!node) return;
    node.textContent = message;
    node.className = `auth-status ${type}`.trim();
  }

  function render() {
    const list = $('[data-studios-list]');
    if (!list) return;
    list.innerHTML = studios.length ? studios.map((studio) => `
      <a class="studio-tile" href="studio.html?id=${studio.id}">
        <span class="studio-icon">${studio.name.charAt(0).toUpperCase()}</span>
        <div><h3>${studio.name}</h3><p>${studio.description || 'Pixnaria studio'}</p><small>${studio.members_count || 0} members · ${studio.projects_count || 0} projects</small></div>
      </a>
    `).join('') : '<div class="scratch-empty">No studios yet.</div>';
  }

  async function load() {
    setStatus('Loading studios…');
    try {
      const data = await api('/api/supabase/studios');
      studios = data.studios || [];
      setStatus('Studios loaded.', 'success');
      render();
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  function bind() {
    $('[data-create-studio-open]')?.addEventListener('click', () => $('[data-studio-modal]').showModal());
    document.querySelectorAll('[data-studio-close]').forEach((button) => button.addEventListener('click', () => $('[data-studio-modal]').close()));
    $('[data-create-studio-form]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        const data = await api('/api/supabase/studios', { method: 'POST', body: JSON.stringify({ action: 'create', name: form.get('name'), description: form.get('description') }) });
        location.href = `studio.html?id=${data.studio.id}`;
      } catch (error) { setStatus(error.message, 'error'); }
    });
  }

  function init() { if (!$('[data-studios-page]')) return; bind(); load(); }
  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaStudios.init);
