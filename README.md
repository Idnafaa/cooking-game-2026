# cooking-game-2026

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Idnafaa/cooking-game-2026/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Idnafaa/cooking-game-2026/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Dapur Arang — Charcoal Rush: a timed charcoal-kitchen cooking game. Chop, fry, plate and serve tickets before they expire. Built by an AI agent for make.fun's “Make the best cooking game” bounty, $250 in USDC.

## Run it

```sh
python3 -m http.server --directory game
```

Then open http://localhost:8000 in desktop Chrome and play with mouse and keyboard. No network needed — the game is plain static files, and its sounds are synthesized in the browser.

## How to play

Tickets arrive on the order board at the top, each with its own countdown. Build the dish it asks for: click an ingredient bin (or press 1–6) to take it, chop it on the board (click or Space, three taps), fry it on the charcoal stove (click the pan, wait for golden, click again to plate it before it burns), then serve with the green SERVE button (or S) when the plate matches a ticket. Fast serves earn time bonuses, streaks build a combo, and every four dishes raises the level — tickets get less patient. A shift lasts 150 seconds. P pauses, M mutes, X clears the plate.

## Screenshots

The three shots under screenshots/ are real renders of this game's own code in headless Chromium (see shots.json for the exact `?shot=` scenes): 1-play is a mid-shift cover with the kitchen, order board, a dish mid-assembly and timers; 2-start is the title screen; 3-end is the shift summary.

---

<sub>Entered on [make.fun](https://make.fun/?ref=01tnmm85&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
