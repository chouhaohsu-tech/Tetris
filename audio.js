// Cute Audio Synthesizer for Kids Tetris Adventure
// Uses Web Audio API (Zero external assets, 100% instant & reliable offline playback)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmVolume = 0.22;
    this.sfxVolume = 0.38;
    this.voiceEnabled = true;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.rotateStep = 0;
    this.lockStep = 0;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.initAudioContext();
  }

  initAudioContext() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = this.bgmVolume;
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.masterGain);
  }

  ensureContext() {
    if (!this.ctx) this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1.0, this.ctx.currentTime);
    }
    if (muted && this.bgmPlaying) {
      this.stopBGM();
    } else if (!muted && !this.bgmPlaying) {
      this.startBGM();
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // --- Sound Effects ---

  // Cute bubble blip when moving
  playMove() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.05);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Rich, multi-layered, dynamic spin sound with 3 whimsical variations!
  playRotate() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    this.rotateStep = (this.rotateStep + 1) % 3;

    // Layer 1: Resonant whoosh sweep (physical air swish)
    const sweepOsc = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweepOsc.type = 'triangle';
    sweepOsc.frequency.setValueAtTime(260 + this.rotateStep * 60, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(750 + this.rotateStep * 120, now + 0.09);

    sweepGain.gain.setValueAtTime(0.18, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(this.sfxGain);

    sweepOsc.start(now);
    sweepOsc.stop(now + 0.1);

    // Layer 2: Whimsical magical twirl / harmonic sparkle
    if (this.rotateStep === 0) {
      // Magic wand twirl (dual harmonic sine chime)
      const chime1 = this.ctx.createOscillator();
      const chime2 = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();

      chime1.type = 'sine';
      chime2.type = 'sine';
      chime1.frequency.setValueAtTime(659.25, now); // E5
      chime1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6
      chime2.frequency.setValueAtTime(987.77, now); // B5
      chime2.frequency.exponentialRampToValueAtTime(1975.53, now + 0.08); // B6

      cGain.gain.setValueAtTime(0.16, now);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      chime1.connect(cGain);
      chime2.connect(cGain);
      cGain.connect(this.sfxGain);

      chime1.start(now);
      chime2.start(now);
      chime1.stop(now + 0.11);
      chime2.stop(now + 0.11);

    } else if (this.rotateStep === 1) {
      // Bouncy cartoon boing-twirl
      const boing = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      boing.type = 'sine';
      boing.frequency.setValueAtTime(440, now);
      boing.frequency.exponentialRampToValueAtTime(1100, now + 0.07);

      bGain.gain.setValueAtTime(0.2, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      boing.connect(bGain);
      bGain.connect(this.sfxGain);

      boing.start(now);
      boing.stop(now + 0.09);

    } else {
      // Arcade crystal twirl (ascending fast arpeggio: C6 -> E6 -> G6)
      const freqs = [1046.50, 1318.51, 1567.98];
      freqs.forEach((freq, idx) => {
        const t = now + idx * 0.025;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.065);
      });
    }
  }

  // Juicy, tactile, satisfying landing sound!
  // Combines a low punchy thud + cute squishy jelly plop + musical tap!
  playLock() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    this.lockStep = (this.lockStep + 1) % 5;

    // 1. Snappy low thud (bass punch that feels tactile)
    const kick = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kick.type = 'triangle';
    kick.frequency.setValueAtTime(160, now);
    kick.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    kickGain.gain.setValueAtTime(0.3, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    kick.connect(kickGain);
    kickGain.connect(this.sfxGain);
    kick.start(now);
    kick.stop(now + 0.09);

    // 2. Cute jelly squish / water droplet pop
    const squish = this.ctx.createOscillator();
    const squishGain = this.ctx.createGain();
    squish.type = 'sine';
    squish.frequency.setValueAtTime(420, now);
    squish.frequency.exponentialRampToValueAtTime(180, now + 0.07);

    squishGain.gain.setValueAtTime(0.22, now);
    squishGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    squish.connect(squishGain);
    squishGain.connect(this.sfxGain);
    squish.start(now);
    squish.stop(now + 0.08);

    // 3. Gentle musical xylophone tap (C5, D5, E5, G5, A5 pentatonic cycle)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00];
    const tapFreq = scale[this.lockStep];
    const tap = this.ctx.createOscillator();
    const tapGain = this.ctx.createGain();

    tap.type = 'sine';
    tap.frequency.setValueAtTime(tapFreq, now + 0.01);
    tapGain.gain.setValueAtTime(0.18, now + 0.01);
    tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    tap.connect(tapGain);
    tapGain.connect(this.sfxGain);
    tap.start(now + 0.01);
    tap.stop(now + 0.15);
  }

  // Mega satisfying cartoon slam on hard drop
  playHardDrop() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Heavy bass thump
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(220, now);
    sub.frequency.exponentialRampToValueAtTime(35, now + 0.16);

    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 0.17);

    // Cartoon spring boing
    const boing = this.ctx.createOscillator();
    const boingGain = this.ctx.createGain();
    boing.type = 'sine';
    boing.frequency.setValueAtTime(750, now);
    boing.frequency.exponentialRampToValueAtTime(120, now + 0.15);

    boingGain.gain.setValueAtTime(0.28, now);
    boingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    boing.connect(boingGain);
    boingGain.connect(this.sfxGain);
    boing.start(now);
    boing.stop(now + 0.16);

    // Star sparkle chime on impact
    const sparkle = this.ctx.createOscillator();
    const spGain = this.ctx.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(1567.98, now + 0.03); // G6
    spGain.gain.setValueAtTime(0.15, now + 0.03);
    spGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    sparkle.connect(spGain);
    spGain.connect(this.sfxGain);
    sparkle.start(now + 0.03);
    sparkle.stop(now + 0.19);
  }

  // Hold piece pop
  playHold() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(550, now + 0.05);
    osc.frequency.linearRampToValueAtTime(700, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Comical cork pop / bubble burst sound for individual block popping
  playCartoonPop(pitch = 1.0) {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 850 * pitch;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(180 * pitch, now + 0.05);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Hilarious, celebratory row cancellation sound!
  // Features comical rapid cork-pops + slide whistle boing + musical celebration chords!
  playLineClear(lines = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // 1. Rapid comical cork pops
    const popCount = Math.min(8, lines * 2 + 2);
    for (let i = 0; i < popCount; i++) {
      setTimeout(() => {
        const pitch = 0.8 + Math.random() * 0.6;
        this.playCartoonPop(pitch);
      }, i * 35);
    }

    // 2. Funny cartoon slide-whistle wobble
    const whistle = this.ctx.createOscillator();
    const wGain = this.ctx.createGain();
    whistle.type = 'triangle';
    whistle.frequency.setValueAtTime(400, now + 0.05);
    whistle.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
    whistle.frequency.exponentialRampToValueAtTime(600, now + 0.28);

    wGain.gain.setValueAtTime(0.01, now + 0.05);
    wGain.gain.linearRampToValueAtTime(0.24, now + 0.12);
    wGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    whistle.connect(wGain);
    wGain.connect(this.sfxGain);
    whistle.start(now + 0.05);
    whistle.stop(now + 0.3);

    // 3. Triumphant glockenspiel chords
    const chords = {
      1: [523.25, 659.25, 783.99, 1046.50],                     // C5, E5, G5, C6
      2: [523.25, 659.25, 783.99, 1046.50, 1318.51],           // C5, E5, G5, C6, E6
      3: [440.00, 554.37, 659.25, 880.00, 1108.73, 1318.51],   // A major sparkle
      4: [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00] // Mega C-major fanfare
    };

    const notes = chords[lines] || chords[1];
    const duration = lines === 4 ? 0.22 : 0.14;
    const stagger = lines === 4 ? 0.06 : 0.05;

    notes.forEach((freq, idx) => {
      const t = now + 0.12 + idx * stagger;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = lines === 4 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + duration + 0.11);
    });
  }

  // Magic wand / powerup sparkle sound
  playMagicWand() {
    if (this.isMuted) return;
    this.ensureContext();

    const freqs = [784, 988, 1175, 1318, 1568, 1760, 2093];
    freqs.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.12);
    });
  }

  // Spooky / Magic bubble sound for cauldron
  playCauldronBubble() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    // 3 quick bubbly droplets
    [0, 0.06, 0.13].forEach((offset, i) => {
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = 380 + Math.random() * 320;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, t + 0.04);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.055);
    });
  }

  // Friendly ghost giggle / spooky spectral wobble
  playGhostGiggle() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.linearRampToValueAtTime(820, now + 0.08);
    osc.frequency.linearRampToValueAtTime(620, now + 0.16);
    osc.frequency.linearRampToValueAtTime(950, now + 0.24);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Warm hollow pumpkin knock / chuckle
  playPumpkinChuckle() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    [220, 290, 360].forEach((freq, idx) => {
      const t = now + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.06);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.075);
    });
  }

  // Playful spring boing for hanging spider
  playSpiderBounce() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(640, now + 0.06);
    osc.frequency.linearRampToValueAtTime(280, now + 0.12);
    osc.frequency.linearRampToValueAtTime(520, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Oops / Undo sound (cute playful wobble)
  playUndo() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Level Up / Achievement fanfare
  playLevelUp() {
    if (this.isMuted) return;
    this.ensureContext();
    const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i === notes.length - 1 ? 0.5 : 0.15));

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + (i === notes.length - 1 ? 0.52 : 0.16));
    });
  }

  // Gentle Game Over melody (comforting, not sad or harsh)
  playGameOver() {
    if (this.isMuted) return;
    this.ensureContext();
    const notes = [523.25, 493.88, 440.00, 392.00]; // C5, B4, A4, G4
    notes.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.23);
    });
  }

  // UI button click
  playClick() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // --- Cheerful Procedural Background Music (Kalimba / Music Box) ---
  startBGM() {
    if (this.bgmPlaying || this.isMuted) return;
    this.ensureContext();
    this.bgmPlaying = true;
    this.bgmStep = 0;

    const melody = [
      523.25, 0, 659.25, 783.99,   // C5, -, E5, G5
      659.25, 523.25, 0, 587.33,   // E5, C5, -, D5
      659.25, 783.99, 880.00, 783.99,// E5, G5, A5, G5
      659.25, 0, 523.25, 0,        // E5, -, C5, -
      587.33, 0, 659.25, 587.33,   // D5, -, E5, D5
      523.25, 440.00, 523.25, 0,   // C5, A4, C5, -
      659.25, 783.99, 1046.50, 880.00,// E5, G5, C6, A5
      783.99, 659.25, 523.25, 0    // G5, E5, C5, -
    ];

    const bass = [
      261.63, 0, 329.63, 0, 392.00, 0, 329.63, 0,
      220.00, 0, 261.63, 0, 329.63, 0, 261.63, 0
    ];

    const tempo = 220; // ms per 16th note

    const tick = () => {
      if (!this.bgmPlaying) return;
      const now = this.ctx.currentTime;
      const note = melody[this.bgmStep % melody.length];
      const bassNote = bass[Math.floor(this.bgmStep / 2) % bass.length];

      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.29);
      }

      if (this.bgmStep % 4 === 0 && bassNote > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bassNote, now);

        bGain.gain.setValueAtTime(0.14, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        bOsc.connect(bGain);
        bGain.connect(this.bgmGain);

        bOsc.start(now);
        bOsc.stop(now + 0.36);
      }

      this.bgmStep++;
      this.bgmTimer = setTimeout(tick, tempo);
    };

    tick();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // --- Voice Encouragement ---
  speakPraise(text) {
    if (!this.voiceEnabled || this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.05;
      utter.pitch = 1.35;
      utter.volume = 0.85;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google') || v.name.includes('Natural')));
      if (preferred) utter.voice = preferred;

      window.speechSynthesis.speak(utter);
    } catch (e) {}
  }
}

window.soundEngine = new SoundEngine();
