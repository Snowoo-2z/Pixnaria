# Pixnaria — Setup GitHub Auth

Version : 0.1  
Date : 2026-07-15  
Statut : guide pour créer l’app GitHub et brancher la connexion réelle plus tard

---

## 1. Objectif

Pixnaria va utiliser GitHub comme connexion obligatoire pour les comptes cloud.

Le flow cible :

```txt
1. L’utilisateur clique “Continue with GitHub”.
2. GitHub authentifie l’utilisateur.
3. Pixnaria récupère son GitHub ID / username.
4. Pixnaria crée ou retrouve son profil Pixnaria.
5. L’utilisateur complète son profil Pixnaria : display name, bio, photo personnalisée.
6. Pixnaria peut créer/synchroniser des repos publics pour les projets.
```

Important : la photo de profil reste **personnalisée Pixnaria**, pas obligatoirement l’avatar GitHub.

---

## 2. Ce qui est fait dans le prototype actuel

Le prototype `auth.html` contient maintenant :

```txt
Continue with GitHub
Login as Snowoo GitHub Admin
Complete Pixnaria profile
Upload avatar personnalisé
Bio
Sauvegarde localStorage
```

Pour l’instant, c’est un **mock frontend**.

Il simule :

```txt
GitHub username
GitHub ID
GitHub repo permission publique
profil Pixnaria
avatar custom
```

---

## 3. Pourquoi la vraie connexion GitHub ne peut pas être 100% frontend simple

Avec GitHub OAuth classique, le navigateur reçoit un `code`, mais pour l’échanger contre un token GitHub, il faut utiliser le `client_secret`.

Le `client_secret` ne doit jamais être mis dans le HTML ou le JavaScript public.

Donc il faut choisir une solution sécurisée :

```txt
Option A : Supabase Auth avec provider GitHub
Option B : Firebase Auth avec provider GitHub
Option C : petit backend / serverless function pour échanger le code OAuth
Option D : GitHub App avec backend
```

Recommandation Pixnaria :

```txt
Prototype : mock GitHub Auth
MVP : Supabase Auth GitHub ou Firebase Auth GitHub
Production : GitHub App pour les permissions repo propres
```

---

## 4. GitHub OAuth App — création

Si tu crées une OAuth App GitHub :

1. Va dans GitHub.
2. Settings.
3. Developer settings.
4. OAuth Apps.
5. New OAuth App.

Champs possibles pour le développement local :

```txt
Application name:
Pixnaria

Homepage URL:
http://localhost:8000

Authorization callback URL:
http://localhost:8000/auth.html
```

Pour le site publié plus tard :

```txt
Homepage URL:
https://pixnaria.com

Authorization callback URL:
https://pixnaria.com/auth/callback
```

Ou avec Supabase :

