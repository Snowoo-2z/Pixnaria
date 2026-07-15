# Pixnaria — Cahier de conception

Version : 0.1  
Date : 2026-07-13  
Créateur : Snowoo  
Statut : document de base à valider avant logo, architecture technique et développement HTML

---

## 1. Vision générale

**Pixnaria** est une plate-forme internationale de coding et de création destinée aux utilisateurs de **11 ans et plus**.

L’objectif est de permettre à des utilisateurs jeunes, créatifs ou débutants de créer des jeux et animations en utilisant **Python**, sans passer par un système de blocs.

Pixnaria s’inspire de :

- **Scratch** pour l’esprit communautaire, la page d’accueil, les profils, les projets partagés et l’accessibilité ;
- **Godot** pour l’organisation en scènes, nodes, inspecteur et scripts ;
- **VS Code / éditeurs modernes** pour l’aspect propre, sérieux et agréable ;
- une direction visuelle **startup moderne**, sombre, violette et néon.

Pixnaria n’est pas un clone de Scratch et n’est pas un clone de Godot.  
C’est une plate-forme hybride : simple à comprendre, mais assez libre et puissante pour créer de vrais projets.

---

## 2. Identité

### Nom

**Pixnaria** se prononce :

```txt
Pix-na-ria
```

Le nom vient de l’imagination du créateur. Il ne doit pas obligatoirement être justifié par une origine précise.

### Positionnement

Pixnaria doit être :

- fun ;
- sérieux, mais pas trop ;
- moderne ;
- créatif ;
- international ;
- open source ;
- communautaire ;
- adapté aux débutants sans être enfantin.

### Slogan actuel

Slogan proposé par le créateur :

```txt
Imagine. Create. Share.
```

Version française possible :

```txt
Imagine. Crée. Partage.
```

Pixnaria étant international dès le départ, le slogan principal peut rester en anglais.

---

## 3. Public cible

Public principal :

- utilisateurs de 11 ans et plus ;
- débutants en Python ;
- jeunes créateurs ;
- personnes qui veulent créer des jeux ou animations sans installer un moteur complexe ;
- communauté internationale.

Pixnaria doit éviter une ambiance trop enfantine. L’expérience doit rester accessible, mais donner envie de progresser vers un vrai environnement de création.

---

## 4. Langues

Pixnaria doit être international dès le début.

Langues prévues au lancement :

- français ;
- anglais.

Le site et l’éditeur devront donc être pensés avec un système de traduction dès l’architecture.

---

## 5. Modèle du projet

Pixnaria est prévu comme un projet :

- **open source** ;
- communautaire ;
- accessible depuis navigateur ;
- avec compte obligatoire ;
- avec sauvegarde cloud ;
- avec possibilité d’exporter ses projets.

La version desktop n’est **pas prévue pour le moment**. Elle pourra être repensée plus tard.

---

## 6. Direction artistique générale

### Style

Direction artistique souhaitée :

- noir moderne ;
- violet foncé ;
- néon discret ;
- startup moderne ;
- pas trop enfantin ;
- interface sombre par défaut ;
- interface claire disponible plus tard.

### Palette proposée

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

### Ambiance visuelle

L’interface doit donner une impression :

- de créativité ;
- de technologie ;
- de puissance ;
- de simplicité ;
- de communauté.

Effets possibles :

- glow violet léger ;
- cartes sombres ;
- coins arrondis ;
- transitions fluides ;
- icônes fines ;
- effets hover modernes ;
- arrière-plans avec gradients violets très sombres.

---

## 7. Logo

Le logo sera traité dans une étape séparée après validation de ce cahier.

Direction actuelle validée :

```txt
Abstrait néon
Violet foncé / noir
Moderne
Startup / tech / créatif
```

Le logo ne doit pas être trop enfantin. Il peut évoquer :

- le pixel ;
- les nodes ;
- la créativité ;
- le code ;
- une énergie néon ;
- une forme abstraite reconnaissable.

---

## 8. Structure générale du site

