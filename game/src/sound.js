// Dapur Arang — tiny WebAudio synth for kitchen sounds. No audio files:
// every effect is a short oscillator blip so the game stays fully offline.

export function createSound() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function blip(freq, dur, type = 'sine', vol = 0.08, slide = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ac.currentTime + dur);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  return {
    chop() { blip(220, 0.07, 'square', 0.06, -80); },
    sizzle() { blip(900, 0.18, 'sawtooth', 0.03, -300); },
    plate() { blip(520, 0.09, 'triangle', 0.07, 120); },
    serve() { blip(523, 0.12, 'sine', 0.09); setTimeout(() => blip(784, 0.18, 'sine', 0.09), 90); },
    bad() { blip(160, 0.25, 'sawtooth', 0.07, -60); },
    tick() { blip(1100, 0.04, 'square', 0.03); },
    setMuted(v) { muted = v; },
    isMuted() { return muted; },
  };
}
