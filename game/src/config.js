// Dapur Arang — Charcoal Rush: tuning and content tables.
// Every dish, ingredient and number the kitchen uses lives here so the
// world logic never hard-codes a recipe.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const SHIFT_SECONDS = 150;
export const MAX_ORDERS = 3;
export const BEST_KEY = 'dapur-arang-best';

// One tap on the board advances a chop by this much; three taps finish one.
export const CHOP_TAPS = 3;
// Seconds on the pan before a piece is perfectly fried.
export const FRY_SECONDS = 4.5;
// Seconds past perfect before it burns and must be binned.
export const BURN_SECONDS = 3.5;

export const INGREDIENTS = [
  { id: 'tomato', name: 'Tomato', key: '1', color: '#e2483d', dark: '#a92c24', chop: true },
  { id: 'onion', name: 'Onion', key: '2', color: '#c9a7e8', dark: '#8a63b8', chop: true },
  { id: 'mushroom', name: 'Mushroom', key: '3', color: '#e8dcc8', dark: '#b09a72', chop: true },
  { id: 'chili', name: 'Chili', key: '4', color: '#d9381e', dark: '#8f1d0e', chop: true },
  { id: 'egg', name: 'Egg', key: '5', color: '#f6d860', dark: '#d9a83c', chop: false },
  { id: 'cheese', name: 'Cheese', key: '6', color: '#f2b705', dark: '#c78d02', chop: false },
];

export const RECIPES = [
  { id: 'omelet', name: 'Omelet Keju', needs: ['egg', 'cheese', 'tomato'], price: 120 },
  { id: 'sup', name: 'Sup Jamur', needs: ['mushroom', 'onion', 'tomato'], price: 110 },
  { id: 'tumis', name: 'Tumis Pedas', needs: ['chili', 'onion', 'mushroom'], price: 130 },
  { id: 'sarapan', name: 'Sarapan Arang', needs: ['egg', 'tomato', 'cheese'], price: 140 },
  { id: 'pedas', name: 'Telur Balado', needs: ['egg', 'chili', 'onion'], price: 150 },
];

export function ingredientById(id) {
  return INGREDIENTS.find((g) => g.id === id);
}

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

// Order patience shrinks as the kitchen levels up.
export function orderTimeFor(level) {
  return Math.max(28, 52 - (level - 1) * 4);
}

export function levelFor(served) {
  return 1 + Math.floor(served / 4);
}
