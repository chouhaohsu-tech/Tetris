// Kids Tetris Engine with Kid-Friendly Rules, Cute Themes, and SRS Rotation
// Designed for children under 8: Gentle speeds, generous lock delay, Undo, and Magic Wand!

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]
};

// Cute color themes with candy gradients & emojis
const THEMES = {
  candy: {
    name: 'Candy Land 🍬',
    I: { base: '#48CAE4', light: '#90E0EF', dark: '#0096C7', emoji: '💎' },
    J: { base: '#70A1FF', light: '#A4C6FF', dark: '#3742FA', emoji: '🫐' },
    L: { base: '#FFA502', light: '#FFD32A', dark: '#FF7F50', emoji: '🍊' },
    O: { base: '#FFDD59', light: '#FFF07C', dark: '#FFC048', emoji: '⭐' },
    S: { base: '#2ED573', light: '#7BED9F', dark: '#10AC84', emoji: '🍏' },
    T: { base: '#A55EEA', light: '#D6A2E8', dark: '#8854D0', emoji: '🍇' },
    Z: { base: '#FF4757', light: '#FF6B81', dark: '#EE5253', emoji: '🍓' },
    bg: '#FFF5F7',
    grid: 'rgba(255, 182, 193, 0.25)',
    border: '#FFAEC9'
  },
  animals: {
    name: 'Animal Friends 🐱',
    I: { base: '#54A0FF', light: '#88C0FF', dark: '#2E86DE', emoji: '🐬' },
    J: { base: '#5F27CD', light: '#8E44AD', dark: '#341F97', emoji: '🐧' },
    L: { base: '#FF9F43', light: '#FECB89', dark: '#EE5A24', emoji: '🦊' },
    O: { base: '#FED330', light: '#FFEAA7', dark: '#F7B731', emoji: '🐥' },
    S: { base: '#10AC84', light: '#1DD1A1', dark: '#058364', emoji: '🐸' },
    T: { base: '#9B59B6', light: '#C39BD3', dark: '#6C3483', emoji: '🦄' },
    Z: { base: '#EE5253', light: '#FF7675', dark: '#C0392B', emoji: '🐼' },
    bg: '#F3F9FF',
    grid: 'rgba(126, 214, 223, 0.25)',
    border: '#70A1FF'
  },
  galaxy: {
    name: 'Galaxy Stars 🚀',
    I: { base: '#00D2D3', light: '#55EFC4', dark: '#01A3A4', emoji: '🛸' },
    J: { base: '#4834D4', light: '#686DE0', dark: '#30336B', emoji: '🪐' },
    L: { base: '#F0932B', light: '#FFBE76', dark: '#E67E22', emoji: '☄️' },
    O: { base: '#F9CA24', light: '#F6E58D', dark: '#F1C40F', emoji: '🌟' },
    S: { base: '#6AB04C', light: '#BADC58', dark: '#27AE60', emoji: '👽' },
    T: { base: '#BE2EDD', light: '#E056FD', dark: '#8E44AD', emoji: '🔮' },
    Z: { base: '#EB4D4B', light: '#FF7979', dark: '#E74C3C', emoji: '🚀' },
    bg: '#181A2A',
    grid: 'rgba(142, 68, 173, 0.28)',
    border: '#BE2EDD'
  }
};

class TetrisGame {
  constructor(canvas, holdCanvas, nextCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.holdCanvas = holdCanvas;
    this.holdCtx = holdCanvas ? holdCanvas.getContext('2d') : null;
    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCanvas ? nextCanvas.getContext('2d') : null;

    // Grid Dimensions
    this.cols = 10;
    this.rows = 20;
    this.hiddenRows = 2; // Buffer rows
    this.totalRows = this.rows + this.hiddenRows;
    this.blockSize = 30;

    // Game Mode: 'kids' (gentle), 'zen' (no game over), 'classic' (faster)
    this.mode = 'kids';
    this.currentTheme = 'candy';

    // State Variables
    this.grid = [];
    this.currentPiece = null;
    this.ghostPiece = null;
    this.holdPiece = null;
    this.canHold = true;
    this.bag = [];
    this.nextQueue = [];

    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.stars = 0;
    this.combo = 0;

    // Kid-Friendly Magic Power
    this.magicWandAvailable = true;
    this.magicWandCooldown = 0; // Secs
    this.magicWandTimer = null;

    // Undo State
    this.lastState = null;

    // Animation & Squash FX
    this.squashAmount = 0; // Visual bounce
    this.clearingLines = []; // Lines currently playing clear animation
    this.clearAnimProgress = 0;

    // Timers
    this.dropInterval = 1100; // ms
    this.lastDropTime = 0;
    this.lockDelay = 1200; // Extra generous lock delay for kids
    this.lockTimer = null;
    this.isLocking = false;

    this.isPaused = false;
    this.isGameOver = false;

    // Event hooks
    this.onLineClear = null; // fn(lineCount, combo)
    this.onScoreUpdate = null; // fn(score, lines, level, stars)
    this.onGameOver = null; // fn()
    this.onMascotReact = null; // fn(mood, text)

    this.init();
  }

