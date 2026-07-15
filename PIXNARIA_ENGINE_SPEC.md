# Pixnaria — Engine Spec & Plan de développement

Version : 0.1  
Date : 2026-07-14  
Créateur : Snowoo  
Statut : base technique du vrai moteur Pixnaria v1

---

## 1. Objectif du moteur Pixnaria

Le moteur Pixnaria doit permettre de créer des jeux et animations 2D avec :

- un système de nodes ;
- un rendu 2D ;
- un moteur personnalisé ;
- des scripts Python à terme ;
- un format de projet `.pixna` ;
- une interface web ;
- une API simple pour les utilisateurs de 11 ans et plus.

Le moteur doit être simple à utiliser, mais suffisamment propre pour évoluer.

---

## 2. Stratégie réaliste

Pixnaria vise Python, mais l’exécution Python réelle dans le navigateur est complexe. Le moteur sera donc construit progressivement.

### Phase 1 — Moteur JavaScript réel

Objectif : créer un vrai moteur 2D qui fonctionne dans le navigateur.

Il gère :

```txt
Canvas
Scene
Nodes
Rendu
Input
Physique simple
Collisions
Caméra
Chargement de projet .pixna JSON
Play / Stop
```

Les scripts Python ne sont pas encore exécutés réellement.

### Phase 2 — API Pixnaria compatible Python

Objectif : définir une API simple qui pourra être appelée par Python plus tard.

Exemple :

```python
class Player(Node2D):
    speed = export(250)

    def update(self, delta):
        if input.is_action_pressed("right"):
            self.x += self.speed * delta
```

### Phase 3 — Exécution Python réelle

Choisir une solution :

```txt
Pyodide
Skulpt
Brython
ou autre solution adaptée
```

Cette phase viendra plus tard.

---

## 3. Objectif moteur v1

Le moteur v1 doit être un moteur 2D minimal mais réel.

Il doit gérer :

- création d’une scène ;
- root node ;
- nodes enfants ;
- rendu canvas ;
- transform position/rotation/scale ;
- sprites mock ;
- shapes ;
- textes ;
- colliders rectangles ;
- gravité ;
- collisions simples ;
- input clavier ;
- input tactile plus tard ;
- boucle `ready/update/physics/render` ;
- export/import JSON `.pixna` ;
- logs moteur.

---

## 4. Architecture générale

Structure proposée :

```txt
scripts/
  engine/
    pixnaria-core.js
    pixnaria-nodes.js
    pixnaria-input.js
    pixnaria-physics.js
    pixnaria-renderer.js
    pixnaria-runtime.js
```

### Rôle des fichiers

#### `pixnaria-core.js`

Contient :

```txt
PixnariaEngine
Scene
EventEmitter
utilitaires
```

#### `pixnaria-nodes.js`

Contient :

```txt
Node
Node2D
SpriteNode
ShapeNode
TextNode
ColliderNode
RigidBody2D
StaticBody2D
Camera2D
TimerNode
```

#### `pixnaria-input.js`

Contient :

```txt
InputManager
keyboard state
actions
```

#### `pixnaria-physics.js`

Contient :

```txt
PhysicsWorld
rectangle collision
gravity
body movement
```

#### `pixnaria-renderer.js`

Contient :

```txt
CanvasRenderer
clear
render nodes
camera transform
```

#### `pixnaria-runtime.js`

Contient :

```txt
chargement projet
création nodes depuis JSON
runtime bridge
```

---

## 5. Boucle moteur

Boucle cible :

```txt
start()
  ↓
load scene
  ↓
call ready() once
  ↓
loop:
  calculate delta
  input.update()
  scene.update(delta)
  physics.step(delta)
  renderer.render(scene)
  console/logs/errors
```

Pseudo-code :

```js
engine.start();

function frame(time) {
  const delta = computeDelta(time);
  input.update();
  scene.update(delta);
  physics.step(scene, delta);
  renderer.render(scene);
  requestAnimationFrame(frame);
}
```

---

## 6. Système de nodes

### Node

Base de tous les nodes.

Propriétés :

```txt
id
name
type
parent
children
visible
locked
metadata
```

Méthodes :

```txt
addChild(node)
removeChild(node)
findById(id)
findByName(name)
getPath()
ready()
update(delta)
```

### Node2D

Ajoute :

```txt
x
y
rotation
scaleX
scaleY
zIndex
```

### SpriteNode

Affiche une image ou un rectangle mock si l’image n’est pas chargée.

Propriétés :

```txt
image
width
height
tint
```

### ShapeNode

Affiche :

