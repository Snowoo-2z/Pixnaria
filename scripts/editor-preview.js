const PixnariaEditorPreview = (() => {
  const templateCategories = [
    { id: "all", label: "All" },
    { id: "base", label: "Base" },
    { id: "visual", label: "Visual" },
    { id: "physics", label: "Physics" },
    { id: "engine", label: "Engine" },
    { id: "ui", label: "UI" },
    { id: "script", label: "Script" },
    { id: "templates", label: "Templates" }
  ];

  let activeTemplateCategory = "all";
  let templateSearch = "";

  const templates = {
    Node: {
      type: "Node", category: "base", icon: "◆", defaultName: "Node",
      description: "Generic organizational node.",
      props: { enabled: true }
    },
    Node2D: {
      type: "Node2D", category: "base", icon: "⬖", defaultName: "Node2D",
      description: "Basic 2D node with transform properties.",
      props: { x: 0, y: 0, rotation: 0, scale: 1, visible: true }
    },
    Group: {
      type: "Group", category: "base", icon: "▦", defaultName: "Group",
      description: "Folder-like node to organize children.",
      props: { visible: true, locked: false }
    },

    Sprite: {
      type: "Sprite", category: "visual", icon: "▣", defaultName: "Sprite",
      description: "Displays an image in the 2D viewport.",
      props: { x: 0, y: 0, rotation: 0, scale: 1, visible: true, image: "none" }
    },
    Text: {
      type: "Text", category: "visual", icon: "T", defaultName: "Text",
      description: "Displays text in the scene.",
      props: { x: 0, y: 0, text: "Hello Pixnaria", fontSize: 32, color: "#f5f3ff", visible: true }
    },
    Shape: {
      type: "Shape", category: "visual", icon: "●", defaultName: "Shape",
      description: "Simple rectangle/circle visual shape.",
      props: { x: 0, y: 0, shape: "Rectangle", width: 80, height: 40, color: "#7c3aed", visible: true }
    },
    AnimatedSprite: {
      type: "AnimatedSprite", category: "visual", icon: "▤", defaultName: "AnimatedSprite",
      description: "Sprite animation frames.",
      props: { x: 0, y: 0, animation: "idle", fps: 12, playing: true, visible: true }
    },
    Tilemap: {
      type: "Tilemap", category: "visual", icon: "▦", defaultName: "Tilemap",
      description: "Grid-based level map.",
      props: { x: 0, y: 0, tileSize: 32, tileset: "none", visible: true }
    },

    Collider: {
      type: "Collider", category: "physics", icon: "□", defaultName: "Collider",
      description: "Collision shape used by the physics mock.",
      props: { x: 0, y: 0, rotation: 0, scale: 1, visible: true, shape: "Rectangle" }
    },
    RigidBody2D: {
      type: "RigidBody2D", category: "physics", icon: "◈", defaultName: "RigidBody2D",
      description: "Moving physics body affected by gravity.",
      props: { x: 0, y: 0, mass: 1, gravityScale: 1, velocityX: 0, velocityY: 0, visible: true }
    },
    StaticBody2D: {
      type: "StaticBody2D", category: "physics", icon: "▰", defaultName: "StaticBody2D",
      description: "Static collision body for ground/platforms.",
      props: { x: 0, y: 0, visible: true }
    },
    Area2D: {
      type: "Area2D", category: "physics", icon: "◎", defaultName: "Area2D",
      description: "Trigger area for detection/events.",
      props: { x: 0, y: 0, monitoring: true, visible: true }
    },

    Camera2D: {
      type: "Camera2D", category: "engine", icon: "◉", defaultName: "Camera2D",
      description: "Camera for the 2D viewport.",
      props: { x: 0, y: 0, zoom: 1, active: true }
    },
    AudioPlayer: {
      type: "AudioPlayer", category: "engine", icon: "♪", defaultName: "AudioPlayer",
      description: "Plays a sound or music asset.",
      props: { audio: "none", volume: 1, autoplay: false, loop: false }
    },
    Timer: {
      type: "Timer", category: "engine", icon: "⏱", defaultName: "Timer",
      description: "Emits timeout events.",
      props: { waitTime: 1, oneShot: false, autostart: false }
    },
    Particle2D: {
      type: "Particle2D", category: "engine", icon: "✦", defaultName: "Particle2D",
      description: "Simple particle effect node.",
      props: { x: 0, y: 0, amount: 24, lifetime: 1.2, emitting: true, color: "#a855f7" }
    },

    Button: {
      type: "Button", category: "ui", icon: "▭", defaultName: "Button",
      description: "Clickable UI button.",
      props: { x: 0, y: 0, text: "Button", width: 160, height: 44, visible: true }
    },
    Panel: {
      type: "Panel", category: "ui", icon: "▧", defaultName: "Panel",
      description: "UI container panel.",
      props: { x: 0, y: 0, width: 320, height: 180, color: "#181026", visible: true }
    },
    Label: {
      type: "Label", category: "ui", icon: "L", defaultName: "Label",
      description: "UI text label.",
      props: { x: 0, y: 0, text: "Label", fontSize: 18, visible: true }
    },
    Input: {
      type: "Input", category: "ui", icon: "⌨", defaultName: "Input",
      description: "Text input field.",
      props: { x: 0, y: 0, placeholder: "Type here", value: "", width: 220, visible: true }
    },
    Menu: {
      type: "Menu", category: "ui", icon: "☰", defaultName: "Menu",
      description: "Menu container for UI screens.",
      props: { x: 0, y: 0, title: "Menu", visible: true }
    },

    PythonScript: {
      type: "PythonScript", category: "script", icon: "🐍", defaultName: "Script.py",
      description: "Attach Python behavior to a node.",
      props: { file: "Script.py", enabled: true }
    },
    Behavior: {
      type: "Behavior", category: "script", icon: "λ", defaultName: "Behavior",
      description: "Reusable behavior logic wrapper.",
      props: { script: "Behavior.py", enabled: true }
    },

    Player: {
      type: "Player", category: "templates", icon: "▰", defaultName: "Player",
      description: "Ready-to-use player with Sprite, Collider and Python script.",
      props: { x: 420, y: 260, rotation: 0, scale: 1, visible: true, speed: 250 },
      children: [
        { type: "Sprite", name: "Sprite", props: { image: "player.png" } },
        { type: "Collider", name: "Collider" },
        { type: "PythonScript", name: "Player.py", props: { file: "Player.py" } }
      ]
    },
    Enemy: {
      type: "Enemy", category: "templates", icon: "◇", defaultName: "Enemy",
      description: "Enemy template with visual, collider and AI script.",
      props: { x: 620, y: 260, rotation: 0, scale: 1, visible: true, speed: 120 },
      children: [
        { type: "Sprite", name: "Sprite", props: { image: "enemy.png" } },
        { type: "Collider", name: "Collider" },
        { type: "PythonScript", name: "EnemyAI.py", props: { file: "EnemyAI.py" } }
      ]
    },
    Platform: {
      type: "Platform", category: "templates", icon: "━", defaultName: "Platform",
      description: "Static platform with sprite and collider.",
      props: { x: 360, y: 420, width: 420, height: 24, visible: true },
      children: [
        { type: "Sprite", name: "Sprite", props: { image: "platform.png" } },
        { type: "Collider", name: "Collider", props: { shape: "Rectangle" } }
      ]
    },
    MenuButton: {
      type: "MenuButton", category: "templates", icon: "▶", defaultName: "MenuButton",
      description: "UI button template for menus.",
      props: { x: 0, y: 0, text: "Play", width: 180, height: 52, visible: true },
      children: [
        { type: "Button", name: "Button", props: { text: "Play" } },
        { type: "PythonScript", name: "MenuButton.py", props: { file: "MenuButton.py" } }
      ]
    }
  };

  let nodes = [
    { id: "scene", name: "Scene", type: "Node2D", parent: null, locked: false, hidden: false, props: { x: 0, y: 0, rotation: 0, scale: 1, visible: true } },
    { id: "world", name: "World", type: "Node2D", parent: "scene", locked: false, hidden: false, props: { x: 0, y: 0, rotation: 0, scale: 1, visible: true } },
    { id: "ground", name: "Ground", type: "Sprite", parent: "world", locked: true, hidden: false, props: { x: 360, y: 420, rotation: 0, scale: 1, visible: true, image: "ground.png" } },
    { id: "player", name: "Player", type: "Player", parent: "scene", locked: false, hidden: false, props: { x: 420, y: 260, rotation: 0, scale: 1, visible: true, speed: 250 } },
    { id: "player_sprite", name: "Sprite", type: "Sprite", parent: "player", locked: false, hidden: false, props: { x: 0, y: 0, rotation: 0, scale: 1, visible: true, image: "player.png" } },
    { id: "player_collider", name: "Collider", type: "Collider", parent: "player", locked: false, hidden: false, props: { x: 0, y: 0, rotation: 0, scale: 1, visible: true, shape: "Rectangle" } },
    { id: "player_script", name: "Player.py", type: "PythonScript", parent: "player", locked: false, hidden: false, props: { file: "Player.py", enabled: true } },
    { id: "camera", name: "Camera2D", type: "Camera2D", parent: "scene", locked: false, hidden: false, props: { x: 0, y: 0, zoom: 1, active: true } }
  ];

  let selectedId = "player";
  let clipboard = null;
  let draggedId = null;

  let assets = [
    { id: "asset_player", name: "player.png", type: "Image", size: "18 KB", color: "violet" },
    { id: "asset_ground", name: "ground.png", type: "Image", size: "22 KB", color: "cyan" },
    { id: "asset_jump", name: "jump.wav", type: "Audio", size: "41 KB", color: "magenta" }
  ];

  const scripts = {
    "Player.py": `class Player(Node2D):
    speed = export(250)

    def ready(self):
        print("Player ready")

    def update(self, delta):
        if input.is_key_down("right"):
            self.x += self.speed * delta

        if input.is_key_down("left"):
            self.x -= self.speed * delta`,
    "EnemyAI.py": `class Enemy(Node2D):
    speed = export(120)

    def update(self, delta):
        self.x -= self.speed * delta

    def on_message(self, name, data):
        if name == "take_damage":
            print("Enemy hit", data)`,
    "Utils.py": `def clamp(value, minimum, maximum):
    return max(minimum, min(value, maximum))

def sign(value):
    return -1 if value < 0 else 1`
  };

  let currentScript = "Player.py";
  const PROJECT_STORAGE_KEY = "pixnaria_local_project_v1";

  let engineRunning = false;
  let engineFrame = null;
  let lastFrameTime = 0;
  const pressedKeys = new Set();

  const projectSettings = {
    project: {
      name: "Neon Platformer",
      author: "Snowoo",
      language: "Python",
      visibility: "private",
      errorHelp: "enabled"
    },
    scene: {
      name: "Scene",
      width: 1280,
      height: 720,
      background: "#090712",
      touchControls: "enabled"
    }
  };

  const physics = {
    gravity: 1350,
    jumpForce: 560,
    maxFallSpeed: 900,
    playerHeight: 64,
    playerWidth: 58,
    floorY: 500,
    platform: { x: 215, y: 392, width: 470, height: 18 },
    velocityY: 0,
    onGround: false,
    groundName: null,
    collisionEnabled: true
  };

  const $ = (selector) => document.querySelector(selector);

  function uid(prefix = "node") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function selectedNode() {
    return nodes.find((node) => node.id === selectedId) || nodes[0];
  }

  function childrenOf(id) {
    return nodes.filter((node) => node.parent === id);
  }

  function depthOf(node) {
    let depth = 0;
    let cursor = node;
    while (cursor?.parent) {
      depth += 1;
      cursor = nodes.find((item) => item.id === cursor.parent);
    }
    return depth;
  }

  function flattenTree(parent = null) {
    const result = [];
    nodes.filter((node) => node.parent === parent).forEach((node) => {
      result.push(node);
      result.push(...flattenTree(node.id));
    });
    return result;
  }

  function canDelete(node) {
    return node && node.id !== "scene";
  }

  function isDescendant(possibleChildId, possibleParentId) {
    let cursor = nodes.find((node) => node.id === possibleChildId);
    while (cursor?.parent) {
      if (cursor.parent === possibleParentId) return true;
      cursor = nodes.find((node) => node.id === cursor.parent);
    }
    return false;
  }

  function canDrop(sourceId, targetId) {
    if (!sourceId || !targetId) return false;
    if (sourceId === "scene") return false;
    if (sourceId === targetId) return false;
    if (isDescendant(targetId, sourceId)) return false;
    const source = nodes.find((node) => node.id === sourceId);
    const target = nodes.find((node) => node.id === targetId);
    return Boolean(source && target);
  }

  function moveNode(sourceId, targetId) {
    if (!canDrop(sourceId, targetId)) {
      log("cannot move node there");
      return;
    }
    const source = nodes.find((node) => node.id === sourceId);
    const target = nodes.find((node) => node.id === targetId);
    source.parent = target.id;
    selectedId = source.id;
    render();
    log(`moved ${source.name} under ${target.name}`);
  }

  function iconFor(node) {
    return templates[node.type]?.icon || "◆";
  }

  function renderTree() {
    const tree = $("[data-editor-node-tree]");
    const search = $("[data-node-search]")?.value.trim().toLowerCase() || "";
    if (!tree) return;

    const visibleNodes = flattenTree().filter((node) => !search || node.name.toLowerCase().includes(search) || node.type.toLowerCase().includes(search));
    tree.innerHTML = visibleNodes.map((node) => {
      const depth = depthOf(node);
      const selected = node.id === selectedId;
      return `
        <button class="editor-node ${selected ? "is-selected" : ""} ${node.hidden ? "is-hidden" : ""} ${node.locked ? "is-locked" : ""}" type="button" data-select-node="${node.id}" draggable="${node.id !== "scene"}" data-drop-node="${node.id}" style="--depth:${depth}">
          <span class="editor-node__icon">${iconFor(node)}</span>
          <span class="editor-node__name">${node.name}</span>
          <span class="editor-node__meta">${node.hidden ? "👁̸" : ""}${node.locked ? " 🔒" : ""}</span>
        </button>
      `;
    }).join("");

    tree.querySelectorAll("[data-select-node]").forEach((button) => {
      button.addEventListener("click", () => selectNode(button.dataset.selectNode));
      button.addEventListener("dragstart", (event) => {
        draggedId = button.dataset.selectNode;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggedId);
        button.classList.add("is-dragging");
        log(`dragging ${nodes.find((node) => node.id === draggedId)?.name || "node"}`);
      });
      button.addEventListener("dragend", () => {
        draggedId = null;
        tree.querySelectorAll(".is-dragging, .is-drop-target").forEach((node) => node.classList.remove("is-dragging", "is-drop-target"));
      });
      button.addEventListener("dragover", (event) => {
        const targetId = button.dataset.dropNode;
        if (canDrop(draggedId, targetId)) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          button.classList.add("is-drop-target");
        }
      });
      button.addEventListener("dragleave", () => button.classList.remove("is-drop-target"));
      button.addEventListener("drop", (event) => {
        event.preventDefault();
        const sourceId = event.dataTransfer.getData("text/plain") || draggedId;
        const targetId = button.dataset.dropNode;
        moveNode(sourceId, targetId);
      });
    });
  }

  function renderInspector() {
    const node = selectedNode();
    const title = $("[data-inspector-title]");
    const type = $("[data-inspector-type]");
    const fields = $("[data-inspector-fields]");
    const hint = $("[data-inspector-hint]");

    if (!node || !fields) return;
    if (title) title.textContent = node.name;
    if (type) type.textContent = node.type;
    if (hint) {
      hint.textContent = node.type === "PythonScript"
        ? "Script is edited in the Script tab, not directly inside the Inspector."
        : "Properties shown here are a mock preview of the future Pixnaria Inspector.";
    }

    const props = node.props || {};
    fields.innerHTML = Object.entries(props).map(([key, value]) => {
      if (typeof value === "boolean") {
        return `
          <label class="inspector-row">
            <span>${key}</span>
            <select data-prop-key="${key}">
              <option value="true" ${value ? "selected" : ""}>True</option>
              <option value="false" ${!value ? "selected" : ""}>False</option>
            </select>
          </label>
        `;
      }
      return `
        <label class="inspector-row">
          <span>${key}</span>
          <input data-prop-key="${key}" value="${String(value).replaceAll('"', '&quot;')}">
        </label>
      `;
    }).join("");

    fields.querySelectorAll("[data-prop-key]").forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.dataset.propKey;
        let value = input.value;
        if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value !== "" && !Number.isNaN(Number(value))) value = Number(value);
        node.props[key] = value;
        renderViewport();
      });
    });

    const renameInput = $("[data-node-name-input]");
    if (renameInput) renameInput.value = node.name;

    const typeSelect = $("[data-node-type-select]");
    if (typeSelect) typeSelect.value = node.type;
  }

  function renderViewport() {
    const player = nodes.find((node) => node.id === "player");
    const playerEl = $("[data-viewport-player]");
    const viewport = $(".viewport");
    if (viewport) {
      viewport.style.setProperty("--scene-bg", projectSettings.scene.background);
      viewport.classList.toggle("has-touch-controls", projectSettings.scene.touchControls === "enabled");
    }

    const touchControls = $("[data-touch-controls]");
    if (touchControls) {
      touchControls.hidden = projectSettings.scene.touchControls !== "enabled";
    }
    if (player && playerEl) {
      playerEl.style.left = `${Math.max(8, Math.min(82, Number(player.props.x || 0) / 9))}%`;
      playerEl.style.top = `${Math.max(8, Math.min(78, Number(player.props.y || 0) / 6))}%`;
      playerEl.style.display = player.hidden || player.props.visible === false ? "none" : "block";
      playerEl.classList.toggle("is-running", engineRunning);
      playerEl.classList.toggle("is-on-ground", physics.onGround);
      playerEl.classList.toggle("is-falling", engineRunning && physics.velocityY > 80 && !physics.onGround);
      playerEl.classList.toggle("is-jumping", engineRunning && physics.velocityY < -80);
    }

    if (viewport) viewport.classList.toggle("is-playing", engineRunning);

    const hud = $("[data-physics-hud]");
    if (hud) {
      const state = !engineRunning ? "idle" : physics.onGround ? `grounded on ${physics.groundName || "floor"}` : physics.velocityY < 0 ? "jumping" : "falling";
      hud.textContent = `Physics: ${state} · Collider: ${physics.collisionEnabled ? "enabled" : "disabled"}`;
    }

    const selected = selectedNode();
    const badge = $("[data-viewport-selected]");
    if (badge) {
      badge.textContent = engineRunning
        ? `▶ Running · ${selected.name} · ${selected.type}`
        : `${selected.name} · ${selected.type}`;
    }
  }

  function refreshInspectorValuesOnly() {
    const node = selectedNode();
    if (!node) return;
    document.querySelectorAll("[data-inspector-fields] [data-prop-key]").forEach((input) => {
      const key = input.dataset.propKey;
      if (key in node.props && document.activeElement !== input) {
        input.value = String(node.props[key]);
      }
    });
  }

  function log(message) {
    const output = $("[data-console-output]");
    if (!output) return;
    output.textContent += `\n> ${message}`;
    output.scrollTop = output.scrollHeight;
  }

  function selectNode(id) {
    selectedId = id;
    render();
    log(`selected ${selectedNode().name}`);
  }

  function createNodeFromTemplate(type, parent, override = {}) {
    const base = templates[type] || templates.Node2D;
    const count = nodes.filter((node) => node.type === base.type).length + 1;
    const baseName = override.name || base.defaultName || base.type;
    const shouldSuffix = count > 1 && !baseName.endsWith(".py");
    const node = {
      id: uid(base.type.toLowerCase()),
      name: shouldSuffix ? `${baseName}_${count}` : baseName,
      type: base.type,
      parent,
      locked: false,
      hidden: false,
      props: { ...structuredClone(base.props || {}), ...(override.props || {}) }
    };
    nodes.push(node);

    if (node.type === "PythonScript" && node.props?.file && !scripts[node.props.file]) {
      scripts[node.props.file] = `class ${node.props.file.replace(/\.py$/i, "")}(Node2D):\n    def ready(self):\n        print("${node.props.file} ready")`;
      renderScripts();
    }

    if (Array.isArray(base.children)) {
      base.children.forEach((child) => createNodeFromTemplate(child.type, node.id, child));
    }
    return node;
  }

  function addNode(type = "Node2D") {
    const parent = selectedNode()?.id || "scene";
    const node = createNodeFromTemplate(type, parent);
    selectedId = node.id;
    render();
    log(`added ${node.name} from ${type} under ${nodes.find((item) => item.id === parent)?.name || "Scene"}`);
  }

  function renameSelected() {
    const node = selectedNode();
    const input = $("[data-node-name-input]");
    const next = input?.value.trim();
    if (!node || !next) return;
    node.name = next;
    render();
    log(`renamed node to ${next}`);
  }

  function changeType() {
    const node = selectedNode();
    const select = $("[data-node-type-select]");
    if (!node || !select) return;
    const nextType = select.value;
    node.type = nextType;
    node.props = { ...structuredClone(templates[nextType]?.props || {}), ...node.props };
    render();
    log(`changed ${node.name} type to ${nextType}`);
  }

  function deleteWithChildren(id) {
    childrenOf(id).forEach((child) => deleteWithChildren(child.id));
    nodes = nodes.filter((node) => node.id !== id);
  }

  function deleteSelected() {
    const node = selectedNode();
    if (!canDelete(node)) {
      log("Scene root cannot be deleted");
      return;
    }
    const parent = node.parent || "scene";
    deleteWithChildren(node.id);
    selectedId = parent;
    render();
    log(`deleted ${node.name}`);
  }

  function duplicateNode(source, parent = source.parent) {
    const copy = structuredClone(source);
    const oldId = copy.id;
    copy.id = uid(source.type.toLowerCase());
    copy.name = `${source.name}_copy`;
    copy.parent = parent;
    nodes.push(copy);
    childrenOf(oldId).forEach((child) => duplicateNode(child, copy.id));
    return copy;
  }

  function duplicateSelected() {
    const node = selectedNode();
    if (!node) return;
    const copy = duplicateNode(node);
    selectedId = copy.id;
    render();
    log(`duplicated ${node.name}`);
  }

  function copySelected() {
    clipboard = structuredClone(selectedNode());
    log(`copied ${clipboard.name}`);
  }

  function pasteNode() {
    if (!clipboard) {
      log("clipboard is empty");
      return;
    }
    const copy = structuredClone(clipboard);
    copy.id = uid(copy.type.toLowerCase());
    copy.name = `${copy.name}_pasted`;
    copy.parent = selectedNode()?.id || "scene";
    nodes.push(copy);
    selectedId = copy.id;
    render();
    log(`pasted ${copy.name}`);
  }

  function toggleHidden() {
    const node = selectedNode();
    if (!node) return;
    node.hidden = !node.hidden;
    render();
    log(`${node.hidden ? "hidden" : "shown"} ${node.name}`);
  }

  function toggleLocked() {
    const node = selectedNode();
    if (!node) return;
    node.locked = !node.locked;
    render();
    log(`${node.locked ? "locked" : "unlocked"} ${node.name}`);
  }

  function groupedTemplateOptions() {
    return templateCategories
      .filter((category) => category.id !== "all")
      .map((category) => {
        const options = Object.entries(templates)
          .filter(([, template]) => template.category === category.id)
          .map(([key, template]) => `<option value="${key}">${template.icon} ${template.defaultName || key}</option>`)
          .join("");
        return options ? `<optgroup label="${category.label}">${options}</optgroup>` : "";
      })
      .join("");
  }

  function filteredTemplates() {
    return Object.entries(templates).filter(([key, template]) => {
      const matchesCategory = activeTemplateCategory === "all" || template.category === activeTemplateCategory;
      const q = templateSearch.toLowerCase();
      const matchesSearch = !q || key.toLowerCase().includes(q) || template.type.toLowerCase().includes(q) || template.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }

  function renderTemplates() {
    const select = $("[data-template-select]");
    const typeSelect = $("[data-node-type-select]");
    const categories = $("[data-template-categories]");
    const library = $("[data-template-library]");
    const options = groupedTemplateOptions();
    if (select) select.innerHTML = options;
    if (typeSelect) typeSelect.innerHTML = options;

    if (categories) {
      categories.innerHTML = templateCategories.map((category) => `
        <button class="template-category ${activeTemplateCategory === category.id ? "active" : ""}" type="button" data-template-category="${category.id}">${category.label}</button>
      `).join("");
      categories.querySelectorAll("[data-template-category]").forEach((button) => {
        button.addEventListener("click", () => {
          activeTemplateCategory = button.dataset.templateCategory;
          renderTemplates();
        });
      });
    }

    if (library) {
      library.innerHTML = filteredTemplates().map(([key, template]) => `
        <button class="template-card" type="button" data-add-template="${key}" title="${template.description}">
          <span class="template-card__icon">${template.icon}</span>
          <span class="template-card__body">
            <strong>${template.defaultName || key}</strong>
            <small>${template.category} · ${template.description}</small>
          </span>
        </button>
      `).join("") || `<p class="template-empty">No template found.</p>`;
      library.querySelectorAll("[data-add-template]").forEach((button) => {
        button.addEventListener("click", () => addNode(button.dataset.addTemplate));
      });
    }
  }

  function renderScripts() {
    const list = $("[data-script-list]");
    if (!list) return;
    list.innerHTML = Object.keys(scripts).map((name) => `
      <button class="script-file ${name === currentScript ? "active" : ""}" type="button" data-script-file="${name}">${name}</button>
    `).join("");
    list.querySelectorAll("[data-script-file]").forEach((button) => {
      button.addEventListener("click", () => selectScript(button.dataset.scriptFile));
    });
  }

  function newScript() {
    let index = 1;
    let name = `Script${index}.py`;
    while (scripts[name]) {
      index += 1;
      name = `Script${index}.py`;
    }
    scripts[name] = `class Script${index}(Node2D):\n    def ready(self):\n        print("${name} ready")`;
    currentScript = name;
    renderScripts();
    selectScript(name);
    log(`created script ${name}`);
  }

  function renderAssets() {
    const grid = $("[data-asset-grid]");
    if (!grid) return;
    grid.innerHTML = assets.map((asset) => `
      <article class="asset-card asset-card--${asset.color}">
        <div class="asset-card__preview">${asset.type === "Audio" ? "♪" : "▣"}</div>
        <div>
          <strong>${asset.name}</strong>
          <small>${asset.type} · ${asset.size}</small>
        </div>
      </article>
    `).join("");
  }

  function addAsset() {
    const count = assets.length + 1;
    assets.push({
      id: uid("asset"),
      name: `mock_asset_${count}.png`,
      type: "Image",
      size: `${12 + count * 3} KB`,
      color: count % 2 ? "violet" : "cyan"
    });
    renderAssets();
    log(`added mock asset mock_asset_${count}.png`);
  }

  function openTab(name) {
    document.querySelectorAll("[data-editor-tab]").forEach((button) => {
      button.classList.toggle("active", button.dataset.editorTab === name);
    });
    document.querySelectorAll("[data-editor-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.editorPanel === name);
    });
  }

  function selectScript(name) {
    const editor = $("[data-script-editor]");
    const label = $("[data-current-script]");
    if (!scripts[name] || !editor) return;
    currentScript = name;
    editor.value = scripts[name];
    if (label) label.textContent = name;
    document.querySelectorAll("[data-script-file]").forEach((button) => {
      button.classList.toggle("active", button.dataset.scriptFile === name);
    });
    log(`opened script ${name}`);
  }

  function saveCurrentScript() {
    const editor = $("[data-script-editor]");
    const status = $("[data-script-status]");
    if (!editor) return;
    scripts[currentScript] = editor.value;
    if (status) {
      status.textContent = "Saved locally";
      status.classList.remove("is-dirty");
    }
  }

  function serializeProject() {
    const editor = $("[data-script-editor]");
    if (editor && currentScript) scripts[currentScript] = editor.value;

    return {
      pixnariaFormat: "pixna-json-prototype",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      metadata: {
        name: projectSettings.project.name,
        author: projectSettings.project.author,
        engine: "Pixnaria Custom 2D Engine",
        language: projectSettings.project.language,
        visibility: projectSettings.project.visibility,
        note: "Prototype .pixna file. Later this can become a compressed archive."
      },
      scene: {
        rootNodeId: "scene",
        selectedNodeId: selectedId,
        nodes: structuredClone(nodes)
      },
      scripts: structuredClone(scripts),
      assets: structuredClone(assets),
      settings: {
        theme: "dark",
        safePython: true,
        errorHelp: projectSettings.project.errorHelp,
        dimensions: { width: Number(projectSettings.scene.width), height: Number(projectSettings.scene.height) },
        sceneName: projectSettings.scene.name,
        background: projectSettings.scene.background,
        touchControls: projectSettings.scene.touchControls,
        physics: {
          gravity: Number(physics.gravity),
          jumpForce: Number(physics.jumpForce),
          maxFallSpeed: Number(physics.maxFallSpeed)
        }
      }
    };
  }

  function applyProject(project) {
    if (engineRunning) stopEngine();
    if (!project || !project.scene || !Array.isArray(project.scene.nodes)) {
      log("invalid .pixna project");
      return false;
    }

    nodes = structuredClone(project.scene.nodes);
    selectedId = project.scene.selectedNodeId && nodes.some((node) => node.id === project.scene.selectedNodeId)
      ? project.scene.selectedNodeId
      : "scene";

    assets = Array.isArray(project.assets) ? structuredClone(project.assets) : assets;

    if (project.metadata) {
      projectSettings.project.name = project.metadata.name || projectSettings.project.name;
      projectSettings.project.author = project.metadata.author || projectSettings.project.author;
      projectSettings.project.language = project.metadata.language || projectSettings.project.language;
      projectSettings.project.visibility = project.metadata.visibility || projectSettings.project.visibility;
    }

    if (project.settings) {
      projectSettings.project.errorHelp = project.settings.errorHelp || projectSettings.project.errorHelp;
      projectSettings.scene.name = project.settings.sceneName || projectSettings.scene.name;
      projectSettings.scene.width = project.settings.dimensions?.width || projectSettings.scene.width;
      projectSettings.scene.height = project.settings.dimensions?.height || projectSettings.scene.height;
      projectSettings.scene.background = project.settings.background || projectSettings.scene.background;
      projectSettings.scene.touchControls = project.settings.touchControls || projectSettings.scene.touchControls;
      physics.gravity = Number(project.settings.physics?.gravity || physics.gravity);
      physics.jumpForce = Number(project.settings.physics?.jumpForce || physics.jumpForce);
      physics.maxFallSpeed = Number(project.settings.physics?.maxFallSpeed || physics.maxFallSpeed);
    }

    if (project.scripts && typeof project.scripts === "object") {
      Object.keys(scripts).forEach((key) => delete scripts[key]);
      Object.entries(project.scripts).forEach(([key, value]) => {
        scripts[key] = String(value);
      });
      currentScript = Object.keys(scripts)[0] || "Player.py";
    }

    renderTemplates();
    renderAssets();
    renderScripts();
    renderSettings();
    render();
    selectScript(currentScript);
    log(`loaded project ${project.metadata?.name || "Pixnaria project"}`);
    return true;
  }

  async function saveProjectLocal() {
    if (window.PixnariaEditorGitHubSync?.repo) {
      const saved = await window.PixnariaEditorGitHubSync.save();
      if (saved) return;
    }
    const project = serializeProject();
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
    log("project saved locally");
  }

  function loadProjectLocal() {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!saved) {
      log("no local project found");
      return;
    }
    try {
      applyProject(JSON.parse(saved));
    } catch (error) {
      log("failed to load local project");
    }
  }

  function exportPixna() {
    const project = serializeProject();
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "neon-platformer.pixna";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    log("exported neon-platformer.pixna prototype");
  }

  function importPixna(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const project = JSON.parse(String(reader.result || "{}"));
        if (applyProject(project)) log(`imported ${file.name}`);
      } catch (error) {
        log("failed to import .pixna file");
      }
    };
    reader.readAsText(file);
  }

  function hasPlayerCollider() {
    const player = nodes.find((node) => node.id === "player");
    if (!player) return false;
    return nodes.some((node) => node.parent === player.id && node.type === "Collider" && !node.hidden);
  }

  function resetPhysicsForPlayer() {
    const player = nodes.find((node) => node.id === "player");
    physics.velocityY = 0;
    physics.onGround = false;
    physics.groundName = null;
    physics.collisionEnabled = hasPlayerCollider();
    if (player) {
      const x = Number(player.props.x || 420);
      player.props.x = Number.isFinite(x) ? x : 420;
      const y = Number(player.props.y || 260);
      player.props.y = Number.isFinite(y) ? Math.min(y, physics.floorY) : 260;
    }
  }

  function playerOverPlatform(player) {
    const x = Number(player.props.x || 0);
    const centerX = x + physics.playerWidth / 2;
    return centerX >= physics.platform.x && centerX <= physics.platform.x + physics.platform.width;
  }

  function resolveCollisions(player, previousY) {
    physics.collisionEnabled = hasPlayerCollider();
    if (!physics.collisionEnabled) {
      physics.onGround = false;
      physics.groundName = null;
      return;
    }

    const y = Number(player.props.y || 0);
    const previousBottom = previousY + physics.playerHeight;
    const bottom = y + physics.playerHeight;
    const platformTop = physics.platform.y;
    const floorTop = physics.floorY;
    let landedOn = null;

    if (playerOverPlatform(player) && previousBottom <= platformTop && bottom >= platformTop && physics.velocityY >= 0) {
      player.props.y = platformTop - physics.playerHeight;
      landedOn = "Ground";
    } else if (bottom >= floorTop && physics.velocityY >= 0) {
      player.props.y = floorTop - physics.playerHeight;
      landedOn = "World Floor";
    }

    if (landedOn) {
      if (!physics.onGround || physics.groundName !== landedOn) {
        log(`collision: Player landed on ${landedOn}`);
      }
      physics.velocityY = 0;
      physics.onGround = true;
      physics.groundName = landedOn;
    } else {
      if (physics.onGround && bottom < platformTop - 2) log("collision: Player left ground");
      physics.onGround = false;
      physics.groundName = null;
    }
  }

  function setPlayButtonState() {
    const button = $("[data-play-project]");
    if (!button) return;
    button.textContent = engineRunning ? "■ Stop" : "▶ Play";
    button.classList.toggle("is-playing", engineRunning);
  }

  function startEngine() {
    if (engineRunning) return;
    const project = serializeProject();
    const nodeCount = project.scene.nodes.length;
    const scriptCount = Object.keys(project.scripts).length;
    resetPhysicsForPlayer();
    engineRunning = true;
    lastFrameTime = performance.now();
    setPlayButtonState();
    renderViewport();
    log(`play preview: ${nodeCount} nodes, ${scriptCount} scripts, ${project.assets.length} assets`);
    log("engine loop mock started: ready() → physics(delta) → update(delta) → render()");
    log("controls: A/D or ←/→ move · W/↑/Space jump · Stop button or Escape stops");
    log(`collisions: ${physics.collisionEnabled ? "enabled through Player/Collider" : "disabled because Player has no Collider"}`);
    engineFrame = requestAnimationFrame(engineLoop);
  }

  function stopEngine() {
    if (!engineRunning) return;
    engineRunning = false;
    if (engineFrame) cancelAnimationFrame(engineFrame);
    engineFrame = null;
    pressedKeys.clear();
    setPlayButtonState();
    renderViewport();
    log("engine loop mock stopped");
  }

  function engineLoop(now) {
    if (!engineRunning) return;
    const delta = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    const player = nodes.find((node) => node.id === "player");
    if (player && !player.locked && !player.hidden && player.props.visible !== false) {
      const speed = Number(player.props.speed || 250);
      let dx = 0;
      if (pressedKeys.has("arrowright") || pressedKeys.has("d")) dx += 1;
      if (pressedKeys.has("arrowleft") || pressedKeys.has("a")) dx -= 1;

      const wantsJump = pressedKeys.has(" ") || pressedKeys.has("arrowup") || pressedKeys.has("w");
      if (wantsJump && physics.onGround && physics.collisionEnabled) {
        physics.velocityY = -physics.jumpForce;
        physics.onGround = false;
        physics.groundName = null;
        pressedKeys.delete(" ");
        pressedKeys.delete("arrowup");
        pressedKeys.delete("w");
        log("physics: Player jump");
      }

      const previousY = Number(player.props.y || 0);
      player.props.x = Math.max(0, Math.min(900, Number(player.props.x || 0) + dx * speed * delta));

      physics.velocityY = Math.min(physics.maxFallSpeed, physics.velocityY + physics.gravity * delta);
      player.props.y = Number(player.props.y || 0) + physics.velocityY * delta;

      resolveCollisions(player, previousY);
      player.props.y = Math.max(0, Math.min(physics.floorY - physics.playerHeight, Number(player.props.y || 0)));

      renderViewport();
      refreshInspectorValuesOnly();
    }

    engineFrame = requestAnimationFrame(engineLoop);
  }

  function playProject() {
    if (window.PixnariaEditorEngineBridge) {
      window.PixnariaEditorEngineBridge.toggleFromPlay();
      return;
    }
    if (engineRunning) stopEngine();
    else startEngine();
  }

  function bindTouchControls() {
    document.querySelectorAll("[data-touch-key]").forEach((button) => {
      const key = button.dataset.touchKey;
      const press = (event) => {
        event.preventDefault();
        if (!engineRunning) startEngine();
        pressedKeys.add(key);
        button.classList.add("is-pressed");
      };
      const release = (event) => {
        event.preventDefault();
        pressedKeys.delete(key);
        button.classList.remove("is-pressed");
      };

      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
      button.addEventListener("contextmenu", (event) => event.preventDefault());
    });
  }

  function bindProjectIO() {
    $("[data-save-project]")?.addEventListener("click", saveProjectLocal);
    $("[data-load-project]")?.addEventListener("click", loadProjectLocal);
    $("[data-export-pixna]")?.addEventListener("click", exportPixna);
    $("[data-play-project]")?.addEventListener("click", playProject);
    $("[data-import-pixna]")?.addEventListener("change", (event) => {
      importPixna(event.target.files?.[0]);
      event.target.value = "";
    });

    document.addEventListener("keydown", (event) => {
      if (window.PixnariaCanvasEngineActive) return;
      const target = event.target;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName);
      if (typing) return;
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
        if (engineRunning) event.preventDefault();
        pressedKeys.add(key);
      }
      if (key === " " && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        if (engineRunning) pressedKeys.add(" ");
        else if (!event.repeat) playProject();
      }
      if (key === "escape" && engineRunning) {
        event.preventDefault();
        stopEngine();
      }
    });

    document.addEventListener("keyup", (event) => {
      pressedKeys.delete(event.key.toLowerCase());
    });

    window.addEventListener("blur", () => pressedKeys.clear());
  }

  function setByPath(path, value) {
    const [group, key] = path.split(".");
    if (group === "project") projectSettings.project[key] = value;
    if (group === "scene") projectSettings.scene[key] = value;
    if (group === "physics") physics[key] = Number(value);
  }

  function getByPath(path) {
    const [group, key] = path.split(".");
    if (group === "project") return projectSettings.project[key];
    if (group === "scene") return projectSettings.scene[key];
    if (group === "physics") return physics[key];
    return "";
  }

  function renderSettings() {
    document.querySelectorAll("[data-setting]").forEach((input) => {
      const value = getByPath(input.dataset.setting);
      if (document.activeElement !== input && value !== undefined) input.value = value;
    });

    const sceneRoot = nodes.find((node) => node.id === "scene");
    if (sceneRoot) sceneRoot.name = projectSettings.scene.name || "Scene";

    const preview = $("[data-settings-preview]");
    if (preview) {
      preview.textContent = JSON.stringify({
        metadata: {
          name: projectSettings.project.name,
          author: projectSettings.project.author,
          visibility: projectSettings.project.visibility
        },
        settings: {
          sceneName: projectSettings.scene.name,
          dimensions: { width: Number(projectSettings.scene.width), height: Number(projectSettings.scene.height) },
          background: projectSettings.scene.background,
          gravity: Number(physics.gravity),
          jumpForce: Number(physics.jumpForce),
          touchControls: projectSettings.scene.touchControls,
          errorHelp: projectSettings.project.errorHelp
        }
      }, null, 2);
    }
    renderTree();
    renderViewport();
  }

  function bindSettings() {
    document.querySelectorAll("[data-setting]").forEach((input) => {
      input.addEventListener("input", () => {
        setByPath(input.dataset.setting, input.value);
        if (input.dataset.setting === "scene.name") {
          const scene = nodes.find((node) => node.id === "scene");
          if (scene) scene.name = input.value || "Scene";
        }
        if (input.dataset.setting === "physics.gravity") physics.gravity = Number(input.value || 1350);
        if (input.dataset.setting === "physics.jumpForce") physics.jumpForce = Number(input.value || 560);
        renderSettings();
        log(`settings updated: ${input.dataset.setting}`);
      });
    });
  }

  function bindTabsAssetsScripts() {
    document.querySelectorAll("[data-editor-tab]").forEach((button) => {
      button.addEventListener("click", () => openTab(button.dataset.editorTab));
    });
    $("[data-add-asset]")?.addEventListener("click", addAsset);
    $("[data-new-script]")?.addEventListener("click", newScript);
    const editor = $("[data-script-editor]");
    const status = $("[data-script-status]");
    editor?.addEventListener("input", () => {
      scripts[currentScript] = editor.value;
      if (status) {
        status.textContent = "Unsaved local changes";
        status.classList.add("is-dirty");
      }
    });
    editor?.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveCurrentScript();
        log(`saved ${currentScript}`);
      }
    });
  }

  function bind() {
    $("[data-add-node]")?.addEventListener("click", () => addNode($("[data-template-select]")?.value || "Node2D"));
    $("[data-rename-node]")?.addEventListener("click", renameSelected);
    $("[data-node-name-input]")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") renameSelected();
    });
    $("[data-node-type-select]")?.addEventListener("change", changeType);
    $("[data-delete-node]")?.addEventListener("click", deleteSelected);
    $("[data-duplicate-node]")?.addEventListener("click", duplicateSelected);
    $("[data-copy-node]")?.addEventListener("click", copySelected);
    $("[data-paste-node]")?.addEventListener("click", pasteNode);
    $("[data-toggle-hidden]")?.addEventListener("click", toggleHidden);
    $("[data-toggle-locked]")?.addEventListener("click", toggleLocked);
    $("[data-node-search]")?.addEventListener("input", renderTree);
    $("[data-template-search]")?.addEventListener("input", (event) => {
      templateSearch = event.target.value;
      renderTemplates();
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName);
      if (typing) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        copySelected();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
        pasteNode();
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelected();
      }
    });
  }

  function render() {
    renderTree();
    renderInspector();
    renderViewport();
  }

  function init() {
    if (!$('[data-editor-node-tree]')) return;
    renderTemplates();
    renderAssets();
    renderScripts();
    bind();
    bindTabsAssetsScripts();
    bindSettings();
    bindTouchControls();
    bindProjectIO();
    renderSettings();
    render();
    log("node manager ready — add, select, rename, duplicate, hide, lock, drag & drop");
  }

  function getProjectForEngine() {
    return serializeProject();
  }

  function loadProjectFromExternal(project) {
    return applyProject(project);
  }

  function stopMockEngineForCanvas() {
    if (engineRunning) stopEngine();
  }

  function updateNodesFromEngineSnapshot(snapshot = []) {
    let changedSelected = false;
    for (const item of snapshot) {
      const node = nodes.find((candidate) => candidate.id === item.id);
      if (!node || !node.props) continue;
      if (typeof item.x === "number") node.props.x = Math.round(item.x * 100) / 100;
      if (typeof item.y === "number") node.props.y = Math.round(item.y * 100) / 100;
      if (typeof item.velocityX === "number") node.props.velocityX = Math.round(item.velocityX * 100) / 100;
      if (typeof item.velocityY === "number") node.props.velocityY = Math.round(item.velocityY * 100) / 100;
      if (typeof item.onGround === "boolean") node.props.onGround = item.onGround;
      if (node.id === selectedId) changedSelected = true;
    }
    if (changedSelected) refreshInspectorValuesOnly();
    if (!window.PixnariaCanvasEngineActive) renderViewport();
  }

  function setCanvasPlayState(active) {
    const button = $("[data-play-project]");
    if (!button) return;
    button.textContent = active ? "■ Stop" : "▶ Play";
    button.classList.toggle("is-playing", active);
  }

  function writeEditorLog(message) {
    log(message);
  }

  const api = { init, getProjectForEngine, loadProjectFromExternal, stopMockEngineForCanvas, updateNodesFromEngineSnapshot, setCanvasPlayState, writeEditorLog };
  window.PixnariaEditorPreview = api;
  return api;
})();

document.addEventListener("DOMContentLoaded", PixnariaEditorPreview.init);
