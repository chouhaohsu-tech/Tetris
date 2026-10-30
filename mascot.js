// Cute Mascot Companion for Kids Tetris Adventure
// Features interactive animated SVG mascot with expressions, cheering, wizard hat, and giggle interactions!

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
          <span id="mascotSpeech">Spooky Magic! 🎃</span>
        </div>

        <!-- Mascot SVG Character (Wizard Bubu the Bunny) -->
        <svg class="mascot-svg" id="mascotSvg" viewBox="0 0 120 135" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bunnyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFF0F5" />
              <stop offset="100%" stop-color="#FFD1DC" />
            </linearGradient>
            <linearGradient id="earInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FF9AA2" />
              <stop offset="100%" stop-color="#FFB7B2" />
            </linearGradient>
            <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#581C87" />
              <stop offset="100%" stop-color="#3B0764" />
            </linearGradient>
            <filter id="cuteShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.15" />
            </filter>
          </defs>

          <!-- Shadow underneath -->
          <ellipse cx="60" cy="126" rx="35" ry="7" fill="rgba(0,0,0,0.14)" />

          <!-- Left Ear -->
          <g class="mascot-ear left-ear">
            <ellipse cx="38" cy="40" rx="11" ry="30" fill="url(#bunnyGrad)" transform="rotate(-15 38 40)" />
            <ellipse cx="38" cy="41" rx="5.5" ry="20" fill="url(#earInnerGrad)" transform="rotate(-15 38 41)" />
          </g>

          <!-- Right Ear -->
          <g class="mascot-ear right-ear">
            <ellipse cx="82" cy="40" rx="11" ry="30" fill="url(#bunnyGrad)" transform="rotate(15 82 40)" />
            <ellipse cx="82" cy="41" rx="5.5" ry="20" fill="url(#earInnerGrad)" transform="rotate(15 82 41)" />
          </g>

          <!-- Head & Body -->
          <g filter="url(#cuteShadow)">
            <!-- Chubby Body -->
            <ellipse cx="60" cy="98" rx="36" ry="28" fill="url(#bunnyGrad)" />
            <ellipse cx="60" cy="101" rx="20" ry="16" fill="#FFFFFF" opacity="0.8" />

            <!-- Paws -->
            <g class="mascot-paws">
              <ellipse class="paw-left" cx="38" cy="99" rx="9" ry="8" fill="#FFF0F5" />
              <ellipse class="paw-right" cx="82" cy="99" rx="9" ry="8" fill="#FFF0F5" />
            </g>

            <!-- Feet -->
            <ellipse cx="44" cy="121" rx="12" ry="8" fill="#FFF0F5" />
            <ellipse cx="76" cy="121" rx="12" ry="8" fill="#FFF0F5" />

            <!-- Head -->
            <circle cx="60" cy="68" r="33" fill="url(#bunnyGrad)" />
          </g>

          <!-- Cute Wizard / Witch Hat on Bubu's Head! -->
          <g class="mascot-wizard-hat" filter="url(#cuteShadow)">
            <!-- Hat Cone with curved magical tip -->
            <path d="M 42 42 Q 55 16 70 10 Q 64 26 78 42 Z" fill="url(#hatGrad)" />
            <circle cx="70" cy="10" r="3" fill="#FFD166" />
            <!-- Hat Brim -->
            <path d="M 34 43 Q 60 50 86 43 Q 60 38 34 43 Z" fill="#2E1065" />
            <!-- Pumpkin Orange Hat Band -->
            <path d="M 43 41 Q 60 46 77 41 L 76 37 Q 60 42 44 37 Z" fill="#FF9F1C" />
            <!-- Gold Star Buckle -->
            <polygon points="60,37 61.5,41 65,41 62,43 63.5,47 60,44.5 56.5,47 58,43 55,41 58.5,41" fill="#FFD166" />
          </g>

          <!-- Cheeks (Blushing) -->
          <ellipse class="cheek" cx="36" cy="76" rx="7" ry="4" fill="#FF8BA7" opacity="0.65" />
          <ellipse class="cheek" cx="84" cy="76" rx="7" ry="4" fill="#FF8BA7" opacity="0.65" />

          <!-- Eyes Group -->
          <g id="mascotEyes">
            <circle class="eye-pupil" cx="46" cy="67" r="5" fill="#2B2D42" />
            <circle class="eye-glint" cx="44" cy="65" r="2" fill="#FFFFFF" />
            <circle class="eye-pupil" cx="74" cy="67" r="5" fill="#2B2D42" />
            <circle class="eye-glint" cx="72" cy="65" r="2" fill="#FFFFFF" />
          </g>

          <!-- Cute Nose -->
          <polygon points="60,73 56,69 64,69" fill="#FF6B8B" />

          <!-- Cute Mouth -->
          <path id="mascotMouth" d="M 54 75 Q 60 80 60 76 Q 60 80 66 75" fill="none" stroke="#2B2D42" stroke-width="2.5" stroke-linecap="round" />

          <!-- Magic Wand in Right Paw -->
          <g class="mascot-wand" transform="translate(4, 0)">
            <line x1="82" y1="99" x2="102" y2="78" stroke="#9D4EDD" stroke-width="2.8" stroke-linecap="round" />
            <!-- Glowing Star Tip -->
            <polygon points="102,72 104,76 108,76 105,79 106,83 102,80.5 98,83 99,79 96,76 100,76" fill="#FFD166" />
            <circle cx="102" cy="77" r="2" fill="#FFFFFF" />
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
      this.say("Uh-oh! Stack is high! 🎃💦");
    } else {
      this.setNormalFace();
    }
  }

  setNormalFace() {
    if (!this.eyesEl || !this.mouthEl) return;
    this.eyesEl.innerHTML = `
      <circle cx="46" cy="67" r="5" fill="#2B2D42" />
      <circle cx="44" cy="65" r="2" fill="#FFFFFF" />
      <circle cx="74" cy="67" r="5" fill="#2B2D42" />
      <circle cx="72" cy="65" r="2" fill="#FFFFFF" />
    `;
    this.mouthEl.setAttribute('d', 'M 54 75 Q 60 80 60 76 Q 60 80 66 75');
    this.mouthEl.setAttribute('fill', 'none');
  }

  setHappyFace() {
    if (!this.eyesEl || !this.mouthEl) return;
    this.eyesEl.innerHTML = `
      <path d="M 40 68 Q 46 61 52 68" fill="none" stroke="#2B2D42" stroke-width="3" stroke-linecap="round" />
      <path d="M 68 68 Q 74 61 80 68" fill="none" stroke="#2B2D42" stroke-width="3" stroke-linecap="round" />
    `;
    this.mouthEl.setAttribute('d', 'M 52 75 Q 60 87 68 75 Z');
    this.mouthEl.setAttribute('fill', '#FF5E7E');
  }

  setStarFace() {
    if (!this.eyesEl || !this.mouthEl) return;
    this.eyesEl.innerHTML = `
      <text x="39" y="72" font-size="14" fill="#FF9F1C">⭐</text>
      <text x="67" y="72" font-size="14" fill="#FF9F1C">⭐</text>
    `;
    this.mouthEl.setAttribute('d', 'M 52 75 Q 60 89 68 75 Z');
    this.mouthEl.setAttribute('fill', '#FF5E7E');
  }

  setWorriedFace() {
    if (!this.eyesEl || !this.mouthEl) return;
    this.eyesEl.innerHTML = `
      <circle cx="46" cy="67" r="6" fill="#2B2D42" />
      <circle cx="44" cy="64" r="2.5" fill="#FFFFFF" />
      <circle cx="74" cy="67" r="6" fill="#2B2D42" />
      <circle cx="72" cy="64" r="2.5" fill="#FFFFFF" />
      <!-- Sweat drop -->
      <path d="M 88 59 Q 86 67 92 67 Q 96 67 92 59 Z" fill="#00F5D4" opacity="0.85" />
    `;
    this.mouthEl.setAttribute('d', 'M 56 78 A 4 4 0 1 0 64 78 A 4 4 0 1 0 56 78');
    this.mouthEl.setAttribute('fill', '#2B2D42');
  }

  giggle() {
    if (window.soundEngine) window.soundEngine.playMove();
    this.setHappyFace();
    this.wrapper.classList.remove('giggle-anim');
    void this.wrapper.offsetWidth;
    this.wrapper.classList.add('giggle-anim');

    const giggles = [
      'Abracadabra! 🪄',
      'Trick or Treat! 🍬',
      'Spooky Magic! 🎃',
      'You are a Wizard! ✨',
      'Boing! 🐰',
      'Boo! Hehehe! 👻',
      'Star Power! 🌟'
    ];
    const chosen = giggles[Math.floor(Math.random() * giggles.length)];
    this.say(chosen, 2200);
    if (window.soundEngine) window.soundEngine.speakPraise(chosen.replace(/[^a-zA-Z !]/g, ''));

    setTimeout(() => {
      if (this.currentMood === 'idle') this.setNormalFace();
    }, 2200);
  }

  startBlinking() {
    const doBlink = () => {
      if (this.currentMood === 'idle' && this.eyesEl) {
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
    const cheers = [
      'Magic Clear! 🌟',
      'Poof! Disappeared! 🪄',
      'Spooky Awesome! 🎃',
      'Sweet Treats! 🍬',
      'Woohoo Wizard! 🔮'
    ];
    return cheers[Math.floor(Math.random() * cheers.length)];
  }

  getRandomCelebrationPhrase() {
    const praises = [
      'MEGA MAGIC! 🌈',
      'HALLOWEEN MASTER! 🎃',
      'WIZARD POWER! 🪄',
      'SUPREME TETRIS! 🏆'
    ];
    return praises[Math.floor(Math.random() * praises.length)];
  }
}

window.MascotCompanion = MascotCompanion;
