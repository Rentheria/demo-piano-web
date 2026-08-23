(function () {
  "use strict";

  // ── Note definitions: C3 → C5 (2 octaves + 1) ──
  const NOTES = [
    { note: "C3",  freq: 130.81, type: "white", key: "z" },
    { note: "C#3", freq: 138.59, type: "black", key: "s" },
    { note: "D3",  freq: 146.83, type: "white", key: "x" },
    { note: "D#3", freq: 155.56, type: "black", key: "d" },
    { note: "E3",  freq: 164.81, type: "white", key: "c" },
    { note: "F3",  freq: 174.61, type: "white", key: "v" },
    { note: "F#3", freq: 185.00, type: "black", key: "g" },
    { note: "G3",  freq: 196.00, type: "white", key: "b" },
    { note: "G#3", freq: 207.65, type: "black", key: "h" },
    { note: "A3",  freq: 220.00, type: "white", key: "n" },
    { note: "A#3", freq: 233.08, type: "black", key: "j" },
    { note: "B3",  freq: 246.94, type: "white", key: "m" },
    { note: "C4",  freq: 261.63, type: "white", key: "q" },
    { note: "C#4", freq: 277.18, type: "black", key: "2" },
    { note: "D4",  freq: 293.66, type: "white", key: "w" },
    { note: "D#4", freq: 311.13, type: "black", key: "3" },
    { note: "E4",  freq: 329.63, type: "white", key: "e" },
    { note: "F4",  freq: 349.23, type: "white", key: "r" },
    { note: "F#4", freq: 369.99, type: "black", key: "5" },
    { note: "G4",  freq: 392.00, type: "white", key: "t" },
    { note: "G#4", freq: 415.30, type: "black", key: "6" },
    { note: "A4",  freq: 440.00, type: "white", key: "y" },
    { note: "A#4", freq: 466.16, type: "black", key: "7" },
    { note: "B4",  freq: 493.88, type: "white", key: "u" },
    { note: "C5",  freq: 523.25, type: "white", key: "i" },
  ];

  // Black-key horizontal offset as fraction of white-key width (center of black key)
  const BLACK_OFFSETS = {
    "C#": 0.72,
    "D#": 0.72,
    "F#": 0.72,
    "G#": 0.72,
    "A#": 0.72,
  };

  // ── Web Audio ──
  let audioCtx = null;
  const activeVoices = new Map();

  const ADSR = {
    attack: 0.015,
    decay: 0.12,
    sustain: 0.55,
    release: 0.35,
  };

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playNote(noteName, frequency) {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    stopNote(noteName, true);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.85, now + ADSR.attack);
    gain.gain.linearRampToValueAtTime(ADSR.sustain, now + ADSR.attack + ADSR.decay);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);

    activeVoices.set(noteName, { osc, gain, started: now });
  }

  function stopNote(noteName, immediate) {
    const voice = activeVoices.get(noteName);
    if (!voice) return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const { osc, gain } = voice;

    if (immediate) {
      try { osc.stop(); } catch (_) { /* already stopped */ }
      activeVoices.delete(noteName);
      return;
    }

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + ADSR.release);

    osc.stop(now + ADSR.release + 0.05);
    activeVoices.delete(noteName);
  }

  // ── DOM ──
  const pianoEl = document.getElementById("piano");
  const keyMap = new Map();
  const elementMap = new Map();
  const pressedKeys = new Set();
  const pressedElements = new Set();
  const blackKeyEls = [];

  function anchorWhiteIndex(blackNote, whiteNotes) {
    const anchor = blackNote.note.replace("#", "");
    return whiteNotes.findIndex((w) => w.note === anchor);
  }

  function positionBlackKeys(whiteNotes) {
    const styles = getComputedStyle(document.documentElement);
    const whiteKeyWidth = parseFloat(styles.getPropertyValue("--white-key-width"));
    const blackKeyWidth = parseFloat(styles.getPropertyValue("--black-key-width"));
    const pianoPadding = 6;

    blackKeyEls.forEach(({ el, noteData, whiteIndex }) => {
      const pitchClass = noteData.note.replace(/\d/, "");
      const offsetFrac = BLACK_OFFSETS[pitchClass] || 0.72;
      const left =
        pianoPadding +
        whiteIndex * whiteKeyWidth +
        offsetFrac * whiteKeyWidth -
        blackKeyWidth / 2;
      el.style.left = `${left}px`;
    });
  }

  function buildPiano() {
    const whiteNotes = NOTES.filter((n) => n.type === "white");

    whiteNotes.forEach((noteData) => {
      const el = document.createElement("button");
      el.className = "key-white";
      el.dataset.note = noteData.note;
      el.setAttribute("aria-label", noteData.note);
      el.innerHTML = `<span class="key-label">${noteData.note}</span>`;
      bindKeyEvents(el, noteData);
      pianoEl.appendChild(el);
      registerNote(noteData, el);
    });

    NOTES.filter((n) => n.type === "black").forEach((noteData) => {
      const whiteIndex = anchorWhiteIndex(noteData, whiteNotes);

      const el = document.createElement("button");
      el.className = "key-black";
      el.dataset.note = noteData.note;
      el.setAttribute("aria-label", noteData.note);
      bindKeyEvents(el, noteData);
      pianoEl.appendChild(el);
      blackKeyEls.push({ el, noteData, whiteIndex });
      registerNote(noteData, el);
    });

    positionBlackKeys(whiteNotes);
  }

  function registerNote(noteData, el) {
    keyMap.set(noteData.key, noteData);
    elementMap.set(noteData.note, el);
  }

  function bindKeyEvents(el, noteData) {
    const down = (e) => {
      e.preventDefault();
      noteOn(noteData);
    };
    const up = (e) => {
      e.preventDefault();
      noteOff(noteData);
    };

    el.addEventListener("mousedown", down);
    el.addEventListener("mouseup", up);
    el.addEventListener("mouseleave", up);
    el.addEventListener("touchstart", down, { passive: false });
    el.addEventListener("touchend", up);
    el.addEventListener("touchcancel", up);
  }

  function noteOn(noteData) {
    if (pressedElements.has(noteData.note)) return;
    pressedElements.add(noteData.note);
    const el = elementMap.get(noteData.note);
    if (el) el.classList.add("active");
    playNote(noteData.note, noteData.freq);
  }

  function noteOff(noteData) {
    if (!pressedElements.has(noteData.note)) return;
    pressedElements.delete(noteData.note);
    const el = elementMap.get(noteData.note);
    if (el) el.classList.remove("active");
    stopNote(noteData.note, false);
  }

  // ── Keyboard input ──
  function initKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      const code = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const noteData = keyMap.get(code);
      if (!noteData) return;
      e.preventDefault();
      pressedKeys.add(code);
      noteOn(noteData);
    });

    document.addEventListener("keyup", (e) => {
      const code = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const noteData = keyMap.get(code);
      if (!noteData) return;
      e.preventDefault();
      pressedKeys.delete(code);
      noteOff(noteData);
    });

    window.addEventListener("blur", () => {
      pressedKeys.forEach((code) => {
        const noteData = keyMap.get(code);
        if (noteData) noteOff(noteData);
      });
      pressedKeys.clear();
    });
  }

  buildPiano();
  initKeyboard();

  window.addEventListener("resize", () => {
    positionBlackKeys(NOTES.filter((n) => n.type === "white"));
  });
})();
