const PixnariaExplore = (() => {
  const extraProjects = [
    { id: "menu-magic", title: "Menu Magic", author: "Snowoo-2z", tag: "UI", description: "A polished animated menu made with UI nodes.", likes: 64, favorites: 21, views: "740", color: "violet", featured: false, createdAt: 5 },
    { id: "tilemap-cave", title: "Tilemap Cave", author: "Blockless", tag: "Game", description: "A cave exploration scene using Tilemap and Sprite nodes.", likes: 112, favorites: 36, views: "1.5k", color: "cyan", featured: false, createdAt: 2 },
    { id: "particles-demo", title: "Particles Demo", author: "VioletLab", tag: "Animation", description: "Neon particles, timers and Python events.", likes: 58, favorites: 16, views: "680", color: "magenta", featured: false, createdAt: 1 },
    { id: "jump-test", title: "Jump Test", author: "OrbitKid", tag: "Physics", description: "Testing collisions, gravity and Player templates.", likes: 43, favorites: 13, views: "520", color: "indigo", featured: false, createdAt: 0 }
  ];

  const studios = [
    { name: "Neon Builders", members: 18, projects: 7, icon: "N" },
    { name: "Python Game Lab", members: 32, projects: 12, icon: "Py" },
    { name: "Animation Makers", members: 14, projects: 5, icon: "A" },
    { name: "Pixnaria Starters", members: 51, projects: 20, icon: "P" }
  ];

  let realProjects = null;

  let activeSort = "trending";
  let activeFilter = "all";
  let query = "";

  const $ = (selector) => document.querySelector(selector);

  function allProjects() {
    return realProjects && realProjects.length ? realProjects : [...PIXNARIA_PROJECTS, ...extraProjects];
  }

  function score(project) {
    const views = Number(String(project.views).replace("k", "")) * (String(project.views).includes("k") ? 1000 : 1);
    return project.likes * 3 + project.favorites * 4 + views * 0.04 + (project.featured ? 80 : 0);
  }

  function sortedProjects(projects) {
    const copy = [...projects];
    if (activeSort === "recent") return copy.sort((a, b) => (a.createdAt ?? 10) - (b.createdAt ?? 10));
    if (activeSort === "popular") return copy.sort((a, b) => b.likes - a.likes);
    if (activeSort === "featured") return copy.filter((project) => project.featured);
    return copy.sort((a, b) => score(b) - score(a));
  }

  function filteredProjects() {
    const q = query.trim().toLowerCase();
    return sortedProjects(allProjects()).filter((project) => {
      const matchesFilter = activeFilter === "all" || project.tag.toLowerCase() === activeFilter;
      const matchesQuery = !q || project.title.toLowerCase().includes(q) || project.author.toLowerCase().includes(q) || project.description.toLowerCase().includes(q) || project.tag.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }

  function renderTabs() {
    document.querySelectorAll("[data-explore-sort]").forEach((button) => {
      button.classList.toggle("active", button.dataset.exploreSort === activeSort);
    });
    document.querySelectorAll("[data-explore-filter]").forEach((button) => {
      button.classList.toggle("active", button.dataset.exploreFilter === activeFilter);
    });
  }

  function projectCard(project) {
    return `
      <article class="project-card" tabindex="0" onclick="location.href='project.html${project.githubRepo ? `?repo=${encodeURIComponent(project.githubRepo)}` : ``}'">
        ${typeof projectPreview === "function" ? projectPreview(project) : ""}
        <div class="project-card__body">
          <div class="project-card__topline">
            <span class="pill">${project.tag}</span>
            ${project.featured ? '<span class="pill pill--featured">Featured</span>' : ''}
          </div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="project-card__author">by <strong>${project.author}</strong></div>
          <div class="project-card__stats"><span>♥ ${project.likes}</span><span>★ ${project.favorites}</span><span>👁 ${project.views}</span></div>
        </div>
      </article>
    `;
  }

  function renderProjects() {
    const grid = $("[data-explore-projects]");
    const count = $("[data-explore-count]");
    if (!grid) return;
    const projects = filteredProjects();
    if (count) count.textContent = `${projects.length} projects`;
    grid.innerHTML = projects.length ? projects.map(projectCard).join("") : `<div class="explore-empty">No project found. Try another search or filter.</div>`;
  }

  function renderRanks() {
    const list = $("[data-trending-ranks]");
    if (!list) return;
    list.innerHTML = sortedProjects(allProjects()).slice(0, 5).map((project, index) => `
      <li>
        <span class="rank-number">${index + 1}</span>
        <span><strong>${project.title}</strong><small>${project.author} · score ${Math.round(score(project))}</small></span>
      </li>
    `).join("");
  }

  function renderStudios() {
    const list = $("[data-studio-list]");
    if (!list) return;
    list.innerHTML = studios.map((studio) => `
      <li class="studio-card">
        <span class="studio-icon">${studio.icon}</span>
        <span><strong>${studio.name}</strong><small>${studio.members} members · ${studio.projects} projects</small></span>
      </li>
    `).join("");
  }

  async function loadRealProjects() {
    try {
      const response = await fetch('/api/supabase/explore', { credentials: 'same-origin' });
      if (!response.ok) return;
      const data = await response.json();
      if (data.configured && Array.isArray(data.projects) && data.projects.length) realProjects = data.projects;
    } catch {}
  }

  function bind() {
    document.querySelectorAll("[data-explore-sort]").forEach((button) => {
      button.addEventListener("click", () => {
        activeSort = button.dataset.exploreSort;
        render();
      });
    });
    document.querySelectorAll("[data-explore-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.exploreFilter;
        render();
      });
    });
    $("[data-explore-search]")?.addEventListener("input", (event) => {
      query = event.target.value;
      render();
    });
  }

  function render() {
    renderTabs();
    renderProjects();
    renderRanks();
    renderStudios();
  }

  async function init() {
    if (!$('[data-explore-page]')) return;
    bind();
    await loadRealProjects();
    render();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", PixnariaExplore.init);