Le site Pixnaria doit avoir une logique proche d’une plate-forme communautaire moderne.

### Navigation principale

Dans l’interface principale du site, l’idée actuelle est :

```txt
En haut à gauche : logo Pixnaria
À droite du logo : Explorer / Tendances
Encore à droite : projets, messages, profil utilisateur
Tout à droite : nom d’utilisateur + photo de profil
```

### Pages principales prévues

```txt
Accueil
Explorer / Tendances
Éditeur
Mes projets
Messages
Profil utilisateur
Projet public
Tutoriels
Paramètres
Connexion / Inscription
Administration Snowoo
Signalements
```

---

## 9. Page d’accueil

La page d’accueil doit s’inspirer de l’esprit Scratch, mais avec une DA plus moderne.

### Objectifs

La page d’accueil doit :

- présenter Pixnaria rapidement ;
- montrer des projets ;
- donner envie de créer ;
- mettre en avant la communauté ;
- afficher des tendances ;
- afficher éventuellement un fil d’informations ;
- afficher plus tard des concours créés par Snowoo ;
- afficher plus tard des vidéos YouTube de présentation.

### Contenu possible

Sections possibles :

```txt
Hero Pixnaria
Projets tendance
Projets mis en avant par Snowoo
Fil d’info
Studios ou groupes créatifs
Tutoriel de démarrage pour nouveaux utilisateurs
Exemples de code Python simples
Aperçu de l’organisation par nodes
Footer
```

### Slogan

```txt
Imagine. Create. Share.
```

---

## 10. Communauté

Pixnaria doit inclure une communauté.

### Fonctionnalités prévues

- profils publics ;
- photo de profil ;
- projets visibles sur le profil ;
- partage de projet par lien ;
- projets publics et privés ;
- likes ;
- favoris ;
- commentaires ;
- page Explorer / Tendances ;
- projets mis en avant ;
- studios créables ;
- signalements ;
- modération automatique ;
- compte administrateur Snowoo.

### Comptes utilisateurs

La création de compte est obligatoire.

Un utilisateur ne peut pas utiliser Pixnaria sans compte.

### Noms d’utilisateur

Les noms d’utilisateur doivent être limités à :

```txt
lettres
chiffres
tiret bas _
tiret haut -
```

Les caractères spéciaux, polices décoratives et symboles doivent être refusés.

Regex possible :

```regex
^[A-Za-z0-9_-]+$
```

À adapter si on veut autoriser les lettres accentuées plus tard.

### Commentaires

Pour le moment, les commentaires doivent être très limités.

Règle actuelle :

```txt
Commentaires avec lettres uniquement pour le moment.
```

Cela permet de simplifier la modération au début.

À préciser plus tard : faut-il autoriser espaces, accents, ponctuation simple et emojis ?

---

## 11. Rôles spéciaux

### Snowoo

Snowoo est le créateur et administrateur principal.

Snowoo doit avoir :

- un badge admin ;
- un badge créateur ;
- accès aux signalements ;
- accès aux messages de signalement ;
- pouvoir bannir définitivement ;
- pouvoir mettre des projets en avant ;
- pouvoir créer des concours ;
- pouvoir publier des informations dans le fil d’actualité.

### Badges

Badges prévus :

```txt
Admin
Créateur
```

Autres badges possibles plus tard :

```txt
Modérateur
Projet mis en avant
Participant concours
Gagnant concours
Contributeur open source
```

---

## 12. Modération

Pixnaria doit avoir une modération automatique de base.

### Système prévu

- filtre de gros mots ;
- vérification des commentaires ;
- signalement manuel ;
- envoi des signalements à Snowoo ;
- onglet spécial dans les messages de Snowoo pour les signalements ;
- bannissement définitif possible par Snowoo.

La modération peut être faite côté JavaScript pour une première couche rapide, mais elle devra aussi être faite côté serveur ou Firebase Cloud Functions plus tard, car une modération uniquement côté client peut être contournée.

---

## 13. Comptes, sauvegarde et Firebase

Pixnaria utilisera Firebase gratuit au début.

