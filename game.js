// Kids Tetris Adventure Controller (v2.0)
// Simple, large tactile controls for 5-8 year old children

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

  // Line Clear Celebration
  let bannerTimer = null;
  tetris.onLineClear = (count, combo, rows) => {
    triggerHaptic(count === 4 ? 40 : 20);

    const rect = gameCanvas.getBoundingClientRect();
    const boardCenterX = rect.left + rect.width / 2;

    rows.forEach(r => {
      const rowY = rect.top + (r + 0.5) * tetris.blockSize;
      if (count === 4) {
        fx.spawnConfetti(boardCenterX, rowY, 40);
        fx.spawnStars(boardCenterX, rowY, 30);
      } else {
        fx.spawnStars(boardCenterX, rowY, 15 * count);
        fx.spawnHearts(boardCenterX, rowY, 6 * count);
      }
    });

    let praise = 'GREAT! ⭐';
    if (count === 4) {
      praise = 'MEGA TETRIS! 🌈';
      mascot.setMood('dance');
      showCelebration(praise);
      window.soundEngine.speakPraise('Mega Tetris!');
    } else if (count >= 2) {
      praise = 'SUPER POP! 🎉';
      mascot.setMood('cheer');
      showCelebration(praise);
      window.soundEngine.speakPraise('Super Pop!');
    } else {
      praise = 'AWESOME! ✨';
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
    mascot.say("You did awesome! 🌟 Play again?");
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
    mascot.say("Let's Play! 🌟");
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
      case 'KeyU':
        tetris.undo();
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

  // ⬇️ DOWN (Soft Drop: lands solidly if touching block)
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

  // Theme Switcher
  const themes = ['candy', 'animals', 'galaxy'];
  let currentThemeIdx = 0;
  themeBtn.addEventListener('click', () => {
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    const themeKey = themes[currentThemeIdx];
    tetris.currentTheme = themeKey;
    document.body.className = `theme-${themeKey}`;
    window.soundEngine.playClick();
    mascot.say(`New Theme! ✨`);
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
