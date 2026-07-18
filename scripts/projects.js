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
    return name
      .replace(/^pixnaria-/i, "")
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || name;
  }

  function filteredRepos() {
    const q = query.trim().toLowerCase();
    return repos.filter((repo) => {
      if (!q) return true;
      return repo.name.toLowerCase().includes(q)
        || repo.full_name.toLowerCase().includes(q)
        || String(repo.description || "").toLowerCase().includes(q);
    });
  }

  function setStatus(message, type = "") {
    const node = $("[data-project-status]");
    if (!node) return;
    node.textContent = message;
    node.className = `auth-status ${type}`.trim();
  }

  function renderRepos() {
    const grid = $("[data-my-projects]");
    const count = $("[data-project-count]");
    if (!grid) return;

    const list = filteredRepos();
    if (count) count.textContent = `${list.length} GitHub repos`;

    if (loading) {
      grid.innerHTML = `<div class="empty-projects">Loading GitHub repositories…</div>`;
      return;
    }

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-projects">
          <strong>No Pixnaria repository yet.</strong><br>
          Create your first GitHub project repo to start building.
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map((repo) => {
      const title = cleanTitleFromRepo(repo.name);
      const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : "recently";
      return `
        <article class="my-project-card">
          <div class="my-project-preview">
            <div class="my-project-preview__platform"></div>
            <div class="my-project-preview__player"></div>
          </div>
          <div class="my-project-card__body">
            <div class="project-card__topline">
              <span class="pill pill--featured">GitHub</span>
              <span class="pill">Public</span>
            </div>
            <h3>${title}</h3>
            <p>${repo.description || "Pixnaria project repository."}</p>
            <div class="project-meta">
              <span>${repo.full_name}</span>
              <span>Updated ${updated}</span>
            </div>
            <div class="my-project-card__actions">
              <a class="button button--primary button--small" href="editor.html?repo=${encodeURIComponent(repo.full_name)}">Open editor</a>
              <a class="button button--ghost button--small" href="${repo.html_url}" target="_blank" rel="noreferrer">GitHub</a>
              <a class="button button--ghost button--small" href="project.html?repo=${encodeURIComponent(repo.full_name)}">View page</a>
              <button class="button button--ghost button--small" type="button" data-copy-repo="${repo.full_name}">Copy name</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    grid.querySelectorAll("[data-copy-repo]").forEach((button) => {
      button.addEventListener("click", async () => {
        await navigator.clipboard?.writeText(button.dataset.copyRepo);
        setStatus(`Copied ${button.dataset.copyRepo}`, "success");
      });
    });
  }

  async function loadRepos() {
    loading = true;
    renderRepos();
    try {
      const data = await api("/api/github/repos");
      repos = data.repos || [];
      setStatus("GitHub repositories loaded.", "success");
    } catch (error) {
      repos = [];
      setStatus(`${error.message}. Sign in with GitHub and make sure public_repo is authorized.`, "error");
    } finally {
      loading = false;
      renderRepos();
    }
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  async function createRepo(data) {
    const title = data.title.trim();
    if (!title) return;
    const repoName = `pixnaria-${slugify(title)}`;
    setStatus(`Creating ${repoName} on GitHub…`);
    try {
      const result = await api("/api/github/repos", {
        method: "POST",
        body: JSON.stringify({
          title,
          repoName,
          description: data.description || `Pixnaria project: ${title}`
        })
      });
      setStatus(`Created ${result.repo.full_name}.`, "success");
      $("[data-project-modal]")?.close();
      await loadRepos();
    } catch (error) {
      setStatus(`GitHub repo creation failed: ${error.message}`, "error");
    }
  }

  function bind() {
    $("[data-open-project-modal]")?.addEventListener("click", () => $("[data-project-modal]").showModal());
    document.querySelectorAll("[data-close-project-modal]").forEach((button) => {
      button.addEventListener("click", () => $("[data-project-modal]").close());
    });

    $("[data-create-project-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      createRepo({
        title: String(data.get("title") || "").trim(),
        description: String(data.get("description") || "").trim()
      });
    });

    $("[data-project-search]")?.addEventListener("input", (event) => {
      query = event.target.value;
      renderRepos();
    });

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
