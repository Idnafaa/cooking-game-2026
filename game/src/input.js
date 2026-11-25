// Dapur Arang — input: mouse clicks on the kitchen zones plus keyboard.
// Zones are expressed in the 1280x800 view space and scaled from the canvas.

import { INGREDIENTS, VIEW_W } from './config.js';

const ZONES = {
  board: { x: 60, y: 540, w: 300, h: 150 },
  pan: { x: 480, y: 540, w: 360, h: 150 },
  plate: { x: 880, y: 540, w: 340, h: 150 },
  serve: { x: 1080, y: 668, w: 120, h: 34 },
};

function inZone(z, x, y) {
  return x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
}

export function createInput(canvas, world, hooks) {
  function toView(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((event.clientY - rect.top) / rect.height) * 800,
    };
  }

  function clickAt(x, y) {
    const s = world.state;
    if (s.screen !== 'play') { hooks.start(); return; }
    // Ingredient bins.
    for (let i = 0; i < INGREDIENTS.length; i++) {
      const bx = 60 + i * 200;
      if (x >= bx && x <= bx + 176 && y >= 414 && y <= 510) {
        hooks.take(INGREDIENTS[i].id);
        return;
      }
    }
    if (inZone(ZONES.serve, x, y)) { hooks.serve(); return; }
    if (inZone(ZONES.board, x, y)) { hooks.chop(); return; }
    if (inZone(ZONES.pan, x, y)) { hooks.pan(); return; }
    if (inZone(ZONES.plate, x, y)) { hooks.clearPlate(); return; }
  }

  canvas.addEventListener('click', (event) => {
    const p = toView(event);
    clickAt(p.x, p.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const s = world.state;
    const key = event.key.toLowerCase();
    if (key === 'enter') { hooks.start(); return; }
    if (s.screen !== 'play') return;
    if (key === 'p') { hooks.togglePause(); return; }
    if (key === 'm') { hooks.toggleMute(); return; }
    if (s.paused) return;
    const ing = INGREDIENTS.find((g) => g.key === key);
    if (ing) { hooks.take(ing.id); return; }
    if (key === ' ' || key === 'c') { event.preventDefault(); hooks.chop(); return; }
    if (key === 'f') { hooks.pan(); return; }
    if (key === 's') { hooks.serve(); return; }
    if (key === 'x') { hooks.clearPlate(); return; }
  });
}
