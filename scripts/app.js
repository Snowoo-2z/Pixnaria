let PIXNARIA_COMMUNITY_PROJECTS = [];
let PIXNARIA_PROJECTS_LOADING = true;

function projectPreview(project = {}) {
  return `
    <div class="project-preview project-preview--${project.color || 'violet'}" aria-hidden="true">
      <div class="preview-orb preview-orb--one"></div>
      <div class="preview-orb preview-orb--two"></div>
      <div class="preview-platform"></div>
      <div class="preview-player"></div>
    </div>
  `;
}

function skeletonCards(count = 4) {
  return Array.from({ length: count }, () => `
    <article class="project-card project-card--loading">
      <div class="project-preview"></div>
      <div class="project-card__body">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line mid"></div>
      </div>
    </article>
  `).join('');
}

async function loadCommunityProjects() {
  PIXNARIA_PROJECTS_LOADING = true;
  renderProjects();
  try {
    const res = await fetch('/api/supabase/explore', { credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    PIXNARIA_COMMUNITY_PROJECTS = data.configured && Array.isArray(data.projects) ? data.projects : [];
  } catch {
    PIXNARIA_COMMUNITY_PROJECTS = [];
  } finally {
    PIXNARIA_PROJECTS_LOADING = false;
    renderProjects();
  }
}

function projectCard(project) {
  const href = project.githubRepo ? `project.html?repo=${encodeURIComponent(project.githubRepo)}` : 'project.html';
  return `
    <article class="project-card" tabindex="0" onclick="location.href='${href}'">
      ${projectPreview(project)}
      <div class="project-card__body">
        <div class="project-card__topline">
          <span class="pill">${project.tag || 'Project'}</span>
          ${project.featured ? '<span class="pill pill--featured">Featured</span>' : ''}
        </div>
        <h3>${project.title}</h3>
        <p>${project.description || 'Pixnaria project.'}</p>
        <div class="project-card__author">by <strong>${project.author}</strong></div>
        <div class="project-card__stats"><span>♥ ${project.likes || 0}</span><span>★ ${project.favorites || 0}</span><span>👁 ${project.views || 0}</span></div>
      </div>
    </article>
  `;
}

function emptyProjects() {
  return `<div class="empty-projects">No projects published yet.</div>`;
}

function renderProjects() {
  const trending = document.querySelector('[data-trending-projects]');
  const featured = document.querySelector('[data-featured-project]');

  if (PIXNARIA_PROJECTS_LOADING) {
    if (trending) trending.innerHTML = skeletonCards(4);
    if (featured) featured.innerHTML = skeletonCards(1);
    return;
  }

  const projects = PIXNARIA_COMMUNITY_PROJECTS;
  const main = projects.find((p) => p.featured) || projects[0];

  if (trending) trending.innerHTML = projects.length ? projects.map(projectCard).join('') : emptyProjects();

  if (featured) {
    if (!main) {
      featured.innerHTML = `<div class="clean-card"><h3>No featured project yet</h3><p style="color:var(--muted)">Featured projects will appear here when published.</p></div>`;
      return;
    }
    const href = main.githubRepo ? `project.html?repo=${encodeURIComponent(main.githubRepo)}` : 'project.html';
    featured.innerHTML = `
      <div class="featured-card__visual">${projectPreview(main)}</div>
      <div class="featured-card__content">
        <span class="section-kicker">Featured Project</span>
        <h3>${main.title}</h3>
        <p>${main.description || 'Pixnaria project.'}</p>
        <div class="featured-card__actions">
          <a class="button button--primary" href="${href}">View project</a>
          <a class="button button--ghost" href="explore.html">Explore</a>
        </div>
      </div>
    `;
  }
}

function createAvatar(user = {}) {
  if (user.avatarData) return `<span class="avatar avatar--${user.avatarColor || 'default'}"><img src="${user.avatarData}" alt="${user.displayName || user.username || 'Avatar'}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></span>`;
  const initial = user.avatarInitial || (user.displayName || user.username || '?').charAt(0).toUpperCase();
  return `<span class="avatar avatar--${user.avatarColor || 'default'}" aria-hidden="true">${initial}</span>`;
}

function renderUser() {
  const user = window.PIXNARIA_USER;
  if (!user) return;
  document.querySelectorAll('[data-username]').forEach((node) => node.textContent = user.displayName || user.username || 'Guest');
  document.querySelectorAll('[data-avatar]').forEach((node) => node.innerHTML = createAvatar(user));
}

function renderNews() {
  if (!window.PixnariaNewsAdmin) return;
  const list = document.querySelector('[data-news-list]');
  if (!list) return;
  const news = PixnariaNewsAdmin.getNews().filter((item) => item.published).sort((a, b) => Number(b.pinned) - Number(a.pinned));
  list.innerHTML = news.map((item) => `<article class="news-card"><div class="news-card__meta"><span class="pill">${item.category}</span><time>${item.date}</time></div><h3>${item.title.en}</h3><p>${item.content.en}</p></article>`).join('');
}

function initApp() {
  renderUser();
  if (typeof initNavigation === 'function') initNavigation();
  window.PixnariaNewsAdmin?.init?.();
  renderNews();
  loadCommunityProjects();
  document.addEventListener('pixnaria:session', renderUser);
  document.addEventListener('pixnaria:news-updated', renderNews);
}

document.addEventListener('DOMContentLoaded', initApp);
