// Main Game Controller for Kids Tetris Adventure
// Orchestrates inputs, touch gestures, haptics, UI, and audio

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const gameCanvas = document.getElementById('gameCanvas');
  const fxCanvas = document.getElementById('fxCanvas');
  const holdCanvas = document.getElementById('holdCanvas');
  const nextCanvas = document.getElementById('nextCanvas');
  const mascotContainer = document.getElementById('mascotContainer');

  // Stats Elements
  const scoreVal = document.getElementById('scoreVal');
  const linesVal = document.getElementById('linesVal');
  const levelVal = document.getElementById('levelVal');
  const starsVal = document.getElementById('starsVal');

  // Modals & Overlays
  const pauseOverlay = document.getElementById('pauseOverlay');
  const gameOverModal = document.getElementById('gameOverModal');
  const finalScoreEl = document.getElementById('finalScore');
  const finalStarsEl = document.getElementById('finalStars');
  const celebrationBanner = document.getElementById('celebrationBanner');
  const praiseText = document.getElementById('praiseText');

  // Buttons & Controls
  const soundBtn = document.getElementById('soundBtn');
  const soundIcon = document.getElementById('soundIcon');
  const themeBtn = document.getElementById('themeBtn');
  const modeBtn = document.getElementById('modeBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const restartModalBtn = document.getElementById('restartModalBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const magicWandBtn = document.getElementById('magicWandBtn');
  const undoBtn = document.getElementById('undoBtn');

  // On-screen Gamepad Controls
  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnDown = document.getElementById('btnDown');
  const btnDrop = document.getElementById('btnDrop');
  const btnRotate = document.getElementById('btnRotate');
  const btnRotateCCW = document.getElementById('btnRotateCCW');
  const btnHold = document.getElementById('btnHold');

  // Initialize FX and Mascot
  const fx = new ParticleEngine(fxCanvas);
  const mascot = new MascotCompanion(mascotContainer);
  const tetris = new TetrisGame(gameCanvas, holdCanvas, nextCanvas);

  // Setup Haptics helper
  const triggerHaptic = (ms = 15) => {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  };

  // --- Hooking Tetris Events to Visual & Sound FX ---

  tetris.onScoreUpdate = (score, lines, level, stars) => {
    scoreVal.textContent = score.toLocaleString();
    linesVal.textContent = lines;
    levelVal.textContent = level;
    starsVal.textContent = stars;

    // Pop animation on stats
    scoreVal.parentElement.classList.remove('stat-pop');
    void scoreVal.parentElement.offsetWidth;
    scoreVal.parentElement.classList.add('stat-pop');
  };

  tetris.onLineClear = (count, combo, rows) => {
    triggerHaptic(count === 4 ? 45 : 25);

    // Get screen coordinates of the game board
    const rect = gameCanvas.getBoundingClientRect();
    const boardCenterX = rect.left + rect.width / 2;

    // Spawn FX for each cleared line
    rows.forEach(r => {
      const displayY = r - tetris.hiddenRows;
      const rowY = rect.top + (displayY + 0.5) * tetris.blockSize;

      if (count === 4) {
        fx.spawnConfetti(boardCenterX, rowY, 45);
        fx.spawnStars(boardCenterX, rowY, 35);
        fx.spawnShockwave(boardCenterX, rowY, 'rgba(255, 94, 126, 0.9)');
      } else {
        fx.spawnStars(boardCenterX, rowY, 15 * count);
        fx.spawnHearts(boardCenterX, rowY, 6 * count);
        fx.spawnShockwave(boardCenterX, rowY);
      }
    });

    // Banners & Mascot Reactions
    let praise = 'Super! ⭐';
    if (count === 4) {
      praise = 'MEGA TETRIS! 🌈🎉';
      mascot.setMood('dance');
      showCelebration(praise);
      window.soundEngine.speakPraise('Mega Tetris! Incredible!');
    } else if (count === 3) {
      praise = 'TRIPLE CLEAR! 🌟🌟🌟';
      mascot.setMood('dance');
      showCelebration(praise);
      window.soundEngine.speakPraise('Triple Clear! Amazing!');
    } else if (count === 2) {
      praise = 'DOUBLE POP! 🎈🎈';
      mascot.setMood('cheer');
      showCelebration(praise);
      window.soundEngine.speakPraise('Double Pop!');
    } else {
      praise = 'GREAT! 💫';
      mascot.setMood('cheer');
      window.soundEngine.speakPraise('Good job!');
    }

    if (combo > 1) {
      fx.spawnFloatingText(`COMBO x${combo}! 🔥`, boardCenterX, rect.top + 80, '#FFD166', 32);
    }

    setTimeout(() => {
      if (!tetris.isGameOver) mascot.setMood('idle');
    }, 3500);
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

    setTimeout(() => {
      celebrationBanner.classList.add('hidden');
    }, 2400);
  }

  // --- Keyboard Controls ---
  const keyState = {};
  window.addEventListener('keydown', (e) => {
    // Resume audio on first interaction
    window.soundEngine.ensureContext();
    if (window.soundEngine && !window.soundEngine.bgmPlaying && !window.soundEngine.isMuted) {
      window.soundEngine.startBGM();
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault(); // Prevent browser scrolling
    }

    if (keyState[e.code]) return; // Avoid key repeat stutter
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
      case 'KeyZ':
        tetris.rotateCounterClockwise();
        triggerHaptic(15);
        break;
      case 'ArrowDown':
      case 'KeyS':
        tetris.softDrop();
        break;
      case 'Space':
        tetris.hardDrop();
        triggerHaptic(30);
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'KeyC':
        tetris.hold();
        triggerHaptic(20);
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

  // Continuous soft drop on holding down ArrowDown or S
  setInterval(() => {
    if (keyState['ArrowDown'] || keyState['KeyS']) {
      tetris.softDrop();
    }
  }, 90);

  // --- Touch & Gesture Controls (Mobile & iPad) ---
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isSwiping = false;

  gameCanvas.addEventListener('touchstart', (e) => {
    window.soundEngine.ensureContext();
    if (!window.soundEngine.bgmPlaying && !window.soundEngine.isMuted) {
      window.soundEngine.startBGM();
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = performance.now();
      isSwiping = true;
    }
  }, { passive: false });

  gameCanvas.addEventListener('touchmove', (e) => {
    if (!isSwiping || e.touches.length !== 1) return;
    e.preventDefault();

    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const threshold = tetris.blockSize * 0.8;

    if (Math.abs(dx) > threshold) {
      if (dx > 0) {
        tetris.moveRight();
      } else {
        tetris.moveLeft();
      }
      touchStartX = touch.clientX;
      triggerHaptic(10);
    } else if (dy > threshold * 1.2) {
      tetris.softDrop();
      touchStartY = touch.clientY;
    }
  }, { passive: false });

  gameCanvas.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const touchEndTime = performance.now();
    const duration = touchEndTime - touchStartTime;

    // Detect tap for rotation
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (duration < 250 && dist < 15) {
      tetris.rotateClockwise();
      triggerHaptic(15);
    }
  });

  // --- On-Screen Virtual Buttons Binding with Repeat Support ---
  const bindContinuousBtn = (btn, action, intervalMs = 120) => {
    if (!btn) return;
    let timer = null;
    let repeatTimer = null;

    const start = (e) => {
      e.preventDefault();
      window.soundEngine.ensureContext();
      if (!window.soundEngine.bgmPlaying && !window.soundEngine.isMuted) {
        window.soundEngine.startBGM();
      }
      btn.classList.add('btn-active');
      action();
      triggerHaptic(12);

      timer = setTimeout(() => {
        repeatTimer = setInterval(() => {
          action();
          triggerHaptic(8);
        }, intervalMs);
      }, 250);
    };

    const stop = () => {
      btn.classList.remove('btn-active');
      if (timer) clearTimeout(timer);
      if (repeatTimer) clearInterval(repeatTimer);
    };

    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('pointercancel', stop);
  };

  const bindSingleTapBtn = (btn, action) => {
    if (!btn) return;
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      window.soundEngine.ensureContext();
      if (!window.soundEngine.bgmPlaying && !window.soundEngine.isMuted) {
        window.soundEngine.startBGM();
      }
      btn.classList.add('btn-active');
      action();
      triggerHaptic(20);
    });
    const release = () => btn.classList.remove('btn-active');
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointercancel', release);
  };

  bindContinuousBtn(btnLeft, () => tetris.moveLeft());
  bindContinuousBtn(btnRight, () => tetris.moveRight());
  bindContinuousBtn(btnDown, () => tetris.softDrop(), 80);

  bindSingleTapBtn(btnRotate, () => tetris.rotateClockwise());
  bindSingleTapBtn(btnRotateCCW, () => tetris.rotateCounterClockwise());
  bindSingleTapBtn(btnDrop, () => tetris.hardDrop());
  bindSingleTapBtn(btnHold, () => tetris.hold());

  // --- UI Action Buttons ---

  // Magic Wand Power-Up
  function useMagicWand() {
    if (tetris.useMagicWand()) {
      triggerHaptic(30);
      const rect = gameCanvas.getBoundingClientRect();
      fx.spawnMagicSparkles(rect.left + rect.width / 2, rect.bottom - 40, 40);
      magicWandBtn.classList.add('cooldown');
      magicWandBtn.disabled = true;

      const updateCooldown = setInterval(() => {
        if (tetris.magicWandAvailable) {
          magicWandBtn.classList.remove('cooldown');
          magicWandBtn.disabled = false;
          magicWandBtn.querySelector('.btn-badge').textContent = 'READY!';
          clearInterval(updateCooldown);
        } else {
          magicWandBtn.querySelector('.btn-badge').textContent = `${tetris.magicWandCooldown}s`;
        }
      }, 500);
    }
  }

  magicWandBtn.addEventListener('click', useMagicWand);

  // Undo Button
  undoBtn.addEventListener('click', () => {
    if (tetris.undo()) {
      triggerHaptic(20);
    }
  });

  // Theme Switcher
  const themes = ['candy', 'animals', 'galaxy'];
  let currentThemeIdx = 0;
  themeBtn.addEventListener('click', () => {
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    const themeKey = themes[currentThemeIdx];
    tetris.currentTheme = themeKey;

    document.body.className = `theme-${themeKey}`;
    const info = THEMES[themeKey];
    themeBtn.querySelector('.btn-label').textContent = info.name;
    window.soundEngine.playClick();
    mascot.say(`New Theme: ${info.name}! ✨`);
  });

  // Game Mode Switcher (Kids Mode, Zen Mode, Classic)
  const modes = [
    { key: 'kids', label: 'Kids 🌟', desc: 'Gentle & Forgiving' },
    { key: 'zen', label: 'Zen 🎈', desc: 'No Game Over!' },
    { key: 'classic', label: 'Classic 🏆', desc: 'Traditional Pace' }
  ];
  let currentModeIdx = 0;
  modeBtn.addEventListener('click', () => {
    currentModeIdx = (currentModeIdx + 1) % modes.length;
    const mode = modes[currentModeIdx];
    tetris.mode = mode.key;
    tetris.updateSpeed();
    modeBtn.querySelector('.btn-label').textContent = mode.label;
    window.soundEngine.playClick();
    mascot.say(`Mode: ${mode.label}! 🎉`);
  });

  // Sound Toggle
  soundBtn.addEventListener('click', () => {
    const isMuted = window.soundEngine.toggleMute();
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
    soundBtn.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
  });

  // Pause Controls
  function togglePause() {
    tetris.isPaused = !tetris.isPaused;
    if (tetris.isPaused) {
      pauseOverlay.classList.remove('hidden');
      mascot.say("Taking a rest? 💤");
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

  // Window Resize handling
  window.addEventListener('resize', () => {
    tetris.resizeCanvases();
  });

  // --- Main Animation & Render Loop ---
  let lastFrameTime = performance.now();
  function gameLoop(now) {
    const delta = now - lastFrameTime;
    lastFrameTime = now;

    tetris.update(delta);
    tetris.draw();

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
