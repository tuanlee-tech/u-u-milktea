/* Offscreen audio player for Office Order Chrome Extension */
let currentAudio = null;

function playSynthesizedBell() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [
      { freq: 880, start: 0, dur: 0.12 },
      { freq: 1174.66, start: 0.14, dur: 0.12 },
      { freq: 1318.51, start: 0.28, dur: 0.16 },
      { freq: 1760, start: 0.46, dur: 0.30 }
    ];
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.start);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + n.start);
      gain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.start + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.start);
      osc.stop(ctx.currentTime + n.start + n.dur + 0.02);
    });
  } catch (e) {}
}

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.target !== 'offscreen') return;
  if (msg.type === 'PLAY_AUDIO') {
    if (!msg.url) {
      playSynthesizedBell();
      return;
    }
    try {
      if (currentAudio) {
        try { currentAudio.pause(); } catch (e) {}
      }
      currentAudio = new Audio(msg.url);
      currentAudio.currentTime = 0;
      const p = currentAudio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => playSynthesizedBell());
      }
    } catch (e) {
      playSynthesizedBell();
    }
  }
});
