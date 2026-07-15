export class Node {
  constructor(config = {}) {
    this.id = config.id || crypto.randomUUID();
    this.name = config.name || this.constructor.name;
    this.type = config.type || this.constructor.name;
    this.parent = null;
    this.children = [];
    this.visible = config.visible ?? true;
    this.locked = config.locked ?? false;
    this.props = config.props || {};
    this.started = false;
  }

  addChild(node) {
    node.parent = this;
    this.children.push(node);
    return node;
  }

  removeChild(node) {
    this.children = this.children.filter((child) => child !== node);
    node.parent = null;
  }

  traverse(callback) {
    callback(this);
    for (const child of this.children) child.traverse(callback);
  }

  findById(id) {
    if (this.id === id) return this;
    for (const child of this.children) {
      const found = child.findById(id);
      if (found) return found;
    }
    return null;
  }

  findByName(name) {
    if (this.name === name) return this;
    for (const child of this.children) {
      const found = child.findByName(name);
      if (found) return found;
    }
    return null;
  }

  getPath() {
    const parts = [];
    let cursor = this;
    while (cursor) {
      parts.unshift(cursor.name);
      cursor = cursor.parent;
    }
    return parts.join("/");
  }

  ready(_engine) {}
  update(_delta, _engine) {}
}

export class Node2D extends Node {
  constructor(config = {}) {
    super(config);
    const p = config.props || {};
    this.x = Number(p.x ?? config.x ?? 0);
    this.y = Number(p.y ?? config.y ?? 0);
    this.rotation = Number(p.rotation ?? 0);
    this.scaleX = Number(p.scaleX ?? p.scale ?? 1);
    this.scaleY = Number(p.scaleY ?? p.scale ?? 1);
    this.zIndex = Number(p.zIndex ?? 0);
  }

  get globalX() {
    return (this.parent?.globalX || 0) + this.x;
  }

  get globalY() {
    return (this.parent?.globalY || 0) + this.y;
  }
}

export class ShapeNode extends Node2D {
  constructor(config = {}) {
    super({ ...config, type: config.type || "Shape" });
    const p = config.props || {};
    this.shape = p.shape || "Rectangle";
    this.width = Number(p.width ?? 64);
    this.height = Number(p.height ?? 64);
    this.radius = Number(p.radius ?? 32);
    this.color = p.color || "#7c3aed";
  }
}

export class SpriteNode extends Node2D {
  constructor(config = {}) {
    super({ ...config, type: config.type || "Sprite" });
    const p = config.props || {};
    this.width = Number(p.width ?? 58);
    this.height = Number(p.height ?? 58);
    this.image = p.image || "none";
    this.tint = p.tint || "#a855f7";
  }
}

export class TextNode extends Node2D {
  constructor(config = {}) {
    super({ ...config, type: config.type || "Text" });
    const p = config.props || {};
    this.text = p.text || "Text";
    this.fontSize = Number(p.fontSize ?? 24);
    this.color = p.color || "#f5f3ff";
  }
}

export class ColliderNode extends Node2D {
  constructor(config = {}) {
    super({ ...config, type: config.type || "Collider" });
    const p = config.props || {};
    this.width = Number(p.width ?? 58);
    this.height = Number(p.height ?? 58);
    this.offsetX = Number(p.offsetX ?? 0);
    this.offsetY = Number(p.offsetY ?? 0);
    this.isTrigger = Boolean(p.isTrigger ?? false);
  }

  getAABB() {
    return {
      x: this.globalX + this.offsetX,
      y: this.globalY + this.offsetY,
      width: this.width,
      height: this.height,
      node: this
    };
  }
}

export class RigidBody2D extends Node2D {
  constructor(config = {}) {
    super({ ...config, type: config.type || "RigidBody2D" });
    const p = config.props || {};
    this.velocityX = Number(p.velocityX ?? 0);
    this.velocityY = Number(p.velocityY ?? 0);
    this.gravityScale = Number(p.gravityScale ?? 1);
    this.mass = Number(p.mass ?? 1);
    this.onGround = false;
    this.speed = Number(p.speed ?? 250);
    this.jumpForce = Number(p.jumpForce ?? 560);
  }
}

export class StaticBody2D extends Node2D {
  constructor(config = {}) {
    super({ ...config, type: config.type || "StaticBody2D" });
  }
}

export class Camera2D extends Node2D {
  constructor(config = {}) {
    super({ ...config, type: config.type || "Camera2D" });
    const p = config.props || {};
    this.zoom = Number(p.zoom ?? 1);
    this.active = p.active ?? true;
  }
}

export class TimerNode extends Node {
  constructor(config = {}) {
    super({ ...config, type: config.type || "Timer" });
    const p = config.props || {};
    this.waitTime = Number(p.waitTime ?? 1);
    this.elapsed = 0;
    this.oneShot = Boolean(p.oneShot ?? false);
    this.running = Boolean(p.autostart ?? false);
  }

  update(delta, engine) {
    if (!this.running) return;
    this.elapsed += delta;
    if (this.elapsed >= this.waitTime) {
      engine.log(`timer timeout: ${this.name}`);
      this.elapsed = 0;
      if (this.oneShot) this.running = false;
    }
  }
}
