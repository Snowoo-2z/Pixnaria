# Pixnaria — GitHub + Vercel deployment guide

## 1. What you created

You created a public GitHub repository:

```txt
pixnaria
```

You will upload the contents of the `pixnaria/` folder generated in this workspace.

---

## 2. GitHub OAuth App

Create a GitHub OAuth App:

GitHub → Settings → Developer settings → OAuth Apps → New OAuth App

### Local development values

```txt
Application name:
Pixnaria

Homepage URL:
http://localhost:8000

Authorization callback URL:
http://localhost:8000/api/auth/github/callback
```

### Vercel production values

After deploying on Vercel, your callback will be:

```txt
https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/github/callback
```

If GitHub allows only one callback in the OAuth App you created, use the Vercel one for production and create a second OAuth App for local dev if needed.

---

## 3. Files you must not upload

Do not upload:

```txt
.env
node_modules/
.vercel/
```

The `.gitignore` already blocks them.

---

## 4. Local setup

Copy:

```bash
cp .env.example .env
```

Fill:

```txt
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/auth/github/callback
PUBLIC_BASE_URL=http://localhost:8000
SESSION_SECRET=generate_a_long_random_secret
```

Run:

```bash
npm start
```

Open:

```txt
http://localhost:8000/auth.html
```

---

## 5. Vercel setup

1. Go to Vercel.
2. New Project.
3. Import your `pixnaria` GitHub repo.
4. Framework preset: Other.
5. Build command: leave empty.
6. Output directory: leave empty.
7. Add environment variables:

```txt
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/github/callback
PUBLIC_BASE_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
SESSION_SECRET=generate_a_long_random_secret
```

8. Deploy.

---

## 6. Test checklist

After deploy:

```txt
/auth.html
```

Click:

```txt
Continue with GitHub
```

Expected flow:

```txt
Pixnaria → GitHub authorization → Pixnaria callback → Complete Pixnaria profile
```

Then test:

```txt
/index.html
/projects.html
/editor.html
/engine-demo.html
/admin.html
```

---

## 7. Current limitations

The Vercel API stores GitHub session data in a signed HTTP-only cookie.

For production later, we should replace this with:

```txt
Supabase Auth / Firebase Auth
Supabase database profiles
Supabase/Firebase Storage for custom profile pictures
```

The current version is good for live prototype testing.
