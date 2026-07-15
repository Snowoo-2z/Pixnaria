# Upload this folder to GitHub

Upload the **contents** of this `pixnaria/` folder to your public GitHub repository named `pixnaria`.

## Do not upload secrets

Do not create or upload `.env`.

Only upload:

```txt
.env.example
```

## GitHub OAuth callback URLs

Local:

```txt
http://localhost:8000/api/auth/github/callback
```

Vercel:

```txt
https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/github/callback
```

## Vercel env variables

Add these in Vercel Project Settings → Environment Variables:

```txt
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_CALLBACK_URL
PUBLIC_BASE_URL
SESSION_SECRET
```

## Current real GitHub features

```txt
Continue with GitHub OAuth
Signed cookie session
Pixnaria custom profile save
Create public GitHub repo from My Projects
Starter Pixnaria files committed to the repo
```
