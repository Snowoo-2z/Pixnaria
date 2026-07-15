# Pixnaria — Architecture GitHub pour comptes et projets

Version : 0.1  
Date : 2026-07-15  
Créateur : Snowoo  
Statut : nouvelle direction technique à intégrer progressivement au prototype

---

## 1. Décision principale

Pixnaria utilisera **GitHub comme système obligatoire de connexion et de stockage des projets**.

Le principe devient :

```txt
Compte Pixnaria = compte GitHub connecté
Projet Pixnaria cloud = repository GitHub public
Communauté Pixnaria = Firebase/Supabase
Profil Pixnaria = données personnalisées Pixnaria
Photo de profil = personnalisée Pixnaria, pas GitHub obligatoire
```

---

## 2. Ce que GitHub gère

GitHub gère :

- connexion obligatoire ;
- identité de base ;
- dépôt public du projet ;
- historique de versions ;
- fichiers du projet ;
- scripts Python ;
- assets raisonnables ;
- accès open source ;
- inspection du projet ;
- stockage principal des projets cloud.

---

## 3. Ce que GitHub ne gère pas

GitHub ne remplace pas toute la plate-forme Pixnaria.

GitHub ne gère pas directement :

- likes ;
- favoris ;
- commentaires ;
- profils Pixnaria enrichis ;
- photo de profil personnalisée Pixnaria ;
- messages ;
- signalements ;
- bans ;
- modérateurs ;
- Featured Project ;
- news / fil d’actualité ;
- studios ;
- paramètres Pixnaria ;
- données admin Snowoo.

Ces données restent dans :

```txt
Firebase et/ou Supabase
```

---

## 4. Photo de profil

Décision importante :

```txt
La photo de profil reste personnalisée dans Pixnaria.
On n’utilise pas obligatoirement l’avatar GitHub.
```

GitHub peut servir à récupérer un avatar par défaut si l’utilisateur n’en met pas, mais Pixnaria doit permettre une photo de profil personnalisée.

Stockage possible :

```txt
Supabase Storage
Firebase Storage
```

Optimisations obligatoires :

- compression ;
- taille maximale ;
- avatar carré ;
- thumbnail ;
- conversion éventuelle en WebP ;
- limite de poids stricte.

Exemple de limite Pixnaria :

```txt
Avatar upload max : 1 MB brut
Avatar stocké : 128x128 ou 256x256 compressé
```

---

## 5. Âge et GitHub

GitHub impose ses propres règles d’âge dans ses conditions d’utilisation. Pixnaria ne doit pas encourager explicitement à contourner les règles de GitHub.

Décision pratique Pixnaria :

```txt
GitHub est obligatoire pour publier/stocker un projet cloud.
Pixnaria ne gère pas de vérification d’âge supplémentaire.
L’utilisateur est responsable de respecter les conditions GitHub.
```

Dans l’interface, on pourra simplement indiquer :

```txt
You need a GitHub account to use Pixnaria cloud projects.
```

Sans entrer dans un système de vérification d’âge complexe.

---

## 6. Architecture globale retenue

```txt
GitHub
├── Auth obligatoire
├── Repos publics Pixnaria
├── Fichiers projet
├── Historique commits
└── Open source / Look inside

Supabase/Firebase
├── Profil Pixnaria
├── Photo de profil personnalisée
├── Likes
├── Favoris
├── Commentaires
├── Messages
├── Signalements
├── Bans
├── Modérateurs
├── Featured Project
├── News
├── Studios
└── Index Explorer

Pixnaria Frontend
├── Site
├── Éditeur
├── Moteur Canvas
├── Import/export .pixna
├── GitHub sync
└── UI communautaire
```

---

## 7. Connexion utilisateur

Flux prévu :

```txt
1. L’utilisateur clique “Continue with GitHub”.
2. GitHub authentifie l’utilisateur.
3. Pixnaria récupère l’identifiant GitHub.
4. Pixnaria crée ou retrouve le profil Pixnaria associé.
5. L’utilisateur peut ensuite configurer son profil Pixnaria.
```

Données profil Pixnaria :

```json
{
  "id": "pix_user_123",
  "githubId": "12345678",
  "githubUsername": "Snowoo",
  "displayName": "Snowoo",
  "avatarUrl": "custom_pixnaria_avatar.webp",
  "bio": "Creator of Pixnaria",
  "badges": ["creator", "admin"],
  "role": "admin",
  "joinedAt": "2026-07-15"
}
```

---

## 8. Création d’un projet

Flux prévu :

```txt
1. L’utilisateur clique “New Project”.
2. Pixnaria demande un nom de projet.
3. Pixnaria crée un repo GitHub public.
4. Pixnaria ajoute les fichiers de base.
5. Pixnaria enregistre le projet dans son index Supabase/Firebase.
```

Nom de repo recommandé :

```txt
pixnaria-project-name
```

Exemple :

```txt
pixnaria-neon-platformer
```

---

## 9. Structure repo GitHub d’un projet Pixnaria

Structure recommandée :

```txt
pixnaria-neon-platformer/
├── README.md
├── pixnaria.project.json
├── pixnaria.scene.json
├── pixnaria.settings.json
├── scripts/
│   ├── Player.py
│   ├── EnemyAI.py
│   └── Utils.py
├── assets/
│   ├── images/
│   │   ├── player.png
│   │   └── ground.png
│   └── audio/
│       └── jump.wav
├── thumbnails/
│   └── cover.webp
└── .pixnaria/
    ├── metadata.json
    └── version.json
```

