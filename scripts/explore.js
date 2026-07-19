const PixnariaExplore = (() => {
  let projects = [];
  let loading = true;
  let activeSort = 'trending';
  let activeFilter = 'all';
  let query = '';

  const $ = (selector) => document.querySelector(selector);

  function score(project) {
    return (project.likes || 0) * 3 + (project.favorites || 0) * 4 + (project.views || 0) * 0.04 + (project.featured ? 80 : 0);
  }

  function sorted(list) {
    const copy = [...list];
    if (activeSort === 'popular') return copy.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    if (activeSort === 'featured') return copy.filter((p) => p.featured);
    if (activeSort === 'recent') return copy.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    return copy.sort((a, b) => score(b) - score(a));
  }

  function filtered() {
    const q = query.trim().toLowerCase();
    return sorted(projects).filter((project) => {
      const tag = String(project.tag || '').toLowerCase();
      const matchesFilter = activeFilter === 'all' || tag === activeFilter;
      const matchesQuery = !q || project.title.toLowerCase().includes(q) || String(project.author || '').toLowerCase().includes(q) || String(project.description || '').toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }

  function projectCard(project) {
    const href = project.githubRepo ? `project.html?repo=${encodeURIComponent(project.githubRepo)}` : 'project.html';
    return `
      <article class="project-card" tabindex="0" onclick="location.href='${href}'">
        ${projectPreview(project)}
        <div class="project-card__body">
          <div class="project-card__topline"><span class="pill">${project.tag || 'Project'}</span>${project.featured ? '<span class="pill pill--featured">Featured</span>' : ''}</div>
          <h3>${project.title}</h3>
          <p>${project.description || 'Pixnaria project.'}</p>
          <div class="project-card__author">by <strong>${project.author}</strong></div>
          <div class="project-card__stats"><span>♥ ${project.likes || 0}</span><span>★ ${project.favorites || 0}</span><span>👁 ${project.views || 0}</span></div>
        </div>
      </article>
    `;
  }

  function skeleton() {
    return Array.from({ length: 6 }, () => `<article class="project-card project-card--loading"><div class="project-preview"></div><div class="project-card__body"><div class="skeleton-line short"></div><div class="skeleton-line"></div><div class="skeleton-line mid"></div></div></article>`).join('');
  }

  function renderTabs() {
    document.querySelectorAll('[data-explore-sort]').forEach((b) => b.classList.toggle('active', b.dataset.exploreSort === activeSort));
    document.querySelectorAll('[data-explore-filter]').forEach((b) => b.classList.toggle('active', b.dataset.exploreFilter === activeFilter));
  }

  function renderProjects() {
    const grid = $('[data-explore-projects]');
    const count = $('[data-explore-count]');
    if (!grid) return;
    if (loading) {
      grid.innerHTML = skeleton();
      if (count) count.textContent = 'Loading projects';
      return;
    }
    const list = filtered();
    if (count) count.textContent = `${list.length} projects`;
    grid.innerHTML = list.length ? list.map(projectCard).join('') : `<div class="explore-empty">No projects published yet.</div>`;
  }

  function renderRanks() {
    const list = $('[data-trending-ranks]');
    if (!list) return;
    list.innerHTML = sorted(projects).slice(0, 5).map((project, index) => `<li><span class="rank-number">${index + 1}</span><span><strong>${project.title}</strong><small>${project.author} · ${Math.round(score(project))}</small></span></li>`).join('') || '<li class="studio-card"><span>No ranking yet</span></li>';
  }

  function renderStudios() {
    const list = $('[data-studio-list]');
    if (!list) return;
    list.innerHTML = `<li class="studio-card"><span class="studio-icon">P</span><span><strong>Pixnaria Creators</strong><small>Community studio</small></span></li>`;
  }

  async function load() {
    loading = true;
    render();
    try {
      const res = await fetch('/api/supabase/explore', { credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      projects = data.configured && Array.isArray(data.projects) ? data.projects : [];
    } catch { projects = []; }
    loading = false;
    render();
  }

  function bind() {
    document.querySelectorAll('[data-explore-sort]').forEach((b) => b.addEventListener('click', () => { activeSort = b.dataset.exploreSort; render(); }));
    document.querySelectorAll('[data-explore-filter]').forEach((b) => b.addEventListener('click', () => { activeFilter = b.dataset.exploreFilter; render(); }));
    $('[data-explore-search]')?.addEventListener('input', (e) => { query = e.target.value; render(); });
  }

  function render() { renderTabs(); renderProjects(); renderRanks(); renderStudios(); }
  function init() { if (!$('[data-explore-page]')) return; bind(); load(); }
  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaExplore.init);
