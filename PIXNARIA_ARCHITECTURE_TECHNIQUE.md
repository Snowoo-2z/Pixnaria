# Pixnaria — Architecture technique du site

Version : 0.1  
Date : 2026-07-13  
Créateur : Snowoo  
Statut : à valider avant développement HTML/CSS/JS

---

## 1. Objectif du document

Ce document définit la base technique de Pixnaria avant de commencer le développement du site.

Il sert à fixer :

- la structure des fichiers ;
- les pages principales ;
- la logique responsive ;
- la navigation ;
- la préparation multilingue français/anglais ;
- la future gestion des comptes ;
- la future gestion des projets ;
- la future gestion du fil d’actualité ;
- la future architecture Firebase/Supabase/Resend ;
- la future structure de l’éditeur Pixnaria.

Le but n’est pas encore de créer le backend complet, mais de préparer un site propre, évolutif et facile à brancher à une vraie base de données plus tard.

---

## 2. Rappel de la vision Pixnaria

Pixnaria est une plate-forme internationale de coding pour les 11 ans et plus.

Elle permet de créer des jeux et animations avec :

- Python ;
- un moteur 2D personnalisé ;
- un système de nodes inspiré de Godot ;
- une expérience communautaire inspirée de Scratch ;
- une direction artistique moderne violet foncé/noir.

Pixnaria doit être :

- fun ;
- sérieux, mais pas trop ;
- open source ;
- international ;
- communautaire ;
- moderne ;
- responsive sur tous les appareils.

---

## 3. Ordre de développement validé

Ordre logique du projet :

```txt
1. Cahier de conception
2. Logo
3. Architecture technique
4. Maquette HTML/CSS/JS responsive
5. Pages statiques principales
6. Prototype interactif
7. Connexion Firebase/Supabase/Resend
8. Éditeur Pixnaria
9. Système de projets
10. Moteur 2D / nodes / Python sécurisé
```

Ce document correspond à l’étape 3.

---

## 4. Structure de fichiers proposée

Pour commencer proprement, je propose une structure simple, sans framework lourd.

```txt
pixnaria/
├── index.html
├── explore.html
├── profile.html
├── projects.html
├── messages.html
├── editor.html
├── our-team.html
├── contact.html
├── privacy.html
├── terms.html
│
├── styles/
│   ├── main.css
│   ├── responsive.css
│   └── editor.css
│
├── scripts/
│   ├── app.js
│   ├── navigation.js
│   ├── mock-data.js
│   ├── i18n.js
│   ├── auth-ui.js
│   ├── news-admin.js
│   └── editor-preview.js
│
├── assets/
│   ├── logos/
│   │   ├── pixnaria_site_logo.svg
│   │   ├── pixnaria_logo_concept.svg
│   │   ├── pixnaria_logo_concept_pub.png
│   │   └── pixnaria_favicon.svg
│   │
│   ├── images/
│   ├── icons/
│   └── avatars/
│
└── data/
    ├── projects.mock.json
    ├── users.mock.json
    ├── news.mock.json
    └── team.mock.json
```

### Pourquoi cette structure ?

Elle permet de commencer rapidement avec du HTML/CSS/JS classique, tout en préparant les vraies fonctionnalités.

Avantages :

- simple à comprendre ;
- bon pour prototyper ;
- facile à convertir plus tard vers React, Vue, Svelte ou autre si besoin ;
- compatible avec Firebase Hosting ;
- facile à rendre responsive ;
- clair pour un projet open source.

---

## 5. Pages principales du site

### 5.1 Accueil — `index.html`

Page principale du site.

Elle contient :

- navbar Pixnaria ;
- hero avec slogan ;
- aperçu nodes + Python ;
- projets tendance ;
- section **Featured Project** ;
- fil d’actualité ;
- studios ou communauté ;
- footer.

Important : la section ne doit pas s’appeler “Featured by Snowoo”.  
Nom validé :

```txt
Featured Project
```

ou en français :

```txt
Projet mis en avant
```

### 5.2 Explorer / Tendances — `explore.html`

Page qui affiche :

- projets tendances ;
- projets récents ;
- projets populaires ;
- studios ;
- filtres ;
- recherche.

L’algorithme de tendance sera défini plus tard.

