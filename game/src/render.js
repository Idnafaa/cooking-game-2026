// Dapur Arang — canvas renderer. Everything on screen is drawn by hand:
// tiles, charcoal stove, wooden counter, tickets and the food itself.

import { CHOP_TAPS, FRY_SECONDS, INGREDIENTS, VIEW_H, VIEW_W, ingredientById, recipeById } from './config.js';

const WOOD = '#8a5a33';
const WOOD_DARK = '#6b4222';
const TILE_A = '#f2e3c6';
const TILE_B = '#e6d3ae';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW_W * dpr;
  canvas.height = VIEW_H * dpr;
  ctx.scale(dpr, dpr);

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(str, x, y, size, color, weight = '700', align = 'left') {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  }

  function drawIngredient(id, x, y, r) {
    const ing = ingredientById(id);
    ctx.save();
    ctx.translate(x, y);
    if (id === 'tomato') {
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3f7d3a';
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(-r * 0.35, -r * 1.25); ctx.lineTo(r * 0.35, -r * 1.25); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.28, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'onion') {
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ing.dark; ctx.lineWidth = 2;
      for (const k of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.arc(k * r * 0.4, 0, r * 0.8, -1.1, 1.1); ctx.stroke(); }
      ctx.fillStyle = '#7fae6a';
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(-r * 0.2, -r * 1.4); ctx.lineTo(r * 0.2, -r * 1.4); ctx.closePath(); ctx.fill();
    } else if (id === 'mushroom') {
      ctx.fillStyle = '#d8c49a';
      ctx.fillRect(-r * 0.35, -r * 0.1, r * 0.7, r * 0.9);
      ctx.fillStyle = '#b06a3b';
      ctx.beginPath(); ctx.arc(0, -r * 0.15, r, Math.PI, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.arc(-r * 0.4, -r * 0.55, r * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.75, r * 0.12, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'chili') {
      ctx.strokeStyle = ing.color; ctx.lineWidth = r * 0.55; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-r * 0.8, -r * 0.5); ctx.quadraticCurveTo(0, r * 0.9, r * 0.85, -r * 0.35); ctx.stroke();
      ctx.strokeStyle = '#3f7d3a'; ctx.lineWidth = r * 0.25;
      ctx.beginPath(); ctx.moveTo(r * 0.85, -r * 0.35); ctx.lineTo(r * 1.15, -r * 0.7); ctx.stroke();
    } else if (id === 'egg') {
      ctx.fillStyle = '#fdf6e0';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.42, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'cheese') {
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.moveTo(-r, r * 0.7); ctx.lineTo(0, -r); ctx.lineTo(r, r * 0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = ing.dark;
      ctx.beginPath(); ctx.arc(-r * 0.3, r * 0.2, r * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.25, r * 0.35, r * 0.12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawTicket(o, x, y, w, h) {
    const recipe = recipeById(o.recipeId);
    const frac = Math.max(0, o.left / o.total);
    const urgent = frac < 0.3;
    ctx.fillStyle = urgent ? '#fff0e0' : '#fffaf0';
    rr(x, y, w, h, 10); ctx.fill();
    ctx.strokeStyle = urgent ? '#d9381e' : '#c9a86a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#e2483d';
    ctx.beginPath(); ctx.arc(x + w - 18, y + 18, 9, 0, Math.PI * 2); ctx.fill();
    text(`#${o.id}`, x + w - 18, y + 18, 13, '#fff', '800', 'center');
    text(recipe.name, x + 14, y + 24, 21, '#3a2415', '800');
    recipe.needs.forEach((id, i) => drawIngredient(id, x + 34 + i * 52, y + 62, 17));
    text(`Rp ${recipe.price}`, x + 14, y + 96, 15, '#7a5a2e', '700');
    // Patience bar.
    ctx.fillStyle = '#e8dcc8';
    rr(x + 120, y + 88, w - 140, 12, 6); ctx.fill();
    ctx.fillStyle = urgent ? '#d9381e' : frac < 0.6 ? '#e8a13a' : '#4d9e57';
    if (frac > 0) { rr(x + 120, y + 88, (w - 140) * frac, 12, 6); ctx.fill(); }
    text(`${Math.ceil(o.left)}s`, x + w - 14, y + 62, 20, urgent ? '#d9381e' : '#3a2415', '800', 'right');
  }

  function draw(s, screen, best) {
    // Wall tiles.
    for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 16; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? TILE_A : TILE_B;
      ctx.fillRect(tx * 80, 64 + ty * 52, 80, 52);
    }
    // Window with a dusk street.
    ctx.fillStyle = '#7fb3d5'; rr(1050, 76, 190, 104, 8); ctx.fill();
    ctx.fillStyle = '#f6d860'; ctx.beginPath(); ctx.arc(1095, 108, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5b7d9e'; ctx.fillRect(1050, 148, 190, 32);
    ctx.fillStyle = '#3a2415'; ctx.fillRect(1136, 76, 8, 104); ctx.fillRect(1050, 124, 190, 8);
    text('DAPUR ARANG', 40, 96, 26, '#3a2415', '800');
    text('charcoal kitchen rush', 40, 122, 14, '#7a5a2e', '600');

    // Top bar.
    ctx.fillStyle = '#2c1c10'; ctx.fillRect(0, 0, VIEW_W, 56);
    text('DAPUR ARANG', 24, 29, 24, '#f6d860', '800');
    text(`SCORE  ${s.score}`, 330, 29, 20, '#fff', '800');
    text(`COINS  ${s.coins}`, 520, 29, 20, '#f6d860', '800');
    text(`LEVEL  ${s.level}`, 700, 29, 20, '#fff', '800');
    text(`SERVED  ${s.served}`, 850, 29, 20, '#fff', '800');
    const shiftUrgent = s.shiftLeft < 30;
    text(`SHIFT  ${Math.floor(s.shiftLeft / 60)}:${String(Math.ceil(s.shiftLeft % 60)).padStart(2, '0')}`,
      1252, 29, 22, shiftUrgent ? '#ff8a70' : '#fff', '800', 'right');

    // Order board.
    ctx.fillStyle = '#4a2f1a'; rr(24, 192, VIEW_W - 48, 8, 4); ctx.fill();
    ctx.fillStyle = '#2c1c10'; rr(32, 204, 170, 26, 8); ctx.fill();
    text('ORDER BOARD', 117, 218, 16, '#f6d860', '800', 'center');
    if (s.orders.length === 0) text('No tickets — a breather!', 420, 268, 18, '#8a6a45', '600');
    s.orders.forEach((o, i) => drawTicket(o, 40 + i * 400, 228, 380, 116));

    // Wooden counter.
    ctx.fillStyle = WOOD; rr(24, 372, VIEW_W - 48, 396, 14); ctx.fill();
    ctx.fillStyle = WOOD_DARK; ctx.fillRect(24, 372, VIEW_W - 48, 10);

    // Ingredient bins.
    text('INGREDIENTS — click a bin, or press 1–6', 48, 400, 15, '#f7ead2', '800');
    INGREDIENTS.forEach((ing, i) => {
      const x = 60 + i * 200;
      const y = 414;
      ctx.fillStyle = '#5d3a1c'; rr(x, y, 176, 96, 10); ctx.fill();
      ctx.fillStyle = '#3d2410'; rr(x + 8, y + 8, 160, 80, 8); ctx.fill();
      drawIngredient(ing.id, x + 44, y + 48, 26);
      text(ing.name, x + 84, y + 38, 17, '#fff', '700');
      text(`[${ing.key}]`, x + 84, y + 62, 15, '#f6d860', '700');
      text(ing.chop ? 'chop it' : 'no chop', x + 84, y + 80, 12, '#c9a86a', '600');
    });

    // Chopping board.
    const bx = 60, by = 540;
    ctx.fillStyle = '#d9b078'; rr(bx, by, 300, 150, 12); ctx.fill();
    ctx.strokeStyle = '#a97e4a'; ctx.lineWidth = 3; rr(bx + 6, by + 6, 288, 138, 10); ctx.stroke();
    text('CHOPPING BOARD', bx + 16, by + 24, 14, '#6b4222', '800');
    if (s.board) {
      drawIngredient(s.board.ingId, bx + 150, by + 82, 34);
      const frac = s.board.taps / CHOP_TAPS;
      ctx.fillStyle = '#fff'; rr(bx + 30, by + 118, 240, 10, 5); ctx.fill();
      ctx.fillStyle = '#4d9e57'; rr(bx + 30, by + 118, 240 * frac, 10, 5); ctx.fill();
      text('Click / Space to chop', bx + 150, by + 142, 13, '#6b4222', '700', 'center');
    } else {
      text('empty — take an ingredient', bx + 150, by + 82, 15, '#8a6a45', '600', 'center');
    }
    // Chopped tray: a narrow shelf between board and stove.
    text('CHOPPED', 420, 560, 12, '#f7ead2', '800', 'center');
    s.chopped.forEach((id, i) => drawIngredient(id, 420, 592 + i * 48, 16));

    // Charcoal stove + pan.
    const px = 480, py = 540;
    ctx.fillStyle = '#3a3a3f'; rr(px, py, 360, 150, 12); ctx.fill();
    ctx.fillStyle = '#232327'; rr(px + 16, py + 16, 328, 118, 10); ctx.fill();
    // Charcoal glow.
    ctx.fillStyle = '#ff7a2f';
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(px + 60 + i * 56, py + 118, 10, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#2b2b30';
    ctx.beginPath(); ctx.arc(px + 180, py + 78, 62, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#55555c'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(px + 180, py + 78, 62, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#1a1a1e';
    ctx.beginPath(); ctx.arc(px + 180, py + 78, 50, 0, Math.PI * 2); ctx.fill();
    if (s.pan) {
      drawIngredient(s.pan.ingId, px + 180, py + 78, 30);
      if (s.pan.state === 'frying') {
        const frac = Math.min(1, s.pan.fry / FRY_SECONDS);
        ctx.fillStyle = '#fff'; rr(px + 90, py + 148, 180, 10, 5); ctx.fill();
        ctx.fillStyle = '#e8a13a'; rr(px + 90, py + 148, 180 * frac, 10, 5); ctx.fill();
        text('frying…', px + 180, py + 30, 13, '#f6d860', '700', 'center');
      } else if (s.pan.state === 'ready') {
        ctx.strokeStyle = '#4d9e57'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(px + 180, py + 78, 56, 0, Math.PI * 2); ctx.stroke();
        text('GOLDEN! click pan to plate it', px + 180, py + 30, 13, '#7ddb8a', '700', 'center');
      } else {
        text('BURNT! click pan to bin it', px + 180, py + 30, 13, '#ff8a70', '700', 'center');
      }
    } else {
      text('STOVE — click to fry chopped food', px + 180, py + 30, 13, '#c9a86a', '700', 'center');
    }

    // Serving plate.
    const qx = 880, qy = 540;
    ctx.fillStyle = '#efe6d0'; rr(qx, qy, 340, 150, 12); ctx.fill();
    text('SERVING PLATE', qx + 18, qy + 24, 15, '#6b4222', '800');
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(qx + 170, qy + 88, 110, 42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(qx + 170, qy + 88, 110, 42, 0, 0, Math.PI * 2); ctx.stroke();
    if (s.plate.length === 0) text('empty plate', qx + 170, qy + 88, 15, '#b09a72', '600', 'center');
    s.plate.forEach((id, i) => drawIngredient(id, qx + 110 + i * 60, qy + 88, 22));
    // Serve button.
    ctx.fillStyle = s.plate.length > 0 ? '#4d9e57' : '#8a8a8a';
    rr(qx + 200, qy + 128, 120, 34, 8); ctx.fill();
    text('SERVE  [S]', qx + 260, qy + 146, 16, '#fff', '800', 'center');
    text('click plate to clear [X]', qx + 100, qy + 146, 12, '#8a6a45', '600', 'center');

    // Steam wisps.
    for (const st of s.steam) {
      ctx.globalAlpha = Math.max(0, st.life);
      ctx.fillStyle = st.color;
      ctx.beginPath(); ctx.arc(st.x, st.y, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Toast line.
    if (s.toast && s.time - s.toastAt < 3) {
      ctx.fillStyle = 'rgba(44,28,16,.85)';
      const w = ctx.measureText(s.toast).width + 36;
      rr(VIEW_W / 2 - w / 2, 716, w, 34, 17); ctx.fill();
      text(s.toast, VIEW_W / 2, 734, 16, '#fff', '700', 'center');
    }

    // Hints bar.
    text('1–6 take ingredient · Space chop · F fry / plate · S serve · X clear plate · P pause · M mute',
      VIEW_W / 2, 764, 14, '#f7ead2', '600', 'center');

    if (s.flash > 0) {
      ctx.fillStyle = `rgba(246,216,96,${s.flash * 0.25})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }

    if (screen === SCREEN_TITLE) {
      ctx.fillStyle = 'rgba(24,14,8,.78)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      text('DAPUR ARANG', VIEW_W / 2, 250, 84, '#f6d860', '800', 'center');
      text('CHARCOAL RUSH', VIEW_W / 2, 318, 30, '#fff', '800', 'center');
      text('A timed charcoal-kitchen cooking game. Tickets arrive on the order board —', VIEW_W / 2, 392, 20, '#f7ead2', '600', 'center');
      text('chop it, fry it golden, plate it, and serve it before the ticket runs out.', VIEW_W / 2, 424, 20, '#f7ead2', '600', 'center');
      text('Best shift so far: ' + best + ' coins', VIEW_W / 2, 470, 18, '#f6d860', '700', 'center');
      ctx.fillStyle = '#4d9e57'; rr(VIEW_W / 2 - 130, 510, 260, 56, 12); ctx.fill();
      text('START SHIFT  [Enter]', VIEW_W / 2, 539, 22, '#fff', '800', 'center');
      text('Mouse + keyboard · no network needed · 150-second shifts', VIEW_W / 2, 610, 15, '#c9a86a', '600', 'center');
    }

    if (screen === SCREEN_OVER) {
      ctx.fillStyle = 'rgba(24,14,8,.82)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      text('SHIFT OVER', VIEW_W / 2, 250, 64, '#f6d860', '800', 'center');
      text(`Score ${s.score}  ·  Dishes served ${s.served}  ·  Walk-outs ${s.failed}`, VIEW_W / 2, 340, 22, '#fff', '700', 'center');
      text(`Best combo x${s.bestCombo}  ·  Level reached ${s.level}`, VIEW_W / 2, 384, 20, '#f7ead2', '600', 'center');
      text(`Best shift: ${best} coins`, VIEW_W / 2, 428, 20, '#f6d860', '700', 'center');
      ctx.fillStyle = '#4d9e57'; rr(VIEW_W / 2 - 130, 480, 260, 56, 12); ctx.fill();
      text('PLAY AGAIN  [Enter]', VIEW_W / 2, 509, 22, '#fff', '800', 'center');
    }

    if (s.paused && screen === SCREEN_PLAY) {
      ctx.fillStyle = 'rgba(24,14,8,.6)'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      text('PAUSED — press P to continue', VIEW_W / 2, VIEW_H / 2, 32, '#fff', '800', 'center');
    }
  }

  return { draw, drawIngredient };
}
