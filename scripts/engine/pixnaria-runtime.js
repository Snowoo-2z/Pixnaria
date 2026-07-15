import { Scene } from "./pixnaria-core.js";
import { Camera2D, ColliderNode, Node, Node2D, RigidBody2D, ShapeNode, SpriteNode, StaticBody2D, TextNode, TimerNode } from "./pixnaria-nodes.js";

const NODE_TYPES = {
  Node,
  Node2D,
  Sprite: SpriteNode,
  SpriteNode,
  Shape: ShapeNode,
  ShapeNode,
  Text: TextNode,
  TextNode,
  Collider: ColliderNode,
  ColliderNode,
  RigidBody2D,
  StaticBody2D,
  Camera2D,
  Timer: TimerNode,
  TimerNode
};

export function createNode(config = {}) {
  const Klass = NODE_TYPES[config.type] || Node2D;
  return new Klass(config);
}

export function sceneFromPixna(project) {
  const nodeConfigs = project.scene?.nodes || [];
  const byId = new Map();

  for (const config of nodeConfigs) {
    byId.set(config.id, createNode(config));
  }

  let root = byId.get(project.scene?.rootNodeId) || byId.values().next().value || new Node({ id: "scene", name: "Scene" });

  for (const config of nodeConfigs) {
    const node = byId.get(config.id);
    if (!node || !config.parent) continue;
    const parent = byId.get(config.parent);
    if (parent) parent.addChild(node);
  }

  return new Scene(root);
}

export function demoProject() {
  return {
    pixnariaFormat: "pixna-json-prototype",
    formatVersion: 1,
    metadata: {
      name: "Pixnaria Engine Demo",
      author: "Snowoo"
    },
    settings: {
      dimensions: { width: 1280, height: 720 },
      background: "#090712",
      physics: { gravity: 1350, jumpForce: 560 }
    },
    scene: {
      rootNodeId: "scene",
      nodes: [
        { id: "scene", name: "Scene", type: "Node2D", parent: null, props: { x: 0, y: 0 } },
        { id: "camera", name: "Camera2D", type: "Camera2D", parent: "scene", props: { x: 640, y: 360, zoom: 1, active: true } },
        { id: "title", name: "Title", type: "Text", parent: "scene", props: { x: 420, y: 120, text: "Pixnaria Engine 0.1", fontSize: 38, color: "#f5f3ff" } },
        { id: "player", name: "Player", type: "RigidBody2D", parent: "scene", props: { x: 410, y: 250, speed: 285, jumpForce: 580 } },
        { id: "player_sprite", name: "Sprite", type: "Sprite", parent: "player", props: { x: 0, y: 0, width: 58, height: 58, tint: "#a855f7" } },
        { id: "player_collider", name: "Collider", type: "Collider", parent: "player", props: { x: 0, y: 0, width: 58, height: 58 } },
        { id: "platform", name: "Platform", type: "StaticBody2D", parent: "scene", props: { x: 300, y: 470 } },
        { id: "platform_shape", name: "PlatformVisual", type: "Shape", parent: "platform", props: { x: 0, y: 0, width: 620, height: 24, color: "#38bdf8" } },
        { id: "platform_collider", name: "Collider", type: "Collider", parent: "platform", props: { x: 0, y: 0, width: 620, height: 24 } },
        { id: "floor", name: "World Floor", type: "StaticBody2D", parent: "scene", props: { x: 0, y: 650 } },
        { id: "floor_shape", name: "FloorVisual", type: "Shape", parent: "floor", props: { x: 0, y: 0, width: 1280, height: 70, color: "#2d1b46" } },
        { id: "floor_collider", name: "Collider", type: "Collider", parent: "floor", props: { x: 0, y: 0, width: 1280, height: 70 } },
        { id: "orb", name: "Neon Orb", type: "Shape", parent: "scene", props: { x: 930, y: 290, shape: "Circle", radius: 34, color: "#d946ef" } }
      ]
    },
    scripts: {},
    assets: []
  };
}
