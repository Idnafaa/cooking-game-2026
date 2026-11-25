// Dapur Arang — deterministic screenshot staging for ?shot=.
// start: title screen over a dressed kitchen. play: mid-shift with two
// tickets, a dish half-built on the plate, food frying and a chop in
// progress. end: the shift-over summary. All from the same world code
// the player uses, so the shots are real renders of the game.

import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

export function stageShot(name, world) {
  const s = world.state;
  if (name === 'start') {
    world.reset();
    s.screen = SCREEN_TITLE;
    s.score = 0;
    s.time = 0;
    return SCREEN_TITLE;
  }
  if (name === 'play') {
    world.reset();
    // A busy mid-shift: two tickets, one nearly out of patience.
    s.orders[0].left = 14;
    s.orders[1].left = 38;
    s.score = 340;
    s.coins = 340;
    s.served = 3;
    s.combo = 2;
    s.shiftLeft = 96;
    s.time = 54;
    // Dish mid-assembly: two of three omelet parts already plated.
    s.plate = ['egg', 'cheese'];
    // A tomato frying, nearly golden; a chopped onion waiting.
    s.pan = { ingId: 'tomato', fry: 3.6, state: 'frying' };
    s.chopped = ['onion'];
    // An onion half-chopped on the board.
    s.board = { ingId: 'onion', taps: 2, needsChop: true };
    s.toast = 'Omelet Keju needs tomato — plate it fast!';
    s.toastAt = s.time;
    s.steam = [
      { x: 660, y: 590, vy: -40, life: 0.7, color: '#e8dcc8' },
      { x: 640, y: 610, vy: -35, life: 0.5, color: '#e8dcc8' },
      { x: 680, y: 600, vy: -45, life: 0.6, color: '#e8dcc8' },
    ];
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    world.reset();
    s.screen = SCREEN_OVER;
    s.score = 1240;
    s.coins = 1240;
    s.served = 9;
    s.failed = 2;
    s.bestCombo = 4;
    s.level = 3;
    s.shiftLeft = 0;
    s.orders = [];
    s.plate = [];
    s.pan = null;
    s.board = null;
    return SCREEN_OVER;
  }
  return SCREEN_TITLE;
}