### 5.3 Profil utilisateur — `profile.html`

Page publique d’un utilisateur.

Elle contient :

- photo de profil ;
- nom d’utilisateur ;
- badges ;
- bio ;
- date d’inscription ;
- projets publics ;
- favoris publics si activé ;
- lien de partage.

Les adresses e-mail ne sont jamais visibles publiquement.

### 5.4 Mes projets — `projects.html`

Page privée accessible après connexion.

Elle contient :

- projets créés ;
- projets privés ;
- projets publics ;
- bouton créer un projet ;
- importer `.pixna` ;
- exporter un projet ;
- supprimer un projet ;
- ouvrir dans l’éditeur.

### 5.5 Messages — `messages.html`

Page privée pour les messages.

Pour Snowoo, elle contient aussi un onglet spécial :

```txt
Signalements
```

### 5.6 Éditeur — `editor.html`

Page de l’éditeur Pixnaria.

Première version : maquette/prototype visuel.

Plus tard :

- gestionnaire de nodes ;
- viewport 2D ;
- inspecteur ;
- onglet script Python ;
- console ;
- assets ;
- export `.pixna`.

### 5.7 Our Team — `our-team.html`

Page publique listant :

- Snowoo tout en haut ;
- badge Creator/Admin ;
- date de join ;
- modérateurs ;
- badge Moderator ;
- date de join.

### 5.8 Contact Us — `contact.html`

Au début : redirection ou lien vers le profil Snowoo.

Plus tard : vraie page de contact avec formulaire.

### 5.9 Privacy — `privacy.html`

Page confidentialité.

Elle doit expliquer que :

- les e-mails sont gardés secrets ;
- les autres utilisateurs ne voient pas les e-mails ;
- certaines informations peuvent être visibles par l’administration pour la sécurité ;
- les projets publics sont visibles publiquement ;
- les projets privés restent privés.

### 5.10 Terms — `terms.html`

Conditions d’utilisation.

À compléter plus tard.

---

## 6. Navigation principale

### Desktop

Structure validée :

```txt
[Logo Pixnaria] [Explorer]                         [Messages] [Projets] [Username + pp]
```

Le logo est tout à gauche.

Le bouton Explorer est à droite du logo.

Le nom d’utilisateur et la photo de profil sont à droite.

L’utilisateur peut cliquer sur son nom ou sa photo de profil pour ouvrir son profil.

### Mobile

Sur mobile, la navigation devient :

```txt
[Logo Pixnaria]                            [Menu]
```

Menu mobile :

```txt
Explorer
Mes projets
Messages
Profil
Paramètres
Our Team
Contact Us
```

### Responsive

La navbar doit rester utilisable sur :

- desktop ;
- laptop ;
- tablette ;
- mobile ;
- petits écrans.

Aucun élément ne doit dépasser horizontalement.

---

## 7. Design system

### Palette principale

```txt
Fond principal          #07050D
Fond secondaire         #110A1F
Panneaux                #181026
Violet principal        #7C3AED
Violet néon             #A855F7
Magenta accent          #D946EF
Texte principal         #F5F3FF
Texte secondaire        #AFA7C8
Bordures                #2D1B46
Succès                  #22C55E
Erreur                  #EF4444
Avertissement           #F59E0B
```

### Style UI

Le site doit utiliser :

- thème sombre par défaut ;
- coins arrondis ;
- cartes modernes ;
- glow violet léger ;
- dégradés sombres ;
- boutons modernes ;
- icônes simples ;
- transitions douces ;
- visuel startup moderne.

### Thème clair

Un thème clair est prévu plus tard.

Il ne sera pas prioritaire dans la première maquette.

Mais le CSS doit être préparé avec des variables :

```css
:root {
  --bg: #07050D;
  --panel: #181026;
  --text: #F5F3FF;
}
```

Comme ça, le thème clair pourra être ajouté plus facilement.

---

## 8. Responsive design

Pixnaria doit être adapté à tous les appareils.

### Breakpoints proposés

```css
@media (max-width: 1100px) { }
@media (max-width: 900px) { }
@media (max-width: 640px) { }
@media (max-width: 420px) { }
```

### Desktop

Sur desktop :

- hero en deux colonnes ;
- grille de projets en 4 colonnes ;
- navbar complète ;
- footer en plusieurs colonnes.

