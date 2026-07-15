import { ColliderNode, RigidBody2D, StaticBody2D } from "./pixnaria-nodes.js";

export class PhysicsWorld {
  constructor(settings = {}) {
    this.gravity = Number(settings.gravity ?? 1350);
    this.maxFallSpeed = Number(settings.maxFallSpeed ?? 900);
    this.debug = true;
  }

  step(scene, delta, engine) {
    const bodies = [];
    const staticColliders = [];

    scene.root.traverse((node) => {
      if (!node.visible) return;
      if (node instanceof RigidBody2D) bodies.push(node);
      if (node instanceof StaticBody2D) {
        const collider = this.findCollider(node);
        if (collider) staticColliders.push(collider);
      }
    });

    for (const body of bodies) {
      this.applyBody(body, staticColliders, delta, engine);
    }
  }

  findCollider(node) {
    return node.children.find((child) => child instanceof ColliderNode && child.visible);
  }

  bodyRect(body) {
    const collider = this.findCollider(body);
    if (collider) return collider.getAABB();
    return { x: body.globalX, y: body.globalY, width: 58, height: 58, node: body };
  }

  applyBody(body, staticColliders, delta, engine) {
    body.onGround = false;

    if (engine.input.isActionPressed("move_left")) body.velocityX = -body.speed;
    else if (engine.input.isActionPressed("move_right")) body.velocityX = body.speed;
    else body.velocityX = 0;

    if (engine.input.isActionJustPressed("jump") && body._wasOnGround) {
      body.velocityY = -body.jumpForce;
      engine.log(`${body.name} jump`);
    }

    body.velocityY = Math.min(this.maxFallSpeed, body.velocityY + this.gravity * body.gravityScale * delta);

    body.x += body.velocityX * delta;
    const previousY = body.y;
    body.y += body.velocityY * delta;

    const rect = this.bodyRect(body);
    const previousBottom = previousY + rect.height;

    for (const collider of staticColliders) {
      const other = collider.getAABB();
      const hitHorizontal = rect.x < other.x + other.width && rect.x + rect.width > other.x;
      const fallingOnto = previousBottom <= other.y && rect.y + rect.height >= other.y && body.velocityY >= 0;
      if (hitHorizontal && fallingOnto) {
        body.y = other.y - rect.height - (rect.y - body.y);
        body.velocityY = 0;
        body.onGround = true;
        engine.lastCollision = `${body.name} on ${collider.parent?.name || collider.name}`;
        break;
      }
    }

    body._wasOnGround = body.onGround;
  }
}
