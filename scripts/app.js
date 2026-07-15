function createAvatar(user) {
  return `<span class="avatar avatar--${user.avatarColor}" aria-hidden="true">${user.avatarInitial}</span>`;
}

function renderUser() {
  document.querySelectorAll("[data-username]").forEach((node) => {
    node.textContent = PIXNARIA_USER.username;
  });
  document.querySelectorAll("[data-avatar]").forEach((node) => {
    node.innerHTML = createAvatar(PIXNARIA_USER);
  });
}

function projectPreview(project) {
  return `
    <div class="project-preview project-preview--${project.color}" aria-hidden="true">
      <div class="preview-orb preview-orb--one"></div>
      <div class="preview-orb preview-orb--two"></div>
      <div class="preview-platform"></div>
      <div class="preview-player"></div>
      <div class="preview-spark preview-spark--one"></div>
      <div class="preview-spark preview-spark--two"></div>
    </div>
  `;
}

function projectCard(project) {
  return `
    <article class="project-card" tabindex="0">
      ${projectPreview(project)}
      <div class="project-card__body">
        <div class="project-card__topline">
          <span class="pill">${project.tag}</span>
          ${project.featured ? '<span class="pill pill--featured">Featured</span>' : ''}
        </div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-card__author">by <strong>${project.author}</strong></div>
        <div class="project-card__stats" aria-label="Project statistics">
          <span>♥ ${project.likes}</span>
          <span>★ ${project.favorites}</span>
          <span>👁 ${project.views}</span>
        </div>
      </div>
    </article>
  `;
}

function renderProjects() {
  const trending = document.querySelector("[data-trending-projects]");
  const featured = document.querySelector("[data-featured-project]");

  if (trending) {
    trending.innerHTML = PIXNARIA_PROJECTS.map(projectCard).join("");
  }

  if (featured) {
    const main = PIXNARIA_PROJECTS.find((project) => project.featured) || PIXNARIA_PROJECTS[0];
    featured.innerHTML = `
      <div class="featured-card__visual">
        ${projectPreview(main)}
      </div>
      <div class="featured-card__content">
        <span class="section-kicker" data-i18n="featured">${PixnariaI18n.t("featured")}</span>
        <h3>${main.title}</h3>
        <p>${main.description} Pixnaria highlights projects selected for creativity, quality, or community value.</p>
        <div class="featured-card__actions">
          <a class="button button--primary" href="editor.html" data-i18n="openEditor">${PixnariaI18n.t("openEditor")}</a>
          <a class="button button--ghost" href="project.html" data-i18n="viewProject">${PixnariaI18n.t("viewProject")}</a>
        </div>
      </div>
    `;
  }
}

function newsLabel(category) {
  const labels = {
    announcement: "Announcement",
    update: "Update",
    contest: "Contest",
    community: "Community",
    maintenance: "Maintenance",
    featured: "Featured"
  };
  return labels[category] || category;
}

function renderNews() {
  const list = document.querySelector("[data-news-list]");
  const adminList = document.querySelector("[data-admin-news-list]");
  const lang = PixnariaI18n.current();
  const news = PixnariaNewsAdmin.getNews()
    .filter((item) => item.published)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  if (list) {
    list.innerHTML = news.map((item) => `
      <article class="news-card ${item.important ? "news-card--important" : ""}">
        <div class="news-card__meta">
          <span class="pill ${item.pinned ? "pill--featured" : ""}">${item.pinned ? "Pinned" : newsLabel(item.category)}</span>
          <time datetime="${item.date}">${item.date}</time>
        </div>
        <h3>${item.title[lang] || item.title.en}</h3>
        <p>${item.content[lang] || item.content.en}</p>
      </article>
    `).join("");
  }

  if (adminList) {
    const allNews = PixnariaNewsAdmin.getNews();
    adminList.innerHTML = allNews.map((item) => `
      <li>
        <span>
          <strong>${item.title[lang] || item.title.en}</strong>
          <small>${item.category} · ${item.date}</small>
        </span>
        <button class="icon-button danger" type="button" data-delete-news="${item.id}" aria-label="Delete news">×</button>
      </li>
    `).join("");

    adminList.querySelectorAll("[data-delete-news]").forEach((button) => {
      button.addEventListener("click", () => PixnariaNewsAdmin.removeNews(button.dataset.deleteNews));
    });
  }
}

function renderTeamPreview() {
  const team = document.querySelector("[data-team-preview]");
  if (!team) return;
  team.innerHTML = PIXNARIA_TEAM.map((member) => `
    <div class="team-chip ${member.top ? "team-chip--creator" : ""}">
      <span class="avatar ${member.top ? "avatar--creator" : ""}">${member.username.charAt(0)}</span>
      <span>
        <strong>${member.username}</strong>
        <small>${member.role} · Joined ${member.joinedAt}</small>
      </span>
    </div>
  `).join("");
}

function initApp() {
  renderUser();
  PixnariaI18n.apply();
  initNavigation();
  PixnariaNewsAdmin.init();
  renderProjects();
  renderNews();
  renderTeamPreview();

  document.addEventListener("pixnaria:lang", () => {
    PixnariaI18n.apply();
    renderProjects();
    renderNews();
  });
  document.addEventListener("pixnaria:news-updated", renderNews);
}

document.addEventListener("DOMContentLoaded", initApp);