Fonctionnalités Firebase possibles :

```txt
Authentication
Firestore
Firebase Storage
Hosting
Cloud Functions si nécessaire plus tard
```

### Sauvegarde des projets

Les projets sont sauvegardés en ligne.

L’utilisateur peut aussi télécharger/exporter son projet.

### Images et photos de profil

Pour limiter le stockage :

- réduire la taille des photos de profil ;
- compresser les images ;
- limiter le poids maximal ;
- mettre en cache local certaines ressources ;
- générer éventuellement des thumbnails.

---

## 14. Format de projet

Le format souhaité est :

```txt
.pixna
```

Objectif : prendre le moins de place possible.

### Proposition technique

Un fichier `.pixna` pourrait être une archive compressée contenant :

```txt
project.json
scenes/
scripts/
assets/
metadata.json
```

Exemple :

```txt
my_game.pixna
 ├── project.json
 ├── scene.json
 ├── scripts/
 │    ├── Player.py
 │    └── Enemy.py
 ├── assets/
 │    ├── player.png
 │    └── jump.wav
 └── metadata.json
```

En interne, cela pourrait être un ZIP compressé renommé en `.pixna`.

Avantages :

- simple ;
- compact ;
- exportable ;
- importable ;
- facile à lire en open source ;
- compatible avec le web.

---

## 15. Éditeur Pixnaria

L’éditeur s’ouvre directement dans le navigateur.

Il prend la taille du navigateur, avec une option pour passer en plein écran.

### Thèmes

- thème sombre obligatoire par défaut ;
- thème clair prévu plus tard.

### Interface générale

Structure proposée :

```txt
┌──────────────────────────────────────────────────────────────┐
│ Top Bar : logo, projet, play, sauvegarde, export, profil     │
├───────────────┬────────────────────────────┬─────────────────┤
│ Nodes         │ Viewport                   │ Inspecteur      │
│ Arborescence  │ Prévisualisation 2D        │ Propriétés      │
├───────────────┴────────────────────────────┴─────────────────┤
│ Onglets : Console / Assets / Scripts / Tutoriel première fois│
└──────────────────────────────────────────────────────────────┘
```

### Explication : que sont les panneaux ?

Dans un éditeur, les **panneaux** sont les grandes zones de l’interface.

Exemples :

- panneau des nodes à gauche ;
- panneau de prévisualisation au centre ;
- panneau inspecteur à droite ;
- panneau console en bas ;
- panneau assets ;
- panneau scripts.

Quand on dit que les panneaux sont redimensionnables, cela signifie que l’utilisateur peut tirer une bordure pour agrandir ou réduire une zone.

Exemple : agrandir la zone de code ou réduire l’inspecteur.

Décision actuelle :

- panneaux probablement redimensionnables ;
- personnalisation du workspace souhaitée ;
- pas de mode débutant / avancé ;
- tutoriel seulement à la première ouverture ;
- aide contextuelle disponible par défaut sur les nodes.

---

## 16. Gestionnaire de Node

Le gestionnaire de Node est un élément central de Pixnaria.

Il permet d’organiser la scène, de créer des éléments et de structurer le projet.

### Décisions actuelles

- un projet ne contient pas plusieurs scènes pour le moment ;
- une scène contient un node racine ;
- le node racine est probablement de type `Node2D` ;
- le nom affiché de la scène est `Scene`, mais l’utilisateur peut le changer ;
- les nodes peuvent être déplacés par glisser-déposer ;
- duplication possible ;
- copier/coller possible ;
- groupement possible ;
- masquage possible ;
- verrouillage possible ;
- recherche par nom ;
- icônes par type de node ;
- couleurs différentes par catégorie ;
- favoris ;
- petite bibliothèque de nodes prédéfinis ;
- templates comme Player, Enemy, Camera 2D.

### Exemple d’arborescence

```txt
Scene
├── World
│   ├── Ground
│   └── Platform_01
├── Player
│   ├── Sprite
│   ├── Collider
│   └── PlayerController.py
├── Enemy
│   ├── Sprite
│   ├── Collider
│   └── EnemyAI.py
└── Camera2D
```