### Tablette

Sur tablette :

- hero plus compact ;
- grille de projets en 2 colonnes ;
- navbar simplifiée si nécessaire.

### Mobile

Sur mobile :

- hero en une colonne ;
- cartes de projets en une colonne ;
- menu burger ;
- boutons larges ;
- texte lisible ;
- images adaptatives ;
- aucun scroll horizontal.

### CSS recommandé

Utiliser :

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(...));
clamp();
max-width;
min();
flex-wrap;
```

---

## 9. Page d’accueil — structure détaillée

### 9.1 Navbar

```txt
Logo Pixnaria
Explorer
Messages
Mes projets
Username + pp
```

### 9.2 Hero

Texte principal :

```txt
Imagine. Create. Share.
```

Sous-texte anglais :

```txt
Create games and animations with Python, nodes, and a custom 2D engine.
```

Sous-texte français :

```txt
Crée des jeux et animations avec Python, des nodes et un moteur 2D personnalisé.
```

Boutons possibles :

```txt
Start Creating
Explore Projects
```

Français :

```txt
Commencer à créer
Explorer les projets
```

### 9.3 Aperçu nodes + Python

Dans le hero, afficher une fausse interface compacte :

```txt
Scene
├── Player
│   ├── Sprite
│   ├── Collider
│   └── Player.py
├── Enemy
└── Camera2D
```

Et un code :

```python
def update(delta):
    if input.is_key_down("right"):
        self.x += speed * delta
