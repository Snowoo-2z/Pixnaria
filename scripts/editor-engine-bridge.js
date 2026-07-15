import { PixnariaEngine } from "./engine/pixnaria-core.js";
import { sceneFromPixna } from "./engine/pixnaria-runtime.js";

const PixnariaEditorEngineBridge = (() => {
  let engine = null;
  let canvasMode = false;
  let syncFrame = null;

  const $ = (selector) => document.querySelector(selector);

  function log(message) {
    window.PixnariaEditorPreview?.writeEditorLog?.(`[canvas engine] ${message}`);
  }

  function normalizeType(node) {
    if (node.type === "Player" || node.type === "Enemy") return "RigidBody2D";
    if (node.type === "Platform") return "StaticBody2D";
    if (["Sprite", "Shape", "Text", "Collider", "RigidBody2D", "StaticBody2D", "Camera2D", "Timer", "Node2D", "Node"].includes(node.type)) return node.type;
    if (["Button", "Panel", "Input", "Menu"].includes(node.type)) return "Shape";
    if (node.type === "Label") return "Text";
    return "Node2D";
  }

  function normalizeNode(node) {
    const props = { ...(node.props || {}) };
    const type = normalizeType(node);

    if (node.type === "Player" || node.type === "Enemy") {
      props.width ??= 58;
      props.height ??= 58;
      props.speed ??= node.type === "Enemy" ? 120 : 250;
      props.jumpForce ??= 560;
      props.gravityScale ??= 1;
      props.velocityX ??= 0;
      props.velocityY ??= 0;
    }

    if (type === "Camera2D") {
      props.x = 640;
      props.y = 360;
      props.zoom ??= 1;
      props.active = true;
    }

    if (type === "Shape") {
      props.width ??= node.type === "Panel" ? 220 : 80;
      props.height ??= node.type === "Panel" ? 120 : 40;
      props.color ??= node.type === "Panel" ? "#181026" : "#7c3aed";
    }

    if (type === "Text") {
      props.text ??= node.props?.text || node.name;
      props.fontSize ??= 24;
      props.color ??= "#f5f3ff";
    }

    if (type === "Sprite") {
      props.width ??= 58;
      props.height ??= 58;
      props.tint ??= node.name.toLowerCase().includes("ground") || node.name.toLowerCase().includes("platform") ? "#38bdf8" : "#a855f7";
    }

    if (type === "Collider") {
      props.width ??= node.name.toLowerCase().includes("ground") || node.name.toLowerCase().includes("platform") ? 420 : 58;
      props.height ??= node.name.toLowerCase().includes("ground") || node.name.toLowerCase().includes("platform") ? 24 : 58;
    }

    return {
      id: node.id,
      name: node.name,
      type,
      parent: node.parent,
      locked: Boolean(node.locked),
      visible: !node.hidden && node.props?.visible !== false,
      props
    };
  }

  function hasNode(nodes, id) {
    return nodes.some((node) => node.id === id);
  }

  function ensurePlayableBasics(project) {
    const nodes = project.scene.nodes;
    const rootId = project.scene.rootNodeId || "scene";
    const player = nodes.find((node) => node.name === "Player" || node.id === "player" || node.type === "RigidBody2D");

    if (player && !nodes.some((node) => node.parent === player.id && node.type === "Sprite")) {
      nodes.push({ id: "engine_player_sprite", name: "Sprite", type: "Sprite", parent: player.id, props: { x: 0, y: 0, width: 58, height: 58, tint: "#a855f7" }, visible: true });
    }
    if (player && !nodes.some((node) => node.parent === player.id && node.type === "Collider")) {
      nodes.push({ id: "engine_player_collider", name: "Collider", type: "Collider", parent: player.id, props: { x: 0, y: 0, width: 58, height: 58 }, visible: true });
    }

    if (!nodes.some((node) => node.type === "Camera2D")) {
      nodes.push({ id: "engine_camera", name: "Camera2D", type: "Camera2D", parent: rootId, props: { x: 640, y: 360, zoom: 1, active: true }, visible: true });
    }

    if (!hasNode(nodes, "engine_platform")) {
      nodes.push({ id: "engine_platform", name: "Engine Platform", type: "StaticBody2D", parent: rootId, props: { x: 300, y: 470 }, visible: true });
      nodes.push({ id: "engine_platform_shape", name: "Platform Visual", type: "Shape", parent: "engine_platform", props: { x: 0, y: 0, width: 620, height: 24, color: "#38bdf8" }, visible: true });
      nodes.push({ id: "engine_platform_collider", name: "Collider", type: "Collider", parent: "engine_platform", props: { x: 0, y: 0, width: 620, height: 24 }, visible: true });
    }

    if (!hasNode(nodes, "engine_floor")) {
      nodes.push({ id: "engine_floor", name: "World Floor", type: "StaticBody2D", parent: rootId, props: { x: 0, y: 650 }, visible: true });
      nodes.push({ id: "engine_floor_shape", name: "Floor Visual", type: "Shape", parent: "engine_floor", props: { x: 0, y: 0, width: 1280, height: 70, color: "#2d1b46" }, visible: true });
      nodes.push({ id: "engine_floor_collider", name: "Collider", type: "Collider", parent: "engine_floor", props: { x: 0, y: 0, width: 1280, height: 70 }, visible: true });
    }
  }

  function projectForCanvasEngine() {
    const source = window.PixnariaEditorPreview?.getProjectForEngine?.();
    if (!source) return null;

    const project = structuredClone(source);
    project.settings ||= {};
    project.settings.dimensions ||= { width: 1280, height: 720 };
    project.settings.background ||= "#090712";
    project.settings.physics ||= { gravity: 1350, jumpForce: 560 };
    project.scene.nodes = (project.scene.nodes || []).map(normalizeNode);
    ensurePlayableBasics(project);
    return project;
  }

  function createEngine(project) {
    const canvas = $("[data-editor-engine-canvas]");
    const logTarget = $("[data-console-output]");
    if (!canvas) return null;
    const nextEngine = new PixnariaEngine({ canvas, logTarget, settings: project.settings });
    nextEngine.setScene(sceneFromPixna(project));
    return nextEngine;
  }

  function snapshotEngineNodes() {
    if (!engine?.scene?.root) return [];
    const snapshot = [];
    engine.scene.root.traverse((node) => {
      if (typeof node.x === "number" || typeof node.y === "number") {
        snapshot.push({
          id: node.id,
          x: node.x,
          y: node.y,
          velocityX: typeof node.velocityX === "number" ? node.velocityX : undefined,
          velocityY: typeof node.velocityY === "number" ? node.velocityY : undefined,
          onGround: typeof node.onGround === "boolean" ? node.onGround : undefined
        });
      }
    });
    return snapshot;
  }

  function syncToEditor() {
    if (!canvasMode || !engine) return;
    window.PixnariaEditorPreview?.updateNodesFromEngineSnapshot?.(snapshotEngineNodes());
    syncFrame = requestAnimationFrame(syncToEditor);
  }

  function startSync() {
    if (syncFrame) cancelAnimationFrame(syncFrame);
    syncFrame = requestAnimationFrame(syncToEditor);
  }

  function stopSync() {
    if (syncFrame) cancelAnimationFrame(syncFrame);
    syncFrame = null;
    if (engine) window.PixnariaEditorPreview?.updateNodesFromEngineSnapshot?.(snapshotEngineNodes());
  }

  function setCanvasMode(active) {
    canvasMode = active;
    window.PixnariaCanvasEngineActive = active;
    $(".viewport")?.classList.toggle("use-canvas-engine", active);
    const canvasButton = $("[data-run-canvas-engine]");
    if (canvasButton) {
      canvasButton.textContent = active ? "Stop Canvas" : "Canvas Engine";
      canvasButton.classList.toggle("is-playing", active);
    }
    window.PixnariaEditorPreview?.setCanvasPlayState?.(active);
  }

  function start() {
    const project = projectForCanvasEngine();
    if (!project) {
      log("editor project not ready");
      return;
    }

    window.PixnariaEditorPreview?.stopMockEngineForCanvas?.();
    if (engine) engine.stop();
    engine = createEngine(project);
    if (!engine) return;
    setCanvasMode(true);
    engine.renderOnce();
    engine.start();
    startSync();
    log(`loaded editor scene into real Canvas runtime (${project.scene.nodes.length} nodes)`);
    log("editor ↔ engine sync active: runtime positions update the Inspector");
  }

  function stop() {
    stopSync();
    if (engine) engine.stop();
    setCanvasMode(false);
    log("canvas runtime stopped; synced final node positions back to editor");
  }

  function toggle() {
    if (canvasMode) stop();
    else start();
  }

  function toggleFromPlay() {
    toggle();
  }

  function init() {
    const button = $("[data-run-canvas-engine]");
    if (!button) return;
    button.addEventListener("click", toggle);
  }

  const api = { init, start, stop, toggle, toggleFromPlay, projectForCanvasEngine };
  window.PixnariaEditorEngineBridge = api;
  return api;
})();

PixnariaEditorEngineBridge.init();
