const PixnariaSession = (() => {
  let state = { authenticated: false, github: null, user: null };

  function localUser() {
    try { return JSON.parse(localStorage.getItem("pixnaria_mock_user") || "null"); }
    catch { return null; }
  }

  function avatarHtml(user) {
    if (user?.avatarData) return `<span class="avatar avatar--${user.avatarColor || "default"}"><img src="${user.avatarData}" alt="${user.displayName || user.username}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></span>`;
    const initial = (user?.displayName || user?.username || user?.githubUsername || "?").charAt(0).toUpperCase();
    return `<span class="avatar avatar--${user?.avatarColor || "default"}" aria-hidden="true">${initial}</span>`;
  }

  function normalizeUser(apiData) {
    const cached = localUser();
    if (apiData?.pixnariaProfile) {
      localStorage.setItem("pixnaria_mock_user", JSON.stringify(apiData.pixnariaProfile));
      return apiData.pixnariaProfile;
    }
    if (cached?.githubConnected) return cached;
    if (apiData?.github) {
      const isSnowoo = apiData.github.login?.toLowerCase() === "snowoo";
      const user = {
        id: isSnowoo ? "user_snowoo" : `pix_${apiData.github.id}`,
        username: apiData.github.login,
        githubUsername: apiData.github.login,
        githubId: apiData.github.id,
        githubProfileUrl: apiData.github.html_url,
        displayName: apiData.github.login,
        bio: "",
        avatarInitial: apiData.github.login.charAt(0).toUpperCase(),
        avatarColor: isSnowoo ? "creator" : "default",
        role: isSnowoo ? "creator" : "user",
        badges: isSnowoo ? ["Creator", "Admin"] : [],
        authProvider: "github",
        githubConnected: true,
        joinedAt: new Date().toISOString().slice(0, 10)
      };
      localStorage.setItem("pixnaria_mock_user", JSON.stringify(user));
      return user;
    }
    return null;
  }

  function applyLoggedOut() {
    document.querySelectorAll("[data-username]").forEach((node) => node.textContent = "Guest");
    document.querySelectorAll("[data-avatar]").forEach((node) => node.innerHTML = avatarHtml(null));
    document.querySelectorAll("[data-auth-link]").forEach((node) => {
      node.textContent = "Continue with GitHub";
      node.setAttribute("href", "auth.html");
    });
    document.querySelectorAll("[data-requires-auth]").forEach((node) => node.hidden = true);
    document.querySelectorAll("[data-guest-only]").forEach((node) => node.hidden = false);
  }

  function applyLoggedIn(user) {
    document.querySelectorAll("[data-username]").forEach((node) => node.textContent = user.displayName || user.username);
    document.querySelectorAll("[data-avatar]").forEach((node) => node.innerHTML = avatarHtml(user));
    document.querySelectorAll("[data-auth-link]").forEach((node) => {
      node.textContent = "Profile";
      node.setAttribute("href", "profile.html");
    });
    document.querySelectorAll("[data-requires-auth]").forEach((node) => node.hidden = false);
    document.querySelectorAll("[data-guest-only]").forEach((node) => node.hidden = true);
  }

  async function logout() {
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" }); } catch {}
    localStorage.removeItem("pixnaria_mock_user");
    location.href = "auth.html";
  }

  async function init() {
    try {
      const response = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (!response.ok) throw new Error("not authenticated");
      const data = await response.json();
      const user = normalizeUser(data);
      state = { authenticated: true, github: data.github, user };
      applyLoggedIn(user);
    } catch {
      state = { authenticated: false, github: null, user: null };
      applyLoggedOut();
      const protectedPage = document.body?.hasAttribute("data-protected-page");
      if (protectedPage && location.pathname.split("/").pop() !== "auth.html") {
        const next = encodeURIComponent(location.pathname + location.search);
        location.href = `auth.html?next=${next}`;
      }
    }

    document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", logout));
    document.dispatchEvent(new CustomEvent("pixnaria:session", { detail: state }));
  }

  return { init, get state() { return state; }, logout };
})();

document.addEventListener("DOMContentLoaded", PixnariaSession.init);
