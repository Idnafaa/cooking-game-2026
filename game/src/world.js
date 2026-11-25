// Dapur Arang — world state: orders, the chopping board, the pan, the plate.
// A dish is built one ingredient at a time: bin -> board (chop) -> pan
// (fry) -> plate. Serving a plate that matches a ticket earns coins.

import {
  BURN_SECONDS, CHOP_TAPS, FRY_SECONDS, INGREDIENTS, MAX_ORDERS,
  RECIPES, SHIFT_SECONDS, ingredientById, levelFor, orderTimeFor, recipeById,
} from './config.js';
import { pick } from './random.js';

export function createWorld(rand) {
  const state = {
    screen: 'title', // title | play | over
    paused: false,
    muted: false,
    seed: 0,
    time: 0,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    failed: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    orders: [], // {id, recipeId, left, total}
    board: null, // {ingId, taps} raw piece waiting to be chopped
    chopped: [], // ingIds chopped and waiting for the pan
    pan: null, // {ingId, fry, state: 'frying'|'ready'|'burnt'}
    plate: [], // cooked ingIds on the serving plate
    toast: '',
    toastAt: 0,
    steam: [],
    nextOrderId: 1,
    orderTimer: 0,
    flash: 0,
  };

  function say(text) {
    state.toast = text;
    state.toastAt = state.time;
  }

  function spawnOrder() {
    const recipe = pick(rand, RECIPES);
    const total = orderTimeFor(state.level);
    state.orders.push({ id: state.nextOrderId++, recipeId: recipe.id, left: total, total });
  }

  function reset() {
    state.screen = 'play';
    state.paused = false;
    state.time = 0;
    state.shiftLeft = SHIFT_SECONDS;
    state.score = 0;
    state.coins = 0;
    state.served = 0;
    state.failed = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.level = 1;
    state.orders = [];
    state.board = null;
    state.chopped = [];
    state.pan = null;
    state.plate = [];
    state.nextOrderId = 1;
    state.orderTimer = 0;
    state.flash = 0;
    spawnOrder();
    spawnOrder();
    say('Shift started — serve the tickets!');
  }

  function takeIngredient(ingId) {
    if (state.screen !== 'play' || state.paused) return false;
    if (state.board) { say('Board is busy — chop it first!'); return false; }
    const ing = ingredientById(ingId);
    if (!ing) return false;
    state.board = { ingId, taps: 0, needsChop: ing.chop };
    if (!ing.chop) {
      // Eggs and cheese skip the knife and go straight to the chopped tray.
      state.chopped.push(ingId);
      state.board = null;
      say(`${ing.name} cracked — to the pan!`);
    } else {
      say(`${ing.name} on the board — chop! (Space / click)`);
    }
    return true;
  }

  function chop() {
    if (state.screen !== 'play' || state.paused || !state.board) return false;
    state.board.taps += 1;
    puff(640, 560, ingredientById(state.board.ingId).color);
    if (state.board.taps >= CHOP_TAPS) {
      state.chopped.push(state.board.ingId);
      say(`${ingredientById(state.board.ingId).name} chopped!`);
      state.board = null;
    }
    return true;
  }

  function panAction() {
    if (state.screen !== 'play' || state.paused) return false;
    if (state.pan) {
      if (state.pan.state === 'burnt') {
        say('Burnt! Tossed in the bin.');
        state.pan = null;
        state.combo = 0;
        return true;
      }
      if (state.pan.state === 'ready') {
        state.plate.push(state.pan.ingId);
        say(`${ingredientById(state.pan.ingId).name} on the plate!`);
        state.pan = null;
        return true;
      }
      say('Still frying — wait for the golden glow!');
      return false;
    }
    if (state.chopped.length === 0) { say('Nothing chopped yet!'); return false; }
    const ingId = state.chopped.shift();
    state.pan = { ingId, fry: 0, state: 'frying' };
    say(`${ingredientById(ingId).name} sizzling…`);
    return true;
  }

  function clearPlate() {
    if (state.screen !== 'play' || state.paused) return false;
    if (state.plate.length === 0) return false;
    state.plate = [];
    state.combo = 0;
    say('Plate cleared.');
    return true;
  }

  function serve() {
    if (state.screen !== 'play' || state.paused) return false;
    if (state.plate.length === 0) { say('Plate is empty!'); return false; }
    const plateSet = [...state.plate].sort().join(',');
    const match = state.orders.find((o) => {
      const r = recipeById(o.recipeId);
      return [...r.needs].sort().join(',') === plateSet;
    });
    if (!match) {
      say('No ticket wants this dish — check the board!');
      state.combo = 0;
      return false;
    }
    const recipe = recipeById(match.recipeId);
    const timeBonus = Math.round((match.left / match.total) * 60);
    const comboBonus = state.combo * 10;
    const earned = recipe.price + timeBonus + comboBonus;
    state.score += earned;
    state.coins += earned;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.orders = state.orders.filter((o) => o.id !== match.id);
    state.plate = [];
    state.flash = 1;
    say(`Served ${recipe.name}! +${earned} (combo x${state.combo})`);
    const newLevel = levelFor(state.served);
    if (newLevel > state.level) {
      state.level = newLevel;
      say(`Level ${state.level} — the rush gets hotter!`);
    }
    return true;
  }

  function puff(x, y, color) {
    for (let i = 0; i < 6; i++) {
      state.steam.push({ x: x + (rand() - 0.5) * 60, y: y + (rand() - 0.5) * 20, vy: -30 - rand() * 30, life: 0.7, color });
    }
  }

  function update(dt) {
    if (state.screen !== 'play' || state.paused) return;
    state.time += dt;
    state.shiftLeft -= dt;
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 2);
    // Orders tick down; an expired ticket is lost.
    for (const o of state.orders) o.left -= dt;
    const expired = state.orders.filter((o) => o.left <= 0);
    if (expired.length > 0) {
      state.orders = state.orders.filter((o) => o.left > 0);
      state.failed += expired.length;
      state.combo = 0;
      say(`Ticket expired! ${expired.length} customer${expired.length > 1 ? 's' : ''} walked out.`);
    }
    // New tickets drift in while the shift runs.
    state.orderTimer += dt;
    if (state.orders.length < MAX_ORDERS && state.orderTimer > 6) {
      state.orderTimer = 0;
      spawnOrder();
    }
    // The pan fries, then burns if forgotten.
    if (state.pan && state.pan.state === 'frying') {
      state.pan.fry += dt;
      if (state.pan.fry >= FRY_SECONDS) {
        state.pan.state = 'ready';
        say(`${ingredientById(state.pan.ingId).name} is golden — plate it!`);
      }
    } else if (state.pan && state.pan.state === 'ready') {
      state.pan.fry += dt;
      if (state.pan.fry >= FRY_SECONDS + BURN_SECONDS) {
        state.pan.state = 'burnt';
        say('It burnt! Click the pan to bin it.');
      }
    }
    // Steam drifts up and fades.
    for (const s of state.steam) { s.y += s.vy * dt; s.life -= dt; }
    state.steam = state.steam.filter((s) => s.life > 0);
    if (state.shiftLeft <= 0) {
      state.shiftLeft = 0;
      state.screen = 'over';
      say('Shift over!');
    }
  }

  return {
    state, reset, takeIngredient, chop, panAction, clearPlate, serve, update, say,
  };
}

export { INGREDIENTS };