```txt
rectangle
circle
line plus tard
```

### TextNode

Affiche du texte.

### ColliderNode

Définit une collision rectangle.

Propriétés :

```txt
width
height
offsetX
offsetY
isTrigger
```

### RigidBody2D

Node physique soumis à la gravité.

Propriétés :

```txt
velocityX
velocityY
gravityScale
mass
onGround
```

### StaticBody2D

Node physique immobile.

Exemple : sol, plateforme.

### Camera2D

Caméra active.

Propriétés :

```txt
x
y
zoom
active
```

---

## 7. Input

Le moteur doit gérer des actions.

Exemple :

```txt
move_left  → ArrowLeft / A
move_right → ArrowRight / D
jump       → Space / W / ArrowUp
move_down  → ArrowDown / S
```

API cible :

```js
input.isDown("move_right")
input.justPressed("jump")
```

API Python future :

```python
input.is_action_pressed("move_right")
input.is_action_just_pressed("jump")
```

---

## 8. Physique v1

La physique v1 reste simple.

Elle gère :

- rectangles AABB ;
- gravité ;
- collisions verticales ;
- sol/platformes ;
- `onGround` ;
- triggers plus tard.

Non prévu en v1 :

```txt
rotations physiques
pentes
cercles physiques avancés
joints
forces complexes
moteur physique complet
```

---

## 9. Rendu v1

Le rendu se fait avec :

```txt
HTML Canvas 2D
```

Le renderer gère :

- clear background ;
- grille optionnelle ;
- rendu nodes par zIndex ;
- rectangles mock ;
- shapes ;
- texte ;
- caméra ;
- debug colliders.

---

## 10. Format `.pixna` v1

Le moteur v1 charge un JSON avec structure :

```json
{
  "pixnariaFormat": "pixna-json-prototype",
  "formatVersion": 1,
  "metadata": {
    "name": "Neon Platformer",
    "author": "Snowoo"
  },
  "settings": {
    "dimensions": { "width": 1280, "height": 720 },
    "background": "#090712",
    "physics": {
      "gravity": 1350,
      "jumpForce": 560
    }
  },
  "scene": {
    "rootNodeId": "scene",
    "nodes": []
  },
  "scripts": {},
  "assets": []
}
```

Plus tard, `.pixna` deviendra probablement une archive compressée.

---

## 11. API future pour Python

Le moteur doit être pensé pour une API Python simple.

### Position

```python
self.x
self.y
self.position.x
self.position.y
```

On pourra supporter les deux pour débutants et avancés.

### Nodes

```python
self.get_node("Player")
self.get_child("Sprite")
self.add_child(node)
self.remove_child(node)
```

### Input

```python
input.is_action_pressed("move_right")
input.is_action_just_pressed("jump")
```

### Messages / signaux

```python
self.emit("hit", damage=10)
self.on("hit", self.take_damage)
```

### Variables exportées

```python
speed = export(250)
health = export(100)
```

Ces variables apparaîtront dans l’inspecteur.

---

## 12. Sécurité Python future

Modules autorisés possibles :

```txt
math
random
time limité
```

Modules interdits :

```txt
os
sys accès dangereux
subprocess
socket
requests
pygame
pytorch
tensorflow
filesystem libre
```

Le code utilisateur doit être sandboxé.

---

## 13. Ce qui doit être fait maintenant

### Étape moteur 0.1

Créer un premier moteur Canvas réel avec :

- `PixnariaEngine` ;
- `Scene` ;
- `Node` ;
- `Node2D` ;
- `ShapeNode` ;
- `SpriteNode` mock ;
- `ColliderNode` ;
- `RigidBody2D` ;
- `StaticBody2D` ;
- `Camera2D` ;
- `InputManager` ;
- `PhysicsWorld` ;
- `CanvasRenderer` ;
- loader `.pixna` JSON ;
- démo `engine-demo.html`.

### Étape moteur 0.2

Connecter le moteur réel à `editor.html`.

### Étape moteur 0.3

Faire que les nodes de l’éditeur créent vraiment des objets moteur.

### Étape moteur 0.4

Faire que la page projet publique utilise le vrai moteur.

### Étape moteur 0.5

Améliorer le format `.pixna`.

---

## 14. Critères de validation moteur 0.1

Le moteur 0.1 est validé si :

- une scène se charge ;
- un player s’affiche ;
- le player bouge avec clavier ;
- le player saute ;
- le player collisionne avec une plateforme ;
- le renderer Canvas fonctionne ;
- les nodes sont hiérarchisés ;
- la boucle engine tourne ;
- un projet JSON `.pixna` est chargé ;
- les logs moteur s’affichent.