### Actions minimales

Première version du gestionnaire :

```txt
Ajouter un node
Renommer un node
Supprimer un node
Dupliquer un node
Copier/coller un node
Déplacer un node
Grouper des nodes
Masquer/afficher un node
Verrouiller/déverrouiller un node
Chercher un node
Ajouter aux favoris
Créer depuis template
```

---

## 17. Types de nodes

### Base

```txt
Node
Node2D
Group
```

### Visuels

```txt
Sprite
Text
Shape
AnimatedSprite
Tilemap
```

### Physique

```txt
Collider
RigidBody2D
StaticBody2D
Area2D
```

### Moteur

```txt
Camera2D
AudioPlayer
Timer
Particle2D
```

### UI

```txt
Button
Panel
Label
Input
Menu
```

### Script

```txt
PythonScript
Behavior
```

### Templates

```txt
Player
Enemy
Camera 2D
Platform
Menu Button
```

---

## 18. Inspecteur de propriétés

Quand un node est sélectionné, l’inspecteur doit afficher :

- ses propriétés ;
- ses caractéristiques ;
- son image ou aperçu si applicable ;
- position ;
- rotation ;
- scale ;
- visibilité ;
- type du node ;
- composants ;
- variables exposées depuis Python ;
- champs adaptés : sliders, cases à cocher, couleurs, menus déroulants.

### Script

Le script Python attaché ne doit pas apparaître directement dans l’inspecteur.

Il doit être accessible via un onglet séparé, comme dans Godot.

Exemple d’onglets possibles :

```txt
Viewport
Script
Assets
Console
```

### Variables Python exposées

Pixnaria doit permettre d’exposer certaines variables Python dans l’inspecteur.

Exemple :

```python
speed = export(250)
health = export(100)
can_jump = export(True)
```

L’inspecteur pourrait alors afficher automatiquement :

```txt
speed: 250
health: 100
can_jump: true
```

---

## 19. Python dans Pixnaria

Pixnaria utilise Python, mais pas un Python totalement libre.

### Décisions actuelles

- pas de blocs ;
- Python uniquement ;
- Python sécurisé ;
- certaines extensions ou bibliothèques sont bloquées ;
- pas de Pygame ;
- pas de PyTorch ;
- imports limités ;
- modules utiles autorisés ;
- `math`, `random`, `time` autorisés ;
- plusieurs fichiers Python possibles ;
- chaque node peut avoir son propre script ;
- un script ne contrôle pas directement plusieurs nodes, mais peut communiquer avec d’autres nodes par messages, événements ou accès contrôlé aux informations ;
- console Python interactive ;
- autocomplétion ;
- messages d’erreur simplifiés ;
- explication des erreurs en langage simple, désactivable dans les paramètres ;
- pas de bouton “réparer avec aide” pour le moment ;
- pas de mode pas-à-pas pour le moment.

### Exemple d’API souhaitée

```python
class Player(Node2D):
    speed = export(250)

    def ready(self):
        print("Player ready")

    def update(self, delta):
        if input.is_key_down("right"):
            self.x += self.speed * delta

        if input.is_key_down("left"):
            self.x -= self.speed * delta
```

### Communication entre nodes

Comme un script ne doit pas contrôler directement tout le projet, Pixnaria peut utiliser :

- signaux ;
- messages ;
- événements ;
- accès limité à certains nodes ;
- fonctions publiques contrôlées.

Exemple :

```python
self.emit("player_hit", damage=10)
```

Ou :

```python
enemy = self.get_node("../Enemy")
enemy.send("take_damage", 10)
```

À préciser dans l’architecture technique.

---

## 20. Moteur personnalisé

Pixnaria utilise un moteur personnalisé.

### Objectif initial

Le moteur est uniquement **2D** pour le moment.

La 3D n’est pas prévue actuellement.

### Types de projets visés

- jeux 2D ;
- animations ;
- petits projets interactifs.

### Fonctionnalités moteur prévues