  init() {
    this.resetGrid();
    this.refillBag();
    this.nextQueue = [this.takePiece(), this.takePiece(), this.takePiece()];
    this.spawnPiece();
    this.updateGhost();
    this.resizeCanvases();
  }

  resizeCanvases() {
    // Dynamically calculate block size according to container size
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const availableW = rect.width;
    const availableH = rect.height;

    // Target 10 cols x 20 rows
    const sizeByW = Math.floor(availableW / this.cols);
    const sizeByH = Math.floor(availableH / this.rows);
    this.blockSize = Math.max(18, Math.min(sizeByW, sizeByH));

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.cols * this.blockSize * dpr;
    this.canvas.height = this.rows * this.blockSize * dpr;
    this.canvas.style.width = `${this.cols * this.blockSize}px`;
    this.canvas.style.height = `${this.rows * this.blockSize}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (this.holdCanvas) {
      const hSize = 80;
      this.holdCanvas.width = hSize * dpr;
      this.holdCanvas.height = hSize * dpr;
      this.holdCanvas.style.width = `${hSize}px`;
      this.holdCanvas.style.height = `${hSize}px`;
      this.holdCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (this.nextCanvas) {
      const nWidth = 80;
      const nHeight = 220;
      this.nextCanvas.width = nWidth * dpr;
      this.nextCanvas.height = nHeight * dpr;
      this.nextCanvas.style.width = `${nWidth}px`;
      this.nextCanvas.style.height = `${nHeight}px`;
      this.nextCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  resetGrid() {
    this.grid = [];
    for (let r = 0; r < this.totalRows; r++) {
      this.grid.push(new Array(this.cols).fill(null));
    }
  }

  refillBag() {
    const pieces = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    // Fisher-Yates shuffle
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    this.bag = pieces;
  }

  takePiece() {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    const type = this.bag.pop();
    return {
      type,
      matrix: JSON.parse(JSON.stringify(SHAPES[type])),
      x: 0,
      y: 0
    };
  }

  spawnPiece() {
    this.saveUndoState();
    this.currentPiece = this.nextQueue.shift();
    this.nextQueue.push(this.takePiece());

    // Center piece at top
    this.currentPiece.x = Math.floor((this.cols - this.currentPiece.matrix[0].length) / 2);
    this.currentPiece.y = 0; // starts in buffer rows

    this.canHold = true;
    this.isLocking = false;
    if (this.lockTimer) clearTimeout(this.lockTimer);

    // Check collision on spawn
    if (this.collides(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y)) {
      if (this.mode === 'zen') {
        // Zen mode rescue! Clear top 4 rows
        this.rescueZenMode();
      } else {
        this.triggerGameOver();
      }
    } else {
      this.updateGhost();
      this.checkHeightWarning();
    }
  }

  checkHeightWarning() {
    // If blocks reach upper 5 rows, mascot gets worried
    let highestBlockRow = this.totalRows;
    for (let r = 0; r < this.totalRows; r++) {
      if (this.grid[r].some(cell => cell !== null)) {
        highestBlockRow = r;
        break;
      }
    }
    const visibleRow = highestBlockRow - this.hiddenRows;
    if (visibleRow <= 4 && this.onMascotReact) {
      this.onMascotReact('worried', 'Watch out! High stack! 🐰💦');
    }
  }

  rescueZenMode() {
    // Clear top 5 visible rows with cute confetti
    for (let r = this.hiddenRows; r < this.hiddenRows + 5; r++) {
      this.grid[r] = new Array(this.cols).fill(null);
    }
    if (window.soundEngine) window.soundEngine.playMagicWand();
    if (this.onMascotReact) {
      this.onMascotReact('cheer', 'Magic Fairy Saved You! 🧚✨');
    }
  }

  collides(matrix, px, py) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const newX = px + c;
          const newY = py + r;

          // Out of horizontal bounds
          if (newX < 0 || newX >= this.cols) return true;
          // Out of bottom bounds
          if (newY >= this.totalRows) return true;
          // Collide with placed block
          if (newY >= 0 && this.grid[newY][newX] !== null) return true;
        }
      }
    }
    return false;
  }

  moveLeft() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    if (!this.collides(this.currentPiece.matrix, this.currentPiece.x - 1, this.currentPiece.y)) {
      this.currentPiece.x--;
      this.resetLockDelay();
      this.updateGhost();
      if (window.soundEngine) window.soundEngine.playMove();
      return true;
    }
    return false;
  }

  moveRight() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    if (!this.collides(this.currentPiece.matrix, this.currentPiece.x + 1, this.currentPiece.y)) {
      this.currentPiece.x++;
      this.resetLockDelay();
      this.updateGhost();
      if (window.soundEngine) window.soundEngine.playMove();
      return true;
    }
    return false;
  }

  // Rotate clockwise with SRS wall kicks
  rotateClockwise() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    const original = this.currentPiece.matrix;
    const N = original.length;
    const rotated = original.map((val, index) =>
      original.map(row => row[index]).reverse()
    );

    // Wall kicks test offsets: [0,0], [-1,0], [1,0], [0,-1], [-2,0], [2,0]
    const kicks = [
      [0, 0], [-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0]
    ];

    for (const [ox, oy] of kicks) {
      if (!this.collides(rotated, this.currentPiece.x + ox, this.currentPiece.y + oy)) {
        this.currentPiece.matrix = rotated;
        this.currentPiece.x += ox;
        this.currentPiece.y += oy;
        this.resetLockDelay();
        this.updateGhost();
        if (window.soundEngine) window.soundEngine.playRotate();
        return true;
      }
    }
    return false;
  }

  rotateCounterClockwise() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    // Rotate 3 times clockwise is 1 counter-clockwise
    const original = this.currentPiece.matrix;
    const N = original.length;
    const rotated = original.map((val, index) =>
      original.map(row => row[row.length - 1 - index])
    );

    const kicks = [[0, 0], [1, 0], [-1, 0], [0, -1], [2, 0], [-2, 0]];
    for (const [ox, oy] of kicks) {
      if (!this.collides(rotated, this.currentPiece.x + ox, this.currentPiece.y + oy)) {
        this.currentPiece.matrix = rotated;
        this.currentPiece.x += ox;
        this.currentPiece.y += oy;
        this.resetLockDelay();
        this.updateGhost();
        if (window.soundEngine) window.soundEngine.playRotate();
        return true;
      }
    }
    return false;
  }

  softDrop() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    if (!this.collides(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
      this.score += 1; // Soft drop bonus point
      this.notifyStats();
      return true;
    } else {
      this.startLockTimer();
      return false;
    }
  }

  hardDrop() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return;
    let droppedRows = 0;
    while (!this.collides(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
      droppedRows++;
    }
    this.score += droppedRows * 2;
    this.squashAmount = 0.28; // Bouncy squash on impact!
    if (window.soundEngine) window.soundEngine.playHardDrop();
    this.lockPiece();
  }

  hold() {
    if (this.isPaused || this.isGameOver || !this.canHold || !this.currentPiece) return;
    if (window.soundEngine) window.soundEngine.playHold();

    const currentType = this.currentPiece.type;
    if (!this.holdPiece) {
      this.holdPiece = currentType;
      this.spawnPiece();
    } else {
      const temp = this.holdPiece;
      this.holdPiece = currentType;
      this.currentPiece = {
        type: temp,
        matrix: JSON.parse(JSON.stringify(SHAPES[temp])),
        x: Math.floor((this.cols - SHAPES[temp][0].length) / 2),
        y: 0
      };
      this.updateGhost();
    }
    this.canHold = false;
  }

  resetLockDelay() {
    if (this.isLocking) {
      clearTimeout(this.lockTimer);
      this.startLockTimer();
    }
  }

  startLockTimer() {
    if (this.isLocking) return;
    this.isLocking = true;
    this.lockTimer = setTimeout(() => {
      if (this.currentPiece && this.collides(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
        this.lockPiece();
      }
      this.isLocking = false;
    }, this.lockDelay);
  }

  lockPiece() {
    if (!this.currentPiece) return;
    clearTimeout(this.lockTimer);
    this.isLocking = false;

    // Stamp piece into grid
    const { matrix, x, y, type } = this.currentPiece;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const gy = y + r;
          const gx = x + c;
          if (gy >= 0 && gy < this.totalRows && gx >= 0 && gx < this.cols) {
            this.grid[gy][gx] = type;
          }
        }
      }
    }

    if (window.soundEngine) window.soundEngine.playLock();

    // Check for completed lines
    this.checkLines();
  }

  checkLines() {
    const fullRows = [];
    for (let r = 0; r < this.totalRows; r++) {
      if (this.grid[r].every(cell => cell !== null)) {
        fullRows.push(r);
      }
    }

    if (fullRows.length > 0) {
      this.clearingLines = fullRows;
      this.clearAnimProgress = 1.0;

      // Handle scores and rewards
      const count = fullRows.length;
      this.lines += count;
      this.combo++;

      // Star bonus for kids
      this.stars += count * 2 + (count === 4 ? 5 : 0);

      // Score calculation
      const linePoints = [0, 100, 300, 600, 1200];
      const basePoints = (linePoints[count] || 100) * this.level;
      const comboBonus = (this.combo - 1) * 50 * this.level;
      this.score += basePoints + comboBonus;

      // Level progression (kid friendly: every 10 lines)
      this.level = Math.floor(this.lines / 10) + 1;
      this.updateSpeed();

      if (window.soundEngine) window.soundEngine.playLineClear(count);

      // Trigger FX callback
      if (this.onLineClear) {
        this.onLineClear(count, this.combo, fullRows);
      }

      // Remove lines after brief squash animation
      setTimeout(() => {
        fullRows.forEach(r => {
          this.grid.splice(r, 1);
          this.grid.unshift(new Array(this.cols).fill(null));
        });
        this.clearingLines = [];
        this.spawnPiece();
      }, 250);
    } else {
      this.combo = 0;
      this.spawnPiece();
    }

    this.notifyStats();
  }

  updateSpeed() {
    if (this.mode === 'kids') {
      // Gentle speed: starts at 1100ms, lowest is 600ms
      this.dropInterval = Math.max(600, 1100 - (this.level - 1) * 50);
      this.lockDelay = 1200;
    } else if (this.mode === 'zen') {
      // Steady relaxing speed
      this.dropInterval = 950;
      this.lockDelay = 1400;
    } else {
      // Classic mode
      this.dropInterval = Math.max(150, 800 - (this.level - 1) * 70);
      this.lockDelay = 500;
    }
  }

  updateGhost() {
    if (!this.currentPiece) return;
    this.ghostPiece = {
      matrix: this.currentPiece.matrix,
      x: this.currentPiece.x,
      y: this.currentPiece.y
    };
    while (!this.collides(this.ghostPiece.matrix, this.ghostPiece.x, this.ghostPiece.y + 1)) {
      this.ghostPiece.y++;
    }
  }

  // --- Kid-Friendly Power-Ups: Undo & Magic Wand ---

  saveUndoState() {
    this.lastState = {
      grid: this.grid.map(row => [...row]),
      score: this.score,
      lines: this.lines,
      level: this.level,
      stars: this.stars,
      combo: this.combo
    };
  }

  undo() {
    if (!this.lastState || this.isGameOver) return false;
    this.grid = this.lastState.grid.map(row => [...row]);
    this.score = this.lastState.score;
    this.lines = this.lastState.lines;
    this.level = this.lastState.level;
    this.stars = this.lastState.stars;
    this.combo = this.lastState.combo;

    this.updateGhost();
    this.notifyStats();
    if (window.soundEngine) window.soundEngine.playUndo();
    if (this.onMascotReact) {
      this.onMascotReact('cheer', 'Oops fixed! 💫');
    }
    return true;
  }

  useMagicWand() {
    if (!this.magicWandAvailable || this.isGameOver || this.isPaused) return false;

    // Find the bottom-most row with blocks and blast it!
    for (let r = this.totalRows - 1; r >= 0; r--) {
      if (this.grid[r].some(cell => cell !== null)) {
        this.grid.splice(r, 1);
        this.grid.unshift(new Array(this.cols).fill(null));
        break;
      }
    }

    this.magicWandAvailable = false;
    this.magicWandCooldown = 15; // 15s cooldown

    if (window.soundEngine) window.soundEngine.playMagicWand();
    if (this.onMascotReact) {
      this.onMascotReact('dance', 'Magic Star Blast! 🪄✨');
    }

    if (this.magicWandTimer) clearInterval(this.magicWandTimer);
    this.magicWandTimer = setInterval(() => {
      this.magicWandCooldown--;
      if (this.magicWandCooldown <= 0) {
        this.magicWandAvailable = true;
        clearInterval(this.magicWandTimer);
      }
    }, 1000);

    return true;
  }

  notifyStats() {
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score, this.lines, this.level, this.stars);
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    if (window.soundEngine) window.soundEngine.playGameOver();
    if (this.onGameOver) this.onGameOver();
    if (this.onMascotReact) this.onMascotReact('cheer', "Good Effort! Let's play again! 💖");
  }

  restart() {
    this.isGameOver = false;
    this.isPaused = false;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.stars = 0;
    this.combo = 0;
    this.magicWandAvailable = true;
    this.magicWandCooldown = 0;
    this.init();
    this.notifyStats();
    if (window.soundEngine) {
      window.soundEngine.startBGM();
    }
  }

  // --- Rendering Loop ---

  update(delta) {
    if (this.isPaused || this.isGameOver) return;

    // Natural gravity drop
    const now = performance.now();
    if (now - this.lastDropTime > this.dropInterval) {
      this.softDrop();
      this.lastDropTime = now;
    }

    // Decay squash amount
    if (this.squashAmount > 0) {
      this.squashAmount = Math.max(0, this.squashAmount - 0.03);
    }
  }

  draw() {
    const ctx = this.ctx;
    const theme = THEMES[this.currentTheme] || THEMES.candy;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Board Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, this.cols * this.blockSize, this.rows * this.blockSize);

    // Draw Subtle Rounded Grid Lines
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    for (let c = 0; c <= this.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * this.blockSize, 0);
      ctx.lineTo(c * this.blockSize, this.rows * this.blockSize);
      ctx.stroke();
    }
    for (let r = 0; r <= this.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * this.blockSize);
      ctx.lineTo(this.cols * this.blockSize, r * this.blockSize);
      ctx.stroke();
    }

    // Draw Placed Blocks on Board
    for (let r = this.hiddenRows; r < this.totalRows; r++) {
      const displayY = r - this.hiddenRows;
      const isClearing = this.clearingLines.includes(r);

      for (let c = 0; c < this.cols; c++) {
        const type = this.grid[r][c];
        if (type) {
          const blockInfo = theme[type];
          this.drawCuteBlock(
            ctx,
            c * this.blockSize,
            displayY * this.blockSize,
            this.blockSize,
            blockInfo,
            isClearing ? 0.4 : 1.0,
            isClearing
          );
        }
      }
    }

    // Draw Ghost Piece
    if (this.ghostPiece && this.currentPiece) {
      const { matrix, x, y, type } = this.ghostPiece;
      const blockInfo = theme[type];
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const gy = y + r - this.hiddenRows;
            const gx = x + c;
            if (gy >= 0) {
              this.drawGhostBlock(
                ctx,
                gx * this.blockSize,
                gy * this.blockSize,
                this.blockSize,
                blockInfo
              );
            }
          }
        }
      }
    }

    // Draw Active Falling Piece (with squash bounce)
    if (this.currentPiece) {
      const { matrix, x, y, type } = this.currentPiece;
      const blockInfo = theme[type];
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const gy = y + r - this.hiddenRows;
            const gx = x + c;
            if (gy >= 0) {
              this.drawCuteBlock(
                ctx,
                gx * this.blockSize,
                gy * this.blockSize,
                this.blockSize,
                blockInfo,
                1.0,
                false,
                this.squashAmount
              );
            }
          }
        }
      }
    }

    // Draw Hold Piece
    this.drawHoldPreview();

    // Draw Next Queue Preview
    this.drawNextPreview();
  }

  // Draw Jelly-style rounded block with cute face & gloss highlight
  drawCuteBlock(ctx, x, y, size, blockInfo, alpha = 1.0, isClearing = false, squash = 0) {
    if (!blockInfo) return;
    ctx.save();
    ctx.globalAlpha = alpha;

    const pad = 2;
    const radius = 6;
    const w = size - pad * 2;
    const h = size - pad * 2;

    // Apply squash bounce if active
    let drawX = x + pad;
    let drawY = y + pad;
    let drawW = w;
    let drawH = h;

    if (squash > 0) {
      drawH = h * (1 - squash);
      drawW = w * (1 + squash * 0.5);
      drawY = y + pad + (h - drawH);
      drawX = x + pad - (drawW - w) / 2;
    }

    // Main rounded jelly body
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, drawW, drawH, radius);
    const grad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + drawH);
    grad.addColorStop(0, blockInfo.light);
    grad.addColorStop(0.5, blockInfo.base);
    grad.addColorStop(1, blockInfo.dark);
    ctx.fillStyle = grad;
    ctx.fill();

    // Cute border
    ctx.strokeStyle = blockInfo.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glossy Top Highlight
    ctx.beginPath();
    ctx.roundRect(drawX + 3, drawY + 3, drawW - 6, drawH * 0.35, 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    // Cute Facial Expression inside the block!
    const cx = drawX + drawW / 2;
    const cy = drawY + drawH / 2 + 1;

    // Little cute eyes
    ctx.fillStyle = '#2B2D42';
    const eyeOffsetX = drawW * 0.22;
    const eyeOffsetY = -1;
    const eyeRadius = Math.max(1.8, drawW * 0.08);

    ctx.beginPath();
    ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkles
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - eyeOffsetX - 0.7, cy + eyeOffsetY - 0.7, eyeRadius * 0.45, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffsetX - 0.7, cy + eyeOffsetY - 0.7, eyeRadius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Smiling tiny mouth
    ctx.beginPath();
    ctx.arc(cx, cy + drawH * 0.12, eyeRadius * 1.1, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.strokeStyle = '#2B2D42';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  // Draw translucent ghost block
  drawGhostBlock(ctx, x, y, size, blockInfo) {
    if (!blockInfo) return;
    ctx.save();
    ctx.globalAlpha = 0.35;
    const pad = 2;
    const radius = 6;
    ctx.beginPath();
    ctx.roundRect(x + pad, y + pad, size - pad * 2, size - pad * 2, radius);
    ctx.fillStyle = blockInfo.light;
    ctx.fill();
    ctx.strokeStyle = blockInfo.base;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.restore();
  }

  drawHoldPreview() {
    if (!this.holdCtx) return;
    const ctx = this.holdCtx;
    const theme = THEMES[this.currentTheme] || THEMES.candy;
    ctx.clearRect(0, 0, 80, 80);

    if (this.holdPiece) {
      const matrix = SHAPES[this.holdPiece];
      const blockInfo = theme[this.holdPiece];
      const previewBlockSize = 16;
      const offsetX = (80 - matrix[0].length * previewBlockSize) / 2;
      const offsetY = (80 - matrix.length * previewBlockSize) / 2;

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            this.drawCuteBlock(
              ctx,
              offsetX + c * previewBlockSize,
              offsetY + r * previewBlockSize,
              previewBlockSize,
              blockInfo,
              this.canHold ? 1.0 : 0.4
            );
          }
        }
      }
    }
  }

  drawNextPreview() {
    if (!this.nextCtx) return;
    const ctx = this.nextCtx;
    const theme = THEMES[this.currentTheme] || THEMES.candy;
    ctx.clearRect(0, 0, 80, 220);

    const previewBlockSize = 16;
    for (let i = 0; i < Math.min(3, this.nextQueue.length); i++) {
      const piece = this.nextQueue[i];
      const matrix = piece.matrix;
      const blockInfo = theme[piece.type];

      const slotY = 15 + i * 65;
      const offsetX = (80 - matrix[0].length * previewBlockSize) / 2;
      const offsetY = slotY + (48 - matrix.length * previewBlockSize) / 2;

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            this.drawCuteBlock(
              ctx,
              offsetX + c * previewBlockSize,
              offsetY + r * previewBlockSize,
              previewBlockSize,
              blockInfo
            );
          }
        }
      }
    }
  }
}

window.TetrisGame = TetrisGame;
window.THEMES = THEMES;
