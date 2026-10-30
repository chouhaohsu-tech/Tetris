// Cute Mascot Companion for Kids Tetris Adventure
// Features interactive animated SVG mascot with expressions, cheering, and giggle interactions!

class MascotCompanion {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentMood = 'idle'; // 'idle', 'cheer', 'dance', 'worried', 'celebrate'
    this.bubbleTimer = null;
    this.blinkTimer = null;
    this.init();
  }

  init() {
    this.render();
    this.startBlinking();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="mascot-wrapper" id="mascotBody" title="Tap me!">
        <!-- Speech Bubble -->
        <div class="mascot-bubble" id="mascotBubble">
          <span id="mascotSpeech">Let's Play! 🌟</span>
        </div>

        <!-- Mascot SVG Character (Bubu the Bunny) -->
        <svg class="mascot-svg" id="mascotSvg" viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bunnyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFF0F5" />
              <stop offset="100%" stop-color="#FFD1DC" />
            </linearGradient>
            <linearGradient id="earInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FF9AA2" />
              <stop offset="100%" stop-color="#FFB7B2" />
            </linearGradient>
            <filter id="cuteShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.12" />
            </filter>
          </defs>

          <!-- Shadow underneath -->
          <ellipse cx="60" cy="122" rx="35" ry="7" fill="rgba(0,0,0,0.12)" />

          <!-- Left Ear -->
          <g class="mascot-ear left-ear">
            <ellipse cx="40" cy="35" rx="12" ry="32" fill="url(#bunnyGrad)" transform="rotate(-12 40 35)" />
            <ellipse cx="40" cy="36" rx="6" ry="22" fill="url(#earInnerGrad)" transform="rotate(-12 40 36)" />
          </g>

          <!-- Right Ear -->
          <g class="mascot-ear right-ear">
            <ellipse cx="80" cy="35" rx="12" ry="32" fill="url(#bunnyGrad)" transform="rotate(12 80 35)" />
            <ellipse cx="80" cy="36" rx="6" ry="22" fill="url(#earInnerGrad)" transform="rotate(12 80 36)" />
          </g>

          <!-- Head & Body -->
          <g filter="url(#cuteShadow)">
            <!-- Chubby Body -->
            <ellipse cx="60" cy="95" rx="36" ry="28" fill="url(#bunnyGrad)" />
            <ellipse cx="60" cy="98" rx="20" ry="16" fill="#FFFFFF" opacity="0.8" />

            <!-- Paws -->
            <g class="mascot-paws">
              <ellipse class="paw-left" cx="38" cy="96" rx="9" ry="8" fill="#FFF0F5" />
              <ellipse class="paw-right" cx="82" cy="96" rx="9" ry="8" fill="#FFF0F5" />
            </g>

            <!-- Feet -->
            <ellipse cx="44" cy="118" rx="12" ry="8" fill="#FFF0F5" />
            <ellipse cx="76" cy="118" rx="12" ry="8" fill="#FFF0F5" />

            <!-- Head -->
            <circle cx="60" cy="65" r="34" fill="url(#bunnyGrad)" />
          </g>

          <!-- Cheeks (Blushing) -->
          <ellipse class="cheek" cx="36" cy="74" rx="7" ry="4" fill="#FF8BA7" opacity="0.65" />
          <ellipse class="cheek" cx="84" cy="74" rx="7" ry="4" fill="#FF8BA7" opacity="0.65" />

          <!-- Eyes Group -->
          <g id="mascotEyes">
            <!-- Left Eye -->
            <circle class="eye-pupil" cx="46" cy="64" r="5" fill="#2B2D42" />
            <circle class="eye-glint" cx="44" cy="62" r="2" fill="#FFFFFF" />
            <!-- Right Eye -->
            <circle class="eye-pupil" cx="74" cy="64" r="5" fill="#2B2D42" />
            <circle class="eye-glint" cx="72" cy="62" r="2" fill="#FFFFFF" />
          </g>

          <!-- Cute Nose -->
          <polygon points="60,70 56,66 64,66" fill="#FF6B8B" />

          <!-- Cute Mouth -->
          <path id="mascotMouth" d="M 54 73 Q 60 78 60 74 Q 60 78 66 73" fill="none" stroke="#2B2D42" stroke-width="2.5" stroke-linecap="round" />

          <!-- Star / Bow decoration on ear -->
          <g transform="translate(74, 45) scale(0.7)">
            <circle cx="0" cy="0" r="6" fill="#FFD166" />
            <circle cx="-5" cy="0" r="4" fill="#FF9F1C" />
            <circle cx="5" cy="0" r="4" fill="#FF9F1C" />
          </g>
        </svg>
      </div>
    `;

    this.wrapper = this.container.querySelector('#mascotBody');
    this.speechEl = this.container.querySelector('#mascotSpeech');
    this.bubbleEl = this.container.querySelector('#mascotBubble');
    this.eyesEl = this.container.querySelector('#mascotEyes');
    this.mouthEl = this.container.querySelector('#mascotMouth');
  }

  attachEvents() {
    if (!this.wrapper) return;
    this.wrapper.addEventListener('pointerdown', () => {
      this.giggle();
    });
  }

  say(phrase, duration = 3000) {
    if (!this.speechEl || !this.bubbleEl) return;
    this.speechEl.textContent = phrase;
    this.bubbleEl.classList.remove('hidden', 'pop-in');
    void this.bubbleEl.offsetWidth; // trigger reflow
    this.bubbleEl.classList.add('pop-in');

    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      if (this.bubbleEl) this.bubbleEl.classList.add('hidden');
    }, duration);
  }

  setMood(mood) {
    this.currentMood = mood;
    if (!this.wrapper) return;
    this.wrapper.classList.remove('mood-idle', 'mood-cheer', 'mood-dance', 'mood-worried', 'mood-celebrate');
    this.wrapper.classList.add(`mood-${mood}`);

    // Update expressions
    if (mood === 'cheer') {
      this.setHappyFace();
      this.say(this.getRandomCheerPhrase());
    } else if (mood === 'dance' || mood === 'celebrate') {
      this.setStarFace();
      this.say(this.getRandomCelebrationPhrase());
    } else if (mood === 'worried') {
      this.setWorriedFace();
      this.say("Uh-oh! Stack is high! 🐰💦");
    } else {
      this.setNormalFace();
    }
  }

  setNormalFace() {
    if (!this.eyesEl || !this.mouthEl) return;
    this.eyesEl.innerHTML = `
      <circle cx="46" cy="64" r="5" fill="#2B2D42" />
      <circle cx="44" cy="62" r="2" fill="#FFFFFF" />
      <circle cx="74" cy="64" r="5" fill="#2B2D42" />
      <circle cx="72" cy="62" r="2" fill="#FFFFFF" />
    `;
    this.mouthEl.setAttribute('d', 'M 54 73 Q 60 78 60 74 Q 60 78 66 73');
  }

  setHappyFace() {
    if (!this.eyesEl || !this.mouthEl) return;
    // Smiling eyes (curved arcs)
    this.eyesEl.innerHTML = `
      <path d="M 40 65 Q 46 58 52 65" fill="none" stroke="#2B2D42" stroke-width="3" stroke-linecap="round" />
      <path d="M 68 65 Q 74 58 80 65" fill="none" stroke="#2B2D42" stroke-width="3" stroke-linecap="round" />
    `;
    // Open happy mouth
    this.mouthEl.setAttribute('d', 'M 52 72 Q 60 84 68 72 Z');
    this.mouthEl.setAttribute('fill', '#FF5E7E');
  }

  setStarFace() {
    if (!this.eyesEl || !this.mouthEl) return;
    // Sparkling star eyes!
    this.eyesEl.innerHTML = `
      <text x="40" y="68" font-size="14" fill="#FF9F1C">⭐</text>
      <text x="68" y="68" font-size="14" fill="#FF9F1C">⭐</text>
    `;
    this.mouthEl.setAttribute('d', 'M 52 72 Q 60 86 68 72 Z');
    this.mouthEl.setAttribute('fill', '#FF5E7E');
  }

  setWorriedFace() {
    if (!this.eyesEl || !this.mouthEl) return;
    // Wide round shocked eyes
    this.eyesEl.innerHTML = `
      <circle cx="46" cy="64" r="6" fill="#2B2D42" />
      <circle cx="44" cy="61" r="2.5" fill="#FFFFFF" />
      <circle cx="74" cy="64" r="6" fill="#2B2D42" />
      <circle cx="72" cy="61" r="2.5" fill="#FFFFFF" />
      <!-- Sweat drop -->
      <path d="M 88 56 Q 86 64 92 64 Q 96 64 92 56 Z" fill="#4D96FF" opacity="0.8" />
    `;
    // Small 'O' mouth
    this.mouthEl.setAttribute('d', 'M 56 75 A 4 4 0 1 0 64 75 A 4 4 0 1 0 56 75');
    this.mouthEl.setAttribute('fill', '#2B2D42');
  }

  giggle() {
    if (window.soundEngine) window.soundEngine.playMove();
    this.setHappyFace();
    this.wrapper.classList.remove('giggle-anim');
    void this.wrapper.offsetWidth;
    this.wrapper.classList.add('giggle-anim');

    const giggles = ['Tee-hee! 🌸', 'You are awesome! ✨', 'Boing! 🐰', 'Go, Superstar! 🚀', 'Yay! 💖'];
    const chosen = giggles[Math.floor(Math.random() * giggles.length)];
    this.say(chosen, 2000);
    if (window.soundEngine) window.soundEngine.speakPraise(chosen.replace(/[^a-zA-Z !]/g, ''));

    setTimeout(() => {
      if (this.currentMood === 'idle') this.setNormalFace();
    }, 2200);
  }

  startBlinking() {
    const doBlink = () => {
      if (this.currentMood === 'idle' && this.eyesEl) {
        // Quick blink
        this.eyesEl.style.opacity = '0.2';
        setTimeout(() => {
          if (this.eyesEl) this.eyesEl.style.opacity = '1';
        }, 120);
      }
      this.blinkTimer = setTimeout(doBlink, 3000 + Math.random() * 4000);
    };
    doBlink();
  }

  getRandomCheerPhrase() {
    const cheers = ['Great Job! 🌟', 'Super Clean! 💫', 'Nice One! 🎈', 'Yummy Clear! 🍬', 'Woohoo! 🎉'];
    return cheers[Math.floor(Math.random() * cheers.length)];
  }

  getRandomCelebrationPhrase() {
    const praises = ['MEGA TETRIS! 🌈', 'STAR POWER! 🌟', 'UNSTOPPABLE! 🚀', 'AMAZING SCORE! 🏆'];
    return praises[Math.floor(Math.random() * praises.length)];
  }
}

window.MascotCompanion = MascotCompanion;