```txt
Rendu 2D
Boucle de jeu
Gestion des nodes
Scripts Python
Input clavier
Input souris
Input tactile/mobile
Collisions simples
Physique via nodes
Tilemap
Animations de sprites
Import d’images
Import de sons
Audio
Caméra 2D
Export .pixna
```

### Non prévu au début

```txt
3D
Manette
Export .exe
Version desktop
Système de versions avancé
Mode professeur
Espace classe
```

---

## 21. Sauvegarde et export

### Sauvegarde

La sauvegarde automatique continue n’est pas prévue pour le moment.

Décision actuelle :

```txt
Sauvegarde lorsque l’utilisateur souhaite quitter le projet.
```

À prévoir quand même :

- avertissement si modifications non sauvegardées ;
- bouton sauvegarder ;
- sauvegarde manuelle ;
- cache local de secours possible.

### Annuler / rétablir

L’éditeur doit avoir :

- annuler ;
- rétablir ;
- raccourcis clavier.

Exemples :

```txt
Ctrl + Z : annuler
Ctrl + Y ou Ctrl + Shift + Z : rétablir
```

### Non prévu

- historique de versions ;
- checkpoints ;
- corbeille de nodes supprimés.

---

## 22. Tutoriels et apprentissage

Il n’y aura pas de système de progression, badges éducatifs ou espace professeur au début.

Décision actuelle :

- tutoriel à la première ouverture ;
- onglet tutoriel ;
- exemples de base possibles.

Tutoriels possibles :

```txt
Créer ton premier personnage
Faire bouger un sprite avec Python
Créer un ennemi
Créer un menu
Créer une animation simple
Utiliser un collider
Créer une tilemap
```

---

## 23. Explorer / Tendances

La page Explorer, aussi appelée Tendances, est centrale.

Elle doit afficher :

- projets populaires ;
- projets récents ;
- projets mis en avant par Snowoo ;
- studios ;
- éventuellement concours ;
- fil d’actualité.

L’algorithme de tendance sera défini plus tard.

Facteurs possibles :

```txt
nombre de vues
likes
favoris
activité récente
commentaires
mise en avant manuelle
âge du projet
signalements négatifs
```

À définir dans un document spécifique plus tard.

---

## 24. Projets open source et remix

Pixnaria est open source dans l’esprit.

Les projets peuvent être regardés de l’intérieur.

Décision actuelle :

- pas de remix complet façon Scratch pour le moment ;
- possibilité d’exporter des nodes ;
- les projets restent consultables de l’intérieur ;
- partage par lien ;
- visibilité sur le profil.

Il faudra préciser plus tard :

- est-ce qu’un projet privé peut être inspecté ?
- est-ce qu’un projet public est toujours lisible ?
- quelle licence appliquer aux projets publiés ?

---

## 25. Studios

Pixnaria pourra inclure des studios créables.

Un studio pourrait être :

- un groupe de projets ;
- une mini-communauté ;
- un espace de collaboration ou de collection ;
- une page autour d’un thème.

Fonctionnalités à définir plus tard :

```txt
Créer un studio
Ajouter des projets
Suivre un studio
Commentaires de studio
Rôles dans un studio
Modération
```

---

## 26. Concours

Les concours ne sont pas ouverts à tous au départ.

Décision actuelle :

```txt
Snowoo peut créer des concours.
```

Les concours peuvent apparaître :

- sur la page d’accueil ;
- dans le fil d’information ;
- dans Explorer ;
- éventuellement dans une page dédiée.

---

## 27. Questions ouvertes

### Identité communauté

Le terme **Pixno** a été proposé pour désigner les nouveaux utilisateurs, mais il semble peut-être trop enfantin.

Alternatives possibles :

```txt
Pixers
Pixnarians
Creators
Makers
Narians
Pixnauts
```

À décider plus tard.

### Page d’accueil

À préciser :

- style exact de la page d’accueil ;
- nombre de sections ;
- types de projets mis en avant ;
- présence ou non d’un aperçu code Python dès le hero.

