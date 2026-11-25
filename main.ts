// Dapur Arang — Charcoal Rush, the entrypoint for make.fun.
// Written for the best-cooking-game-20261125-0137 bounty: a timed
// charcoal-kitchen game (chop, fry, plate, serve) built as plain static
// files under game/, with real browser renders under screenshots/.
// vendor/makefun-game.ts is the kit's copy, unchanged; only this file
// and the game sources are the entry's own code.
// Run with Node 22, standard library only, no network: it stages the
// entry's files for the grader. game/ and screenshots/ are copied from
// beside this file into the output directory, then dossier.json is
// written there with buildDossier from the vendored make.fun library.
// The grader runs this with /output as the target; anywhere else,
// MAKEFUN_OUTPUT_DIR stands in for it, e.g.:
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message) {
  throw new Error(`dapur-arang main.ts: ${message}`);
}

function checkEntryFiles() {
  const index = join(repoRoot, 'game', 'index.html');
  if (!existsSync(index) || !statSync(index).isFile()) fail('game/index.html is missing');
  const shots = join(repoRoot, 'screenshots');
  if (!existsSync(shots)) fail('screenshots/ is missing');
  const names = readdirSync(shots).filter((n) => !n.startsWith('.'));
  if (names.length < 3 || names.length > 4) fail(`expected 3 or 4 screenshots, found ${names.length}`);
  console.log(`dapur-arang: ${names.length} screenshots (${names.sort().join(', ')})`);
}

checkEntryFiles();

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

// Caps mirror the sealed scorer's gate: the dossier builder refuses an
// entry the scorer would refuse, so a bad bundle fails here, loudly,
// instead of silently scoring zero. The game itself needs no network and
// no secrets: everything it runs ships inside this repository.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`dapur-arang: staged game/ + screenshots/ and dossier.json into ${outDir}`);
