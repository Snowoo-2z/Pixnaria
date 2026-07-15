const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { URL } = require("node:url");

loadEnv();

const PORT = Number(process.env.PORT || 8000);
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || `http://localhost:${PORT}/api/auth/github/callback`;
const SESSION_COOKIE = "pixnaria_session";
const sessions = new Map();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function randomId() {
  return crypto.randomBytes(24).toString("hex");
}

function parseCookies(req) {
  const cookies = {};
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join("="));
  }
  return cookies;
}

function getSession(req, res) {
  const cookies = parseCookies(req);
  let sid = cookies[SESSION_COOKIE];
  if (!sid || !sessions.has(sid)) {
    sid = randomId();
    sessions.set(sid, { id: sid, createdAt: Date.now() });
    res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
  }
  return sessions.get(sid);
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 3_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function exchangeCodeForToken(code) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: CALLBACK_URL
    })
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || "GitHub token exchange failed");
  }
  return data.access_token;
}

async function fetchGitHubUser(token) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Pixnaria-Dev"
    }
  });
  if (!response.ok) throw new Error("Failed to fetch GitHub user");
  return response.json();
}

async function handleApi(req, res, url) {
  const session = getSession(req, res);

  if (url.pathname === "/api/auth/github/start") {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return sendJson(res, 500, {
        error: "GitHub OAuth is not configured. Create .env from .env.example and add GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET."
      });
    }
    const state = randomId();
    session.githubOAuthState = state;
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: CALLBACK_URL,
      scope: "read:user public_repo",
      state,
      allow_signup: "true"
    });
    return redirect(res, `https://github.com/login/oauth/authorize?${params.toString()}`);
  }

  if (url.pathname === "/api/auth/github/callback") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state || state !== session.githubOAuthState) {
      return redirect(res, "/auth.html?github=error");
    }
    try {
      const token = await exchangeCodeForToken(code);
      const gh = await fetchGitHubUser(token);
      session.githubToken = token;
      session.githubUser = {
        id: gh.id,
        login: gh.login,
        name: gh.name,
        html_url: gh.html_url,
        avatar_url: gh.avatar_url
      };
      session.githubOAuthState = null;
      return redirect(res, "/auth.html?github=connected");
    } catch (error) {
      console.error(error);
      return redirect(res, "/auth.html?github=error");
    }
  }

  if (url.pathname === "/api/auth/me") {
    if (!session.githubUser) return sendJson(res, 401, { authenticated: false });
    return sendJson(res, 200, {
      authenticated: true,
      github: session.githubUser,
      pixnariaProfile: session.pixnariaProfile || null
    });
  }

  if (url.pathname === "/api/auth/profile" && req.method === "POST") {
    if (!session.githubUser) return sendJson(res, 401, { error: "GitHub login required" });
    const body = JSON.parse(await readBody(req) || "{}");
    const displayName = String(body.displayName || session.githubUser.login).trim();
    if (!/^[A-Za-z0-9_-]+$/.test(displayName)) {
      return sendJson(res, 400, { error: "Display name can only contain letters, numbers, _ and -" });
    }
    session.pixnariaProfile = {
      id: session.githubUser.login.toLowerCase() === "snowoo" ? "user_snowoo" : `pix_${session.githubUser.id}`,
      username: session.githubUser.login,
      githubUsername: session.githubUser.login,
      githubId: session.githubUser.id,
      githubProfileUrl: session.githubUser.html_url,
      displayName,
      bio: String(body.bio || "").slice(0, 240),
      avatarData: body.avatarData || null,
      avatarInitial: displayName.charAt(0).toUpperCase() || "P",
      avatarColor: session.githubUser.login.toLowerCase() === "snowoo" ? "creator" : "default",
      role: session.githubUser.login.toLowerCase() === "snowoo" ? "creator" : "user",
      badges: session.githubUser.login.toLowerCase() === "snowoo" ? ["Creator", "Admin"] : [],
      authProvider: "github",
      githubConnected: true,
      joinedAt: new Date().toISOString().slice(0, 10)
    };
    return sendJson(res, 200, { user: session.pixnariaProfile });
  }

  if (url.pathname === "/api/auth/logout" && req.method === "POST") {
    sessions.delete(session.id);
    res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 404, { error: "API route not found" });
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.normalize(path.join(__dirname, pathname));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Pixnaria dev server running on http://localhost:${PORT}`);
  console.log(`GitHub callback URL: ${CALLBACK_URL}`);
});
