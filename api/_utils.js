const crypto = require('node:crypto');

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function unbase64url(input) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(value) {
  const secret = env('SESSION_SECRET', env('GITHUB_CLIENT_SECRET', 'pixnaria-dev-secret'));
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function encodeSession(payload) {
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function decodeSession(token) {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  if (sign(body) !== signature) return null;
  try {
    return JSON.parse(unbase64url(body));
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const cookies = {};
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join('='));
  }
  return cookies;
}

function cookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.secure) parts.push('Secure');
  return parts.join('; ');
}

function clearCookie(name) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function sendJson(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end(JSON.stringify(data));
}

function redirect(res, location, headers = {}) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function exchangeCodeForToken(code, callbackUrl) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: env('GITHUB_CLIENT_ID'),
      client_secret: env('GITHUB_CLIENT_SECRET'),
      code,
      redirect_uri: callbackUrl
    })
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || 'GitHub token exchange failed');
  }
  return data.access_token;
}

async function fetchGitHubUser(token) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Pixnaria'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch GitHub user');
  return response.json();
}

function callbackUrl(req) {
  if (process.env.GITHUB_CALLBACK_URL) return process.env.GITHUB_CALLBACK_URL;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/api/auth/github/callback`;
}

function publicBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = {
  env,
  randomId: () => crypto.randomBytes(24).toString('hex'),
  encodeSession,
  decodeSession,
  parseCookies,
  cookie,
  clearCookie,
  sendJson,
  redirect,
  readBody,
  exchangeCodeForToken,
  fetchGitHubUser,
  callbackUrl,
  publicBaseUrl
};
