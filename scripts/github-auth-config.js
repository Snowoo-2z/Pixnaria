window.PIXNARIA_GITHUB_AUTH = {
  // Mode "mock" keeps Pixnaria testable without a backend.
  // Change to "oauth" only after a secure backend/Supabase/Firebase callback exists.
  mode: "mock",

  // Public GitHub OAuth App Client ID. Safe to expose.
  // Paste it here later if you want the frontend to build the GitHub authorize URL.
  clientId: "PASTE_GITHUB_CLIENT_ID_HERE",

  // For local static preview. For production, use your real domain or Supabase/Firebase callback.
  callbackUrl: "http://localhost:8000/auth.html",

  // Minimal profile scope + public repo access for Pixnaria cloud projects.
  // Later we may request public_repo only when the user creates/syncs a project.
  scopes: ["read:user", "public_repo"],

  appName: "Pixnaria"
};