```txt
Authorization callback URL:
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

---

## 5. Scopes GitHub

Pour lire le profil public :

```txt
read:user
```

Pour lire l’e-mail si nécessaire :

```txt
user:email
```

Pour créer/modifier des repos publics :

```txt
public_repo
```

Décision Pixnaria :

```txt
Login : read:user
Cloud projects / repo sync : public_repo
```

Idéalement, on ne demande `public_repo` qu’au moment où l’utilisateur veut créer/synchroniser un projet GitHub.

---

## 6. Données utilisateur Pixnaria

Après connexion GitHub, Pixnaria stocke son propre profil :

```json
{
  "id": "pix_user_123",
  "githubId": "12345678",
  "githubUsername": "Snowoo",
  "displayName": "Snowoo",
  "bio": "Creator of Pixnaria",
  "avatarUrl": "custom-avatar.webp",
  "role": "admin",
  "badges": ["Creator", "Admin"],
  "joinedAt": "2026-07-15"
}
```

---

## 7. Stockage avatar personnalisé

Même avec GitHub Auth, Pixnaria garde son propre avatar.

Stockage futur :

```txt
Supabase Storage ou Firebase Storage
```

Contraintes recommandées :

```txt
Upload max brut : 1 MB
Avatar final : 256x256 max
Format recommandé : WebP
Thumbnail : 128x128
```

---

## 8. Prochaine intégration dans le prototype

Après `auth.html`, il faudra adapter :

```txt
projects.html
project.html
explore.html
profile.html
admin.html
```

Pour afficher :

```txt
GitHub connected
GitHub username
GitHub repo URL
Create GitHub repo mock
Sync to GitHub mock
Open repository
```

---

## 9. Checklist quand tu auras créé l’app GitHub

À me donner plus tard :

```txt
Client ID public
Callback URL choisie
Tu veux Supabase Auth, Firebase Auth ou backend custom ?
Nom exact de l’app GitHub
Nom de domaine/local utilisé
```

Ne donne jamais le `client_secret` dans le chat si tu veux éviter de l’exposer.  
Le secret doit aller dans une variable d’environnement côté backend/Supabase/Firebase, pas dans le frontend.

---

## 10. Fichier de configuration ajouté

Le prototype contient maintenant :

```txt
scripts/github-auth-config.js
```

Il contient :

```js
window.PIXNARIA_GITHUB_AUTH = {
  mode: "mock",
  clientId: "PASTE_GITHUB_CLIENT_ID_HERE",
  callbackUrl: "http://localhost:8000/auth.html",
  scopes: ["read:user", "public_repo"],
  appName: "Pixnaria"
};
```

### Mode mock

```txt
mode: "mock"
```

Le bouton `Continue with GitHub` simule la connexion GitHub sans vraie API.

### Mode oauth

```txt
mode: "oauth"
```

Le bouton construira l’URL GitHub OAuth réelle :

```txt
https://github.com/login/oauth/authorize
```

Mais attention : après le retour GitHub, le frontend reçoit seulement un `code`. Pour transformer ce code en access token, il faut un backend sécurisé, Supabase Auth, Firebase Auth ou une fonction serverless. Le `client_secret` ne doit pas être dans le frontend.

---

## 11. Décision produit confirmée

Décision Snowoo :

```txt
GitHub obligatoire pour les comptes cloud.
Pas de vérification d’âge supplémentaire côté Pixnaria.
Photo de profil personnalisée Pixnaria conservée.
GitHub ne gère pas la photo de profil Pixnaria.
Firebase/Supabase gardent profils, avatars et social.
```

Formulation recommandée dans Pixnaria :

```txt
A GitHub account is required to use Pixnaria cloud projects.
```

Éviter d’écrire dans l’interface qu’on contourne ou ignore les règles GitHub. L’utilisateur reste responsable de respecter les conditions GitHub.

---

## 12. Implémentation réelle ajoutée — server.js

Pixnaria contient maintenant une vraie base GitHub OAuth côté serveur :

```txt
server.js
.env.example
package.json
```

### Pourquoi un serveur ?

GitHub OAuth réel nécessite d’échanger le `code` reçu contre un token avec le `client_secret`. Le secret ne doit jamais être dans le frontend. Donc Pixnaria utilise maintenant `server.js` pour faire cet échange.

### Installation locale

1. Crée une OAuth App GitHub.
2. Copie `.env.example` vers `.env`.
3. Remplis :

```txt
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:8000/api/auth/github/callback
```

4. Lance :

```bash
npm start
```

5. Ouvre :

```txt
http://localhost:8000/auth.html
```

### Callback GitHub à mettre dans l’app

```txt
http://localhost:8000/api/auth/github/callback
```

### Routes serveur ajoutées

```txt
GET  /api/auth/github/start
GET  /api/auth/github/callback
GET  /api/auth/me
POST /api/auth/profile
POST /api/auth/logout
```

### Session

Le serveur utilise un cookie HTTP-only :

```txt
pixnaria_session
```

Le token GitHub reste côté serveur en mémoire dans le prototype dev.

### Important production

Pour la production, il faudra remplacer la mémoire par :

```txt
Supabase session
Firebase session
base de données
stockage sécurisé chiffré
```

Ne jamais commiter `.env`.
