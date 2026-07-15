import { Camera2D, ColliderNode, ShapeNode, SpriteNode, TextNode } from "./pixnaria-nodes.js";

export class CanvasRenderer {
  constructor(canvas, settings = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.background = settings.background || "#090712";
    this.debug = settings.debug ?? true;
    this.resize(settings.width || 1280, settings.height || 720);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  render(scene, engine) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.width, this.height);
    this.drawGrid(ctx);

    const camera = scene.findActiveCamera();
    ctx.save();
    if (camera) {
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x + this.width / 2 / camera.zoom, -camera.y + this.height / 2 / camera.zoom);
    }

    const nodes = [];
    scene.root.traverse((node) => {
      if (node.visible) nodes.push(node);
    });
    nodes.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    for (const node of nodes) this.renderNode(ctx, node);
    if (this.debug) for (const node of nodes) this.renderDebug(ctx, node);

    ctx.restore();

    ctx.fillStyle = "rgba(11,7,18,.72)";
    ctx.strokeStyle = "rgba(168,85,247,.28)";
    ctx.lineWidth = 1;
    this.roundRect(ctx, 18, 18, 360, 42, 20, true, true);
    ctx.fillStyle = "#d8b4fe";
    ctx.font = "bold 16px system-ui";
    ctx.fillText(`Pixnaria Engine 0.1 · ${engine.running ? "Running" : "Stopped"}`, 36, 45);

    if (engine.lastCollision) {
      ctx.fillStyle = "#bbf7d0";
      ctx.fillText(`Collision: ${engine.lastCollision}`, 36, 72);
    }
  }

  drawGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
    }
    ctx.restore();
  }

  renderNode(ctx, node) {
    if (node instanceof ShapeNode) {
      ctx.fillStyle = node.color;
      if (node.shape === "Circle") {
        ctx.beginPath();
        ctx.arc(node.globalX, node.globalY, node.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        this.roundRect(ctx, node.globalX, node.globalY, node.width, node.height, 10, true, false);
      }
    }

    if (node instanceof SpriteNode) {
      const gradient = ctx.createLinearGradient(node.globalX, node.globalY, node.globalX + node.width, node.globalY + node.height);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, node.tint);
      ctx.fillStyle = gradient;
      this.roundRect(ctx, node.globalX, node.globalY, node.width, node.height, 14, true, false);
    }

    if (node instanceof TextNode) {
      ctx.fillStyle = node.color;
      ctx.font = `bold ${node.fontSize}px system-ui`;
      ctx.fillText(node.text, node.globalX, node.globalY);
    }
  }

  renderDebug(ctx, node) {
    if (!(node instanceof ColliderNode)) return;
    const box = node.getAABB();
    ctx.save();
    ctx.strokeStyle = node.isTrigger ? "#38bdf8" : "#22c55e";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}
