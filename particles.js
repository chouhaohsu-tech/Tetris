// Cute & High Performance Particle FX Engine for Kids Tetris
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.width = 0;
    this.height = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.lastTime = performance.now();
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

  // Confetti explosion for multi-line clears or level ups
  spawnConfetti(x, y, count = 40) {
    const colors = ['#FF5E7E', '#FFD166', '#06D6A0', '#118AB2', '#9B5DE5', '#F15BB5', '#FEE440'];
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 1.5;
      const speed = 3 + Math.random() * 7;
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
        decay: 0.01 + Math.random() * 0.01,
        gravity: 0.15,
        type: 'confetti'
      });
    }
  }

  // Cute floating hearts / bubbles
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
        gravity: -0.04, // Float upward!
        type: 'heart'
      });
    }
  }

  // Cute magic wand sparkles
  spawnMagicSparkles(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: '#FFF275',
        alpha: 1.0,
        decay: 0.025 + Math.random() * 0.02,
        gravity: 0.03,
        type: 'sparkle'
      });
    }
  }

  // Floating text like "+100 ⭐", "AMAZING!", "YAY!"
  spawnFloatingText(text, x, y, color = '#FFD166', fontSize = 28) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -2.0,
      alpha: 1.0,
      decay: 0.015,
      color,
      fontSize,
      scale: 0.5,
      scaleTarget: 1.2,
      rotation: (Math.random() - 0.5) * 0.2
    });
  }

  // Expanding shockwave ripple
  spawnShockwave(x, y, color = 'rgba(255, 230, 109, 0.8)') {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 160,
      color,
      alpha: 1.0,
      decay: 0.03
    });
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
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
    // Top left curve
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    // Bottom left curve
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.3, x, y + size);
    // Bottom right curve
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.3, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    // Top right curve
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }

  animate(now) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update & draw shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 6;
      sw.alpha -= sw.decay;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = sw.color.replace('0.8', `${sw.alpha * 0.8}`);
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Update & draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      if (p.rotation !== undefined && p.rotSpeed) {
        p.rotation += p.rotSpeed;
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;

      if (p.type === 'star') {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.drawStar(this.ctx, 0, 0, 5, p.size, p.size * 0.45);
      } else if (p.type === 'confetti') {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillRect(-p.size / 2, -p.size * p.widthRatio / 2, p.size, p.size * p.widthRatio);
      } else if (p.type === 'heart') {
        this.drawHeart(this.ctx, p.x, p.y, p.size);
      } else if (p.type === 'sparkle') {
        this.ctx.translate(p.x, p.y);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    // Update & draw floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= ft.decay;
      if (ft.scale < ft.scaleTarget) {
        ft.scale += 0.08;
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

      // Outline
      this.ctx.strokeStyle = '#2b2d42';
      this.ctx.lineWidth = 6;
      this.ctx.lineJoin = 'round';
      this.ctx.strokeText(ft.text, 0, 0);

      // Text Fill
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, 0, 0);

      this.ctx.restore();
    }

    requestAnimationFrame(this.animate);
  }
}

window.ParticleEngine = ParticleEngine;
