import { InputManager } from "./pixnaria-input.js";
import { PhysicsWorld } from "./pixnaria-physics.js";
import { CanvasRenderer } from "./pixnaria-renderer.js";
import { Camera2D, Node } from "./pixnaria-nodes.js";

export class Scene {
  constructor(root = new Node({ id: "scene", name: "Scene", type: "Node" })) {
    this.root = root;
  }

  update(delta, engine) {
    this.root.traverse((node) => {
      if (!node.started) {
        node.ready(engine);
        node.started = true;
      }
      node.update(delta, engine);
    });
  }

  findActiveCamera() {
    let active = null;
    this.root.traverse((node) => {
      if (node instanceof Camera2D && node.active) active = node;
    });
    return active;
  }
}

export class PixnariaEngine {
  constructor({ canvas, logTarget, settings = {} }) {
    this.canvas = canvas;
    this.logTarget = logTarget;
    this.settings = settings;
    this.input = new InputManager();
    this.physics = new PhysicsWorld(settings.physics || {});
    this.renderer = new CanvasRenderer(canvas, {
      width: settings.dimensions?.width || 1280,
      height: settings.dimensions?.height || 720,
      background: settings.background || "#090712",
      debug: true
    });
    this.scene = new Scene();
    this.running = false;
    this.frameId = null;
    this.lastTime = 0;
    this.lastCollision = "";
  }

  setScene(scene) {
    this.scene = scene;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.input.bind();
    this.lastTime = performance.now();
    this.log("engine started");
    this.frameId = requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    this.running = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.log("engine stopped");
    this.renderer.render(this.scene, this);
  }

  toggle() {
    if (this.running) this.stop();
    else this.start();
  }

  loop(time) {
    if (!this.running) return;
    const delta = Math.min(0.05, (time - this.lastTime) / 1000);
    this.lastTime = time;
    this.lastCollision = "";

    this.scene.update(delta, this);
    this.physics.step(this.scene, delta, this);
    this.renderer.render(this.scene, this);
    this.input.beginFrame();

    this.frameId = requestAnimationFrame((next) => this.loop(next));
  }

  renderOnce() {
    this.renderer.render(this.scene, this);
  }

  log(message) {
    const line = `> ${message}`;
    if (this.logTarget) {
      this.logTarget.textContent += `${line}\n`;
      this.logTarget.scrollTop = this.logTarget.scrollHeight;
    }
    console.log(`[PixnariaEngine] ${message}`);
  }
}
