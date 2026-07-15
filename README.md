# Pixnaria

Pixnaria is a modern open-source coding platform concept for creating 2D games and animations with Python, nodes, and a custom engine.

## Current status

This repository is an early prototype. It includes:

- responsive website pages;
- Pixnaria editor prototype;
- node manager;
- Canvas engine runtime prototype;
- `.pixna` export/import prototype;
- GitHub OAuth login base for Vercel;
- admin/community mock pages.

## Local run

```bash
npm start
```

Then open:

```txt
http://localhost:8000
```

## GitHub OAuth local setup

1. Create a GitHub OAuth App.
2. Set callback URL:

```txt
http://localhost:8000/api/auth/github/callback
```

3. Copy `.env.example` to `.env`.
4. Fill:

```txt
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:8000/api/auth/github/callback
SESSION_SECRET=any-long-random-secret
```

5. Run:

```bash
npm start
```

## Vercel deployment

Set these environment variables in Vercel:

```txt
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_CALLBACK_URL=https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/github/callback
PUBLIC_BASE_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
SESSION_SECRET
```

In the GitHub OAuth App, add this callback URL:

```txt
https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/github/callback
```

## Important

Never commit `.env`.

The profile picture is managed by Pixnaria, not GitHub. GitHub is used for login and public project repositories.
