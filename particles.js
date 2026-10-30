// Cute & High Performance Particle FX Engine for Kids Tetris
// Features hilarious cartoon pop animations, comic smoke poofs, bouncing googly eyes, and magical ambient wisps!

class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.clouds = [];
    this.ambientWisps = [];
    this.width = 0;
    this.height = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.lastTime = performance.now();
    this.initAmbientWisps();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Continuous ambient magical wisps drifting along screen margins
  initAmbientWisps() {
    this.ambientWisps = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      this.ambientWisps.push(this.createWisp(true));
    }
  }

  createWisp(randomY = false) {
    const isLeft = Math.random() < 0.5;
    const x = isLeft
      ? Math.random() * (this.width * 0.18 + 60)
      : this.width - Math.random() * (this.width * 0.18 + 60);
    const colors = ['#9D4EDD', '#FF9F1C', '#00F5D4', '#FF5E7E', '#70D6FF', '#FFD166'];
    return {
      x,
      y: randomY ? Math.random() * this.height : this.height + 20 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.5 + Math.random() * 1.1),
      radius: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.2 + Math.random() * 0.55,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.03 + Math.random() * 0.04
    };
  }

  // --- HILARIOUS ROW CLEAR EXPLOSION ---
  // Spawns comic smoke poofs, bouncing googly eyes, funny emojis, and comic text!
  spawnRowClearHilarious(boardLeft, boardTop, rowIndices, cols, blockSize, lineCount) {
    const funWords = [
      'POOF! 💨', 'POP! 💥', 'SQUISH! 🤪', 'BYE BYE! 👋',
      'KAPOW! ⚡', 'GHOSTED! 👻', 'POPCORN! 🍿', 'YAY! 🍬', 'BOING! 🌟', 'BOOM! 🎆'
    ];
    const funEmojis = ['👻', '🎃', '🦇', '💥', '💫', '🍿', '🍬', '⭐', '🤪', '💨', '🍭', '🍉', '🎈'];

    rowIndices.forEach((rowIndex, idx) => {
      const rowY = boardTop + (rowIndex + 0.5) * blockSize;
      const boardWidth = cols * blockSize;
      const boardCenterX = boardLeft + boardWidth / 2;

      // 1. Expanding shockwave ring
      this.spawnShockwave(boardCenterX, rowY, 'rgba(255, 209, 102, 0.9)');

      // 2. Comic Smoke Poofs along the row
      const poofCount = Math.min(10, cols);
      for (let c = 0; c < poofCount; c += 2) {
        const poofX = boardLeft + (c + 0.5) * blockSize;
        this.spawnComicPoof(poofX, rowY);
      }

      // 3. Bouncing Googly Eyes! (Hilarious cartoon eyes popping out)
      const eyePairs = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < eyePairs; i++) {
        const eyeX = boardLeft + Math.random() * boardWidth;
        const speedX = (Math.random() - 0.5) * 6;
        const speedY = -4 - Math.random() * 5;
        this.spawnBouncingGooglyEyes(eyeX, rowY, speedX, speedY);
      }

      // 4. Flying Comic Emojis bursting in arcs
      const emojiCount = 6 + lineCount * 3;
      for (let i = 0; i < emojiCount; i++) {
        const ex = boardLeft + Math.random() * boardWidth;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
        const speed = 4 + Math.random() * 7;
        const emoji = funEmojis[Math.floor(Math.random() * funEmojis.length)];

        this.particles.push({
          x: ex,
          y: rowY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 20 + Math.random() * 12,
          emoji,
          rotation: (Math.random() - 0.5) * 0.4,
          rotSpeed: (Math.random() - 0.5) * 0.25,
          alpha: 1.0,
          decay: 0.016 + Math.random() * 0.01,
          gravity: 0.2,
          type: 'emoji'
        });
      }

      // 5. Star & Confetti sparkles
      this.spawnStars(boardCenterX, rowY, 18, ['#FFD166', '#FF5E7E', '#00F5D4', '#9D4EDD', '#FF9F1C']);
      if (lineCount >= 2) {
        this.spawnConfetti(boardCenterX, rowY, 25);
      }
    });

    // 6. Giant Comical Action Text popping in center of cleared area
    const avgRow = rowIndices.reduce((a, b) => a + b, 0) / rowIndices.length;
    const centerRowY = boardTop + (avgRow + 0.5) * blockSize;
    const boardCenterX = boardLeft + (cols * blockSize) / 2;
    const chosenWord = funWords[Math.floor(Math.random() * funWords.length)];
    this.spawnFloatingText(chosenWord, boardCenterX, centerRowY - 10, '#FFE66D', 34);
  }

  // Comic puffy smoke cloud (group of expanding soft puffs)
  spawnComicPoof(x, y) {
    const puffColors = ['#FFFFFF', '#FFF0F5', '#FFF9DB'];
    for (let i = 0; i < 4; i++) {
      const offsetX = (Math.random() - 0.5) * 22;
      const offsetY = (Math.random() - 0.5) * 14;
      this.clouds.push({
        x: x + offsetX,
        y: y + offsetY,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -0.6 - Math.random() * 1.0,
        radius: 8 + Math.random() * 8,
        maxRadius: 24 + Math.random() * 12,
        growth: 0.9,
        color: puffColors[Math.floor(Math.random() * puffColors.length)],
        alpha: 0.9,
        decay: 0.03 + Math.random() * 0.02
      });
    }
  }

  // Hilarious bouncing googly eyes that tumble and land
  spawnBouncingGooglyEyes(x, y, vx, vy) {
    const pupilOffsetAngle = Math.random() * Math.PI * 2;
    this.particles.push({
      x,
      y,
      vx,
      vy,
      size: 13 + Math.random() * 4,
      pupilAngle: pupilOffsetAngle,
      pupilDistance: 3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      alpha: 1.0,
      decay: 0.012,
      gravity: 0.26,
      floorY: this.height - 30,
      bounces: 0,
      type: 'googlyEye'
    });
  }

  // Spawn star explosion at (x, y)
  spawnStars(x, y, count = 20, colors = ['#FFD166', '#FF9F1C', '#FF6B6B', '#4D96FF', '#6BCB77']) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 8 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.015,
        gravity: 0.12,
        type: 'star'
      });
    }
  }

  // Confetti explosion
  spawnConfetti(x, y, count = 35) {
    const colors = ['#FF5E7E', '#FFD166', '#06D6A0', '#118AB2', '#9B5DE5', '#F15BB5', '#FEE440'];
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 1.5;
      const speed = 3 + Math.random() * 6;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 7 + Math.random() * 7,
        widthRatio: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.01,
        gravity: 0.15,
        type: 'confetti'
      });
    }
  }

  // Cute floating hearts
  spawnHearts(x, y, count = 10) {
    const colors = ['#FF6B8B', '#FF8E72', '#FF477E', '#FF70A6'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = 1.5 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 10 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.01,
        gravity: -0.04,
        type: 'heart'
      });
    }
  }

  // Magic wand / cauldron sparkles
  spawnMagicSparkles(x, y, count = 30) {
    const colors = ['#00F5D4', '#70FFF0', '#FFD166', '#C77DFF', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.025 + Math.random() * 0.02,
        gravity: 0.03,
        type: 'sparkle'
      });
    }
  }

  // Cauldron burst (potion bubbles & steam)
  spawnCauldronBurst(x, y) {
    const colors = ['#06D6A0', '#00F5D4', '#9D4EDD', '#70FFF0'];
    for (let i = 0; i < 22; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 2 + Math.random() * 4.5;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.025,
        gravity: -0.05, // Float up like bubbly steam!
        type: 'sparkle'
      });
    }
  }

  // Pumpkin glowing embers
  spawnPumpkinEmbers(x, y) {
    const colors = ['#FF9F1C', '#FFD166', '#FF5E7E', '#FFE494'];
    for (let i = 0; i < 16; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y - 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.022,
        gravity: -0.04,
        type: 'sparkle'
      });
    }
  }

  // Ghost friendly giggle hearts
  spawnGhostHearts(x, y) {
    this.spawnHearts(x, y, 8);
    this.spawnStars(x, y, 10, ['#70FFF0', '#C77DFF', '#FFFFFF']);
  }

  // Floating text like "+100 ⭐", "POOF!", "AWESOME!"
  spawnFloatingText(text, x, y, color = '#FFD166', fontSize = 28) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -2.2,
      alpha: 1.0,
      decay: 0.016,
      color,
      fontSize,
      scale: 0.4,
      scaleTarget: 1.25,
      rotation: (Math.random() - 0.5) * 0.25
    });
  }

  // Expanding shockwave ripple
  spawnShockwave(x, y, color = 'rgba(255, 230, 109, 0.8)') {
    this.shockwaves.push({
      x,
      y,
      radius: 12,
      maxRadius: 180,
      color,
      alpha: 1.0,
      decay: 0.035
    });
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.3, x, y + size);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.3, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }

  drawGooglyEye(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    // Eye White with outline
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#2B2D42';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Pupil
    const pupilX = Math.cos(p.pupilAngle) * p.pupilDistance;
    const pupilY = Math.sin(p.pupilAngle) * p.pupilDistance;
    const pupilR = p.size * 0.45;

    ctx.beginPath();
    ctx.arc(pupilX, pupilY, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = '#2B2D42';
    ctx.fill();

    // Glint
    ctx.beginPath();
    ctx.arc(pupilX - pupilR * 0.3, pupilY - pupilR * 0.3, pupilR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();
  }

  animate(now) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Ambient magical wisps along sides
    for (let i = 0; i < this.ambientWisps.length; i++) {
      const wisp = this.ambientWisps[i];
      wisp.x += wisp.vx;
      wisp.y += wisp.vy;
      wisp.pulse += wisp.pulseSpeed;

      if (wisp.y < -20) {
        this.ambientWisps[i] = this.createWisp(false);
        continue;
      }

      const r = wisp.radius + Math.sin(wisp.pulse) * 1.5;
      const alpha = Math.max(0, wisp.alpha + Math.sin(wisp.pulse) * 0.15);

      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = wisp.color;
      this.ctx.shadowColor = wisp.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(wisp.x, wisp.y, r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 2. Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 7;
      sw.alpha -= sw.decay;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = sw.color.replace('0.9', `${sw.alpha * 0.9}`);
      this.ctx.lineWidth = 4.5;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 3. Comic Smoke Clouds
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const c = this.clouds[i];
      c.x += c.vx;
      c.y += c.vy;
      if (c.radius < c.maxRadius) {
        c.radius += c.growth;
      }
      c.alpha -= c.decay;
      if (c.alpha <= 0) {
        this.clouds.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, c.alpha);
      this.ctx.fillStyle = c.color;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(43, 45, 66, 0.15)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 4. Main Particles (Stars, Emojis, Confetti, Googly Eyes)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      // Bounce check for googly eyes
      if (p.floorY && p.y >= p.floorY && p.bounces < 2) {
        p.y = p.floorY;
        p.vy = -p.vy * 0.55;
        p.vx *= 0.7;
        p.bounces++;
      }

      if (p.rotation !== undefined && p.rotSpeed) {
        p.rotation += p.rotSpeed;
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'googlyEye') {
        this.drawGooglyEye(this.ctx, p);
      } else if (p.type === 'emoji') {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.font = `${p.size}px 'Fredoka', 'Nunito', sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.emoji, 0, 0);
      } else if (p.type === 'star') {
        this.ctx.fillStyle = p.color;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.drawStar(this.ctx, 0, 0, 5, p.size, p.size * 0.45);
      } else if (p.type === 'confetti') {
        this.ctx.fillStyle = p.color;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillRect(-p.size / 2, (-p.size * p.widthRatio) / 2, p.size, p.size * p.widthRatio);
      } else if (p.type === 'heart') {
        this.ctx.fillStyle = p.color;
        this.drawHeart(this.ctx, p.x, p.y, p.size);
      } else if (p.type === 'sparkle') {
        this.ctx.fillStyle = p.color;
        this.ctx.translate(p.x, p.y);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    // 5. Floating Action Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= ft.decay;
      if (ft.scale < ft.scaleTarget) {
        ft.scale += 0.09;
      }

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.alpha);
      this.ctx.translate(ft.x, ft.y);
      this.ctx.rotate(ft.rotation);
      this.ctx.scale(ft.scale, ft.scale);

      this.ctx.font = `900 ${ft.fontSize}px 'Fredoka', 'Nunito', sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Bold comical cartoon outline
      this.ctx.strokeStyle = '#2B2D42';
      this.ctx.lineWidth = 7;
      this.ctx.lineJoin = 'round';
      this.ctx.strokeText(ft.text, 0, 0);

      // Bright fill
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, 0, 0);

      this.ctx.restore();
    }

    requestAnimationFrame(this.animate);
  }
}

window.ParticleEngine = ParticleEngine;
