const PixnariaProjects = (() => {
  let repos = [];
  let query = "";
  let loading = false;

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

  function cleanTitleFromRepo(name = "") {
    return name.replace(/^pixnaria-/i, "").split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || name;
  }

  function filteredRepos() {
    const q = query.trim().toLowerCase();
    return repos.filter((repo) => !q || repo.name.toLowerCase().includes(q) || repo.full_name.toLowerCase().includes(q) || String(repo.description || "").toLowerCase().includes(q));
  }

  function setStatus(message, type = "") {
    const node = $("[data-project-status]");
    if (!node) return;
    node.textContent = message;
    node.className = `auth-status ${type}`.trim();
  }

  function skeletonRows() {
    return Array.from({ length: 4 }, () => `
      <article class="project-row project-row--loading">
        <div class="project-row__thumb"></div>
        <div class="project-row__main"><div class="skeleton-line short"></div><div class="skeleton-line"></div><div class="skeleton-line mid"></div></div>
      </article>
    `).join("");
  }

  function renderRepos() {
    const listNode = $("[data-my-projects]");
    const count = $("[data-project-count]");
    if (!listNode) return;

    const list = filteredRepos();
    if (count) count.textContent = `${list.length} projects`;

    if (loading) {
      listNode.innerHTML = skeletonRows();
      return;
    }

    if (!list.length) {
      listNode.innerHTML = `
        <div class="projects-empty-state">
          <h2>No projects yet</h2>
          <p>Create your first Pixnaria project to start building.</p>
          <button class="button button--primary" type="button" data-empty-new-project>+ New project</button>
        </div>
      `;
      listNode.querySelector("[data-empty-new-project]")?.addEventListener("click", () => $("[data-project-modal]").showModal());
      return;
    }

    listNode.innerHTML = list.map((repo) => {
      const title = cleanTitleFromRepo(repo.name);
      const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : "recently";
      const href = `editor.html?repo=${encodeURIComponent(repo.full_name)}`;
      const pageHref = `project.html?repo=${encodeURIComponent(repo.full_name)}`;
      return `
        <article class="project-row">
          <div class="project-row__thumb" onclick="location.href='${pageHref}'">
            <div class="project-row__platform"></div>
            <div class="project-row__player"></div>
          </div>
          <div class="project-row__main">
            <div class="project-row__titleline">
              <h3>${title}</h3>
              <span class="pill">Public</span>
            </div>
            <p>${repo.description || "Pixnaria project."}</p>
            <div class="project-row__meta"><span>${repo.full_name}</span><span>Updated ${updated}</span></div>
          </div>
          <div class="project-row__actions">
            <a class="button button--primary button--small" href="${href}">Edit</a>
            <a class="button button--ghost button--small" href="${pageHref}">View</a>
            <a class="button button--ghost button--small" href="${repo.html_url}" target="_blank" rel="noreferrer">Source</a>
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadRepos() {
    loading = true;
    renderRepos();
    try {
      const data = await api("/api/github/repos");
      repos = data.repos || [];
      setStatus("Projects loaded.", "success");
    } catch (error) {
      repos = [];
      setStatus(`${error.message}. Sign in again if needed.`, "error");
    } finally {
      loading = false;
      renderRepos();
    }
  }

  function slugify(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  }

  async function createRepo(data) {
    const title = data.title.trim();
    if (!title) return;
    const repoName = `pixnaria-${slugify(title)}`;
    setStatus(`Creating ${title}…`);
    try {
      const result = await api("/api/github/repos", {
        method: "POST",
        body: JSON.stringify({ title, repoName, description: data.description || `Pixnaria project: ${title}` })
      });
      setStatus(`Created ${result.repo.name}.`, "success");
      $("[data-project-modal]")?.close();
      await loadRepos();
    } catch (error) {
      setStatus(`Creation failed: ${error.message}`, "error");
    }
  }

  function bind() {
    $("[data-open-project-modal]")?.addEventListener("click", () => $("[data-project-modal]").showModal());
    document.querySelectorAll("[data-close-project-modal]").forEach((button) => button.addEventListener("click", () => $("[data-project-modal]").close()));

    $("[data-create-project-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      createRepo({ title: String(data.get("title") || "").trim(), description: String(data.get("description") || "").trim() });
    });

    $("[data-project-search]")?.addEventListener("input", (event) => { query = event.target.value; renderRepos(); });
    $("[data-refresh-repos]")?.addEventListener("click", loadRepos);
  }

  function init() {
    if (!$('[data-projects-page]')) return;
    bind();
    loadRepos();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", PixnariaProjects.init);
