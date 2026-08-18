// Deprecated: Pixnaria now performs real GitHub OAuth entirely through the
// server (see server.js / api/auth/github/*.js). This file is kept only to
// avoid breaking old bookmarks/scripts that might still reference it, and
// is not loaded by any page anymore.
window.PIXNARIA_GITHUB_AUTH = { mode: "oauth", appName: "Pixnaria" };
