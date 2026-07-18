const PixnariaAuth = (() => {
  const USER_KEY = "pixnaria_mock_user";

  const $ = (selector) => document.querySelector(selector);

  function setStatus(message, type = "") {
    const status = $("[data-auth-status]");
    if (!status) return;
    status.textContent = message;
    status.className = `auth-status ${type}`.trim();
  }

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

  function profileUrl(user) {
    const name = user?.githubUsername || user?.username || user?.login;
    return name ? `/user/${encodeURIComponent(name)}` : "profile.html";
  }

  function startGithubOAuth() {
    location.href = "/api/auth/github/start";
  }

  function normalizeUser(data) {
    if (data.pixnariaProfile) return data.pixnariaProfile;
    const gh = data.github;
    const isAdmin = ["snowoo-2z", "snowoo"].includes(String(gh.login).toLowerCase());
    return {
      id: isAdmin ? "user_snowoo" : `pix_${gh.id}`,
      username: gh.login,
      githubUsername: gh.login,
      githubId: gh.id,
      githubProfileUrl: gh.html_url,
      displayName: gh.login,
      bio: "",
      avatarInitial: gh.login.charAt(0).toUpperCase(),
      avatarColor: isAdmin ? "creator" : "default",
      role: isAdmin ? "creator" : "user",
      badges: isAdmin ? ["Creator", "Admin"] : [],
      authProvider: "github",
      githubConnected: true,
      joinedAt: new Date().toISOString().slice(0, 10)
    };
  }

  async function loadSession() {
    const params = new URLSearchParams(location.search);
    try {
      const data = await api("/api/auth/me");
      const user = normalizeUser(data);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (params.get("github") === "connected") {
        history.replaceState({}, document.title, location.pathname);
        setStatus("GitHub connected. Redirecting to your profile…", "success");
        setTimeout(() => location.href = profileUrl(user), 450);
      } else {
        setStatus(`Already signed in as ${user.githubUsername || user.username}.`, "success");
      }
      return true;
    } catch {
      localStorage.removeItem(USER_KEY);
      if (params.get("github") === "error") {
        history.replaceState({}, document.title, location.pathname);
        setStatus("GitHub sign in failed. Check your OAuth callback and Vercel variables.", "error");
      } else {
        setStatus("Sign in with GitHub to continue.");
      }
      return false;
    }
  }

  function bindGithub() {
    $("[data-github-connect]")?.addEventListener("click", startGithubOAuth);
  }

  function bindLogout() {
    $("[data-reset-auth]")?.addEventListener("click", async () => {
      try { await api("/api/auth/logout", { method: "POST", body: "{}" }); } catch {}
      localStorage.removeItem(USER_KEY);
      setStatus("Signed out.", "success");
    });
  }

  async function init() {
    if (!$('[data-auth-page]')) return;
    if (typeof initNavigation === "function") initNavigation();
    bindGithub();
    bindLogout();
    await loadSession();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", PixnariaAuth.init);
