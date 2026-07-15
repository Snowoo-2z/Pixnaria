export class InputManager {
  constructor(target = window) {
    this.target = target;
    this.keys = new Set();
    this.previous = new Set();
    this.actions = {
      move_left: ["arrowleft", "a"],
      move_right: ["arrowright", "d"],
      move_up: ["arrowup", "w"],
      move_down: ["arrowdown", "s"],
      jump: [" ", "arrowup", "w"]
    };
    this.bound = false;
  }

  bind() {
    if (this.bound) return;
    this.bound = true;
    window.addEventListener("keydown", (event) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName);
      if (typing) return;
      const key = event.key.toLowerCase();
      if (this.isManagedKey(key)) event.preventDefault();
      this.keys.add(key);
    });
    window.addEventListener("keyup", (event) => this.keys.delete(event.key.toLowerCase()));
    window.addEventListener("blur", () => this.keys.clear());
  }

  isManagedKey(key) {
    return Object.values(this.actions).some((keys) => keys.includes(key));
  }

  beginFrame() {
    this.previous = new Set(this.keys);
  }

  isKeyDown(key) {
    return this.keys.has(key.toLowerCase());
  }

  isActionPressed(action) {
    return (this.actions[action] || []).some((key) => this.keys.has(key));
  }

  isActionJustPressed(action) {
    return (this.actions[action] || []).some((key) => this.keys.has(key) && !this.previous.has(key));
  }

  pressVirtual(action) {
    const key = this.actions[action]?.[0];
    if (key) this.keys.add(key);
  }

  releaseVirtual(action) {
    for (const key of this.actions[action] || []) this.keys.delete(key);
  }
}
