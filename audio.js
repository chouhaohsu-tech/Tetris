// Cute Audio Synthesizer for Kids Tetris Adventure
// Uses Web Audio API (Zero external assets, 100% instant & reliable offline playback)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmVolume = 0.22;
    this.sfxVolume = 0.35;
    this.voiceEnabled = true;
    this.bgmTimer = null;
    this.bgmStep = 0;
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

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Playful swoop / chirp when rotating
  playRotate() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Cartoon boing on hard drop
  playHardDrop() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Gentle pleasant xylophone tap on block lock
  playLock() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
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

  // Line clear glockenspiel chords (1, 2, 3 lines, or Tetris celebration)
  playLineClear(lines = 1) {
    if (this.isMuted) return;
    this.ensureContext();

    // Ascending cute notes
    const chords = {
      1: [523.25, 659.25, 783.99],            // C5, E5, G5
      2: [523.25, 659.25, 783.99, 1046.50],   // C5, E5, G5, C6
      3: [440.00, 554.37, 659.25, 880.00, 1108.73], // A major sparkling
      4: [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // Mega C-major glissando
    };

    const notes = chords[lines] || chords[1];
    const duration = lines === 4 ? 0.15 : 0.08;
    const stagger = lines === 4 ? 0.07 : 0.05;

    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * stagger;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = lines === 4 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration + 0.16);
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

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.1);
    });
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
  // A gentle, bouncy pentatonic melody for kids
  startBGM() {
    if (this.bgmPlaying || this.isMuted) return;
    this.ensureContext();
    this.bgmPlaying = true;
    this.bgmStep = 0;

    // Pentatonic scale in C major: C, D, E, G, A
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
        // Melodic note (sweet marimba/music box)
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
        // Bass heartbeat note
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

  // --- Voice Encouragement (SpeechSynthesis) ---
  speakPraise(text) {
    if (!this.voiceEnabled || this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop pending speech
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.05;
      utter.pitch = 1.35; // Cheerful, slightly higher pitch for kids
      utter.volume = 0.85;

      // Prefer cute English or local language voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google') || v.name.includes('Natural')));
      if (preferred) utter.voice = preferred;

      window.speechSynthesis.speak(utter);
    } catch (e) {
      // Speech may fail if user hasn't interacted or unsupported
    }
  }
}

// Global singleton instance
window.soundEngine = new SoundEngine();
