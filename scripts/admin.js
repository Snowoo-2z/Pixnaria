const PixnariaAdmin = (() => {
  const STORAGE_KEY = "pixnaria_admin_mock_state";

  const defaultState = {
    reports: [
      { id: "rep_001", project: "Space Runner", reporter: "LunaDev", target: "OrbitKid", reason: "Bad word in comments", status: "open", date: "Today" },
      { id: "rep_002", project: "Pixel Forest", reporter: "NariaMaker", target: "ForestFan", reason: "Spam comments", status: "open", date: "Today" }
    ],
    users: [
      { id: "user_snowoo", username: "Snowoo-2z", email: "snowoo@example.hidden", role: "creator", status: "active", joinedAt: "2026-07-13", ban: null },
      { id: "user_luna", username: "LunaDev", email: "luna@example.hidden", role: "user", status: "active", joinedAt: "2026-07-13", ban: null },
      { id: "user_orbit", username: "OrbitKid", email: "orbit@example.hidden", role: "user", status: "active", joinedAt: "2026-07-13", ban: null },
      { id: "user_forest", username: "ForestFan", email: "forest@example.hidden", role: "user", status: "active", joinedAt: "2026-07-13", ban: null }
    ],
    moderators: [
      { username: "ModeratorSoon", joinedAt: "Soon", addedBy: "Snowoo-2z" }
    ],
    featured: [
      { id: "neon-platformer", title: "Neon Platformer", author: "Snowoo-2z", order: 1 },
      { id: "pixel-forest", title: "Pixel Forest", author: "LunaDev", order: 2 }
    ],
    logs: ["> admin dashboard ready"]
  };

  let state = load();

  const $ = (selector) => document.querySelector(selector);

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(defaultState);
    } catch {
      return structuredClone(defaultState);
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function log(message) {
    const line = `> ${message}`;
    state.logs.unshift(line);
    state.logs = state.logs.slice(0, 60);
    save();
    renderLog();
  }

  function isSnowooName(name) {
    return ["snowoo-2z", "snowoo"].includes(String(name || "").toLowerCase());
  }

  async function isSnowoo() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        if (isSnowooName(data.github?.login || data.pixnariaProfile?.githubUsername)) return true;
      }
    } catch {}
    try {
      const user = JSON.parse(localStorage.getItem('pixnaria_mock_user') || 'null');
      return isSnowooName(user?.githubUsername || user?.username);
    } catch {
      return false;
    }
  }

  function openTab(name) {
    document.querySelectorAll("[data-admin-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.adminTab === name);
    });
    document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.adminPanel === name);
    });
  }

  function statusPill(status) {
    if (status === "banned") return `<span class="pill" style="border-color:rgba(239,68,68,.35);color:#fecaca;background:rgba(239,68,68,.12)">Banned</span>`;
    if (status === "moderator") return `<span class="pill pill--featured">Moderator</span>`;
    return `<span class="pill">${status}</span>`;
  }

  function renderStats() {
    $("[data-stat-reports]").textContent = state.reports.filter((report) => report.status === "open").length;
    $("[data-stat-users]").textContent = state.users.length;
    $("[data-stat-mods]").textContent = state.moderators.length;
    $("[data-stat-featured]").textContent = state.featured.length;
  }

  function renderReports() {
    const list = $("[data-report-list]");
    if (!list) return;
    list.innerHTML = state.reports.map((report) => `
      <li class="admin-list-item">
        <span>
          <strong>${report.project}</strong>
          <small>Reporter: ${report.reporter} · Target: ${report.target} · ${report.date}</small>
          <small>Reason: ${report.reason}</small>
          <small>Status: ${report.status}</small>
        </span>
        <span class="admin-actions">
          <button class="button button--ghost button--small" type="button" data-resolve-report="${report.id}">Resolve</button>
          <button class="button button--ghost button--small danger" type="button" data-report-ban="${report.target}">Ban target</button>
        </span>
      </li>
    `).join("");

    list.querySelectorAll("[data-resolve-report]").forEach((button) => {
      button.addEventListener("click", () => {
        const report = state.reports.find((item) => item.id === button.dataset.resolveReport);
        if (report) report.status = "resolved";
        save(); render(); log(`resolved report ${button.dataset.resolveReport}`);
      });
    });

    list.querySelectorAll("[data-report-ban]").forEach((button) => {
      button.addEventListener("click", () => {
        const user = state.users.find((item) => item.username === button.dataset.reportBan);
        if (user) {
          user.status = "banned";
          user.ban = { type: "temporary", reason: "Report action", until: "7 days", by: "Snowoo-2z" };
          save(); render(); log(`temporary ban applied to ${user.username} from report`);
        }
      });
    });
  }

  function renderUsers() {
    const list = $("[data-user-list]");
    if (!list) return;
    list.innerHTML = state.users.map((user) => `
      <li class="admin-list-item">
        <span>
          <strong>${user.username}</strong>
          <small>Email visible to Snowoo-2z only: <span class="user-email">${user.email}</span></small>
          <small>Role: ${user.role} · Joined: ${user.joinedAt}</small>
          ${user.ban ? `<small>Ban: ${user.ban.type} · Reason: ${user.ban.reason} · Until: ${user.ban.until || "Permanent"}</small>` : ""}
        </span>
        <span class="admin-actions">
          ${statusPill(user.status)}
          <button class="button button--ghost button--small" type="button" data-temp-ban="${user.id}">Temp ban</button>
          <button class="button button--ghost button--small danger" type="button" data-perm-ban="${user.id}">Perm ban</button>
          <button class="button button--ghost button--small" type="button" data-unban="${user.id}">Unban</button>
        </span>
      </li>
    `).join("");

    list.querySelectorAll("[data-temp-ban]").forEach((button) => button.addEventListener("click", () => banUser(button.dataset.tempBan, "temporary")));
    list.querySelectorAll("[data-perm-ban]").forEach((button) => button.addEventListener("click", () => banUser(button.dataset.permBan, "permanent")));
    list.querySelectorAll("[data-unban]").forEach((button) => button.addEventListener("click", () => unbanUser(button.dataset.unban)));
  }

  function banUser(id, type) {
    const reason = $("[data-ban-reason]").value.trim() || "No reason provided";
    const duration = $("[data-ban-duration]").value.trim() || "7 days";
    const user = state.users.find((item) => item.id === id);
    if (!user || user.username === "Snowoo-2z") {
      log("cannot ban Snowoo-2z");
      return;
    }
    user.status = "banned";
    user.ban = { type, reason, until: type === "temporary" ? duration : null, by: "Snowoo-2z" };
    save(); render(); log(`${type} ban applied to ${user.username}: ${reason}`);
  }

  function unbanUser(id) {
    const user = state.users.find((item) => item.id === id);
    if (!user) return;
    user.status = "active";
    user.ban = null;
    save(); render(); log(`unbanned ${user.username}`);
  }

  function renderModerators() {
    const list = $("[data-moderator-list]");
    if (!list) return;
    list.innerHTML = state.moderators.map((mod, index) => `
      <li class="admin-list-item">
        <span><strong>${mod.username}</strong><small>Moderator · Joined: ${mod.joinedAt} · Added by ${mod.addedBy}</small></span>
        <span class="admin-actions"><button class="button button--ghost button--small danger" type="button" data-remove-mod="${index}">Remove</button></span>
      </li>
    `).join("");

    list.querySelectorAll("[data-remove-mod]").forEach((button) => {
      button.addEventListener("click", () => {
        const removed = state.moderators.splice(Number(button.dataset.removeMod), 1)[0];
        const user = state.users.find((item) => item.username === removed.username);
        if (user && user.role === "moderator") user.role = "user";
        save(); render(); log(`removed moderator ${removed.username}`);
      });
    });
  }

  function renderFeatured() {
    const list = $("[data-featured-list]");
    if (!list) return;
    list.innerHTML = state.featured.sort((a,b) => a.order - b.order).map((project, index) => `
      <li class="admin-list-item">
        <span><strong>${project.title}</strong><small>Author: ${project.author} · Order: ${project.order}</small></span>
        <span class="admin-actions"><button class="button button--ghost button--small danger" type="button" data-remove-featured="${index}">Remove</button></span>
      </li>
    `).join("");

    list.querySelectorAll("[data-remove-featured]").forEach((button) => {
      button.addEventListener("click", () => {
        const removed = state.featured.splice(Number(button.dataset.removeFeatured), 1)[0];
        save(); render(); log(`removed featured project ${removed.title}`);
      });
    });
  }

  function renderLog() {
    const logNode = $("[data-admin-log]");
    if (logNode) logNode.textContent = state.logs.join("\n");
  }

  function render() {
    renderStats();
    renderReports();
    renderUsers();
    renderModerators();
    renderFeatured();
    renderLog();
  }

  function bindForms() {
    $("[data-add-moderator-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = new FormData(event.currentTarget).get("username").trim();
      if (!/^[A-Za-z0-9_-]+$/.test(username)) {
        alert("Username must only contain letters, numbers, _ and -");
        return;
      }
      if (!state.moderators.some((mod) => mod.username === username)) {
        state.moderators.push({ username, joinedAt: "Mock date", addedBy: "Snowoo-2z" });
      }
      let user = state.users.find((item) => item.username === username);
      if (!user) {
        user = { id: `user_${Date.now()}`, username, email: `${username.toLowerCase()}@example.hidden`, role: "moderator", status: "active", joinedAt: "Mock date", ban: null };
        state.users.push(user);
      }
      user.role = "moderator";
      save(); render(); event.currentTarget.reset(); log(`added moderator ${username}`);
    });

    $("[data-add-featured-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const title = data.get("title").trim();
      const author = data.get("author").trim() || "Unknown";
      if (!title) return;
      state.featured.push({ id: `featured_${Date.now()}`, title, author, order: state.featured.length + 1 });
      save(); render(); event.currentTarget.reset(); log(`added featured project ${title}`);
    });

    $("[data-reset-admin]")?.addEventListener("click", () => {
      state = structuredClone(defaultState);
      save(); render(); log("admin demo reset");
    });
  }

  async function init() {
    if (!$('[data-admin-page]')) return;
    if (!(await isSnowoo())) {
      document.body.innerHTML = `<main class="page-hero"><div class="container page-hero__card"><h1>Access denied</h1><p>This admin panel is only available to Snowoo-2z.</p><a class="button button--primary" href="index.html">Back home</a></div></main>`;
      return;
    }
    document.querySelectorAll("[data-admin-tab]").forEach((button) => {
      button.addEventListener("click", () => openTab(button.dataset.adminTab));
    });
    bindForms();
    render();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", PixnariaAdmin.init);
