// Kids Tetris Adventure Controller (v3.1)
// Simple, large tactile controls for 5-8 year old children with magical Halloween vibes

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const gameCanvas = document.getElementById('gameCanvas');
  const fxCanvas = document.getElementById('fxCanvas');
  const holdCanvas = document.getElementById('holdCanvas');
  const nextCanvas = document.getElementById('nextCanvas');
  const mascotContainer = document.getElementById('mascotContainer');

  // Stats Elements
  const scoreVal = document.getElementById('scoreVal');
  const starsVal = document.getElementById('starsVal');

  // Modals & Overlays
  const startOverlay = document.getElementById('startOverlay');
  const playStartBtn = document.getElementById('playStartBtn');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const gameOverModal = document.getElementById('gameOverModal');
  const finalScoreEl = document.getElementById('finalScore');
  const finalStarsEl = document.getElementById('finalStars');
  const celebrationBanner = document.getElementById('celebrationBanner');
  const praiseText = document.getElementById('praiseText');

  // Tool Buttons
  const soundBtn = document.getElementById('soundBtn');
  const soundIcon = document.getElementById('soundIcon');
  const themeBtn = document.getElementById('themeBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const restartModalBtn = document.getElementById('restartModalBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const magicWandBtn = document.getElementById('magicWandBtn');
  const btnHoldCard = document.getElementById('btnHoldCard');

  // Side Interactive Props (Magic & Halloween)
  const witchCauldron = document.getElementById('witchCauldron');
  const spookyPumpkin = document.getElementById('spookyPumpkin');
  const friendlyGhost = document.getElementById('friendlyGhost');
  const spookySpider = document.getElementById('spookySpider');

  // Big Kid Controller Buttons
  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnRotate = document.getElementById('btnRotate');
  const btnDown = document.getElementById('btnDown');
  const btnDrop = document.getElementById('btnDrop');

  // Instantiate Engines
  const fx = new ParticleEngine(fxCanvas);
  const mascot = new MascotCompanion(mascotContainer);
  const tetris = new TetrisGame(gameCanvas, holdCanvas, nextCanvas);

  let gameStarted = false;

  // Haptic feedback
  const triggerHaptic = (ms = 15) => {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  };

  // Score & Stat Updates
  tetris.onScoreUpdate = (score, lines, level, stars) => {
    scoreVal.textContent = score.toLocaleString();
    starsVal.textContent = stars;
  };

  // Hilarious Line Clear Celebration
  let bannerTimer = null;
  tetris.onLineClear = (count, combo, rows) => {
    triggerHaptic(count === 4 ? 45 : 25);

    const rect = gameCanvas.getBoundingClientRect();

    // Spawn comic smoke poofs, bouncing googly eyes, flying emojis, and comical text!
    fx.spawnRowClearHilarious(rect.left, rect.top, rows, tetris.cols, tetris.blockSize, count);

    let praise = 'POOF! 💨';
    if (count === 4) {
      praise = 'MEGA MAGIC! 🎃';
      mascot.setMood('dance');
      showCelebration(praise);
      window.soundEngine.speakPraise('Mega Magic Tetris!');
    } else if (count >= 2) {
      praise = 'SUPER POP! 💥';
      mascot.setMood('cheer');
      showCelebration(praise);
      window.soundEngine.speakPraise('Super Pop!');
    } else {
      const singlePraises = ['SQUISH! 🤪', 'POOF! 💨', 'POP! 💥', 'AWESOME! ✨'];
      praise = singlePraises[Math.floor(Math.random() * singlePraises.length)];
      mascot.setMood('cheer');
      showCelebration(praise);
    }

    setTimeout(() => {
      if (!tetris.isGameOver) mascot.setMood('idle');
    }, 2800);
  };

  tetris.onMascotReact = (mood, text) => {
    mascot.setMood(mood);
    if (text) mascot.say(text);
  };

  tetris.onGameOver = () => {
    finalScoreEl.textContent = tetris.score.toLocaleString();
    finalStarsEl.textContent = tetris.stars;
    gameOverModal.classList.remove('hidden');
    mascot.setMood('cheer');
    mascot.say("Super Wizard Effort! 🌟 Play again?");
  };

  function showCelebration(text) {
    praiseText.textContent = text;
    celebrationBanner.classList.remove('hidden', 'banner-anim');
    void celebrationBanner.offsetWidth;
    celebrationBanner.classList.add('banner-anim');

    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      celebrationBanner.classList.add('hidden');
    }, 1800);
  }

  // --- Start Game Screen ---
  const modeChips = document.querySelectorAll('.mode-chip');
  modeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      modeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      tetris.mode = chip.dataset.mode;
      tetris.updateSpeed();
      window.soundEngine.playClick();
    });
  });

  playStartBtn.addEventListener('click', () => {
    window.soundEngine.ensureContext();
    window.soundEngine.startBGM();
    startOverlay.classList.add('hidden');
    gameStarted = true;
    tetris.start();
    mascot.say("Spooky Magic! 🎃✨");
    triggerHaptic(25);
  });

  // --- Keyboard Shortcuts (PC) ---
  const keyState = {};
  window.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    window.soundEngine.ensureContext();
    if (!window.soundEngine.bgmPlaying && !window.soundEngine.isMuted) {
      window.soundEngine.startBGM();
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    if (keyState[e.code]) return;
    keyState[e.code] = true;

    if (tetris.isGameOver) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        tetris.moveLeft();
        triggerHaptic(10);
        break;
      case 'ArrowRight':
      case 'KeyD':
        tetris.moveRight();
        triggerHaptic(10);
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'KeyX':
        tetris.rotateClockwise();
        triggerHaptic(15);
        break;
      case 'ArrowDown':
      case 'KeyS':
        tetris.softDrop();
        break;
      case 'Space':
        tetris.hardDrop();
        triggerHaptic(25);
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        tetris.hold();
        triggerHaptic(15);
        break;
      case 'KeyM':
        useMagicWand();
        break;
      case 'KeyP':
      case 'Escape':
        togglePause();
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    keyState[e.code] = false;
  });

  setInterval(() => {
    if (keyState['ArrowDown'] || keyState['KeyS']) {
      tetris.softDrop();
    }
  }, 90);

  // --- Giant Kid Touch Controls Binding ---
  const bindKidButton = (btn, action, continuous = false, intervalMs = 120) => {
    if (!btn) return;
    let timer = null;
    let repeat = null;

    const onStart = (e) => {
      e.preventDefault();
      if (!gameStarted) return;
      window.soundEngine.ensureContext();
      if (!window.soundEngine.bgmPlaying && !window.soundEngine.isMuted) {
        window.soundEngine.startBGM();
      }
      btn.classList.add('btn-active');
      action();
      triggerHaptic(12);

      if (continuous) {
        timer = setTimeout(() => {
          repeat = setInterval(() => {
            action();
            triggerHaptic(8);
          }, intervalMs);
        }, 220);
      }
    };

    const onEnd = (e) => {
      if (e) e.preventDefault();
      btn.classList.remove('btn-active');
      if (timer) clearTimeout(timer);
      if (repeat) clearInterval(repeat);
    };

    btn.addEventListener('pointerdown', onStart);
    btn.addEventListener('pointerup', onEnd);
    btn.addEventListener('pointerleave', onEnd);
    btn.addEventListener('pointercancel', onEnd);
    btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  };

  // ◀ Move Left & ▶ Move Right
  bindKidButton(btnLeft, () => tetris.moveLeft(), true, 110);
  bindKidButton(btnRight, () => tetris.moveRight(), true, 110);

  // 🔄 SPIN (Only 1 fun spin button!)
  bindKidButton(btnRotate, () => tetris.rotateClockwise(), false);

  // ⬇️ DOWN (Soft Drop)
  bindKidButton(btnDown, () => tetris.softDrop(), true, 85);

  // ⚡ DROP (Slam Drop)
  bindKidButton(btnDrop, () => tetris.hardDrop(), false);

  // Pocket Hold
  if (btnHoldCard) {
    btnHoldCard.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      tetris.hold();
      triggerHaptic(15);
    });
  }

  // --- Kid Power Tools: Magic Wand ---
  function useMagicWand() {
    if (tetris.useMagicWand()) {
      triggerHaptic(30);
      const rect = gameCanvas.getBoundingClientRect();
      fx.spawnMagicSparkles(rect.left + rect.width / 2, rect.bottom - 40, 35);
      magicWandBtn.disabled = true;

      const wandInterval = setInterval(() => {
        if (tetris.magicWandAvailable) {
          magicWandBtn.disabled = false;
          clearInterval(wandInterval);
        }
      }, 500);
    }
  }

  magicWandBtn.addEventListener('click', useMagicWand);

  // --- Interactive Side Props (Magic & Halloween Vibe!) ---

  // 1. Bubbling Witch Cauldron
  if (witchCauldron) {
    witchCauldron.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      window.soundEngine.ensureContext();
      window.soundEngine.playCauldronBubble();
      triggerHaptic(18);

      const rect = witchCauldron.getBoundingClientRect();
      fx.spawnCauldronBurst(rect.left + rect.width / 2, rect.top + 15);

      witchCauldron.classList.remove('prop-bounce');
      void witchCauldron.offsetWidth;
      witchCauldron.classList.add('prop-bounce');

      const cauldronPhrases = ['Bubble bubble! 🧪', 'Secret Potion! 🔮', 'Magic Brew! ✨', 'Fizzing! 🫧'];
      mascot.say(cauldronPhrases[Math.floor(Math.random() * cauldronPhrases.length)], 2000);
    });
  }

  // 2. Glowing Jack-o'-Lantern Pumpkin
  if (spookyPumpkin) {
    spookyPumpkin.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      window.soundEngine.ensureContext();
      window.soundEngine.playPumpkinChuckle();
      triggerHaptic(18);

      const rect = spookyPumpkin.getBoundingClientRect();
      fx.spawnPumpkinEmbers(rect.left + rect.width / 2, rect.top + 15);

      spookyPumpkin.classList.remove('prop-bounce');
      void spookyPumpkin.offsetWidth;
      spookyPumpkin.classList.add('prop-bounce');

      const pumpkinPhrases = ['Pumpkin Chuckle! 🎃', 'Glow Bright! 🌟', 'Trick or Treat! 🍬', 'Happy Halloween! 🧡'];
      mascot.say(pumpkinPhrases[Math.floor(Math.random() * pumpkinPhrases.length)], 2000);
    });
  }

  // 3. Friendly Peek-a-boo Ghost
  if (friendlyGhost) {
    friendlyGhost.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      window.soundEngine.ensureContext();
      window.soundEngine.playGhostGiggle();
      triggerHaptic(18);

      const rect = friendlyGhost.getBoundingClientRect();
      fx.spawnGhostHearts(rect.left + rect.width / 2, rect.top + 15);

      friendlyGhost.classList.remove('ghost-spin-anim');
      void friendlyGhost.offsetWidth;
      friendlyGhost.classList.add('ghost-spin-anim');

      const ghostPhrases = ['Boo! Hehehe! 👻', 'Ghost Hug! 💖', 'Floaty Floaty! ✨', 'Friendly Casper! 🌟'];
      mascot.say(ghostPhrases[Math.floor(Math.random() * ghostPhrases.length)], 2000);
    });
  }

  // 4. Hanging Cute Spider
  if (spookySpider) {
    spookySpider.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      window.soundEngine.ensureContext();
      window.soundEngine.playSpiderBounce();
      triggerHaptic(15);

      const rect = spookySpider.getBoundingClientRect();
      fx.spawnStars(rect.left + rect.width / 2, rect.bottom, 8, ['#9D4EDD', '#00F5D4', '#FFD166']);

      spookySpider.classList.remove('spider-drop-anim');
      void spookySpider.offsetWidth;
      spookySpider.classList.add('spider-drop-anim');

      const spiderPhrases = ['Boing! 🕷️', 'Spider Swing! 🕸️', 'Tickle tickle! 💖'];
      mascot.say(spiderPhrases[Math.floor(Math.random() * spiderPhrases.length)], 1800);
    });
  }

  // Theme Switcher (Includes Spooky Magic, Candy, Animals, Galaxy)
  const themeList = ['spooky', 'candy', 'animals', 'galaxy'];
  let currentThemeIdx = 0;
  themeBtn.addEventListener('click', () => {
    currentThemeIdx = (currentThemeIdx + 1) % themeList.length;
    const themeKey = themeList[currentThemeIdx];
    tetris.currentTheme = (themeKey === 'spooky' ? 'halloween' : themeKey);
    document.body.className = `theme-${themeKey}`;
    window.soundEngine.playClick();

    const themeNames = {
      spooky: 'Spooky Magic 🎃',
      candy: 'Candy Land 🍬',
      animals: 'Animal Friends 🐱',
      galaxy: 'Galaxy Stars 🚀'
    };
    mascot.say(`${themeNames[themeKey] || 'New Theme!'} ✨`);
  });

  // Sound Toggle
  soundBtn.addEventListener('click', () => {
    const isMuted = window.soundEngine.toggleMute();
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
    soundBtn.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
  });

  // Pause Controls
  function togglePause() {
    if (!gameStarted) return;
    tetris.isPaused = !tetris.isPaused;
    if (tetris.isPaused) {
      pauseOverlay.classList.remove('hidden');
      mascot.say("Resting! 💤");
    } else {
      pauseOverlay.classList.add('hidden');
      mascot.say("Let's Go! 🚀");
    }
    window.soundEngine.playClick();
  }

  pauseBtn.addEventListener('click', togglePause);
  resumeBtn.addEventListener('click', togglePause);

  // Restart Controls
  function restartGame() {
    gameOverModal.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    tetris.restart();
    window.soundEngine.playClick();
  }

  restartBtn.addEventListener('click', restartGame);
  restartModalBtn.addEventListener('click', restartGame);

  // Dynamic window resizing
  window.addEventListener('resize', () => {
    tetris.resizeCanvases();
  });

  // Game loop
  let lastTime = performance.now();
  function loop(now) {
    const delta = now - lastTime;
    lastTime = now;

    if (gameStarted) {
      tetris.update(delta);
    }
    tetris.draw();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
