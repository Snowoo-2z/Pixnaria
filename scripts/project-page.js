const PixnariaProjectPage = (() => {
  const STORAGE_KEY = "pixnaria_public_project_mock";
  const COMMENT_KEY = "pixnaria_public_project_comments";

  const defaultProject = {
    id: "neon-platformer",
    title: "Neon Platformer",
    author: "Snowoo",
    visibility: "Public",
    description: "A neon 2D platformer prototype made with Pixnaria nodes, Python scripts, a custom 2D engine mock, collisions and touch controls.\n\nThis page shows how a public project could look when opened from Explorer or a creator profile.",
    credits: [
      { name: "Snowoo", role: "Creator / Game design" },
      { name: "Pixnaria", role: "Engine concept" },
      { name: "Community", role: "Future feedback" }
    ],
    stats: { likes: 128, favorites: 42, views: "2.4k" }
  };

  let project = loadProject();
  let player = { x: 420, y: 260, vy: 0, onGround: false };
  let running = false;
  let frame = null;
  let last = 0;
  const keys = new Set();
  const physics = { gravity: 1350, jump: 560, speed: 250, floorY: 450, height: 58, platform: { x: 210, y: 340, width: 520 } };

  const $ = (selector) => document.querySelector(selector);

  function loadProject() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(defaultProject);
    } catch {
      return structuredClone(defaultProject);
    }
  }

  function saveProject() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }

  function comments() {
    try {
      return JSON.parse(localStorage.getItem(COMMENT_KEY)) || [
        { author: "NariaMaker", text: "Amazing neon vibe", date: "Today" },
        { author: "LunaDev", text: "The node system looks cool", date: "Today" }
      ];
    } catch {
      return [];
    }
  }

  function saveComments(items) {
    localStorage.setItem(COMMENT_KEY, JSON.stringify(items));
  }

  function isAuthor() {
    return typeof PIXNARIA_USER !== "undefined" && PIXNARIA_USER.username === project.author;
  }

  function renderProject() {
    document.querySelectorAll("[data-project-title]").forEach((node) => node.textContent = project.title);
    document.querySelectorAll("[data-project-author]").forEach((node) => node.textContent = project.author);
    $("[data-project-visibility]").textContent = project.visibility;
    $("[data-project-description]").textContent = project.description;
    $("[data-edit-description]").value = project.description;
    $("[data-likes]").textContent = project.stats.likes;
    $("[data-favorites]").textContent = project.stats.favorites;
    $("[data-views]").textContent = project.stats.views;

    const authorControls = document.querySelectorAll("[data-author-only]");
    authorControls.forEach((node) => node.hidden = !isAuthor());

    renderCredits();
    renderComments();
  }

  function renderCredits() {
    const list = $("[data-credits-list]");
    if (!list) return;
    list.innerHTML = project.credits.map((credit, index) => `
      <li>
        <span><strong>${credit.name}</strong><small>${credit.role}</small></span>
        ${isAuthor() ? `<button class="icon-button danger" type="button" data-remove-credit="${index}">×</button>` : ""}
      </li>
    `).join("");
    list.querySelectorAll("[data-remove-credit]").forEach((button) => {
      button.addEventListener("click", () => {
        project.credits.splice(Number(button.dataset.removeCredit), 1);
        saveProject();
        renderCredits();
      });
    });
  }

  function renderComments() {
    const list = $("[data-comment-list]");
    if (!list) return;
    list.innerHTML = comments().map((comment) => `
      <li class="comment-item">
        <span><strong>${comment.author}</strong><small>${comment.text}</small></span>
        <small>${comment.date}</small>
      </li>
    `).join("");
  }

  function updatePlayer() {
    const el = $("[data-public-player]");
    if (!el) return;
    el.style.left = `${Math.max(5, Math.min(88, player.x / 9))}%`;
    el.style.top = `${Math.max(5, Math.min(82, player.y / 6))}%`;
  }

  function overPlatform() {
    const cx = player.x + 29;
    return cx >= physics.platform.x && cx <= physics.platform.x + physics.platform.width;
  }

  function loop(now) {
    if (!running) return;
    const delta = Math.min(.05, (now - last) / 1000);
    last = now;

    let dx = 0;
    if (keys.has("arrowright") || keys.has("d")) dx += 1;
    if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
    if ((keys.has(" ") || keys.has("arrowup") || keys.has("w")) && player.onGround) {
      player.vy = -physics.jump;
      player.onGround = false;
      keys.delete(" "); keys.delete("arrowup"); keys.delete("w");
    }

    const prevY = player.y;
    player.x = Math.max(0, Math.min(900, player.x + dx * physics.speed * delta));
    player.vy = Math.min(900, player.vy + physics.gravity * delta);
    player.y += player.vy * delta;

    const bottom = player.y + physics.height;
    const prevBottom = prevY + physics.height;
    if (overPlatform() && prevBottom <= physics.platform.y && bottom >= physics.platform.y && player.vy >= 0) {
      player.y = physics.platform.y - physics.height;
      player.vy = 0;
      player.onGround = true;
    } else if (bottom >= physics.floorY && player.vy >= 0) {
      player.y = physics.floorY - physics.height;
      player.vy = 0;
      player.onGround = true;
    }

    updatePlayer();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    $("[data-game-player]").classList.add("is-running");
    $("[data-public-play]").textContent = "■ Stop";
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    keys.clear();
    $("[data-game-player]").classList.remove("is-running");
    $("[data-public-play]").textContent = "▶ Play";
  }

  function bind() {
    $("[data-public-play]")?.addEventListener("click", () => running ? stop() : start());
    $("[data-inside]")?.addEventListener("click", () => location.href = "editor.html");
    $("[data-like]")?.addEventListener("click", () => { project.stats.likes += 1; saveProject(); renderProject(); });
    $("[data-favorite]")?.addEventListener("click", () => { project.stats.favorites += 1; saveProject(); renderProject(); });
    $("[data-report]")?.addEventListener("click", () => alert("Mock report sent to Snowoo."));

    $("[data-save-description]")?.addEventListener("click", () => {
      project.description = $("[data-edit-description]").value.trim() || project.description;
      saveProject();
      renderProject();
    });

    $("[data-credit-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const name = String(data.get("name") || "").trim();
      const role = String(data.get("role") || "").trim();
      if (!name || !role) return;
      project.credits.push({ name, role });
      saveProject();
      event.currentTarget.reset();
      renderCredits();
    });

    $("[data-comment-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.currentTarget.querySelector("input");
      const value = input.value.trim();
      if (!/^[A-Za-zÀ-ÿ ]{1,80}$/.test(value)) {
        alert("Mock rule: comments only allow letters and spaces for now.");
        return;
      }
      const items = comments();
      items.unshift({ author: PIXNARIA_USER.username, text: value, date: "Now" });
      saveComments(items);
      input.value = "";
      renderComments();
    });

    document.addEventListener("keydown", (event) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName);
      if (typing) return;
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "a", "d", "w"].includes(key) || key === " ") {
        if (running) event.preventDefault();
        keys.add(key);
      }
    });
    document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

    document.querySelectorAll("[data-public-touch]").forEach((button) => {
      const key = button.dataset.publicTouch;
      const down = (event) => { event.preventDefault(); if (!running) start(); keys.add(key); button.classList.add("is-pressed"); };
      const up = (event) => { event.preventDefault(); keys.delete(key); button.classList.remove("is-pressed"); };
      button.addEventListener("pointerdown", down);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
      button.addEventListener("pointerleave", up);
    });
  }

  function init() {
    if (!$('[data-game-player]')) return;
    renderProject();
    updatePlayer();
    bind();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", PixnariaProjectPage.init);