---

## 10. Sauvegarde projet

Quand l’utilisateur sauvegarde dans l’éditeur :

```txt
1. Pixnaria convertit les nodes en JSON.
2. Pixnaria met à jour les scripts.
3. Pixnaria met à jour les assets modifiés.
4. Pixnaria commit sur GitHub.
5. Pixnaria met à jour l’index Supabase/Firebase.
```

Message de commit possible :

```txt
Update Pixnaria project
```

Ou plus précis :

```txt
Update scene from Pixnaria editor
```

---

## 11. Import projet

Pixnaria doit pouvoir importer :

```txt
un repo GitHub Pixnaria
un fichier .pixna local
```

Flux import GitHub :

```txt
1. L’utilisateur colle ou sélectionne un repo.
2. Pixnaria vérifie la présence de fichiers Pixnaria.
3. Pixnaria charge project/scene/settings/scripts/assets.
4. Pixnaria ouvre le projet dans l’éditeur.
```

---

## 12. Projet public et Look Inside

Avec GitHub, tous les projets cloud Pixnaria sont publics par défaut.

Cela correspond à l’esprit :

```txt
open source
regarder à l’intérieur
apprendre des projets
exporter des nodes
```

La page projet publique affiche :

- lecteur du jeu ;
- description ;
- auteur ;
- crédits ;
- likes ;
- favoris ;
- commentaires ;
- bouton Look Inside ;
- lien GitHub repo ;
- bouton Report.

---

## 13. Limites recommandées Pixnaria

Même si GitHub permet des repos assez grands, Pixnaria doit imposer ses propres limites pour rester rapide.

Limites Pixnaria recommandées :

```txt
Projet recommandé : moins de 100 MB
Projet maximum Pixnaria v1 : 500 MB
Fichier maximum Pixnaria : 25 MB
Fichier maximum absolu GitHub : 100 MB
Avatar maximum brut : 1 MB
Avatar stocké : compressé
```

Pourquoi limiter à 25 MB côté Pixnaria ?

- éviter les abus ;
- garder les projets rapides ;
- éviter les pushes GitHub lourds ;
- éviter les assets énormes ;
- rester compatible écoles/faibles connexions.

---

## 14. Permissions GitHub

Objectif : demander le minimum possible.

Deux options techniques :

### Option A — OAuth GitHub simple

Plus simple à démarrer.

Mais le scope `public_repo` donne accès en lecture/écriture aux repos publics autorisés.

### Option B — GitHub App

Meilleure option à terme.

Permet de limiter Pixnaria à certains repos sélectionnés ou aux repos créés par Pixnaria.

Recommandation :

```txt
Prototype : OAuth mock / Supabase GitHub Auth
Production : GitHub App si possible
```

---

## 15. Supabase/Firebase — données restantes

Pixnaria garde une base pour :

```txt
users
profiles
avatars
projects_index
likes
favorites
comments
reports
bans
moderators
featured_projects
news
studios
messages
settings
```

Exemple `projects_index` :

```json
{
  "id": "project_123",
  "ownerId": "pix_user_123",
  "githubOwner": "Snowoo",
  "githubRepo": "pixnaria-neon-platformer",
  "title": "Neon Platformer",
  "description": "A Pixnaria platformer",
  "thumbnailUrl": "...",
  "likes": 128,
  "favorites": 42,
  "views": 2400,
  "featured": true,
  "createdAt": "2026-07-15",
  "updatedAt": "2026-07-15"
}
```

---

## 16. Ce qui change dans le prototype

À modifier progressivement :

```txt
auth.html
projects.html
project.html
explore.html
admin.html
profile.html
PIXNARIA_ARCHITECTURE_TECHNIQUE.md
PIXNARIA_CAHIER_DE_CONCEPTION.md
```

Nouvelles features mock à créer :

- bouton `Continue with GitHub` ;
- faux login GitHub ;
- liste de repos GitHub mock ;
- création repo public mock ;
- commit/sync mock ;
- lien GitHub repo dans la page projet ;
- stockage avatar Pixnaria personnalisé ;
- suppression Resend de la v1 ;
- remplacement email code par GitHub auth.

---

## 17. Nouvelle roadmap

### Étape 1 — Adapter le prototype auth

Remplacer l’inscription e-mail par :

```txt
Continue with GitHub
```

Garder :

```txt
avatar Pixnaria personnalisé
profil Pixnaria
bio
```

### Étape 2 — Adapter Mes projets

Ajouter :

```txt
Create GitHub repo mock
Sync to GitHub mock
Open repo
Import GitHub repo
```

### Étape 3 — Adapter page projet

Ajouter :

```txt
GitHub repo link
Open source badge
Last commit
Look inside from repo
```

### Étape 4 — Adapter Explorer

Explorer lit l’index Pixnaria, qui pointe vers des repos GitHub publics.

### Étape 5 — Vraie intégration GitHub

Choisir :

```txt
Supabase Auth GitHub
Firebase Auth GitHub
GitHub OAuth custom
GitHub App
```

---

## 18. Décision actuelle

Décision validée par Snowoo :

```txt
GitHub obligatoire pour tous les comptes Pixnaria cloud.
Les projets cloud sont stockés dans des repos GitHub publics.
Les photos de profil restent personnalisées dans Pixnaria.
Firebase/Supabase gardent toutes les fonctionnalités communautaires.
Resend n’est plus prioritaire pour la v1.
```