### Commentaires

À préciser :

- lettres uniquement strictes ?
- autoriser les espaces ?
- autoriser les accents ?
- autoriser la ponctuation simple ?
- limite de caractères ?

### Firebase

À préciser :

- structure Firestore ;
- règles de sécurité ;
- limites de stockage ;
- compression images ;
- modération côté serveur.

### Python sécurisé

À préciser :

- liste des modules autorisés ;
- liste des modules bloqués ;
- sandbox Python côté web ;
- exécution locale ou serveur ;
- limites CPU/mémoire ;
- sécurité contre code malveillant.

---

## 28. Roadmap proposée

### Étape 1 — Cahier de conception

Statut : en cours.

Créer et valider ce document.

### Étape 2 — Logo

Créer un premier logo abstrait néon violet/noir.

Livrable prévu :

```txt
pixnaria_logo_concept.png
```

### Étape 3 — Architecture technique

Créer un document détaillé :

```txt
PIXNARIA_ARCHITECTURE_TECHNIQUE.md
```

Il devra couvrir :

- structure du front-end ;
- Firebase ;
- structure des données ;
- format `.pixna` ;
- système de nodes ;
- moteur 2D ;
- sandbox Python ;
- profils et communauté ;
- modération ;
- sécurité.

### Étape 4 — Maquette HTML

Créer une première maquette statique.

Fichiers possibles :

```txt
index.html
style.css
app.js
```

Ou structure plus propre :

```txt
src/
  index.html
  styles/
  scripts/
  assets/
```

### Étape 5 — Prototype interactif

Créer les premières interactions :

- navigation ;
- faux login visuel ;
- page Explorer ;
- layout de l’éditeur ;
- ajout/suppression visuelle de nodes ;
- inspecteur simulé.

### Étape 6 — Base technique réelle

Après validation du prototype :

- auth Firebase ;
- stockage projets ;
- profils ;
- système de nodes réel ;
- format `.pixna` ;
- moteur 2D minimal.

---

## 29. Résumé des décisions validées

```txt
Nom : Pixnaria
Prononciation : Pix-na-ria
Slogan : Imagine. Create. Share.
Public : 11+
Langues : français + anglais
Style : startup moderne
Ton : fun et sérieux, mais pas trop sérieux
Plate-forme : web d’abord
Desktop : pas prévu pour le moment
Compte : obligatoire
Sauvegarde : Firebase + export local possible
Open source : oui
Éditeur : navigateur, sombre, option plein écran
Coding : Python uniquement, pas de blocs
Python : sécurisé, imports limités
Moteur : personnalisé, 2D seulement au début
Projets : jeux et animations
Format export : .pixna
Communauté : oui
Profils : oui
Explorer / tendances : oui
Likes / favoris / commentaires : oui
Modération : automatique + Snowoo admin
Remix : non pour le moment
Export de nodes : oui
Studios : oui
Concours : créés par Snowoo
Tutoriels : au début + onglet tutoriel
```

---

## 30. Prochaine validation

Avant de passer au logo, il faut valider ce cahier de conception.

Si le document est correct, prochaine étape :

```txt
Étape 2 — création du logo Pixnaria
```

Direction logo :

```txt
Abstrait néon
Violet foncé / noir
Moderne
Non enfantin
Startup tech créative
```

---

## 31. Mise à jour après validation du cahier

Date : 2026-07-13

Ces éléments complètent le cahier de conception validé.

### 31.1 Navigation de la page d’accueil

La barre du haut de la page d’accueil doit suivre cette logique :

```txt
Tout à gauche : logo Pixnaria
À droite du logo : bouton Explorer
Tout à droite : nom d’utilisateur + photo de profil
```

L’utilisateur peut cliquer sur son nom d’utilisateur ou sa photo de profil pour ouvrir son profil.

### 31.2 Confidentialité des adresses e-mail

Les adresses e-mail des utilisateurs doivent rester cachées publiquement.

Règle :

```txt
Les autres utilisateurs ne voient jamais l’adresse e-mail d’un compte.
Seul Snowoo peut la voir depuis les outils d’administration.
```