```

But : montrer immédiatement que Pixnaria est basé sur Python et les nodes.

### 9.4 Projets tendance

Section :

```txt
Trending Projects
```

Français :

```txt
Projets tendance
```

Cartes fictives pour la première maquette :

```txt
Neon Platformer
Pixel Forest
Space Runner
Animation Lab
```

Chaque carte contient :

- image/preview ;
- nom du projet ;
- auteur ;
- likes ;
- favoris ;
- vues.

### 9.5 Featured Project

Section validée :

```txt
Featured Project
```

Français :

```txt
Projet mis en avant
```

Cette section affiche les projets mis en avant par l’administration, mais le texte public ne doit pas forcément dire “par Snowoo”.

### 9.6 Fil d’actualité

Section :

```txt
News
```

Français :

```txt
Actualités
```

Elle affiche :

- annonces ;
- nouveautés ;
- concours ;
- mises à jour ;
- messages importants.

Snowoo doit avoir une gestion complète du fil d’actualité une fois connecté.

Voir section 12.

### 9.7 Footer

Footer :

```txt
Pixnaria
Open Source
Our Team
Contact Us
Privacy
Terms
GitHub
```

---

## 10. Multilingue français / anglais

Pixnaria doit proposer français et anglais dès le départ.

### Première approche

Dans la maquette HTML, on peut commencer avec un fichier JS simple :

```txt
scripts/i18n.js
```

Il contiendra un dictionnaire :

```js
const translations = {
  fr: {
    explore: "Explorer",
    startCreating: "Commencer à créer"
  },
  en: {
    explore: "Explore",
    startCreating: "Start Creating"
  }
};
```

### Choix de langue

Prévoir un bouton :

```txt
FR / EN
```

Ou un menu dans les paramètres.

### Sauvegarde de langue

Au début :

```txt
localStorage
```

Plus tard :

```txt
préférence utilisateur dans Firebase/Supabase
```

---

## 11. Authentification

Les comptes sont obligatoires.

Mais pour la première maquette HTML, on ne fera pas encore une vraie authentification.

### Première maquette

Utiliser un faux utilisateur :

```txt
Snowoo
Avatar violet
Badges Admin / Creator
```

### Plus tard

Authentification réelle avec :

- Firebase Authentication ou Supabase Auth ;
- vérification e-mail avec Resend ;
- code de vérification par e-mail ;
- stockage du profil utilisateur ;
- règles de sécurité.

### Vérification e-mail avec Resend

Flux prévu :

```txt
1. L’utilisateur entre son e-mail.
2. Pixnaria génère un code.
3. Resend envoie le code.
4. L’utilisateur saisit le code.
5. Le compte est validé.
```

À confirmer plus tard selon le backend choisi.

---

## 12. Gestion complète du fil d’actualité

Snowoo veut pouvoir gérer complètement le fil d’actualité une fois connecté.

### Objectif

Créer une interface d’administration permettant à Snowoo, et éventuellement aux modérateurs autorisés, de gérer les actualités visibles sur la page d’accueil.

### Page ou panneau prévu

Dans la première version, on peut prévoir une section admin cachée/simulée.

Plus tard, une vraie page :

```txt
admin-news.html
```

Ou un onglet dans le dashboard admin :

```txt
Admin > News
```

### Fonctionnalités prévues

Snowoo doit pouvoir :

- créer une actualité ;
- modifier une actualité ;
- supprimer une actualité ;
- publier/dépublier ;
- épingler une actualité ;
- choisir une date ;
- choisir une catégorie ;
- ajouter un titre ;
- ajouter un contenu ;
- ajouter une image optionnelle ;
- ajouter un lien optionnel ;
- définir la langue : français, anglais ou les deux ;
- choisir si l’annonce apparaît sur l’accueil ;
- choisir si l’annonce apparaît dans Explorer ;
- choisir si l’annonce est importante.

### Catégories possibles

```txt
Update
Contest
Community
Maintenance
Announcement
Featured
```

Français :

```txt
Mise à jour
Concours
Communauté
Maintenance
Annonce
Mis en avant
```

### Structure d’une actualité

Exemple de donnée :

```json
{
  "id": "news_001",
  "title": {
    "fr": "Bienvenue sur Pixnaria",
    "en": "Welcome to Pixnaria"
  },
  "content": {
    "fr": "La première version arrive bientôt.",
    "en": "The first version is coming soon."
  },
  "category": "announcement",
  "imageUrl": null,
  "linkUrl": null,
  "isPublished": true,
  "isPinned": true,
  "isImportant": false,
  "showOnHome": true,
  "showOnExplore": false,
  "createdBy": "Snowoo",
  "createdAt": "2026-07-13T00:00:00.000Z",
  "updatedAt": "2026-07-13T00:00:00.000Z"
}
```

### Première maquette

Dans la première maquette HTML, on pourra simuler :

- des news fictives ;
- un bouton “Manage News” visible uniquement pour Snowoo ;
- une modale ou un panneau de gestion ;
- ajout/modification/suppression en local dans le navigateur.

Cette simulation pourra utiliser :

```txt
localStorage
```

Plus tard, ce sera branché à Firebase/Supabase.

---

## 13. Projets et Featured Project

### Projets publics

Un projet public contient :

- titre ;
- description ;
- auteur ;
- image de preview ;
- likes ;
- favoris ;
- vues ;
- commentaires ;
- lien de partage ;
- date de création ;
- date de mise à jour ;
- visibilité.

### Featured Project

La section **Featured Project** affiche un ou plusieurs projets choisis par l’administration.

Important : le nom public de la section est :

```txt
Featured Project
```

Pas :

```txt
Featured by Snowoo
```

### Gestion admin

Snowoo doit pouvoir :

- sélectionner un projet comme featured ;
- retirer un projet featured ;
- modifier l’ordre des projets featured ;
- choisir une durée optionnelle ;
- voir les projets signalés avant de les mettre en avant.

---

## 14. Profils utilisateurs

### Données publiques

```json
{
  "username": "Snowoo",
  "displayName": "Snowoo",
  "avatarUrl": "...",
  "bio": "Creator of Pixnaria",
  "badges": ["creator", "admin"],
  "joinedAt": "2026-07-13",
  "publicProjects": []
}
```

### Données privées

```json
{
  "email": "hidden@example.com",
  "emailVerified": true,
  "settings": {},
  "role": "admin"
}
```

Les données privées ne doivent jamais être affichées publiquement.

### Règles username

Regex actuelle :

```regex
^[A-Za-z0-9_-]+$
```

Les noms d’utilisateur peuvent contenir :

- lettres ;
- chiffres ;
- tiret bas `_` ;
- tiret haut `-`.

---

## 15. Commentaires

Pour le moment, les commentaires sont très limités.

Règle actuelle :

```txt
Lettres uniquement pour le moment.
```

À clarifier plus tard :

- espaces ;
- accents ;
- ponctuation simple ;
- longueur maximale.

### Modération

Même avec une validation côté JavaScript, il faudra plus tard une validation côté serveur.

Pourquoi ?

Parce qu’une validation uniquement côté navigateur peut être contournée.

---

## 16. Administration et modération

### Rôles

```txt
User
Moderator
Admin
Creator
```

Snowoo possède :

```txt
Creator
Admin
```

### Pouvoirs Snowoo

Snowoo peut :

- voir certains détails nécessaires à l’administration ;
- voir les e-mails ;
- bannir temporairement ;
- bannir définitivement ;
- ajouter une raison au ban ;
- ajouter des modérateurs ;
- retirer des modérateurs ;
- gérer les signalements ;
- gérer les projets featured ;
- gérer le fil d’actualité ;
- créer des concours.

### Bannissements

Structure :

```json
{
  "userId": "user_123",
  "type": "temporary",
  "reason": "Spam",
  "startsAt": "2026-07-13T00:00:00.000Z",
  "endsAt": "2026-07-20T00:00:00.000Z",
  "createdBy": "Snowoo"
}
```

Pour un ban définitif :

```json
{
  "type": "permanent",
  "endsAt": null
}
```

---

## 17. Firebase / Supabase / Resend

Pixnaria utilisera au départ des plans gratuits.

### Contraintes mentionnées

Firebase :

```txt
1 Go de téléchargement
5 Go de stockage
```

Ces limites imposent une forte optimisation.

### Stratégie stockage

Prévoir :

- compression des images ;
- avatars réduits ;
- thumbnails ;
- limite de poids par projet ;
- nettoyage des assets inutilisés ;
- export `.pixna` ;
- cache local ;
- possible usage de Supabase en complément.

### Répartition possible

Option A : Firebase principalement

```txt
Firebase Auth
Firestore
Firebase Storage
Firebase Hosting
Resend pour e-mails
```

Option B : Supabase principalement

```txt
Supabase Auth
Supabase Database
Supabase Storage
Resend pour e-mails si besoin
```

Option C : Mix

```txt
Firebase Hosting/Auth
Supabase pour certains fichiers/données
Resend pour e-mails de vérification
```

La décision finale sera prise plus tard selon limites réelles, coût, sécurité et simplicité.

---

## 18. Format `.pixna`

Les projets Pixnaria seront exportables dans un format :

```txt
.pixna
```

### Proposition technique

Un `.pixna` peut être une archive compressée contenant :

```txt
project.json
scene.json
scripts/
assets/
metadata.json
```

### Objectifs

- compact ;
- exportable ;
- importable ;
- compatible navigateur ;
- facile à inspecter ;
- cohérent avec l’esprit open source.

---

## 19. Éditeur Pixnaria — structure future

L’éditeur sera dans :

```txt
editor.html
```

### Layout desktop

```txt
┌──────────────────────────────────────────────────────────────┐
│ Top bar : logo, projet, play, save, export, profil           │
├───────────────┬────────────────────────────┬─────────────────┤
│ Nodes         │ Viewport                   │ Inspecteur      │
│ Arborescence  │ Prévisualisation 2D        │ Propriétés      │
├───────────────┴────────────────────────────┴─────────────────┤
│ Console / Assets / Script / Tutoriel                         │
└──────────────────────────────────────────────────────────────┘
```

### Mobile/tablette

Sur petits écrans, l’éditeur doit être utilisable, mais il sera forcément plus complexe.

Approche proposée :

```txt
Onglets : Nodes / Viewport / Inspector / Script / Console
```

Au lieu d’afficher tous les panneaux en même temps, on affiche un panneau à la fois.

### Gestionnaire de nodes

Première version :

- ajouter node ;
- renommer ;
- supprimer ;
- dupliquer ;
- copier/coller ;
- glisser-déposer ;
- masquer ;
- verrouiller ;
- rechercher ;
- favoris ;
- templates.

---

## 20. Préparation JavaScript

### Fichiers JS proposés

```txt
scripts/app.js
```

Logique générale du site.

```txt
scripts/navigation.js
```

Menu mobile, dropdown profil, navigation.

```txt
scripts/mock-data.js
```

Données fictives pour les projets, utilisateurs, news.

```txt
scripts/i18n.js
```

Traductions français/anglais.

```txt
scripts/auth-ui.js
```

Simulation de l’utilisateur connecté.

```txt
scripts/news-admin.js
```

Gestion simulée du fil d’actualité pour Snowoo.

```txt
scripts/editor-preview.js
```

Interactions visuelles de la future maquette d’éditeur.

---

## 21. Première version HTML à développer

Après validation de ce document, le premier développement doit être :

```txt
index.html
styles/main.css
styles/responsive.css
scripts/app.js
scripts/navigation.js
scripts/mock-data.js
scripts/i18n.js
scripts/news-admin.js
```

### Contenu de la première page

La première page doit inclure :

- navbar responsive ;
- logo Pixnaria ;
- bouton Explorer ;
- faux utilisateur connecté Snowoo ;
- hero ;
- aperçu nodes + Python ;
- projets tendance ;
- Featured Project ;
- fil d’actualité ;
- bouton de gestion des actualités visible pour Snowoo ;
- footer avec Our Team et Contact Us ;
- menu mobile.

### Important

La première version reste une maquette interactive, pas encore une vraie application backend.

Les données seront fictives/locales.

---

## 22. Accessibilité

Pixnaria doit être accessible autant que possible.

Prévoir :

- contrastes lisibles ;
- textes alternatifs pour images ;
- boutons avec labels ;
- focus clavier ;
- tailles de texte correctes ;
- pas d’animations trop agressives ;
- `prefers-reduced-motion` dans le CSS.

---

## 23. Performance

Comme le stockage et le téléchargement sont limités, il faut éviter un site trop lourd.

Prévoir :

- images compressées ;
- SVG pour logos ;
- lazy loading ;
- CSS propre ;
- pas de dépendances lourdes au début ;
- pas de framework inutile dans la première version ;
- avatars compressés.

---

## 24. Sécurité future

Points importants à prévoir :

- validation username côté client et serveur ;
- validation commentaires côté client et serveur ;
- règles Firebase/Supabase strictes ;
- e-mails jamais publics ;
- rôles admin/modérateur protégés côté serveur ;
- modération impossible à contourner côté client ;
- protection contre spam ;
- vérification e-mail ;
- bans appliqués côté backend.

---

## 25. Décisions à valider avant HTML

Avant de coder `index.html`, valider :

1. Structure de fichiers proposée ;
2. Pages principales ;
3. Navbar desktop/mobile ;
4. Section `Featured Project` ;
5. Gestion complète du fil d’actualité pour Snowoo ;
6. Maquette avec faux utilisateur connecté ;
7. Français/anglais préparés dès le début ;
8. Responsive mobile/tablette/desktop ;
9. Développement sans framework au début.

---

## 26. Prochaine étape après validation

Si ce document est validé, prochaine étape :

```txt
Création de la première maquette HTML/CSS/JS responsive de Pixnaria.
```

Fichiers à créer :

```txt
index.html
styles/main.css
styles/responsive.css
scripts/app.js
scripts/navigation.js
scripts/mock-data.js
scripts/i18n.js
scripts/news-admin.js
```

Objectif : créer une page d’accueil moderne, responsive, inspirée de Scratch dans la structure communautaire, mais avec la DA sombre/violet moderne Pixnaria.

---

## 33. Pivot architecture — GitHub obligatoire pour comptes et projets cloud

Date : 2026-07-15

Nouvelle décision : Pixnaria utilisera GitHub comme système obligatoire pour les comptes cloud et le stockage des projets publics.

Résumé :

```txt
GitHub = connexion + repos publics de projets
Firebase/Supabase = communauté, profils, avatars personnalisés, modération, likes, commentaires
Resend = plus prioritaire pour la v1
```

Détails complets dans :

```txt
PIXNARIA_GITHUB_ARCHITECTURE.md
```

Décisions :

- compte GitHub obligatoire pour utiliser Pixnaria cloud ;
- projets cloud stockés dans des repos GitHub publics ;
- photo de profil Pixnaria personnalisée, pas forcément GitHub ;
- Supabase/Firebase gardent les profils enrichis, avatars, likes, favoris, commentaires, reports, bans, modérateurs, news, featured projects, studios ;
- `.pixna` reste le format d’export/import local ;
- l’intégration GitHub sera d’abord mockée dans le prototype.
