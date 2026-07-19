const PixnariaHome = (() => {
  let data = { featured: [], trending: [], recent: [], studios: [], news: [] };
  let loading = true;

  const $ = (selector) => document.querySelector(selector);

  function projectUrl(project) {
    return project.githubRepo ? `project.html?repo=${encodeURIComponent(project.githubRepo)}` : 'project.html';
  }

  function projectCard(project) {
    return `
      <article class="scratch-project-card" onclick="location.href='${projectUrl(project)}'" tabindex="0">
        ${projectPreview(project)}
        <div class="scratch-project-card__body">
          <h3>${project.title}</h3>
          <p>${project.author}</p>
          <div><span>♥ ${project.likes || 0}</span><span>★ ${project.favorites || 0}</span></div>
        </div>
      </article>
    `;
  }

  function wideFeatured(project) {
    if (!project) return `<div class="scratch-empty">No featured project yet.</div>`;
    return `
      <article class="scratch-featured" onclick="location.href='${projectUrl(project)}'" tabindex="0">
        ${projectPreview(project)}
        <div>
          <span class="pill pill--featured">Featured Project</span>
          <h3>${project.title}</h3>
          <p>${project.description || 'Pixnaria project.'}</p>
          <small>by ${project.author}</small>
        </div>
      </article>
    `;
  }

  function studioCard(studio) {
    return `
      <article class="scratch-studio-card">
        <span class="studio-icon">${studio.name.charAt(0).toUpperCase()}</span>
        <div><h3>${studio.name}</h3><p>${studio.description || 'Community studio'}</p></div>
      </article>
    `;
  }

  function newsCard(item) {
    return `
      <article class="scratch-news-card">
        <span class="pill">${item.category || 'news'}</span>
        <h3>${item.title}</h3>
        <p>${item.content}</p>
      </article>
    `;
  }

  function skeleton(count = 4) {
    return Array.from({ length: count }, () => `<article class="scratch-project-card project-card--loading"><div class="project-preview"></div><div class="scratch-project-card__body"><div class="skeleton-line short"></div><div class="skeleton-line"></div></div></article>`).join('');
  }

  function renderRail(selector, items, renderer, empty = 'Nothing here yet.') {
    const node = $(selector);
    if (!node) return;
    if (loading) node.innerHTML = skeleton(4);
    else node.innerHTML = items.length ? items.map(renderer).join('') : `<div class="scratch-empty">${empty}</div>`;
  }

  function render() {
    const featured = $('[data-home-featured]');
    if (featured) featured.innerHTML = loading ? skeleton(1) : wideFeatured(data.featured[0] || data.trending[0]);
    renderRail('[data-home-trending]', data.trending, projectCard, 'No projects published yet.');
    renderRail('[data-home-recent]', data.recent, projectCard, 'No recent projects yet.');
    renderRail('[data-home-studios]', data.studios, studioCard, 'No studios yet.');
    renderRail('[data-home-news]', data.news, newsCard, 'No news yet.');
  }

  async function load() {
    loading = true;
    render();
    try {
      const res = await fetch('/api/supabase/home', { credentials: 'same-origin' });
      const json = await res.json().catch(() => ({}));
      if (json.configured) data = json;
      else data = { featured: [], trending: [], recent: [], studios: [], news: [] };
    } catch {
      data = { featured: [], trending: [], recent: [], studios: [], news: [] };
    } finally {
      loading = false;
      render();
    }
  }

  function init() {
    if (!$('[data-home-page]')) return;
    load();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PixnariaHome.init);
