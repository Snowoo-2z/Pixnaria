const PixnariaAuth = (() => {
  const USER_KEY = "pixnaria_mock_user";
  const USERNAME_RE = /^[A-Za-z0-9_-]+$/;
  let githubSession = null;
  let avatarData = null;

  const $ = (selector) => document.querySelector(selector);

  function setStatus(message, type = "") {
    const status = $("[data-auth-status]");
    if (!status) return;
    status.textContent = message;
    status.className = `auth-status ${type}`.trim();
  }

  function showStep(step) {
    document.querySelectorAll("[data-auth-step]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.authStep === step);
    });
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

  function startGithubOAuth() {
    location.href = "/api/auth/github/start";
  }

  async function loadSession() {
    try {
      const data = await api("/api/auth/me");
      githubSession = data.github;
      fillProfileDefaults(data.pixnariaProfile);
      showStep("profile");
      const params = new URLSearchParams(location.search);
      if (params.get("github") === "connected") {
        history.replaceState({}, document.title, location.pathname);
        setStatus(`GitHub connected as ${githubSession.login}. Complete your Pixnaria profile.`, "success");
      } else {
        setStatus(`GitHub session active: ${githubSession.login}.`, "success");
      }
      return true;
    } catch {
      showStep("github");
      const params = new URLSearchParams(location.search);
      if (params.get("github") === "error") {
        history.replaceState({}, document.title, location.pathname);
        setStatus("GitHub login failed. Check your OAuth app callback and .env config.", "error");
      } else {
        setStatus("Connect with GitHub to use Pixnaria cloud projects.");
      }
      return false;
    }
  }

  function fillProfileDefaults(profile = null) {
    if (!githubSession) return;
    const displayName = $("[data-profile-display]");
    const bio = $("[data-profile-bio]");
    if (displayName) displayName.value = profile?.displayName || githubSession.login || "";
    if (bio) bio.value = profile?.bio || (githubSession.login?.toLowerCase() === "snowoo" ? "Creator of Pixnaria" : "Pixnaria creator");
    if (profile?.avatarData) avatarData = profile.avatarData;

    const githubInfo = $("[data-github-info]");
    if (githubInfo) {
      githubInfo.innerHTML = `
        <strong>${githubSession.login}</strong>
        <small>Real GitHub connected · public repo scope requested</small>
      `;
    }

    const preview = $("[data-avatar-preview]");
    if (preview) {
      if (avatarData) preview.innerHTML = `<img src="${avatarData}" alt="Custom Pixnaria avatar preview">`;
      else preview.textContent = (profile?.displayName || githubSession.login || "P").charAt(0).toUpperCase();
    }
  }

  async function savePixnariaProfile() {
    if (!githubSession) {
      setStatus("Connect GitHub first.", "error");
      return;
    }

    const displayName = $("[data-profile-display]").value.trim() || githubSession.login;
    const bio = $("[data-profile-bio]").value.trim();

    if (!USERNAME_RE.test(displayName)) {
      setStatus("Display name currently follows username rules: letters, numbers, _ and -.", "error");
      return;
    }

    try {
      const data = await api("/api/auth/profile", {
        method: "POST",
        body: JSON.stringify({ displayName, bio, avatarData })
      });
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setStatus(`Pixnaria profile saved for ${data.user.displayName}. Redirecting...`, "success");
      setTimeout(() => location.href = "index.html", 650);
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  function bindGithub() {
    $("[data-github-connect]")?.addEventListener("click", startGithubOAuth);
    $("[data-login-snowoo]")?.addEventListener("click", startGithubOAuth);
    $("[data-github-real-note]")?.addEventListener("click", () => {
      setStatus("Real GitHub Auth is now handled by server.js. Create .env from .env.example, then run npm start.", "success");
    });
  }

  function bindAvatar() {
    const input = $("[data-avatar-input]");
    const preview = $("[data-avatar-preview]");
    input?.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 1024 * 1024) {
        setStatus("Avatar limit for Pixnaria dev: 1 MB before compression.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        avatarData = String(reader.result);
        preview.innerHTML = `<img src="${avatarData}" alt="Custom Pixnaria avatar preview">`;
        setStatus("Custom Pixnaria avatar loaded. GitHub avatar is not used.", "success");
      };
      reader.readAsDataURL(file);
    });
  }

  function bindProfile() {
    $("[data-save-profile]")?.addEventListener("click", savePixnariaProfile);
    $("[data-back-github]")?.addEventListener("click", () => showStep("github"));
  }

  function bindLogoutReset() {
    $("[data-reset-auth]")?.addEventListener("click", async () => {
      try { await api("/api/auth/logout", { method: "POST", body: "{}" }); } catch {}
      localStorage.removeItem(USER_KEY);
      avatarData = null;
      githubSession = null;
      showStep("github");
      setStatus("GitHub/Pixnaria session cleared.", "success");
    });
  }

  async function init() {
    if (!$('[data-auth-page]')) return;
    if (typeof PixnariaI18n !== "undefined") PixnariaI18n.apply();
    if (typeof initNavigation === "function") initNavigation();

    bindGithub();
    bindAvatar();
    bindProfile();
    bindLogoutReset();
    await loadSession();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", PixnariaAuth.init);
