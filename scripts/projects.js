const PixnariaProjects = (() => {
  const STORAGE_KEY = "pixnaria_my_projects_mock";
  let activeFilter = "all";
  let query = "";

  const defaultProjects = [
    {
      id: "neon-platformer",
      title: "Neon Platformer",
      description: "A public platformer prototype with collisions and touch controls.",
      visibility: "public",
      updatedAt: "Today",
      sizeKb: 182,
      nodes: 8,
      scripts: 3
    },
    {
      id: "untitled-animation",
      title: "Untitled Animation",
      description: "Private animation draft using sprites, timers and particles.",
      visibility: "private",
      updatedAt: "Today",
      sizeKb: 96,
      nodes: 5,
      scripts: 1
    },
    {
      id: "menu-test",
      title: "Menu Test",
      description: "UI experiment with MenuButton and Panel nodes.",
      visibility: "private",
      updatedAt: "Yesterday",
      sizeKb: 64,
      nodes: 6,
      scripts: 2
    }
  ];

  let projects = loadProjects();
  const $ = (selector) => document.querySelector(selector);

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  }


  function loadProjects() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(defaultProjects);
    } catch {
      return structuredClone(defaultProjects);
    }
  }

  function saveProjects() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  function uid() {
    return `project_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
  }

  function projectToPixna(project) {
    return {
      pixnariaFormat: "pixna-json-prototype",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      metadata: {
        name: project.title,
        author: PIXNARIA_USER.username,
        visibility: project.visibility,
        language: "Python",
        engine: "Pixnaria Custom 2D Engine"
      },
      scene: {
        rootNodeId: "scene",
        selectedNodeId: "scene",
        nodes: [
          { id: "scene", name: "Scene", type: "Node2D", parent: null, locked: false, hidden: false, props: { x: 0, y: 0, visible: true } },
          { id: "player", name: "Player", type: "Player", parent: "scene", locked: false, hidden: false, props: { x: 420, y: 260, speed: 250, visible: true } },
          { id: "player_collider", name: "Collider", type: "Collider", parent: "player", locked: false, hidden: false, props: { shape: "Rectangle", visible: true } }
        ]
      },
      scripts: {
        "Player.py": "class Player(Node2D):\n    speed = export(250)\n\n    def update(self, delta):\n        pass"
      },
      assets: [],
      settings: {
        theme: "dark",
        safePython: true,
        sceneName: "Scene",
        dimensions: { width: 1280, height: 720 },
        background: "#090712",
        physics: { gravity: 1350, jumpForce: 560 }
      }
    };
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function filteredProjects() {
    const q = query.toLowerCase().trim();
    return projects.filter((project) => {
      const matchesFilter = activeFilter === "all" || project.visibility === activeFilter;
      const matchesQuery = !q || project.title.toLowerCase().includes(q) || project.description.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }

  function renderProjects() {
    const grid = $("[data-my-projects]");
    const count = $("[data-project-count]");
    if (!grid) return;
    const list = filteredProjects();
    if (count) count.textContent = `${list.length} projects`;
    grid.innerHTML = list.length ? list.map((project) => `
      <article class="my-project-card">
        <div class="my-project-preview">
          <div class="my-project-preview__platform"></div>
          <div class="my-project-preview__player"></div>
        </div>
        <div class="my-project-card__body">
          <div class="project-card__topline">
            <span class="pill ${project.visibility === "public" ? "pill--featured" : ""}">${project.visibility}</span>
            <span class="pill">${project.sizeKb} KB</span>
          </div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="project-meta"><span>${project.nodes} nodes</span><span>${project.scripts} scripts</span><span>Updated ${project.updatedAt}</span></div>
          ${project.githubUrl ? `<div class="project-meta"><span>GitHub: ${project.githubRepo}</span></div>` : `<div class="project-meta"><span>Not synced to GitHub yet</span></div>`}
          <div class="my-project-card__actions">
            <a class="button button--primary button--small" href="editor.html">Open</a>
            <button class="button button--ghost button--small" type="button" data-export-project="${project.id}">Export</button>
            <button class="button button--ghost button--small" type="button" data-sync-github="${project.id}">${project.githubUrl ? "Re-sync" : "Create repo"}</button>
            ${project.githubUrl ? `<a class="button button--ghost button--small" href="${project.githubUrl}" target="_blank" rel="noreferrer">Open repo</a>` : `<button class="button button--ghost button--small" type="button" data-toggle-visibility="${project.id}">${project.visibility === "public" ? "Make private" : "Publish"}</button>`}
            <button class="button button--ghost button--small danger" type="button" data-delete-project="${project.id}">Delete</button>
          </div>
        </div>
      </article>
    `).join("") : `<div class="empty-projects">No project found. Create or import a .pixna file.</div>`;

    grid.querySelectorAll("[data-export-project]").forEach((button) => button.addEventListener("click", () => exportProject(button.dataset.exportProject)));
    grid.querySelectorAll("[data-sync-github]").forEach((button) => button.addEventListener("click", () => syncGitHubRepo(button.dataset.syncGithub)));
    grid.querySelectorAll("[data-toggle-visibility]").forEach((button) => button.addEventListener("click", () => toggleVisibility(button.dataset.toggleVisibility)));
    grid.querySelectorAll("[data-delete-project]").forEach((button) => button.addEventListener("click", () => deleteProject(button.dataset.deleteProject)));
    renderStorage();
  }

  function renderFilters() {
    document.querySelectorAll("[data-project-filter]").forEach((button) => {
      button.classList.toggle("active", button.dataset.projectFilter === activeFilter);
    });
  }

  function renderStorage() {
    const usage = projects.reduce((sum, project) => sum + Number(project.sizeKb || 0), 0);
    const label = $("[data-storage-label]");
    const bar = $("[data-storage-bar]");
    if (label) label.textContent = `${usage} KB used in mock storage`;
    if (bar) bar.style.setProperty("--usage", `${Math.min(100, usage / 12)}%`);
  }

  function createProject(data) {
    projects.unshift({
      id: uid(),
      title: data.title,
      description: data.description || "No description yet.",
      visibility: data.visibility,
      updatedAt: "Now",
      sizeKb: 48,
      nodes: 1,
      scripts: 0
    });
    saveProjects();
    render();
  }

  function deleteProject(id) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    if (!confirm(`Delete ${project.title}?`)) return;
    projects = projects.filter((item) => item.id !== id);
    saveProjects();
    render();
  }

  function toggleVisibility(id) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    project.visibility = project.visibility === "public" ? "private" : "public";
    project.updatedAt = "Now";
    saveProjects();
    render();
  }

  async function syncGitHubRepo(id) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    try {
      const data = await api("/api/github/repos", {
        method: "POST",
        body: JSON.stringify({ title: project.title, description: project.description })
      });
      project.githubRepo = data.repo.full_name;
      project.githubUrl = data.repo.html_url;
      project.visibility = "public";
      project.updatedAt = "Synced now";
      saveProjects();
      render();
      alert(`GitHub repo created: ${data.repo.full_name}`);
    } catch (error) {
      alert(`GitHub sync failed: ${error.message}. Make sure you are logged in with GitHub and public_repo is authorized.`);
    }
  }

  function exportProject(id) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    const pixna = projectToPixna(project);
    const filename = `${project.title.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "project"}.pixna`;
    download(filename, JSON.stringify(pixna, null, 2));
  }

  function importProject(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const pixna = JSON.parse(String(reader.result || "{}"));
        const title = pixna.metadata?.name || file.name.replace(/\.pixna$/i, "");
        projects.unshift({
          id: uid(),
          title,
          description: pixna.metadata?.note || "Imported .pixna project.",
          visibility: pixna.metadata?.visibility || "private",
          updatedAt: "Imported now",
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
          nodes: pixna.scene?.nodes?.length || 0,
          scripts: pixna.scripts ? Object.keys(pixna.scripts).length : 0
        });
        saveProjects();
        render();
      } catch {
        alert("Invalid .pixna file for this mock importer.");
      }
    };
    reader.readAsText(file);
  }

  function bind() {
    $("[data-open-project-modal]")?.addEventListener("click", () => $("[data-project-modal]").showModal());
    document.querySelectorAll("[data-close-project-modal]").forEach((button) => button.addEventListener("click", () => $("[data-project-modal]").close()));
    $("[data-create-project-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      createProject({ title: String(data.get("title") || "Untitled Project").trim(), description: String(data.get("description") || "").trim(), visibility: String(data.get("visibility") || "private") });
      event.currentTarget.reset();
      $("[data-project-modal]").close();
    });
    $("[data-import-project]")?.addEventListener("change", (event) => {
      importProject(event.target.files?.[0]);
      event.target.value = "";
    });
    $("[data-project-search]")?.addEventListener("input", (event) => { query = event.target.value; render(); });
    document.querySelectorAll("[data-project-filter]").forEach((button) => {
      button.addEventListener("click", () => { activeFilter = button.dataset.projectFilter; render(); });
    });
    $("[data-reset-projects]")?.addEventListener("click", () => { projects = structuredClone(defaultProjects); saveProjects(); render(); });
  }

  function render() {
    renderFilters();
    renderProjects();
  }

  function init() {
    if (!$('[data-projects-page]')) return;
    bind();
    render();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", PixnariaProjects.init);