Dans l’interface publique, il faut seulement préciser que les informations personnelles sont gardées secrètes et protégées.

### 31.3 Administration Snowoo

Snowoo doit pouvoir :

- voir certaines informations sensibles nécessaires à l’administration, comme les adresses e-mail ;
- bannir définitivement un utilisateur ;
- bannir temporairement un utilisateur ;
- ajouter une raison au bannissement ;
- ajouter des modérateurs ;
- retirer des modérateurs ;
- consulter les signalements ;
- recevoir les signalements dans un onglet dédié des messages ;
- mettre en avant des projets ;
- créer des concours ;
- gérer le fil d’actualité.

### 31.4 Bannissements

Deux types de bannissements sont prévus :

```txt
Ban temporaire
Ban définitif
```

Chaque bannissement doit contenir :

```txt
Utilisateur concerné
Type de ban
Raison
Date de début
Date de fin si ban temporaire
Administrateur/modérateur responsable
```

### 31.5 Modérateurs

Snowoo peut nommer ou retirer des modérateurs.

Les modérateurs peuvent apparaître dans une page publique appelée :

```txt
Our Team
```

### 31.6 Page Our Team

La page **Our Team** doit être accessible depuis le bas du site, dans le footer.

Elle doit afficher :

- Snowoo tout en haut ;
- son badge créateur/admin ;
- les modérateurs en dessous ;
- leur badge modérateur ;
- leur date d’inscription / join date.

Exemple :

```txt
Snowoo
Badge : Creator / Admin
Joined : date

Moderators
- username
  Badge : Moderator
  Joined : date
```

### 31.7 Page Contact Us

Une page **Contact Us** est prévue.

Au début, elle pourra simplement rediriger vers le profil de Snowoo.

Plus tard, elle pourra devenir une vraie page avec :

- formulaire de contact ;
- choix du sujet ;
- aide ;
- signalement ;
- support communauté ;
- contact administratif.

### 31.8 Firebase, Supabase et Resend

Pixnaria commencera avec des plans gratuits.

Contraintes Firebase actuelles mentionnées :

```txt
1 Go de téléchargement
5 Go de stockage
```

Ces limites sont faibles pour une plate-forme avec images, profils, projets et assets. Il faudra donc optimiser fortement le stockage.

Pistes prévues :

- compression des images ;
- réduction des photos de profil ;
- thumbnails ;
- limites de poids par projet ;
- nettoyage des fichiers inutilisés ;
- export local `.pixna` ;
- utilisation possible de Supabase en complément ;
- cache local côté navigateur.

Supabase pourra être étudié en complément du plan gratuit, notamment pour certaines données ou fichiers selon les limites exactes.

Pour la vérification d’e-mail, Pixnaria pourra utiliser **Resend** avec un plan gratuit. Le système prévu :

```txt
L’utilisateur entre son e-mail.
Pixnaria envoie un code de vérification.
L’utilisateur saisit le code.
Le compte est validé.
```

À vérifier plus tard : limite exacte quotidienne du plan gratuit Resend, supposée autour de 100 e-mails par jour.

---

## 32. Validation

Le cahier de conception est validé par Snowoo avec les ajouts ci-dessus.

Prochaine étape :

```txt
Étape 2 — Logo Pixnaria
```

---

## 33. Décision produit — GitHub comme base des comptes et projets

Date : 2026-07-15

Pixnaria évolue vers une architecture où GitHub est obligatoire pour les comptes cloud et les projets publiés.

Décision :

```txt
Les utilisateurs se connectent avec GitHub.
Les projets cloud sont stockés dans des repos GitHub publics.
Les projets restent open source et inspectables.
Les photos de profil restent personnalisées dans Pixnaria.
Firebase/Supabase gardent toute la partie communautaire.
```

Cette décision renforce l’identité open source de Pixnaria et simplifie le stockage des projets.

Document détaillé :

```txt
PIXNARIA_GITHUB_ARCHITECTURE.md
```
