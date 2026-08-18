# Pixnaria — setup & deployment

Pixnaria runs entirely on GitHub. There is no Supabase, Firebase or other
external database. Two different GitHub integrations are used:

1. **Visitor GitHub OAuth app** — lets any visitor sign in with their own
   GitHub account (to like/comment/publish projects/etc).
2. **Data-store GitHub token** — a single server-side Personal Access Token
   belonging to a Pixnaria maintainer, used to read/write the site's shared
   data (profiles, projects, likes, comments, reports, bans, news, studios,
   public profile "wall" messages). It is stored as JSON files under
   `data/*.json` on a dedicated branch (`pixnaria-data` by default) of this
   repository, so everyday writes (a like, a comment, a message) never touch
   `main` or trigger a redeploy.

## 1. Create the GitHub OAuth App (visitor login)

1. Go to <https://github.com/settings/developers> → "New OAuth App".
2. Application name: `Pixnaria` (or anything you like).
3. Homepage URL: your deployed URL, e.g. `https://pixnaria.vercel.app`.
4. Authorization callback URL:
   `https://pixnaria.vercel.app/api/auth/github/callback`
   (use `http://localhost:8000/api/auth/github/callback` for local dev).
5. Generate a **Client Secret**.
6. Note the **Client ID** and **Client Secret**.

## 2. Create the data-store Personal Access Token

This token needs write access to **this repository's contents** only —
nothing else.

Recommended (fine-grained token):
1. Go to <https://github.com/settings/tokens?type=beta> → "Generate new
   token".
2. Resource owner: the account/organisation that owns this repo
   (`Snowoo-2z`).
3. Repository access: "Only select repositories" → `Pixnaria`.
4. Permissions → Repository permissions → **Contents: Read and write**.
   (No other permission is required.)
5. Generate the token and copy it — you will not see it again.

Alternative (classic token, simpler but broader): generate a classic PAT
with the `repo` scope.

Keep this token secret. It is only ever used by the server (Vercel
functions / `server.js`), never sent to the browser.

## 3. Environment variables

Copy `.env.example` to `.env` for local development, or set the same
variables in your hosting provider (e.g. Vercel → Project → Settings →
Environment Variables):

| Variable | Required | Description |
|---|---|---|
| `GITHUB_CLIENT_ID` | yes | OAuth App client ID (step 1) |
| `GITHUB_CLIENT_SECRET` | yes | OAuth App client secret (step 1) |
| `GITHUB_CALLBACK_URL` | no | Override if it can't be inferred from the request |
| `PUBLIC_BASE_URL` | no | Override the public site URL used in redirects |
| `SESSION_SECRET` | yes | Any long random string, used to sign session cookies |
| `DATA_GITHUB_TOKEN` | yes | PAT from step 2 |
| `DATA_REPO_OWNER` | no (default `Snowoo-2z`) | Owner of the data repository |
| `DATA_REPO_NAME` | no (default `Pixnaria`) | Name of the data repository |
| `DATA_REPO_BRANCH` | no (default `pixnaria-data`) | Branch used to store JSON data |

The `pixnaria-data` branch is created automatically on first write if it
doesn't exist yet (branched off `main`).

## 4. Run locally

```bash
npm install   # no dependencies today, but keeps npm happy
npm run dev   # starts server.js on http://localhost:8000
```

`server.js` serves the static site and dispatches every `/api/**` request to
the matching file under `api/`, exactly like Vercel does in production —
so local dev and production behave the same way.

## 5. Deploy

Pixnaria is designed for Vercel (see `vercel.json`), but any Node host that
can run `server.js` (or turn `api/**.js` into serverless functions) works.
On Vercel: import the repo, set the environment variables above, and
deploy — no build step is required.

## Data model (all stored on the `pixnaria-data` branch)

- `data/profiles.json` — Pixnaria profiles (linked 1:1 to GitHub accounts)
- `data/projects.json` — indexed `pixnaria-*` GitHub repositories
- `data/project_likes.json`, `data/project_favorites.json` — reactions
- `data/project_comments.json` — comments on a project page
- `data/reports.json`, `data/bans.json` — moderation
- `data/news.json` — announcements shown on the homepage
- `data/studios.json`, `data/studio_members.json`, `data/studio_projects.json`
- `data/wall_messages.json` — public messages left on profile pages

See `api/_gitdb.js` for the small read-modify-write helper (with retry on
write conflicts) that all of the above is built on, and `api/_store.js` for
the domain-level helpers used by the API routes in `api/data/*.js`.