---

## 15. Décision actuelle

On commence maintenant par :

```txt
Pixnaria Engine 0.1 — JavaScript Canvas Runtime
```

Objectif immédiat : créer un vrai moteur minimal sans encore exécuter Python.

---

## 16. Mise à jour — Engine 0.2 commencé

Date : 2026-07-14

Le moteur Canvas réel est maintenant connecté à `editor.html`.

### Ajouts réalisés

- bouton `Canvas Engine` dans la topbar de l’éditeur ;
- canvas moteur réel dans le viewport ;
- bridge `scripts/editor-engine-bridge.js` ;
- style `styles/editor-engine-bridge.css` ;
- conversion des nodes éditeur vers nodes moteur ;
- conversion `Player` / `Enemy` vers `RigidBody2D` ;
- conversion `Platform` vers `StaticBody2D` ;
- ajout automatique d’une caméra si absente ;
- ajout automatique d’une plateforme et d’un sol moteur si nécessaires ;
- lancement du runtime Canvas depuis la scène actuelle de l’éditeur ;
- retour possible au viewport mock en arrêtant le Canvas Engine.

### Fonctionnement actuel

Dans `editor.html`, le bouton :

```txt
Canvas Engine
```

charge la scène de l’éditeur dans le vrai moteur Canvas.

Le moteur utilise :

```txt
PixnariaEngine
Scene
CanvasRenderer
InputManager
PhysicsWorld
nodes convertis depuis l’éditeur
```

### Limites actuelles

- le moteur Canvas ne remplace pas encore totalement le viewport mock ;
- les scripts Python ne sont toujours pas exécutés ;
- tous les types de nodes ne sont pas encore rendus de façon spécialisée ;
- les assets images réels ne sont pas encore chargés ;
- l’éditeur et le moteur partagent encore deux systèmes d’état séparés.

### Prochaine étape moteur 0.3

Objectif : rapprocher l’état de l’éditeur et l’état moteur.

À faire :

- synchroniser les positions modifiées par le moteur vers l’inspecteur ;
- rendre plus de node types dans Canvas ;
- permettre au bouton Play principal d’utiliser le vrai moteur ;
- faire que l’export `.pixna` soit directement compatible moteur sans conversion spéciale ;
- remplacer progressivement le mock DOM par le Canvas runtime.

---

## 17. Mise à jour — Engine 0.3 commencé

Date : 2026-07-14

L'étape Engine 0.3 a commencé : synchronisation éditeur ↔ moteur.

### Ajouts réalisés

- le bouton principal `Play` de l'éditeur lance maintenant le vrai Canvas Engine si le bridge est disponible ;
- le bouton `Canvas Engine` reste disponible comme contrôle direct du runtime Canvas ;
- l'état du bouton `Play` est synchronisé avec le Canvas Engine ;
- les positions des nodes modifiées par le moteur sont renvoyées vers l'état de l'éditeur ;
- l'inspecteur se met à jour pendant que le Canvas Engine tourne, notamment pour `x`, `y`, `velocityX`, `velocityY`, `onGround` ;
- à l'arrêt du Canvas Engine, une synchronisation finale est appliquée ;
- les contrôles clavier du vieux moteur mock sont désactivés quand le Canvas Engine est actif ;
- le viewport mock DOM est masqué pendant que le Canvas Runtime est actif.

### Résultat actuel

Dans `editor.html` :

```txt
Play          → utilise maintenant le vrai Canvas Engine
Canvas Engine → démarre/arrête aussi le vrai Canvas Engine
Stop          → synchronise les dernières positions vers l'éditeur
```

### Limites restantes

- le moteur ne synchronise pas encore tous les types de propriétés ;
- les scripts ne sont pas exécutés ;
- les assets images ne sont pas encore chargés réellement ;
- certains nodes UI sont rendus comme des shapes simples ;
- l'export `.pixna` garde encore des types éditeur comme `Player`, que le bridge convertit au runtime.

### Prochaine étape Engine 0.4

Objectif : rendre l'export `.pixna` directement engine-ready et enrichir le rendu Canvas.

À faire :

- ajouter un champ `runtimeType` ou une normalisation officielle dans le format `.pixna` ;
- rendre plus proprement `Button`, `Panel`, `Label`, `Tilemap`, `Particle2D` ;
- charger de vrais assets image mockés depuis `assets/` ;
- ajouter un mode debug colliders activable/désactivable ;
- faire de la page publique projet `project.html` un vrai lecteur Canvas Engine.
