/**
 * Pixnaria local dev server.
 *
 * Serves the static site and dispatches every `/api/**` request to the
 * matching file under `./api` (mirroring how Vercel turns `api/**.js` files
 * into serverless functions), so local dev behaves exactly like production.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

loadEnv();

const PORT = Number(process.env.PORT || 8000);
const API_DIR = path.join(__dirname, "api");

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

// Resolve an /api/foo/bar request to a handler file, the same way Vercel's
// file-system routing does: api/foo/bar.js, or api/foo/bar/index.js.
function resolveApiHandler(pathname) {
  const relative = pathname.replace(/^\/api\/?/, "");
  if (relative.includes("..")) return null;
  const segments = relative.split("/").filter(Boolean);
  const direct = path.join(API_DIR, ...segments) + ".js";
  const indexed = path.join(API_DIR, ...segments, "index.js");
  if (fs.existsSync(direct)) return direct;
  if (fs.existsSync(indexed)) return indexed;
  return null;
}

async function handleApi(req, res, url) {
  const handlerPath = resolveApiHandler(url.pathname);
  if (!handlerPath) {
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ error: "API route not found" }));
  }
  delete require.cache[require.resolve(handlerPath)];
  const handler = require(handlerPath);
  return handler(req, res);
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  // Mirror vercel.json's clean-URL rewrite for public profiles.
  const userMatch = pathname.match(/^\/user\/([^/]+)\/?$/);
  if (userMatch) pathname = "/profile.html";

  let filePath = path.normalize(path.join(__dirname, pathname));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      // cleanUrls: try appending .html
      if (!path.extname(filePath)) {
        return fs.readFile(`${filePath}.html`, (err2, data2) => {
          if (err2) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            return res.end("Not found");
          }
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(data2);
        });
      }
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
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ error: error.message || "Server error" }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Pixnaria dev server running on http://localhost:${PORT}`);
  console.log(`GitHub OAuth callback: ${process.env.GITHUB_CALLBACK_URL || `http://localhost:${PORT}/api/auth/github/callback`}`);
  console.log(`Data store: ${process.env.DATA_GITHUB_TOKEN ? "GitHub (configured)" : "not configured — set DATA_GITHUB_TOKEN"}`);
});
