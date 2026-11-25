// Dapur Arang — Charcoal Rush: game loop, screens and wiring.
// The world holds the kitchen state, the renderer paints it, input feeds
// it, and the sound synth answers it. A ?shot= query stages a fixed
// scene for screenshots instead of starting a live shift.

import { BEST_KEY } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, createRenderer } from './render.js';
import { createInput } from './input.js';
import { createSound } from './sound.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const sound = createSound();

function readBest() {
  try { return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; } catch { return 0; }
}

function saveBest(value) {
  try { window.localStorage.setItem(BEST_KEY, String(value)); } catch { /* private mode */ }
}

let screen = SCREEN_TITLE;
let best = readBest();

function announce(message) {
  status.textContent = message;
}

function startShift() {
  world.reset();
  screen = SCREEN_PLAY;
  announce('Shift started. Serve the tickets before their timers run out.');
  sound.sizzle();
}

function endShift() {
  screen = SCREEN_OVER;
  if (world.state.score > best) {
    best = world.state.score;
    saveBest(best);
  }
  announce(`Shift over. Score ${world.state.score}. Dishes served ${world.state.served}. Best ${best}.`);
}

const hooks = {
  start() {
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startShift();
  },
  take(id) { if (world.takeIngredient(id)) sound.chop(); },
  chop() { if (world.chop()) sound.chop(); },
  pan() {
    const before = world.state.pan && world.state.pan.state;
    if (world.panAction()) {
      if (before === 'ready') sound.plate();
      else sound.sizzle();
    } else sound.bad();
  },
  serve() { if (world.serve()) sound.serve(); else sound.bad(); },
  clearPlate() { if (world.clearPlate()) sound.bad(); },
  togglePause() {
    world.state.paused = !world.state.paused;
    announce(world.state.paused ? 'Paused.' : 'Playing.');
  },
  toggleMute() {
    world.state.muted = !world.state.muted;
    sound.setMuted(world.state.muted);
    announce(world.state.muted ? 'Sound off.' : 'Sound on.');
  },
};

createInput(canvas, world, hooks);

function runShot(name) {
  screen = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, screen, best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    if (screen === SCREEN_PLAY && !world.state.paused) {
      world.update(dt);
      if (world.state.screen === 'over') endShift();
    }
    renderer.draw(world.state, screen, best);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
