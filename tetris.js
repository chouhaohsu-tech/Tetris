// Kids Tetris Engine with Kid-Friendly Rules, Cute Themes, and SRS Rotation
// Engineered for 5-8 year old children: Score strictly from clearing lines, snappy landing!

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

    // Grid Dimensions: 10 cols x 20 visible rows
    this.cols = 10;
    this.rows = 20;
    this.blockSize = 28;

    // Game Mode: 'kids' (gentle), 'zen' (no game over), 'classic'
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

    // Trophy Score & Stars (Earned strictly from clearing lines!)
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.stars = 0;
    this.combo = 0;

    // Magic Wand Power
    this.magicWandAvailable = true;
    this.magicWandCooldown = 0;
    this.magicWandTimer = null;

    // Animation & Squash FX
    this.squashAmount = 0;
    this.clearingLines = [];

    // Drop timings
    this.dropInterval = 1000; // ms
    this.lastDropTime = 0;
    this.lockTimer = null;

    this.isPaused = false;
    this.isGameOver = false;

    // Event hooks
    this.onLineClear = null;
    this.onScoreUpdate = null;
    this.onGameOver = null;
    this.onMascotReact = null;

    this.init();
  }

  init() {
    this.resetGrid();
    this.refillBag();
    this.nextQueue = [this.takePiece(), this.takePiece()];
    this.resizeCanvases();
  }

  start() {
    this.isGameOver = false;
    this.isPaused = false;
    this.resetGrid();
    this.spawnPiece();
    this.updateGhost();
    this.notifyStats();
  }

  resizeCanvases() {
    const container = this.canvas.closest('.board-container') || this.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const pad = 16;
    const availW = Math.max(120, rect.width - pad);
    const availH = Math.max(200, rect.height - pad);

    const sizeByW = Math.floor(availW / this.cols);
    const sizeByH = Math.floor(availH / this.rows);

    // Dynamic block size allowing up to 48px on large PC displays!
    this.blockSize = Math.max(16, Math.min(sizeByW, sizeByH, 48));

    const dpr = window.devicePixelRatio || 1;
    const boardW = this.cols * this.blockSize;
    const boardH = this.rows * this.blockSize;

    this.canvas.width = boardW * dpr;
    this.canvas.height = boardH * dpr;
    this.canvas.style.width = `${boardW}px`;
    this.canvas.style.height = `${boardH}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (this.holdCanvas) {
      const hSize = 58;
      this.holdCanvas.width = hSize * dpr;
      this.holdCanvas.height = hSize * dpr;
      this.holdCanvas.style.width = `${hSize}px`;
      this.holdCanvas.style.height = `${hSize}px`;
      this.holdCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (this.nextCanvas) {
      const nSize = 58;
      this.nextCanvas.width = nSize * dpr;
      this.nextCanvas.height = nSize * dpr;
      this.nextCanvas.style.width = `${nSize}px`;
      this.nextCanvas.style.height = `${nSize}px`;
      this.nextCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  resetGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid.push(new Array(this.cols).fill(null));
    }
  }

  refillBag() {
    const pieces = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
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
    this.currentPiece = this.nextQueue.shift();
    this.nextQueue.push(this.takePiece());

    this.currentPiece.x = Math.floor((this.cols - this.currentPiece.matrix[0].length) / 2);
    this.currentPiece.y = 0;

    this.canHold = true;
    if (this.lockTimer) clearTimeout(this.lockTimer);

    if (this.collides(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y)) {
      if (this.mode === 'zen') {
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
    let highestBlockRow = this.rows;
    for (let r = 0; r < this.rows; r++) {
      if (this.grid[r].some(cell => cell !== null)) {
        highestBlockRow = r;
        break;
      }
    }
    if (highestBlockRow <= 4 && this.onMascotReact) {
      this.onMascotReact('worried', 'Stack is high! 🐰💦');
    }
  }

  rescueZenMode() {
    for (let r = 0; r < 4; r++) {
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

          if (newX < 0 || newX >= this.cols) return true;
          if (newY >= this.rows) return true;
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
      this.updateGhost();
      if (window.soundEngine) window.soundEngine.playMove();
      return true;
    }
    return false;
  }

  rotateClockwise() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    const original = this.currentPiece.matrix;
    const rotated = original.map((val, index) =>
      original.map(row => row[index]).reverse()
    );

    const kicks = [
      [0, 0], [-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0]
    ];

    for (const [ox, oy] of kicks) {
      if (!this.collides(rotated, this.currentPiece.x + ox, this.currentPiece.y + oy)) {
        this.currentPiece.matrix = rotated;
        this.currentPiece.x += ox;
        this.currentPiece.y += oy;
        this.updateGhost();
        if (window.soundEngine) window.soundEngine.playRotate();
        return true;
      }
    }
    return false;
  }

  // Soft drop (Down button): Moves 1 step down. NO SCORE ADDED.
  softDrop() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    if (!this.collides(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  // Natural gravity tick: Moves 1 step down. NO SCORE ADDED.
  naturalDrop() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    if (!this.collides(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  // Hard drop: slams to bottom. NO SCORE ADDED (Score only from lines!).
  hardDrop() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return;
    while (!this.collides(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
    }
    this.squashAmount = 0.25;
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

  lockPiece() {
    if (!this.currentPiece) return;
    clearTimeout(this.lockTimer);

    const { matrix, x, y, type } = this.currentPiece;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const gy = y + r;
          const gx = x + c;
          if (gy >= 0 && gy < this.rows && gx >= 0 && gx < this.cols) {
            this.grid[gy][gx] = type;
          }
        }
      }
    }

    this.currentPiece = null;
    this.ghostPiece = null;

    if (window.soundEngine) window.soundEngine.playLock();
    this.checkLines();
  }

  // 🏆 Score is strictly earned here when lines are completed!
  checkLines() {
    const fullRows = [];
    for (let r = 0; r < this.rows; r++) {
      if (this.grid[r].every(cell => cell !== null)) {
        fullRows.push(r);
      }
    }

    if (fullRows.length > 0) {
      this.clearingLines = fullRows;

      const count = fullRows.length;
      this.lines += count;
      this.combo++;
      this.stars += count * 2 + (count === 4 ? 6 : 0);

      // Score points exclusively from lines
      const linePoints = [0, 100, 300, 600, 1200];
      const basePoints = (linePoints[count] || 100) * this.level;
      const comboBonus = (this.combo - 1) * 50 * this.level;
      this.score += basePoints + comboBonus;

      this.level = Math.floor(this.lines / 10) + 1;
      this.updateSpeed();

      if (window.soundEngine) window.soundEngine.playLineClear(count);
      if (this.onLineClear) {
        this.onLineClear(count, this.combo, fullRows);
      }

      setTimeout(() => {
        const remaining = this.grid.filter((_, idx) => !fullRows.includes(idx));
        const newEmpty = Array.from({ length: fullRows.length }, () => new Array(this.cols).fill(null));
        this.grid = [...newEmpty, ...remaining];
        this.clearingLines = [];
        this.spawnPiece();
        this.notifyStats();
      }, 200);
    } else {
      this.combo = 0;
      this.spawnPiece();
      this.notifyStats();
    }
  }

  updateSpeed() {
    if (this.mode === 'kids') {
      this.dropInterval = Math.max(700, 1000 - (this.level - 1) * 40);
    } else if (this.mode === 'zen') {
      this.dropInterval = 950;
    } else {
      this.dropInterval = Math.max(200, 800 - (this.level - 1) * 60);
    }
  }

  updateGhost() {
    if (!this.currentPiece) {
      this.ghostPiece = null;
      return;
    }
    this.ghostPiece = {
      matrix: this.currentPiece.matrix,
      x: this.currentPiece.x,
      y: this.currentPiece.y
    };
    while (!this.collides(this.ghostPiece.matrix, this.ghostPiece.x, this.ghostPiece.y + 1)) {
      this.ghostPiece.y++;
    }
  }

  useMagicWand() {
    if (!this.magicWandAvailable || this.isGameOver || this.isPaused) return false;

    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].some(cell => cell !== null)) {
        this.grid.splice(r, 1);
        this.grid.unshift(new Array(this.cols).fill(null));
        break;
      }
    }

    this.magicWandAvailable = false;
    this.magicWandCooldown = 15;

    if (window.soundEngine) window.soundEngine.playMagicWand();
    if (this.onMascotReact) {
      this.onMascotReact('dance', 'Magic Blast! 🪄✨');
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
    if (this.onMascotReact) this.onMascotReact('cheer', "Good Job! 🌟 Let's play again!");
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
    this.start();
    if (window.soundEngine) {
      window.soundEngine.startBGM();
    }
  }

  update(delta) {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return;

    const now = performance.now();
    if (now - this.lastDropTime > this.dropInterval) {
      this.naturalDrop();
      this.lastDropTime = now;
    }

    if (this.squashAmount > 0) {
      this.squashAmount = Math.max(0, this.squashAmount - 0.03);
    }
  }

  draw() {
    const ctx = this.ctx;
    const theme = THEMES[this.currentTheme] || THEMES.candy;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Board Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, this.cols * this.blockSize, this.rows * this.blockSize);

    // Subtle Grid Lines
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

    // Placed Blocks
    for (let r = 0; r < this.rows; r++) {
      const isClearing = this.clearingLines.includes(r);
      for (let c = 0; c < this.cols; c++) {
        const type = this.grid[r][c];
        if (type) {
          const blockInfo = theme[type];
          this.drawCuteBlock(
            ctx,
            c * this.blockSize,
            r * this.blockSize,
            this.blockSize,
            blockInfo,
            isClearing ? 0.35 : 1.0,
            isClearing
          );
        }
      }
    }

    // Ghost Piece
    if (this.ghostPiece && this.currentPiece) {
      const { matrix, x, y, type } = this.ghostPiece;
      const blockInfo = theme[type];
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const gy = y + r;
            const gx = x + c;
            if (gy >= 0 && gy < this.rows) {
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

    // Active Falling Piece
    if (this.currentPiece) {
      const { matrix, x, y, type } = this.currentPiece;
      const blockInfo = theme[type];
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const gy = y + r;
            const gx = x + c;
            if (gy >= 0 && gy < this.rows) {
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

    this.drawHoldPreview();
    this.drawNextPreview();
  }

  drawCuteBlock(ctx, x, y, size, blockInfo, alpha = 1.0, isClearing = false, squash = 0) {
    if (!blockInfo) return;
    ctx.save();
    ctx.globalAlpha = alpha;

    const pad = 1.5;
    const radius = 5;
    const w = size - pad * 2;
    const h = size - pad * 2;

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

    ctx.beginPath();
    ctx.roundRect(drawX, drawY, drawW, drawH, radius);
    const grad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + drawH);
    grad.addColorStop(0, blockInfo.light);
    grad.addColorStop(0.5, blockInfo.base);
    grad.addColorStop(1, blockInfo.dark);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = blockInfo.dark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(drawX + 2, drawY + 2, drawW - 4, drawH * 0.35, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    if (size >= 16) {
      const cx = drawX + drawW / 2;
      const cy = drawY + drawH / 2 + 1;
      const eyeOffsetX = drawW * 0.22;
      const eyeRadius = Math.max(1.5, drawW * 0.08);

      ctx.fillStyle = '#2B2D42';
      ctx.beginPath();
      ctx.arc(cx - eyeOffsetX, cy - 1, eyeRadius, 0, Math.PI * 2);
      ctx.arc(cx + eyeOffsetX, cy - 1, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - eyeOffsetX - 0.5, cy - 1.5, eyeRadius * 0.4, 0, Math.PI * 2);
      ctx.arc(cx + eyeOffsetX - 0.5, cy - 1.5, eyeRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy + drawH * 0.12, eyeRadius * 1.1, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.strokeStyle = '#2B2D42';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawGhostBlock(ctx, x, y, size, blockInfo) {
    if (!blockInfo) return;
    ctx.save();
    ctx.globalAlpha = 0.35;
    const pad = 1.5;
    const radius = 5;
    ctx.beginPath();
    ctx.roundRect(x + pad, y + pad, size - pad * 2, size - pad * 2, radius);
    ctx.fillStyle = blockInfo.light;
    ctx.fill();
    ctx.strokeStyle = blockInfo.base;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 2]);
    ctx.stroke();
    ctx.restore();
  }

  drawHoldPreview() {
    if (!this.holdCtx) return;
    const ctx = this.holdCtx;
    const theme = THEMES[this.currentTheme] || THEMES.candy;
    ctx.clearRect(0, 0, 58, 58);

    if (this.holdPiece) {
      const matrix = SHAPES[this.holdPiece];
      const blockInfo = theme[this.holdPiece];
      const pSize = 13;
      const offsetX = (58 - matrix[0].length * pSize) / 2;
      const offsetY = (58 - matrix.length * pSize) / 2;

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            this.drawCuteBlock(
              ctx,
              offsetX + c * pSize,
              offsetY + r * pSize,
              pSize,
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
    ctx.clearRect(0, 0, 58, 58);

    if (this.nextQueue.length > 0) {
      const piece = this.nextQueue[0];
      const matrix = piece.matrix;
      const blockInfo = theme[piece.type];
      const pSize = 13;
      const offsetX = (58 - matrix[0].length * pSize) / 2;
      const offsetY = (58 - matrix.length * pSize) / 2;

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            this.drawCuteBlock(
              ctx,
              offsetX + c * pSize,
              offsetY + r * pSize,
              pSize,
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
