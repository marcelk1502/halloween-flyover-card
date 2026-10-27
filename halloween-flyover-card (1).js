/**
 * Halloween Flyover Card for Home Assistant Lovelace
 * Repository: github.com/marcelk1502/halloween-flyover-card
 * Version: 1.9.0
 * 
 * Features v1.9.0:
 * - Visuelle Effekte & Deko:
 *   * Schleim- / Spinnennetz-Vorhang am oberen Bildschirmrand (slime_web_curtain)
 *   * Geister-Portal / Schwarzes Loch Cameo (ghost_portal)
 *   * Umschaltbarer Kerzenschein-Modus (candle_glow)
 * - Neue Flieger & Kreaturen:
 *   * Mumien-Sarkophag mit Bandagen-Wurf (mummy_sarcophagus)
 *   * Gargoyle im Sturzflug mit schwerem Flügelschlag & Knurren (dive_gargoyle)
 *   * Fliegende Kessel-Hexe mit lila Giftrauch (cauldron_witch)
 * - Reine Vektor-/SVG-Grafiken, dynamisches CSS & synthetisches Web Audio API.
 */

class HalloweenFlyoverCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._audioCtx = null;
    this._flyoverInterval = null;
    this._cameoInterval = null;
    this._curtainElement = null;
    this._activeEntities = [];
    this._config = {};
  }

  static getStubConfig() {
    return {
      glow_mode: 'candle', // 'candle' (Kürbis-Orange) | 'toxic' (Giftgrün) | 'off'
      curtain_type: 'slime_web', // 'slime_web' | 'slime' | 'web' | 'none'
      portal_cameo: true,
      portal_interval_seconds: 60,
      flyover_frequency: 'medium', // 'low' | 'medium' | 'high'
      enabled_creatures: [
        'mummy_sarcophagus',
        'dive_gargoyle',
        'cauldron_witch',
        'classic_bat',
        'classic_ghost'
      ],
      sound_enabled: true,
      volume: 0.3
    };
  }

  setConfig(config) {
    this._config = {
      glow_mode: config.glow_mode || 'candle',
      curtain_type: config.curtain_type !== undefined ? config.curtain_type : 'slime_web',
      portal_cameo: config.portal_cameo !== undefined ? config.portal_cameo : true,
      portal_interval_seconds: config.portal_interval_seconds || 60,
      flyover_frequency: config.flyover_frequency || 'medium',
      enabled_creatures: config.enabled_creatures || [
        'mummy_sarcophagus',
        'dive_gargoyle',
        'cauldron_witch',
        'classic_bat',
        'classic_ghost'
      ],
      sound_enabled: config.sound_enabled !== undefined ? config.sound_enabled : true,
      volume: config.volume !== undefined ? config.volume : 0.3,
      ...config
    };

    this._applyGlobalStyles();
    this.render();
    this._startTimers();
  }

  set hass(hass) {
    this._hass = hass;
  }

  connectedCallback() {
    this._startTimers();
  }

  disconnectedCallback() {
    this._stopTimers();
  }

  _getAudioContext() {
    if (!this._audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this._audioCtx = new AudioCtx();
      }
    }
    if (this._audioCtx && this._audioCtx.state === 'suspended') {
      this._audioCtx.resume();
    }
    return this._audioCtx;
  }

  /* ----------------------------------------------------
   * SYNTHETIC WEB AUDIO (Keine externen MP3s)
   * ---------------------------------------------------- */
  _playSound(type) {
    if (!this._config.sound_enabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this._config.volume || 0.3, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'mummy_bandage': {
        // Zischendes, raschelndes Stoff-/Bandagen-Geräusch (White Noise + Bandpass Sweep)
        const bufferSize = ctx.sampleRate * 0.45;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * (i / bufferSize));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.45);
        filter.Q.setValueAtTime(4.0, now);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(now);
        break;
      }

      case 'gargoyle_growl': {
        // Tiefes, bedrohliches Knurren (2 detunierte Sawtooth-Oszillatoren + modulierter Lowpass)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(65, now);
        osc1.frequency.linearRampToValueAtTime(48, now + 1.2);
        osc2.frequency.setValueAtTime(68, now);
        osc2.frequency.linearRampToValueAtTime(45, now + 1.2);

        // Subtiler Tremolo/Gurgel-LFO
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(14, now);
        lfoGain.gain.setValueAtTime(0.4, now);
        lfo.connect(lfoGain.gain);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);
        filter.frequency.linearRampToValueAtTime(180, now + 1.2);

        oscGain.gain.setValueAtTime(0.0, now);
        oscGain.gain.linearRampToValueAtTime(0.8, now + 0.15);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);
        break;
      }

      case 'gargoyle_wing': {
        // Schwerer Flügelschlag (Kurzer tiefer Thud / Whoosh)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.38);
        break;
      }

      case 'witch_cackle': {
        // Hexenartiges Lachen / Kessel-Blubbern (FM Frequenzmodulation)
        const carrier = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const gain = ctx.createGain();

        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(600, now);
        carrier.frequency.linearRampToValueAtTime(950, now + 0.2);
        carrier.frequency.linearRampToValueAtTime(450, now + 0.6);

        mod.frequency.setValueAtTime(12, now);
        modGain.gain.setValueAtTime(250, now);

        mod.connect(carrier.frequency);
        carrier.connect(gain);
        gain.connect(masterGain);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

        mod.start(now);
        carrier.start(now);
        mod.stop(now + 0.8);
        carrier.stop(now + 0.8);
        break;
      }

      case 'portal_vortex': {
        // Mystischer, kosmischer Portal-Sound (Rosa Rauschen + Resonanter Tiefpass-Sweep + Hall-Effekt)
        const dur = 4.0;
        const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const out = buf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < buf.length; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.11;
          b2 = 0.85 * b2 + white * 0.25;
          out[i] = (b0 + b1 + b2) * 0.4;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;

        const bq = ctx.createBiquadFilter();
        bq.type = 'bandpass';
        bq.frequency.setValueAtTime(200, now);
        bq.frequency.exponentialRampToValueAtTime(1400, now + 2.0);
        bq.frequency.exponentialRampToValueAtTime(120, now + dur);
        bq.Q.setValueAtTime(8.0, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.6, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        src.connect(bq);
        bq.connect(gain);
        gain.connect(masterGain);
        src.start(now);
        break;
      }
    }
  }

  /* ----------------------------------------------------
   * GLOBALE STYLES (Kerzenschein-Modus & Schleim/Netz Vorhang)
   * ---------------------------------------------------- */
  _applyGlobalStyles() {
    let globalStyle = document.head.querySelector('#halloween-flyover-global-style');
    if (!globalStyle) {
      globalStyle = document.createElement('style');
      globalStyle.id = 'halloween-flyover-global-style';
      document.head.appendChild(globalStyle);
    }

    let css = '';

    if (this._config.glow_mode === 'candle') {
      css += `
        @keyframes hfc-candle-flicker {
          0% {
            box-shadow: 0 0 14px rgba(255, 120, 10, 0.45), 0 0 28px rgba(255, 70, 0, 0.2);
            border-color: rgba(255, 140, 20, 0.45) !important;
          }
          25% {
            box-shadow: 0 0 10px rgba(255, 100, 0, 0.35), 0 0 18px rgba(255, 60, 0, 0.15);
            border-color: rgba(255, 115, 10, 0.35) !important;
          }
          50% {
            box-shadow: 0 0 18px rgba(255, 150, 20, 0.6), 0 0 35px rgba(255, 80, 0, 0.3);
            border-color: rgba(255, 160, 30, 0.6) !important;
          }
          75% {
            box-shadow: 0 0 12px rgba(255, 110, 5, 0.4), 0 0 22px rgba(255, 65, 0, 0.2);
            border-color: rgba(255, 125, 15, 0.4) !important;
          }
          100% {
            box-shadow: 0 0 14px rgba(255, 120, 10, 0.45), 0 0 28px rgba(255, 70, 0, 0.2);
            border-color: rgba(255, 140, 20, 0.45) !important;
          }
        }
        ha-card {
          animation: hfc-candle-flicker 3.2s infinite ease-in-out !important;
          transition: box-shadow 0.4s ease, border-color 0.4s ease !important;
        }
      `;
    } else if (this._config.glow_mode === 'toxic') {
      css += `
        @keyframes hfc-toxic-pulse {
          0%, 100% {
            box-shadow: 0 0 12px rgba(50, 255, 50, 0.4), 0 0 24px rgba(20, 180, 20, 0.25);
            border-color: rgba(60, 240, 60, 0.4) !important;
          }
          50% {
            box-shadow: 0 0 22px rgba(70, 255, 70, 0.7), 0 0 40px rgba(40, 220, 40, 0.45);
            border-color: rgba(90, 255, 90, 0.75) !important;
          }
        }
        ha-card {
          animation: hfc-toxic-pulse 2.8s infinite ease-in-out !important;
          transition: box-shadow 0.4s ease, border-color 0.4s ease !important;
        }
      `;
    }

    globalStyle.textContent = css;

    // Schleim- / Spinnennetz-Vorhang am oberen Bildschirmrand montieren
    this._updateCurtain();
  }

  _updateCurtain() {
    let curtain = document.body.querySelector('#hfc-screen-curtain');
    if (this._config.curtain_type === 'none') {
      if (curtain) curtain.remove();
      return;
    }

    if (!curtain) {
      curtain = document.createElement('div');
      curtain.id = 'hfc-screen-curtain';
      document.body.appendChild(curtain);
    }

    curtain.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 75px;
      pointer-events: none;
      z-index: 999990;
      overflow: hidden;
      display: flex;
    `;

    const showSlime = this._config.curtain_type === 'slime_web' || this._config.curtain_type === 'slime';
    const showWeb = this._config.curtain_type === 'slime_web' || this._config.curtain_type === 'web';

    curtain.innerHTML = `
      <svg viewBox="0 0 1920 80" preserveAspectRatio="none" style="width: 100%; height: 100%; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">
        <defs>
          <linearGradient id="hfc-slime-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#24db16" stop-opacity="0.95" />
            <stop offset="60%" stop-color="#14940b" stop-opacity="0.85" />
            <stop offset="100%" stop-color="#0e6b06" stop-opacity="0.9" />
          </linearGradient>
          <radialGradient id="hfc-drip-shine" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#99ff88" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#14940b" stop-opacity="0" />
          </radialGradient>
        </defs>

        ${showWeb ? `
          <!-- Spinnennetze in den Ecken & Kanten -->
          <g stroke="rgba(240, 240, 255, 0.42)" stroke-width="1.2" fill="none">
            <!-- Linkes Ecknetz -->
            <path d="M0,0 L90,65 M0,20 L75,55 M0,45 L50,50 M0,0 L18,70" />
            <path d="M12,4 Q18,22 4,32" />
            <path d="M28,8 Q42,42 12,56" />
            <path d="M48,12 Q70,58 20,70" />

            <!-- Rechtes Ecknetz -->
            <path d="M1920,0 L1830,65 M1920,20 L1845,55 M1920,45 L1870,50 M1920,0 L1902,70" />
            <path d="M1908,4 Q1902,22 1916,32" />
            <path d="M1892,8 Q1878,42 1908,56" />
            <path d="M1872,12 Q1850,58 1900,70" />

            <!-- Hängende Web-Fäden mit winziger Spinne -->
            <path d="M360,0 L360,42 M360,42 A3,3 0 1,0 360,48 A3,3 0 1,0 360,42" stroke-width="1" />
            <path d="M1420,0 L1420,55 M1420,55 A3,3 0 1,0 1420,61 A3,3 0 1,0 1420,55" stroke-width="1" />
          </g>
        ` : ''}

        ${showSlime ? `
          <!-- Organisch tropfender Schleim-Vorhang -->
          <path d="
            M0,0 L1920,0 L1920,18
            C1880,18 1865,48 1850,48 C1835,48 1820,15 1780,15
            C1740,15 1725,62 1705,62 C1685,62 1675,20 1620,20
            C1570,20 1550,52 1530,52 C1515,52 1500,22 1440,22
            C1390,22 1375,68 1350,68 C1330,68 1315,18 1260,18
            C1200,18 1185,45 1165,45 C1150,45 1140,12 1080,12
            C1020,12 1000,58 975,58 C955,58 940,20 880,20
            C825,20 810,65 790,65 C770,65 760,15 700,15
            C640,15 625,50 605,50 C590,50 580,22 520,22
            C470,22 455,72 430,72 C410,72 395,16 340,16
            C290,16 275,55 255,55 C240,55 225,24 170,24
            C120,24 105,64 80,64 C60,64 45,18 0,18 Z
          " fill="url(#hfc-slime-grad)" />

          <!-- Tropfen-Glanzlichter -->
          <ellipse cx="430" cy="67" rx="5" ry="3.5" fill="url(#hfc-drip-shine)" />
          <ellipse cx="790" cy="60" rx="4" ry="3" fill="url(#hfc-drip-shine)" />
          <ellipse cx="1350" cy="63" rx="5" ry="3.5" fill="url(#hfc-drip-shine)" />
          <ellipse cx="1705" cy="57" rx="4" ry="3" fill="url(#hfc-drip-shine)" />
        ` : ''}
      </svg>
    `;
  }

  /* ----------------------------------------------------
   * TIMER & SPAWNER
   * ---------------------------------------------------- */
  _startTimers() {
    this._stopTimers();

    // Flyover Frequenz
    const freqMs = {
      low: 18000,
      medium: 10000,
      high: 5500
    }[this._config.flyover_frequency] || 10000;

    this._flyoverInterval = setInterval(() => {
      this._spawnFlyoverCreature();
    }, freqMs);

    // Initialer Test-Spawn nach kurzer Zeit
    setTimeout(() => this._spawnFlyoverCreature(), 2000);

    // Portal Cameo Timer
    if (this._config.portal_cameo) {
      const portalSec = Math.max(15, this._config.portal_interval_seconds || 60);
      this._cameoInterval = setInterval(() => {
        this._spawnGhostPortal();
      }, portalSec * 1000);
    }
  }

  _stopTimers() {
    if (this._flyoverInterval) clearInterval(this._flyoverInterval);
    if (this._cameoInterval) clearInterval(this._cameoInterval);
  }

  /* ----------------------------------------------------
   * FEATURE 1: GEISTER-PORTAL / SCHWARZES LOCH CAMEO
   * ---------------------------------------------------- */
  _spawnGhostPortal() {
    const existing = document.body.querySelector('#hfc-ghost-portal');
    if (existing) return;

    this._playSound('portal_vortex');

    const portal = document.createElement('div');
    portal.id = 'hfc-ghost-portal';
    
    // Zufällige Position auf dem Bildschirm (zentraler Bereich)
    const posX = 15 + Math.random() * 65; // vw
    const posY = 15 + Math.random() * 50; // vh

    portal.style.cssText = `
      position: fixed;
      left: ${posX}vw;
      top: ${posY}vh;
      width: 220px;
      height: 220px;
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
      z-index: 999995;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: hfc-portal-lifecycle 7.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    // SVG Strudel & Schwarzes Loch
    portal.innerHTML = `
      <style>
        @keyframes hfc-portal-lifecycle {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
          15% { transform: translate(-50%, -50%) scale(1.1) rotate(220deg); opacity: 1; }
          25% { transform: translate(-50%, -50%) scale(1.0) rotate(360deg); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(1.0) rotate(1400deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0) rotate(1800deg); opacity: 0; }
        }
        @keyframes hfc-portal-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hfc-swallowed-ghost-1 {
          0% { transform: translate(140px, -110px) scale(0.9) rotate(20deg); opacity: 0.9; }
          40% { transform: translate(60px, -40px) scale(0.65) rotate(-45deg); opacity: 0.85; }
          100% { transform: translate(0px, 0px) scale(0.05) rotate(-380deg); opacity: 0; }
        }
        @keyframes hfc-swallowed-ghost-2 {
          0% { transform: translate(-150px, 100px) scale(0.85) rotate(-30deg); opacity: 0.85; }
          45% { transform: translate(-50px, 35px) scale(0.55) rotate(50deg); opacity: 0.8; }
          100% { transform: translate(0px, 0px) scale(0.04) rotate(420deg); opacity: 0; }
        }
      </style>

      <!-- Schwarzes Loch / Vortex -->
      <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; overflow: visible; animation: hfc-portal-spin 3s linear infinite;">
        <defs>
          <radialGradient id="hfc-vortex-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#020108" stop-opacity="1" />
            <stop offset="40%" stop-color="#2a0845" stop-opacity="0.9" />
            <stop offset="75%" stop-color="#6414e9" stop-opacity="0.6" />
            <stop offset="95%" stop-color="#00ffcc" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <filter id="hfc-portal-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <!-- Äußere Aura & Akkretionsscheibe -->
        <circle cx="100" cy="100" r="95" fill="url(#hfc-vortex-glow)" />

        <!-- Rotierende Tentakel / Spiralarme -->
        <g stroke="#9b51e0" stroke-width="2.5" fill="none" opacity="0.8" filter="url(#hfc-portal-blur)">
          <path d="M100,100 Q120,40 170,50 Q140,110 100,100" />
          <path d="M100,100 Q80,160 30,150 Q60,90 100,100" />
          <path d="M100,100 Q160,80 150,30 Q90,60 100,100" />
          <path d="M100,100 Q40,120 50,170 Q110,140 100,100" />
        </g>

        <!-- Inneres Schwarzes Loch -->
        <circle cx="100" cy="100" r="34" fill="#000000" stroke="#00f2fe" stroke-width="2" />
        <circle cx="100" cy="100" r="28" fill="#030008" />
      </svg>

      <!-- Geister, die in den Schlund gesaugt werden -->
      <div style="position: absolute; width: 44px; height: 44px; animation: hfc-swallowed-ghost-1 2.8s 1.2s cubic-bezier(0.55, 0, 1, 0.45) forwards; opacity: 0;">
        <svg viewBox="0 0 50 60" fill="rgba(220, 245, 255, 0.9)" style="filter: drop-shadow(0 0 8px #00ffff);">
          <path d="M25,5 C12,5 5,18 5,32 C5,45 2,52 8,55 C14,58 16,50 21,52 C26,54 28,58 34,56 C40,54 39,47 43,49 C47,51 45,40 45,32 C45,18 38,5 25,5 Z" />
          <circle cx="18" cy="22" r="3.5" fill="#0f172a" />
          <circle cx="32" cy="22" r="3.5" fill="#0f172a" />
          <ellipse cx="25" cy="35" rx="4" ry="7" fill="#0f172a" />
        </svg>
      </div>

      <div style="position: absolute; width: 38px; height: 38px; animation: hfc-swallowed-ghost-2 3.1s 2.3s cubic-bezier(0.55, 0, 1, 0.45) forwards; opacity: 0;">
        <svg viewBox="0 0 50 60" fill="rgba(230, 255, 235, 0.85)" style="filter: drop-shadow(0 0 8px #39ff14);">
          <path d="M25,5 C12,5 5,18 5,32 C5,45 2,52 8,55 C14,58 16,50 21,52 C26,54 28,58 34,56 C40,54 39,47 43,49 C47,51 45,40 45,32 C45,18 38,5 25,5 Z" />
          <circle cx="18" cy="22" r="3" fill="#0b2412" />
          <circle cx="32" cy="22" r="3" fill="#0b2412" />
          <ellipse cx="25" cy="34" rx="3.5" ry="5.5" fill="#0b2412" />
        </svg>
      </div>
    `;

    document.body.appendChild(portal);
    setTimeout(() => {
      if (portal.parentElement) portal.remove();
    }, 7600);
  }

  /* ----------------------------------------------------
   * SPAWN LOGIK FÜR KREATUREN
   * ---------------------------------------------------- */
  _spawnFlyoverCreature() {
    const list = this._config.enabled_creatures || [];
    if (!list.length) return;

    const chosen = list[Math.floor(Math.random() * list.length)];
    switch (chosen) {
      case 'mummy_sarcophagus':
        this._spawnMummySarcophagus();
        break;
      case 'dive_gargoyle':
        this._spawnDiveGargoyle();
        break;
      case 'cauldron_witch':
        this._spawnCauldronWitch();
        break;
      case 'classic_bat':
        this._spawnClassicBat();
        break;
      case 'classic_ghost':
      default:
        this._spawnClassicGhost();
        break;
    }
  }

  /* ----------------------------------------------------
   * FEATURE 2A: FLIEGENDER MUMIEN-SARKOPHAG MIT BANDAGEN-WURF
   * ---------------------------------------------------- */
  _spawnMummySarcophagus() {
    const wrapper = document.createElement('div');
    const startY = 15 + Math.random() * 45;
    const duration = 12 + Math.random() * 4;

    wrapper.className = 'hfc-creature hfc-mummy';
    wrapper.style.cssText = `
      position: fixed;
      top: ${startY}vh;
      left: -180px;
      width: 140px;
      height: 90px;
      z-index: 999992;
      cursor: pointer;
      user-select: none;
      filter: drop-shadow(0 10px 14px rgba(0,0,0,0.7));
      transition: transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      animation: hfc-fly-horizontal ${duration}s linear forwards;
    `;

    wrapper.innerHTML = `
      <style>
        @keyframes hfc-fly-horizontal {
          0% { transform: translateX(0vw) translateY(0px) rotate(-6deg); }
          30% { transform: translateX(35vw) translateY(-25px) rotate(4deg); }
          60% { transform: translateX(70vw) translateY(18px) rotate(-5deg); }
          100% { transform: translateX(115vw) translateY(-10px) rotate(6deg); }
        }
        @keyframes hfc-sarc-hover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes hfc-float-bandage {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 60; }
        }
      </style>

      <div style="width: 100%; height: 100%; animation: hfc-sarc-hover 2.2s ease-in-out infinite;">
        <svg viewBox="0 0 160 100" style="width: 100%; height: 100%;">
          <defs>
            <linearGradient id="hfc-gold-sarc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffd700" />
              <stop offset="30%" stop-color="#b8860b" />
              <stop offset="70%" stop-color="#daa520" />
              <stop offset="100%" stop-color="#5a4208" />
            </linearGradient>
            <linearGradient id="hfc-linen-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#e6dfcc" />
              <stop offset="50%" stop-color="#fffbee" />
              <stop offset="100%" stop-color="#c9be9d" />
            </linearGradient>
          </defs>

          <!-- Schwebender ägyptischer Sarkophag-Rumpf -->
          <polygon points="25,48 55,20 120,24 148,50 120,76 55,80" fill="url(#hfc-gold-sarc)" stroke="#3a2503" stroke-width="2.5" />
          
          <!-- Pharaonen-Kopfschmuck (Nemes) Linien -->
          <line x1="120" y1="24" x2="148" y2="50" stroke="#003366" stroke-width="4" />
          <line x1="120" y1="76" x2="148" y2="50" stroke="#003366" stroke-width="4" />
          <polygon points="112,38 135,50 112,62" fill="#002b49" />

          <!-- Sarkophag-Maske mit leuchtenden Mumien-Augen -->
          <ellipse cx="120" cy="46" rx="3.5" ry="2" fill="#00ffcc" style="filter: drop-shadow(0 0 3px #00ffcc);" />
          <ellipse cx="120" cy="54" rx="3.5" ry="2" fill="#00ffcc" style="filter: drop-shadow(0 0 3px #00ffcc);" />

          <!-- Mumien-Bandagen-Streifen über dem Rumpf -->
          <path d="M35,42 Q75,35 110,40" stroke="url(#hfc-linen-grad)" stroke-width="6" stroke-linecap="round" fill="none" />
          <path d="M30,56 Q70,62 108,58" stroke="url(#hfc-linen-grad)" stroke-width="6.5" stroke-linecap="round" fill="none" />
          <path d="M45,28 Q75,48 95,70" stroke="url(#hfc-linen-grad)" stroke-width="4.5" stroke-linecap="round" fill="none" />
          <path d="M45,72 Q75,52 95,30" stroke="url(#hfc-linen-grad)" stroke-width="4.5" stroke-linecap="round" fill="none" />

          <!-- Lose wehende Mumienbinden hinten -->
          <path d="M25,48 C10,38 -5,60 -25,45" stroke="#f0e6d2" stroke-width="3" fill="none" stroke-dasharray="10 4" style="animation: hfc-float-bandage 1.2s linear infinite;" />
          <path d="M30,55 C12,65 0,40 -18,62" stroke="#dfd4bd" stroke-width="2.5" fill="none" stroke-dasharray="8 3" style="animation: hfc-float-bandage 1s linear infinite;" />
        </svg>
      </div>
    `;

    // Interaktiver Bandagen-Wurf bei Klick / Tap
    wrapper.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this._throwBandages(wrapper);
    });

    document.body.appendChild(wrapper);
    setTimeout(() => {
      if (wrapper.parentElement) wrapper.remove();
    }, duration * 1000 + 500);
  }

  _throwBandages(targetElement) {
    this._playSound('mummy_bandage');

    const rect = targetElement.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    // Erzeuge 6 flatternde Bandagen-Fäden in alle Richtungen
    for (let i = 0; i < 7; i++) {
      const bandage = document.createElement('div');
      bandage.className = 'hfc-thrown-bandage';
      const angle = (i / 7) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const dist = 120 + Math.random() * 110;
      const targetX = Math.cos(angle) * dist;
      const targetY = Math.sin(angle) * dist;
      const rot = Math.random() * 360;

      bandage.style.cssText = `
        position: fixed;
        left: ${originX}px;
        top: ${originY}px;
        width: ${40 + Math.random() * 35}px;
        height: 14px;
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%) rotate(0deg) scale(0.6);
        transition: transform 0.65s cubic-bezier(0.12, 0.8, 0.33, 1), opacity 0.65s ease;
      `;

      bandage.innerHTML = `
        <svg viewBox="0 0 60 14" style="width: 100%; height: 100%; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
          <path d="M0,7 Q15,0 30,7 T60,7" stroke="#fff4dc" stroke-width="9" fill="none" stroke-linecap="round" />
          <path d="M5,7 Q20,2 35,7 T55,7" stroke="#dacbb0" stroke-width="2" fill="none" />
        </svg>
      `;

      document.body.appendChild(bandage);

      requestAnimationFrame(() => {
        bandage.style.transform = `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) rotate(${rot}deg) scale(1.1)`;
      });

      setTimeout(() => {
        bandage.style.opacity = '0';
        setTimeout(() => bandage.remove(), 400);
      }, 700);
    }

    // Mini Ruckler / Wackler am Sarkophag
    targetElement.style.transform = 'scale(1.25) rotate(10deg)';
    setTimeout(() => {
      targetElement.style.transform = '';
    }, 250);
  }

  /* ----------------------------------------------------
   * FEATURE 2B: GARGOYLE IM STURZFLUG MIT FLÜGELSCHLAG & KNURREN
   * ---------------------------------------------------- */
  _spawnDiveGargoyle() {
    const gargoyle = document.createElement('div');
    const startX = 20 + Math.random() * 60; // vw
    
    // Knurren beim Erscheinen
    this._playSound('gargoyle_growl');

    gargoyle.className = 'hfc-creature hfc-gargoyle';
    gargoyle.style.cssText = `
      position: fixed;
      top: -140px;
      left: ${startX}vw;
      width: 150px;
      height: 130px;
      pointer-events: auto;
      z-index: 999993;
      filter: drop-shadow(0 15px 18px rgba(0,0,0,0.85));
      animation: hfc-gargoyle-dive 4.8s cubic-bezier(0.35, 0, 0.25, 1) forwards;
    `;

    gargoyle.innerHTML = `
      <style>
        @keyframes hfc-gargoyle-dive {
          0% {
            top: -140px;
            transform: scale(0.6) rotate(42deg);
          }
          38% {
            top: 48vh;
            transform: scale(1.3) rotate(15deg);
          }
          52% {
            top: 50vh;
            transform: scale(1.25) rotate(-10deg);
          }
          100% {
            top: -200px;
            left: ${startX + (Math.random() > 0.5 ? 25 : -25)}vw;
            transform: scale(0.5) rotate(-35deg);
          }
        }
        @keyframes hfc-wing-flap-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-38deg); }
        }
        @keyframes hfc-wing-flap-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(38deg); }
        }
      </style>

      <svg viewBox="0 0 160 140" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="hfc-stone-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#69737d" />
            <stop offset="50%" stop-color="#485159" />
            <stop offset="100%" stop-color="#2a3036" />
          </linearGradient>
          <radialGradient id="hfc-gargoyle-eye" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#ff3b30" />
            <stop offset="100%" stop-color="#7a0000" />
          </radialGradient>
        </defs>

        <!-- Linker Flügel (animiert) -->
        <g style="transform-origin: 70px 75px; animation: hfc-wing-flap-left 0.45s ease-in-out infinite;">
          <path d="M70,75 C50,30 20,10 5,25 C-5,35 15,65 30,85 C15,80 5,95 20,105 C35,115 65,95 70,75 Z" fill="url(#hfc-stone-grad)" stroke="#1a1c1e" stroke-width="2.5" />
          <!-- Flügelkrallen -->
          <polygon points="5,25 0,18 8,22" fill="#111" />
        </g>

        <!-- Rechter Flügel (animiert) -->
        <g style="transform-origin: 90px 75px; animation: hfc-wing-flap-right 0.45s ease-in-out infinite;">
          <path d="M90,75 C110,30 140,10 155,25 C165,35 145,65 130,85 C145,80 155,95 140,105 C125,115 95,95 90,75 Z" fill="url(#hfc-stone-grad)" stroke="#1a1c1e" stroke-width="2.5" />
          <!-- Flügelkrallen -->
          <polygon points="155,25 160,18 152,22" fill="#111" />
        </g>

        <!-- Kräftiger Steinkörper -->
        <path d="M62,60 C58,85 64,115 80,125 C96,115 102,85 98,60 Z" fill="#3f474d" stroke="#1f2326" stroke-width="2" />

        <!-- Klauenbeine & Schwanz -->
        <path d="M80,120 Q80,145 105,140 Q100,132 85,125" fill="#2a3036" />
        <path d="M68,115 L60,130 L66,132 L72,122" fill="#1e2124" />
        <path d="M92,115 L100,130 L94,132 L88,122" fill="#1e2124" />

        <!-- Hörner & Dämonenkopf -->
        <polygon points="66,45 52,18 72,36" fill="#22262a" stroke="#111" stroke-width="1.5" />
        <polygon points="94,45 108,18 88,36" fill="#22262a" stroke="#111" stroke-width="1.5" />
        <circle cx="80" cy="52" r="19" fill="url(#hfc-stone-grad)" stroke="#1a1c1e" stroke-width="2" />

        <!-- Glimmende rote Augen -->
        <ellipse cx="73" cy="50" rx="3.5" ry="2.5" fill="url(#hfc-gargoyle-eye)" style="filter: drop-shadow(0 0 5px #ff1a1a);" />
        <ellipse cx="87" cy="50" rx="3.5" ry="2.5" fill="url(#hfc-gargoyle-eye)" style="filter: drop-shadow(0 0 5px #ff1a1a);" />

        <!-- Aufgerissenes Maul mit Fangzähnen -->
        <path d="M72,60 Q80,68 88,60 Q80,63 72,60 Z" fill="#150202" />
        <polygon points="74,60 76,64 78,60" fill="#fff" />
        <polygon points="82,60 84,64 86,60" fill="#fff" />
      </svg>
    `;

    // Flügelschlag-Sounds synchron zur Sturzflug-Annäherung
    setTimeout(() => this._playSound('gargoyle_wing'), 600);
    setTimeout(() => this._playSound('gargoyle_wing'), 1200);
    setTimeout(() => this._playSound('gargoyle_wing'), 1800);

    // Klick-Reaktion: Gargoyle brüllt erneut
    gargoyle.addEventListener('pointerdown', () => {
      this._playSound('gargoyle_growl');
    });

    document.body.appendChild(gargoyle);
    setTimeout(() => {
      if (gargoyle.parentElement) gargoyle.remove();
    }, 5000);
  }

  /* ----------------------------------------------------
   * FEATURE 2C: FLIEGENDE KESSEL-HEXE MIT LILA GIFTRAUCH
   * ---------------------------------------------------- */
  _spawnCauldronWitch() {
    const witch = document.createElement('div');
    const startY = 20 + Math.random() * 40;
    const dur = 11 + Math.random() * 3;

    this._playSound('witch_cackle');

    witch.className = 'hfc-creature hfc-witch';
    witch.style.cssText = `
      position: fixed;
      top: ${startY}vh;
      right: -170px;
      width: 150px;
      height: 120px;
      pointer-events: auto;
      z-index: 999994;
      cursor: pointer;
      filter: drop-shadow(0 8px 12px rgba(0,0,0,0.6));
      animation: hfc-fly-witch ${dur}s cubic-bezier(0.4, 0, 0.6, 1) forwards;
    `;

    witch.innerHTML = `
      <style>
        @keyframes hfc-fly-witch {
          0% { transform: translateX(0vw) translateY(0px) rotate(4deg); }
          25% { transform: translateX(-30vw) translateY(-28px) rotate(-3deg); }
          55% { transform: translateX(-65vw) translateY(20px) rotate(5deg); }
          80% { transform: translateX(-95vw) translateY(-15px) rotate(-2deg); }
          100% { transform: translateX(-120vw) translateY(0px) rotate(4deg); }
        }
      </style>

      <svg viewBox="0 0 160 120" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="hfc-witch-robe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4a154b" />
            <stop offset="100%" stop-color="#190724" />
          </linearGradient>
          <radialGradient id="hfc-poison-brew" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#00ff88" />
            <stop offset="70%" stop-color="#9b51e0" />
            <stop offset="100%" stop-color="#3c096c" />
          </radialGradient>
        </defs>

        <!-- Hexenbesen-Stiel -->
        <line x1="15" y1="88" x2="148" y2="52" stroke="#6f4e37" stroke-width="5" stroke-linecap="round" />
        <!-- Besenborsten -->
        <polygon points="135,46 160,35 158,62 138,60" fill="#c29b38" stroke="#8c6d1d" stroke-width="1.5" />

        <!-- Gusseiserner Kessel, am Besen befestigt -->
        <ellipse cx="60" cy="72" rx="20" ry="16" fill="#1b1d20" stroke="#0e0f12" stroke-width="2.5" />
        <ellipse cx="60" cy="62" rx="16" ry="6" fill="url(#hfc-poison-brew)" />

        <!-- Hexenkörper & Umhang -->
        <polygon points="75,35 60,65 95,65" fill="url(#hfc-witch-robe)" />
        
        <!-- Hexengesicht & Hakennase -->
        <circle cx="85" cy="32" r="10" fill="#8ed179" />
        <path d="M89,32 L97,35 L89,37" fill="#8ed179" stroke="#68a056" stroke-width="1" />
        <!-- Auge -->
        <circle cx="87" cy="30" r="1.8" fill="#103308" />

        <!-- Spitzhut -->
        <polygon points="72,26 98,26 84,0" fill="#1e102d" />
        <ellipse cx="85" cy="26" rx="16" ry="3" fill="#32164a" />
        <!-- Hutband -->
        <rect x="76" y="21" width="16" height="3" fill="#ff7700" />
      </svg>
    `;

    document.body.appendChild(witch);

    // Kontinuierlich lila Giftrauch hinter dem Kessel erzeugen
    const smokeInterval = setInterval(() => {
      if (!witch.parentElement) {
        clearInterval(smokeInterval);
        return;
      }
      this._emitPoisonPuff(witch);
    }, 120);

    witch.addEventListener('pointerdown', () => {
      this._playSound('witch_cackle');
      for (let k = 0; k < 5; k++) this._emitPoisonPuff(witch, true);
    });

    setTimeout(() => {
      clearInterval(smokeInterval);
      if (witch.parentElement) witch.remove();
    }, dur * 1000 + 400);
  }

  _emitPoisonPuff(witchEl, burst = false) {
    const rect = witchEl.getBoundingClientRect();
    if (rect.right < -50 || rect.left > window.innerWidth + 50) return;

    // Kesselposition ermitteln (ca. 40% von links, 60% von oben im Hexen-Element)
    const puffX = rect.left + rect.width * 0.4;
    const puffY = rect.top + rect.height * 0.6;

    const puff = document.createElement('div');
    puff.className = 'hfc-poison-smoke';
    const size = burst ? (26 + Math.random() * 24) : (18 + Math.random() * 16);
    const floatDistY = -(35 + Math.random() * 45);
    const floatDistX = (Math.random() * 30 - 15);

    puff.style.cssText = `
      position: fixed;
      left: ${puffX}px;
      top: ${puffY}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(179, 71, 255, 0.85) 0%, rgba(106, 13, 173, 0.6) 55%, rgba(45, 0, 77, 0) 80%);
      pointer-events: none;
      z-index: 999991;
      transform: translate(-50%, -50%) scale(0.3);
      transition: transform 1.4s cubic-bezier(0.1, 0.6, 0.3, 1), opacity 1.4s ease;
      filter: blur(2px) drop-shadow(0 0 6px #bf55ec);
    `;

    document.body.appendChild(puff);

    requestAnimationFrame(() => {
      puff.style.transform = `translate(calc(-50% + ${floatDistX}px), calc(-50% + ${floatDistY}px)) scale(2.2)`;
      puff.style.opacity = '0';
    });

    setTimeout(() => puff.remove(), 1450);
  }

  /* ----------------------------------------------------
   * VORHANDENE KLASSIKER (Fledermaus & Geist)
   * ---------------------------------------------------- */
  _spawnClassicBat() {
    const bat = document.createElement('div');
    const startY = 10 + Math.random() * 70;
    const dur = 7 + Math.random() * 3;
    bat.className = 'hfc-creature hfc-bat';
    bat.style.cssText = `
      position: fixed;
      top: ${startY}vh;
      left: -90px;
      width: 75px;
      height: 45px;
      pointer-events: none;
      z-index: 999992;
      animation: hfc-fly-horizontal ${dur}s ease-in-out forwards;
    `;
    bat.innerHTML = `
      <svg viewBox="0 0 100 60" style="width: 100%; height: 100%; fill: #1c1917; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
        <path d="M50,32 C40,15 25,5 5,18 C15,35 25,38 28,52 C36,44 44,48 50,38 C56,48 64,44 72,52 C75,38 85,35 95,18 C75,5 60,15 50,32 Z" />
        <circle cx="47" cy="28" r="2" fill="#ff2200" />
        <circle cx="53" cy="28" r="2" fill="#ff2200" />
      </svg>
    `;
    document.body.appendChild(bat);
    setTimeout(() => { if (bat.parentElement) bat.remove(); }, dur * 1000 + 400);
  }

  _spawnClassicGhost() {
    const ghost = document.createElement('div');
    const startY = 15 + Math.random() * 60;
    const dur = 9 + Math.random() * 4;
    ghost.className = 'hfc-creature hfc-ghost';
    ghost.style.cssText = `
      position: fixed;
      top: ${startY}vh;
      right: -90px;
      width: 70px;
      height: 75px;
      pointer-events: none;
      z-index: 999992;
      animation: hfc-fly-witch ${dur}s ease-in-out forwards;
    `;
    ghost.innerHTML = `
      <svg viewBox="0 0 60 70" fill="rgba(240, 248, 255, 0.88)" style="width: 100%; height: 100%; filter: drop-shadow(0 0 10px rgba(120, 220, 255, 0.7));">
        <path d="M30,5 C15,5 8,20 8,36 C8,52 4,60 12,63 C20,66 22,57 28,60 C34,63 36,67 42,65 C48,63 47,54 52,57 C57,60 54,46 54,36 C54,20 45,5 30,5 Z" />
        <circle cx="22" cy="25" r="4" fill="#0b1320" />
        <circle cx="38" cy="25" r="4" fill="#0b1320" />
        <ellipse cx="30" cy="40" rx="4.5" ry="7" fill="#0b1320" />
      </svg>
    `;
    document.body.appendChild(ghost);
    setTimeout(() => { if (ghost.parentElement) ghost.remove(); }, dur * 1000 + 400);
  }

  /* ----------------------------------------------------
   * KARTEN-DARSTELLUNG IM DASHBOARD
   * ---------------------------------------------------- */
  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        ha-card {
          padding: 16px;
          background: linear-gradient(135deg, rgba(28, 17, 38, 0.95), rgba(14, 10, 20, 0.98));
          color: #f3e8ee;
          border: 1px solid rgba(255, 120, 10, 0.3);
          border-radius: 14px;
          overflow: hidden;
          position: relative;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .title {
          font-size: 1.15rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ff9d00;
          text-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
        }
        .badge {
          font-size: 0.75rem;
          background: #4a154b;
          color: #ffb703;
          padding: 3px 8px;
          border-radius: 10px;
          font-weight: bold;
          border: 1px solid rgba(255, 183, 3, 0.4);
        }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
          font-size: 0.85rem;
        }
        .status-pill {
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 10px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          border-left: 3px solid #ff7700;
        }
        .status-pill.toxic {
          border-left-color: #39ff14;
        }
        .status-label {
          color: #aaa;
          font-size: 0.72rem;
          text-transform: uppercase;
        }
        .status-val {
          font-weight: 600;
          color: #fff;
        }
        .action-row {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        button.action-btn {
          background: rgba(255, 120, 0, 0.2);
          border: 1px solid rgba(255, 140, 20, 0.4);
          color: #ffeedd;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s, transform 0.1s;
        }
        button.action-btn:hover {
          background: rgba(255, 120, 0, 0.4);
          transform: translateY(-1px);
        }
        button.action-btn:active {
          transform: translateY(1px);
        }
      </style>

      <ha-card>
        <div class="header">
          <div class="title">
            <span>🎃</span> Halloween Flyover Card
          </div>
          <span class="badge">v1.9.0</span>
        </div>

        <div class="status-grid">
          <div class="status-pill ${this._config.glow_mode === 'toxic' ? 'toxic' : ''}">
            <span class="status-label">Glow-Modus</span>
            <span class="status-val">${this._config.glow_mode === 'candle' ? '🕯️ Kerzenschein' : (this._config.glow_mode === 'toxic' ? '🧪 Giftgrün' : 'Aus')}</span>
          </div>
          <div class="status-pill">
            <span class="status-label">Deko-Vorhang</span>
            <span class="status-val">${this._config.curtain_type === 'slime_web' ? '🕸️ Schleim & Netz' : this._config.curtain_type}</span>
          </div>
          <div class="status-pill">
            <span class="status-label">Portal-Cameo</span>
            <span class="status-val">${this._config.portal_cameo ? '🌀 Aktiv (' + this._config.portal_interval_seconds + 's)' : 'Inaktiv'}</span>
          </div>
          <div class="status-pill">
            <span class="status-label">Sound</span>
            <span class="status-val">${this._config.sound_enabled ? '🔊 ' + Math.round((this._config.volume || 0.3) * 100) + '%' : '🔇 Stumm'}</span>
          </div>
        </div>

        <div class="action-row">
          <button class="action-btn" id="btn-portal">🌀 Portal beschwören</button>
          <button class="action-btn" id="btn-mummy">🏺 Mumie testen</button>
          <button class="action-btn" id="btn-gargoyle">🦅 Gargoyle testen</button>
          <button class="action-btn" id="btn-witch">🧙‍♀️ Hexe testen</button>
        </div>
      </ha-card>
    `;

    // Schnelltest Buttons
    this.shadowRoot.querySelector('#btn-portal')?.addEventListener('click', () => this._spawnGhostPortal());
    this.shadowRoot.querySelector('#btn-mummy')?.addEventListener('click', () => this._spawnMummySarcophagus());
    this.shadowRoot.querySelector('#btn-gargoyle')?.addEventListener('click', () => this._spawnDiveGargoyle());
    this.shadowRoot.querySelector('#btn-witch')?.addEventListener('click', () => this._spawnCauldronWitch());
  }

  getCardSize() {
    return 2;
  }

  static getConfigElement() {
    return document.createElement('halloween-flyover-card-editor');
  }
}

/* ----------------------------------------------------
 * LOVELACE CARD EDITOR (halloween-flyover-card-editor)
 * ---------------------------------------------------- */
class HalloweenFlyoverCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...config };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  _valueChanged(ev) {
    if (!this._config) return;
    const target = ev.target;
    const configValue = target.dataset.config;
    if (!configValue) return;

    let value = target.value;
    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'number') {
      value = Number(target.value);
    }

    if (configValue === 'creatures') {
      const enabled = [];
      this.shadowRoot.querySelectorAll('input[data-creature]').forEach(cb => {
        if (cb.checked) enabled.push(cb.dataset.creature);
      });
      this._config = { ...this._config, enabled_creatures: enabled };
    } else {
      this._config = { ...this._config, [configValue]: value };
    }

    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.shadowRoot) return;

    const creatures = this._config.enabled_creatures || [
      'mummy_sarcophagus',
      'dive_gargoyle',
      'cauldron_witch',
      'classic_bat',
      'classic_ghost'
    ];

    this.shadowRoot.innerHTML = `
      <style>
        .card-config {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 8px 0;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
        }
        .section-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--primary-color, #ff9800);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 4px;
          margin-top: 6px;
        }
        .form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .form-row label {
          font-size: 0.9rem;
          color: var(--primary-text-color, #fff);
          flex: 1;
        }
        select, input[type="number"] {
          background: var(--card-background-color, #202020);
          color: var(--primary-text-color, #fff);
          border: 1px solid var(--divider-color, #444);
          padding: 6px 10px;
          border-radius: 6px;
          outline: none;
        }
        .creature-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 4px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }
      </style>

      <div class="card-config">
        <!-- VISUELLE EFFEKTE & DEKO -->
        <div class="section-title">✨ Visuelle Effekte & Deko (v1.9.0)</div>

        <div class="form-row">
          <label for="glow_mode">Karten-Glow Modus:</label>
          <select id="glow_mode" data-config="glow_mode">
            <option value="candle" ${this._config.glow_mode === 'candle' ? 'selected' : ''}>🕯️ Kerzenschein (Warm-Orange)</option>
            <option value="toxic" ${this._config.glow_mode === 'toxic' ? 'selected' : ''}>🧪 Toxic Glow (Giftgrün)</option>
            <option value="off" ${this._config.glow_mode === 'off' ? 'selected' : ''}>Aus</option>
          </select>
        </div>

        <div class="form-row">
          <label for="curtain_type">Oberer Vorhang / Rand:</label>
          <select id="curtain_type" data-config="curtain_type">
            <option value="slime_web" ${this._config.curtain_type === 'slime_web' ? 'selected' : ''}>🕸️ Schleim & Spinnennetz</option>
            <option value="slime" ${this._config.curtain_type === 'slime' ? 'selected' : ''}>🧪 Nur Schleim-Tropfen</option>
            <option value="web" ${this._config.curtain_type === 'web' ? 'selected' : ''}>🕸️ Nur Spinnennetz</option>
            <option value="none" ${this._config.curtain_type === 'none' ? 'selected' : ''}>Deaktiviert</option>
          </select>
        </div>

        <div class="form-row">
          <label class="checkbox-label">
            <input type="checkbox" data-config="portal_cameo" ${this._config.portal_cameo !== false ? 'checked' : ''} />
            Geister-Portal / Schwarzes Loch Cameo
          </label>
        </div>

        <div class="form-row">
          <label for="portal_interval">Portal-Intervall (Sekunden):</label>
          <input type="number" id="portal_interval" data-config="portal_interval_seconds" min="15" max="600" value="${this._config.portal_interval_seconds || 60}" style="width: 70px;" />
        </div>

        <!-- FLIEGER & KREATUREN -->
        <div class="section-title">🦇 Flieger & Kreaturen</div>

        <div class="form-row">
          <label for="flyover_frequency">Erscheinungs-Häufigkeit:</label>
          <select id="flyover_frequency" data-config="flyover_frequency">
            <option value="high" ${this._config.flyover_frequency === 'high' ? 'selected' : ''}>Häufig (alle ~5s)</option>
            <option value="medium" ${this._config.flyover_frequency === 'medium' || !this._config.flyover_frequency ? 'selected' : ''}>Normal (alle ~10s)</option>
            <option value="low" ${this._config.flyover_frequency === 'low' ? 'selected' : ''}>Selten (alle ~18s)</option>
          </select>
        </div>

        <div class="creature-group">
          <label class="checkbox-label">
            <input type="checkbox" data-config="creatures" data-creature="mummy_sarcophagus" ${creatures.includes('mummy_sarcophagus') ? 'checked' : ''} />
            🏺 Mumien-Sarkophag
          </label>
          <label class="checkbox-label">
            <input type="checkbox" data-config="creatures" data-creature="dive_gargoyle" ${creatures.includes('dive_gargoyle') ? 'checked' : ''} />
            🦅 Sturzflug-Gargoyle
          </label>
          <label class="checkbox-label">
            <input type="checkbox" data-config="creatures" data-creature="cauldron_witch" ${creatures.includes('cauldron_witch') ? 'checked' : ''} />
            🧙‍♀️ Kessel-Hexe
          </label>
          <label class="checkbox-label">
            <input type="checkbox" data-config="creatures" data-creature="classic_ghost" ${creatures.includes('classic_ghost') ? 'checked' : ''} />
            👻 Klassischer Geist
          </label>
          <label class="checkbox-label">
            <input type="checkbox" data-config="creatures" data-creature="classic_bat" ${creatures.includes('classic_bat') ? 'checked' : ''} />
            🦇 Fledermaus
          </label>
        </div>

        <!-- AUDIO EINSTELLUNGEN -->
        <div class="section-title">🔊 Web Audio (Synthetisch)</div>

        <div class="form-row">
          <label class="checkbox-label">
            <input type="checkbox" data-config="sound_enabled" ${this._config.sound_enabled !== false ? 'checked' : ''} />
            Soundeffekte aktivieren
          </label>
        </div>

        <div class="form-row">
          <label for="volume">Lautstärke (0.1 - 1.0):</label>
          <input type="number" step="0.1" min="0.1" max="1.0" id="volume" data-config="volume" value="${this._config.volume !== undefined ? this._config.volume : 0.3}" style="width: 70px;" />
        </div>
      </div>
    `;

    // Event-Listener verdrahten
    this.shadowRoot.querySelectorAll('select, input').forEach(input => {
      input.addEventListener('change', (e) => this._valueChanged(e));
    });
  }
}

// Elemente bei CustomElements registrieren
if (!customElements.get('halloween-flyover-card')) {
  customElements.define('halloween-flyover-card', HalloweenFlyoverCard);
}
if (!customElements.get('halloween-flyover-card-editor')) {
  customElements.define('halloween-flyover-card-editor', HalloweenFlyoverCardEditor);
}

// Karte im Home Assistant Lovelace Custom Cards Register anmelden
window.customCards = window.customCards || [];
const cardEntry = {
  type: 'halloween-flyover-card',
  name: 'Halloween Flyover Card',
  description: 'Spukhafte Flieger, Cameo-Portale, Deko-Vorhänge und flackernder Kerzenschein für dein Dashboard (v1.9.0).',
  preview: true,
  documentationURL: 'https://github.com/marcelk1502/halloween-flyover-card'
};

const existingIndex = window.customCards.findIndex(c => c.type === 'halloween-flyover-card');
if (existingIndex >= 0) {
  window.customCards[existingIndex] = cardEntry;
} else {
  window.customCards.push(cardEntry);
}

console.info(
  `%c 🎃 HALLOWEEN-FLYOVER-CARD %c v1.9.0 `,
  'color: #fff; background: #ff7700; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #000; background: #39ff14; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
