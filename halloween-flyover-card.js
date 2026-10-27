/*
 * Halloween Flyover Card for Home Assistant
 * ------------------------------------------
 * Version 1.7.0:
 * - NEU: Eigener Home Assistant Card-Editor (HalloweenFlyoverCardEditor)
 *   -> Behebt den Schalter- & Schieberegler-Bug endgültig! Alle Schalter & Schieberegler
 *      zeigen sofort ihren echten Standardwert (EIN / 60% / 10s etc.), selbst wenn die Card-YAML leer ist.
 * - NEU: Aufgeräumter Editor mit aufklappbaren Kategorien (Allgemein, Deko, Flieger, Spezial, Cameos, Kiosk)
 * - NEU: Süßigkeiten-Regen beim Klick auf den Countdown (🍬 🍭 🍫 🍪 🧁 mit magischem Glöckchen-Sound)
 * - NEU: Neuer Flieger "Krähen-Schwarm" (Schwarze Raben im Tiefflug mit Flügelschlag & Krah-Sound)
 * - NEU: Erschütterungs- / Rüttel-Effekt (Dashboard wackelt bei Donner, Geisterschiff & Display-Riss)
 * - Sensenmann (Grim Reaper), Skelettfinger mit Glasriss, kriechende Mini-Spinnen, giftgrüner Glow
 * - Kiosk-Standby-Schutz (Fully Kiosk & Page Visibility)
 */

const CARD_VERSION = "1.7.1";
const STORAGE_KEY = "halloween-flyover-card-v1";

const DEFAULT_CONFIG = {
  title: "Halloween",
  duration: 10,
  width_percent: 60,
  sound_volume: 0.6,
  wind_volume: 0.5,
  schedule_start: "09:00",
  schedule_end: "22:00",
  countdown: true,
  default_collapsed: false,
  kiosk_safe: true,
  shake_fx: true,
  // Dashboard-Deko
  corner_webs: true,
  card_glow: true,
  crawling_spiders: true,
  // Haupt-Flieger
  enable_witch: true,
  enable_ghosts: true,
  ghost_every: 2,
  enable_reaper: true,
  reaper_every: 5,
  enable_crows: true,
  crows_every: 7,
  // Spezialflüge
  enable_specials: true,
  special_every: 10,
  special_storm: true,
  special_bats: true,
  special_ship: true,
  // Cameos
  cameos: true,
  cameo_spider: true,
  cameo_hand: true,
  cameo_lantern: true,
  cameo_fog: true,
  cameo_drip: true,
  cameo_crack: true,
  cameo_min: 4,
  cameo_max: 12,
};

const MODES = {
  daily: null,
  "1-2": [1, 2],
  "3-8": [3, 8],
  "5-10": [5, 10],
  "10-20": [10, 20],
};

const I18N = {
  de: {
    title: "Halloween",
    enable: "Aktivieren",
    disable: "Deaktivieren",
    sound_on: "Ton an",
    sound_off: "Ton aus",
    test: "Test Hexe",
    test_ghost: "Test Geister",
    test_reaper: "Test Sensenmann",
    test_crows: "Test Krähen",
    test_special: "Test Spezial",
    test_cameo: "Test Cameo",
    from: "Von",
    until: "Bis",
    mode: "Modus",
    m_daily: "1–10 Flüge pro Tag",
    "m_1-2": "alle 1–2 Min.",
    "m_3-8": "alle 3–8 Min.",
    "m_5-10": "alle 5–10 Min.",
    "m_10-20": "alle 10–20 Min.",
    st_off: "Deaktiviert",
    st_next: "Nächster Spuk: ",
    st_none: "Heute keine Flüge mehr",
    st_flying: "Spuk im Flug …",
    bad_time: "„Von“ muss vor „Bis“ liegen.",
    caught: "Erwischte Geister:",
    cd_n: "🎃 Noch {n} Tage bis Halloween",
    cd_one: "🎃 Nur noch 1 Tag bis Halloween!",
    cd_today: "🎃 Heute ist Halloween!",
    cd_over: "🎃 Halloween ist vorbei – bis nächstes Jahr!",
    expand: "Details anzeigen",
    collapse: "Einklappen",
    // Editor Abschnitte
    sec_general: "⚙️ Allgemeine Einstellungen & Sound",
    sec_decorations: "🕸️ Dashboard-Dekoration & Rüttel-Effekt",
    sec_flyers: "🦇 Flieger (Hexe, Geister, Sensenmann, Krähen)",
    sec_specials: "⚡ Spezial-Events (Gewitter, Schwarm, Schiff)",
    sec_cameos: "🕷️ Überraschungen (Cameos)",
    sec_kiosk: "📱 Tablet & Kiosk-Modus",
    // Editor Labels
    ed_title: "Titel der Karte",
    ed_duration: "Flugdauer (Sekunden)",
    ed_width: "Größe der Figuren (%)",
    ed_sound: "Lautstärke Effekte & Rufe",
    ed_wind: "Lautstärke Wind / Ambient",
    ed_start: "Tägliche Flugzeit ab",
    ed_end: "Tägliche Flugzeit bis",
    ed_countdown: "Countdown bis Halloween anzeigen (klickbar!)",
    ed_default_collapsed: "Karte standardmäßig eingeklappt starten",
    ed_corner_webs: "Spinnennetze in den Dashboard-Ecken",
    ed_card_glow: "Giftgrüner Spuk-Glow für Dashboard-Karten",
    ed_crawling_spiders: "Kriechende Mini-Spinnen auf dem Dashboard",
    ed_shake_fx: "Erschütterungs-Effekt (Karten wackeln bei Donner & Bruch)",
    ed_enable_witch: "Hexe auf dem Besen fliegen lassen",
    ed_enable_ghosts: "Geisterschwarm erlauben",
    ed_ghost: "Geister: jeder N-te Flug (0 = nie)",
    ed_enable_reaper: "Sensenmann (Grim Reaper) erlauben",
    ed_reaper_every: "Sensenmann: jeder N-te Flug (0 = nie)",
    ed_enable_crows: "Krähen-Schwarm im Tiefflug erlauben",
    ed_crows_every: "Krähen: jeder N-te Flug (0 = nie)",
    ed_enable_specials: "Spezialflüge erlauben",
    ed_special: "Spezialflug: jeder N-te Flug (0 = nie)",
    ed_sp_storm: "Spezial: Gewitter mit Blitzen & Donner",
    ed_sp_bats: "Spezial: Großer Fledermausschwarm",
    ed_sp_ship: "Spezial: Fliegendes Geisterschiff",
    ed_cameos: "Zufällige Überraschungen generell erlauben",
    ed_cam_spider: "Cameo: Abseilende Spinne",
    ed_cam_hand: "Cameo: Zombie-Hand von unten",
    ed_cam_lantern: "Cameo: Grinsender Kürbis am Rand",
    ed_cam_fog: "Cameo: Bodennebel mit leuchtenden Augen",
    ed_cam_drip: "Cameo: Herabtropfendes Blut",
    ed_cam_crack: "Cameo: Skelettfinger klopft & zerbricht Display",
    ed_cameo_min: "Überraschung frühestens nach (Min.)",
    ed_cameo_max: "Überraschung spätestens nach (Min.)",
    ed_kiosk_safe: "Standby-Schutz (Bildschirm aus = Pause & Stumm)",
  },
  en: {
    title: "Halloween",
    enable: "Enable",
    disable: "Disable",
    sound_on: "Sound on",
    sound_off: "Sound off",
    test: "Test Witch",
    test_ghost: "Test Ghosts",
    test_reaper: "Test Reaper",
    test_crows: "Test Crows",
    test_special: "Test Special",
    test_cameo: "Test Cameo",
    from: "From",
    until: "Until",
    mode: "Mode",
    m_daily: "1–10 flights per day",
    "m_1-2": "every 1–2 min",
    "m_3-8": "every 3–8 min",
    "m_5-10": "every 5–10 min",
    "m_10-20": "every 10–20 min",
    st_off: "Disabled",
    st_next: "Next spook: ",
    st_none: "No more flights today",
    st_flying: "Spook in progress …",
    bad_time: "“From” must be earlier than “Until”.",
    caught: "Ghosts caught:",
    cd_n: "🎃 {n} days until Halloween",
    cd_one: "🎃 Only 1 day until Halloween!",
    cd_today: "🎃 Today is Halloween!",
    cd_over: "🎃 Halloween is over – see you next year!",
    expand: "Show details",
    collapse: "Collapse",
    sec_general: "⚙️ General Settings & Audio",
    sec_decorations: "🕸️ Dashboard Decorations & Shake FX",
    sec_flyers: "🦇 Flyers (Witch, Ghosts, Reaper, Crows)",
    sec_specials: "⚡ Special Events (Storm, Bat Swarm, Ship)",
    sec_cameos: "🕷️ Surprises (Cameos)",
    sec_kiosk: "📱 Tablet & Kiosk Mode",
    ed_title: "Card title",
    ed_duration: "Flight duration (seconds)",
    ed_width: "Figure size (%)",
    ed_sound: "Effects volume",
    ed_wind: "Wind / Ambient volume",
    ed_start: "Daily flights from",
    ed_end: "Daily flights until",
    ed_countdown: "Show Halloween countdown (clickable!)",
    ed_default_collapsed: "Start collapsed (compact bar)",
    ed_corner_webs: "Cobwebs in dashboard corners",
    ed_card_glow: "Toxic green eerie glow on cards",
    ed_crawling_spiders: "Crawling mini spiders on dashboard",
    ed_shake_fx: "Screen shake effect (cards vibrate on thunder/crack)",
    ed_enable_witch: "Enable Witch flights",
    ed_enable_ghosts: "Enable Ghost swarms",
    ed_ghost: "Ghosts: every Nth flight (0 = never)",
    ed_enable_reaper: "Enable Grim Reaper",
    ed_reaper_every: "Reaper: every Nth flight (0 = never)",
    ed_enable_crows: "Enable flying Crow swarm",
    ed_crows_every: "Crows: every Nth flight (0 = never)",
    ed_enable_specials: "Enable Special flights",
    ed_special: "Special flight: every Nth flight (0 = never)",
    ed_sp_storm: "Special: Lightning storm & thunder",
    ed_sp_bats: "Special: Bat swarm",
    ed_sp_ship: "Special: Ghost ship",
    ed_cameos: "Enable random surprises",
    ed_cam_spider: "Cameo: Hanging spider",
    ed_cam_hand: "Cameo: Zombie hand from below",
    ed_cam_lantern: "Cameo: Grinning pumpkin peek",
    ed_cam_fog: "Cameo: Ground fog with eyes",
    ed_cam_drip: "Cameo: Dripping blood",
    ed_cam_crack: "Cameo: Skeleton finger tap & screen crack",
    ed_cameo_min: "Surprise earliest after (min.)",
    ed_cameo_max: "Surprise latest after (min.)",
    ed_kiosk_safe: "Standby protection (Screen off = pause & mute)",
  },
};

/* ---------- SVGs ---------- */

const WITCH_SVG = `
<svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;overflow:visible">
  <path d="M90 30 Q70 34 60 54 Q80 48 92 40 Z" fill="#ff7518"/>
  <line x1="24" y1="79" x2="168" y2="60" stroke="#6b4423" stroke-width="5" stroke-linecap="round"/>
  <path d="M26 74 L2 68 L6 78 L0 86 L8 88 L4 96 L28 84 Z" fill="#c9923a"/>
  <path d="M26 76 L8 76 M26 80 L6 84 M26 83 L10 91" stroke="#8a5f1f" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="24" y1="73" x2="24" y2="85" stroke="#4a2f14" stroke-width="3"/>
  <line x1="150" y1="62" x2="150" y2="76" stroke="#bbb" stroke-width="1.2"/>
  <circle cx="150" cy="82" r="7" fill="#ff7518" style="filter:drop-shadow(0 0 6px #ffb347)"/>
  <path d="M146 80 q2 -3 4 0 M150 80 q2 -3 4 0" stroke="#3b1a0a" stroke-width="1.4" fill="none"/>
  <path d="M146 85 q4 3 8 0" stroke="#3b1a0a" stroke-width="1.4" fill="none"/>
  <path d="M88 62 L94 84 L103 84 L102 62 Z" fill="#2a1745"/>
  <path d="M92 82 L106 82 L108 89 L91 89 Z" fill="#120a1c"/>
  <path d="M74 66 C70 42 98 36 104 48 L112 66 Z" fill="#3a1f5c"/>
  <path d="M74 66 Q60 70 52 82 Q70 74 86 70 Z" fill="#3a1f5c"/>
  <line x1="98" y1="48" x2="118" y2="62" stroke="#2a1745" stroke-width="6" stroke-linecap="round"/>
  <circle cx="119" cy="62" r="3.4" fill="#9fd37b"/>
  <circle cx="98" cy="34" r="9" fill="#9fd37b"/>
  <path d="M105 34 L116 37 L105 39 Z" fill="#8bc268"/>
  <circle cx="101" cy="32" r="1.6" fill="#1a0f2b"/>
  <ellipse cx="97" cy="27" rx="18" ry="4.5" fill="#1a0f2b"/>
  <path d="M84 27 Q92 12 106 2 Q106 14 110 27 Z" fill="#241438"/>
  <rect x="86" y="21" width="22" height="4.5" fill="#ff7518" transform="rotate(-6 97 23)"/>
</svg>`;

const BAT_SVG = `
<svg viewBox="0 0 64 36" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;overflow:visible">
  <g class="hw-wing hw-wing-left" style="transform-origin: 30px 17px;">
    <path d="M30 17 C24 9 14 8 2 13 C7 17 11 16 13 21 C17 19 21 19 24 23 C27 20 29 19 30 17 Z"
          fill="#2b1646" stroke="#9b6bff" stroke-width="1" stroke-linejoin="round"/>
  </g>
  <g class="hw-wing hw-wing-right" style="transform-origin: 34px 17px;">
    <path d="M34 17 C40 9 50 8 62 13 C57 17 53 16 51 21 C47 19 43 19 40 23 C37 20 35 19 34 17 Z"
          fill="#2b1646" stroke="#9b6bff" stroke-width="1" stroke-linejoin="round"/>
  </g>
  <g class="hw-bat-body">
    <ellipse cx="32" cy="20" rx="4.5" ry="7" fill="#2b1646" stroke="#9b6bff" stroke-width="0.8"/>
    <circle cx="32" cy="13" r="3.8" fill="#2b1646"/>
    <polygon points="29,12 26,6 31,10" fill="#2b1646"/>
    <polygon points="35,12 38,6 33,10" fill="#2b1646"/>
    <circle cx="30.5" cy="13" r="1.1" fill="#ff9d3c"/>
    <circle cx="33.5" cy="13" r="1.1" fill="#ff9d3c"/>
  </g>
</svg>`;

const GHOST_SVG = `
<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;overflow:visible">
  <path d="M8 34 C8 14 16 4 30 4 C44 4 52 14 52 34 L52 62 L45 55 L38 64 L30 55 L22 64 L15 55 L8 62 Z"
        fill="#f2f0ff" fill-opacity=".95" stroke="#8f6fe0" stroke-width="1.8" stroke-linejoin="round"/>
  <ellipse cx="22.5" cy="28" rx="4" ry="6" fill="#1b0f2e"/>
  <ellipse cx="37.5" cy="28" rx="4" ry="6" fill="#1b0f2e"/>
  <ellipse cx="30" cy="43" rx="4.2" ry="6" fill="#1b0f2e"/>
  <circle cx="17" cy="38" r="3" fill="#ffb6d9" fill-opacity=".55"/>
  <circle cx="43" cy="38" r="3" fill="#ffb6d9" fill-opacity=".55"/>
</svg>`;

const REAPER_SVG = `
<svg viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;overflow:visible">
  <line x1="45" y1="125" x2="115" y2="15" stroke="#4a3018" stroke-width="5" stroke-linecap="round"/>
  <path d="M115 15 C135 12 155 25 158 50 C146 32 130 25 112 21 Z" fill="#e0e8f0" stroke="#7e94b2" stroke-width="1.5" style="filter:drop-shadow(0 0 6px #7fffd4)"/>
  <path d="M60 48 Q35 75 42 120 Q65 130 90 120 Q105 75 88 48 Z" fill="#13101c" stroke="#2c223b" stroke-width="2"/>
  <path d="M42 120 L48 112 L56 124 L68 114 L78 126 L90 120 Z" fill="#13101c"/>
  <path d="M78 58 Q98 68 106 48 L96 44 Z" fill="#1c1729"/>
  <circle cx="103" cy="42" r="3.2" fill="#d8d3c5"/>
  <circle cx="106" cy="44" r="3" fill="#d8d3c5"/>
  <path d="M56 46 C52 24 70 12 84 18 C96 24 96 44 90 52 C78 58 64 58 56 46 Z" fill="#181324" stroke="#3d3052" stroke-width="1.8"/>
  <ellipse cx="76" cy="36" rx="10" ry="12" fill="#08060d"/>
  <circle cx="72" cy="34" r="2" fill="#7fffd4" style="filter:drop-shadow(0 0 5px #00ffaa)"/>
  <circle cx="80" cy="34" r="2" fill="#7fffd4" style="filter:drop-shadow(0 0 5px #00ffaa)"/>
</svg>`;

/* Krähe / Rabe SVG */
const CROW_SVG = `
<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;overflow:visible">
  <g class="hw-wing hw-wing-left" style="transform-origin: 38px 22px;">
    <path d="M38 22 C30 8 16 2 2 8 C6 14 12 18 16 26 C24 24 30 24 38 22 Z" fill="#111116" stroke="#2d2d38" stroke-width="1"/>
  </g>
  <g class="hw-wing hw-wing-right" style="transform-origin: 42px 22px;">
    <path d="M42 22 C50 8 64 2 78 8 C74 14 68 18 64 26 C56 24 50 24 42 22 Z" fill="#111116" stroke="#2d2d38" stroke-width="1"/>
  </g>
  <!-- Körper & Kopf -->
  <g fill="#1a1a24">
    <ellipse cx="40" cy="25" rx="7" ry="12" transform="rotate(-15 40 25)"/>
    <circle cx="46" cy="16" r="5.5"/>
    <!-- Schnabel -->
    <polygon points="51,14 62,18 50,20" fill="#2c2c36"/>
    <!-- Auge -->
    <circle cx="47" cy="15" r="1.2" fill="#ff3b3b"/>
    <!-- Schwanzfedern -->
    <polygon points="32,34 26,48 37,36" fill="#111116"/>
  </g>
</svg>`;

const SKELETON_FINGER_SVG = `
<svg viewBox="0 0 70 140" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%;overflow:visible">
  <g fill="#e4decb" stroke="#736859" stroke-width="1.5" stroke-linejoin="round">
    <path d="M28 15 C28 8 42 8 42 15 L44 45 C46 50 24 50 26 45 Z"/>
    <ellipse cx="35" cy="48" rx="10" ry="6"/>
    <path d="M26 52 C24 58 23 80 25 86 C25 92 45 92 45 86 C47 80 46 58 44 52 Z"/>
    <ellipse cx="35" cy="90" rx="12" ry="7"/>
    <path d="M24 96 C22 105 20 135 22 140 L48 140 C50 135 48 105 46 96 Z"/>
  </g>
</svg>`;

const SCREEN_CRACK_SVG = (w, h) => `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible">
  <defs>
    <filter id="crack-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#ffffff" flood-opacity="0.9"/>
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#7fffd4" flood-opacity="0.6"/>
    </filter>
  </defs>
  <g stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" filter="url(#crack-glow)">
    <path d="M${w*0.5} ${h*0.5} L${w*0.48} ${h*0.42} L${w*0.54} ${h*0.38} L${w*0.58} ${h*0.22} L${w*0.52} ${h*0.12} L${w*0.56} 0" stroke-width="3" fill="none"/>
    <path d="M${w*0.5} ${h*0.5} L${w*0.42} ${h*0.55} L${w*0.32} ${h*0.52} L${w*0.22} ${h*0.62} L${w*0.1} ${h*0.65} L0 ${h*0.72}" stroke-width="2.8" fill="none"/>
    <path d="M${w*0.5} ${h*0.5} L${w*0.58} ${h*0.58} L${w*0.65} ${h*0.68} L${w*0.78} ${h*0.75} L${w*0.88} ${h*0.9} L${w} ${h*0.95}" stroke-width="2.6" fill="none"/>
    <path d="M${w*0.5} ${h*0.5} L${w*0.46} ${h*0.62} L${w*0.52} ${h*0.76} L${w*0.48} ${h*0.88} L${w*0.5} ${h}" stroke-width="2.4" fill="none"/>
    <path d="M${w*0.5} ${h*0.5} L${w*0.62} ${h*0.46} L${w*0.74} ${h*0.42} L${w*0.85} ${h*0.32} L${w} ${h*0.28}" stroke-width="2.4" fill="none"/>
    <path d="M${w*0.48} ${h*0.42} L${w*0.38} ${h*0.36} L${w*0.3} ${h*0.28}" stroke-width="1.4" fill="none"/>
    <path d="M${w*0.58} ${h*0.58} L${w*0.7} ${h*0.6} L${w*0.82} ${h*0.55}" stroke-width="1.4" fill="none"/>
    <polygon points="${w*0.49},${h*0.48} ${w*0.53},${h*0.49} ${w*0.51},${h*0.53}" fill="rgba(255,255,255,0.7)"/>
  </g>
</svg>`;

const MINI_SPIDER_SVG = `
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%">
  <g stroke="#1a0f2b" stroke-width="1.8" stroke-linecap="round" fill="none">
    <path d="M12 14 Q6 10 2 13"/><path d="M12 16 Q5 17 2 22"/><path d="M12 18 Q6 22 4 27"/>
    <path d="M20 14 Q26 10 30 13"/><path d="M20 16 Q27 17 30 22"/><path d="M20 18 Q26 22 28 27"/>
  </g>
  <ellipse cx="16" cy="18" rx="5" ry="6" fill="#1b0e2b" stroke="#7952b3" stroke-width="0.8"/>
  <circle cx="16" cy="11" r="3.5" fill="#1b0e2b"/>
  <circle cx="14.5" cy="10" r="0.8" fill="#ff3b3b"/>
  <circle cx="17.5" cy="10" r="0.8" fill="#ff3b3b"/>
</svg>`;

const WEB_CORNER_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
  <g stroke="rgba(215,208,234,0.65)" stroke-width="1" fill="none">
    <line x1="0" y1="0" x2="100" y2="0"/>
    <line x1="0" y1="0" x2="92" y2="38"/>
    <line x1="0" y1="0" x2="70" y2="70"/>
    <line x1="0" y1="0" x2="38" y2="92"/>
    <line x1="0" y1="0" x2="0" y2="100"/>
    <path d="M 30 0 Q 28 10 25 12 Q 20 20 12 25 Q 10 28 0 30"/>
    <path d="M 60 0 Q 56 22 50 25 Q 40 40 25 50 Q 22 56 0 60"/>
    <path d="M 90 0 Q 82 34 72 37 Q 60 60 37 72 Q 34 82 0 90"/>
  </g>
</svg>`;

const pumpkinSvg = (x) =>
  `<g style="filter:drop-shadow(0 0 6px #ffb347)">
    <rect x="${x - 1}" y="111" width="2" height="3" fill="#5a7a2a"/>
    <ellipse cx="${x}" cy="121" rx="8" ry="7" fill="#ff7518"/>
    <circle cx="${x - 2.5}" cy="119.5" r="1.2" fill="#3b1a0a"/>
    <circle cx="${x + 2.5}" cy="119.5" r="1.2" fill="#3b1a0a"/>
    <path d="M${x - 3} 123.5 q3 2 6 0" stroke="#3b1a0a" stroke-width="1.2" fill="none"/>
  </g>`;

const SHIP_SVG = `
<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;overflow:visible">
  <rect x="92" y="18" width="5" height="112" fill="#4a3560"/>
  <rect x="147" y="34" width="5" height="96" fill="#4a3560"/>
  <path d="M92 8 L92 20 L122 14 Z" fill="#ff7518"/>
  <path d="M97 26 Q134 40 131 100 L126 93 L120 104 L114 95 L108 105 L102 97 L97 104 Z"
        fill="#d7d2f0" fill-opacity=".62" stroke="#9b6bff" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M152 42 Q183 54 181 104 L176 97 L170 107 L164 98 L158 108 L152 102 Z"
        fill="#d7d2f0" fill-opacity=".62" stroke="#9b6bff" stroke-width="1.4" stroke-linejoin="round"/>
  <line x1="214" y1="128" x2="236" y2="112" stroke="#4a3560" stroke-width="4" stroke-linecap="round"/>
  <path d="M28 128 L216 128 Q206 160 176 168 L68 168 Q42 160 28 128 Z"
        fill="#3a1f5c" stroke="#9b6bff" stroke-width="1.8" stroke-linejoin="round"/>
  <line x1="28" y1="128" x2="216" y2="128" stroke="#9b6bff" stroke-width="2"/>
  <circle cx="78" cy="148" r="5" fill="#ffd27a"/>
  <circle cx="112" cy="148" r="5" fill="#ffd27a"/>
  <circle cx="146" cy="148" r="5" fill="#ffd27a"/>
  ${pumpkinSvg(50)}${pumpkinSvg(100)}${pumpkinSvg(150)}${pumpkinSvg(196)}
</svg>`;

const pumpkinFaceSvg = (grin) => `
<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;overflow:visible">
  <rect x="46" y="4" width="8" height="14" rx="3" fill="#5a7a2a"/>
  <ellipse cx="32" cy="50" rx="26" ry="34" fill="#e8620c"/>
  <ellipse cx="68" cy="50" rx="26" ry="34" fill="#e8620c"/>
  <ellipse cx="50" cy="50" rx="26" ry="36" fill="#ff7518"/>
  <path d="M50 16 Q44 50 50 86 M34 20 Q22 50 34 84 M66 20 Q78 50 66 84" stroke="#c4500a" stroke-width="2" fill="none"/>
  ${
    grin
      ? `<path d="M26 34 L44 42 L32 26 Z" fill="#ffe27a" stroke="#2a1200" stroke-width="2" stroke-linejoin="round"/>
         <path d="M74 34 L56 42 L68 26 Z" fill="#ffe27a" stroke="#2a1200" stroke-width="2" stroke-linejoin="round"/>
         <path d="M22 56 L33 65 L42 58 L50 67 L58 58 L67 65 L78 56 L73 79 Q50 92 27 79 Z" fill="#ffe27a" stroke="#2a1200" stroke-width="2" stroke-linejoin="round"/>`
      : `<path d="M30 42 L42 42 L36 28 Z" fill="#ffe27a" stroke="#2a1200" stroke-width="2" stroke-linejoin="round"/>
         <path d="M58 42 L70 42 L64 28 Z" fill="#ffe27a" stroke="#2a1200" stroke-width="2" stroke-linejoin="round"/>
         <path d="M30 58 L38 66 L44 60 L50 68 L56 60 L62 66 L70 58 L66 74 Q50 82 34 74 Z" fill="#ffe27a" stroke="#2a1200" stroke-width="2" stroke-linejoin="round"/>`
  }
</svg>`;

const SPIDER_SVG = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;overflow:visible">
  <g stroke="#1c0f2b" stroke-width="2.6" stroke-linecap="round" fill="none">
    <path d="M22 32 Q8 24 3 31"/><path d="M21 38 Q6 36 2 45"/><path d="M22 44 Q9 50 6 58"/><path d="M24 28 Q14 16 9 20"/>
    <path d="M38 32 Q52 24 57 31"/><path d="M39 38 Q54 36 58 45"/><path d="M38 44 Q51 50 54 58"/><path d="M36 28 Q46 16 51 20"/>
  </g>
  <ellipse cx="30" cy="40" rx="11" ry="13" fill="#1c0f2b" stroke="#6b4aa8" stroke-width="1.4"/>
  <circle cx="30" cy="24" r="8" fill="#1c0f2b" stroke="#6b4aa8" stroke-width="1.4"/>
  <circle cx="26.5" cy="22.5" r="2.2" fill="#ff3b3b" style="filter:drop-shadow(0 0 3px #ff3b3b)"/>
  <circle cx="33.5" cy="22.5" r="2.2" fill="#ff3b3b" style="filter:drop-shadow(0 0 3px #ff3b3b)"/>
  <path d="M30 34 L26 44 L30 50 L34 44 Z" fill="#ff7518" fill-opacity=".85"/>
</svg>`;

const HAND_SVG = `
<svg viewBox="0 0 70 120" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%;overflow:visible">
  <g fill="#8fbf7a" stroke="#4f7a40" stroke-width="1.5">
    <rect x="17" y="16" width="9" height="38" rx="4.5"/>
    <rect x="27" y="8" width="9" height="46" rx="4.5"/>
    <rect x="37" y="10" width="9" height="44" rx="4.5"/>
    <rect x="47" y="20" width="9" height="34" rx="4.5"/>
    <rect x="4" y="50" width="9" height="26" rx="4.5" transform="rotate(-40 9 62)"/>
    <rect x="22" y="64" width="26" height="60"/>
    <ellipse cx="35" cy="60" rx="19" ry="16"/>
  </g>
  <g fill="#2a3a22">
    <ellipse cx="21.5" cy="20" rx="2.6" ry="3"/><ellipse cx="31.5" cy="12" rx="2.6" ry="3"/>
    <ellipse cx="41.5" cy="14" rx="2.6" ry="3"/><ellipse cx="51.5" cy="24" rx="2.6" ry="3"/>
  </g>
  <path d="M14 98 L19 104 L25 97 L31 105 L37 97 L43 105 L49 97 L54 104 L57 98 L58 124 L12 124 Z" fill="#3a2a50"/>
</svg>`;

/* ---------- Globale Styles ---------- */

function ensureGlobalStyle() {
  let s = document.getElementById("hw-flyover-style");
  if (s && s.dataset.v === CARD_VERSION) return;
  if (!s) {
    s = document.createElement("style");
    s.id = "hw-flyover-style";
  }
  s.dataset.v = CARD_VERSION;
  s.textContent = `
    .hw-overlay{position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden}
    .hw-vignette{position:absolute;inset:0;opacity:0;
      background:radial-gradient(ellipse at 50% 35%,rgba(60,20,90,0) 30%,rgba(25,8,40,.55) 100%)}
    .hw-group{position:absolute;left:0;will-change:transform}
    .hw-wave,.hw-inner{position:relative;will-change:transform}
    .hw-witch{position:relative;filter:drop-shadow(0 0 10px rgba(155,107,255,.55))}
    .hw-reaper{position:relative;filter:drop-shadow(0 0 16px rgba(0,255,170,.65))}
    .hw-crow{position:relative;filter:drop-shadow(0 0 8px rgba(0,0,0,.9))}
    .hw-bat{position:absolute;will-change:transform}
    .hw-wing-left{animation:hw-flap-l .2s ease-in-out infinite alternate}
    .hw-wing-right{animation:hw-flap-r .2s ease-in-out infinite alternate}
    .hw-bat-bob{animation:hw-bob 1.1s ease-in-out infinite alternate}
    .hw-spark{position:fixed;z-index:100000;border-radius:50%;pointer-events:none;will-change:transform,opacity}
    .hw-emoji{position:fixed;z-index:100000;pointer-events:none;white-space:nowrap;line-height:1;will-change:transform,opacity}
    .hw-ghost{position:absolute;left:0;will-change:transform;filter:drop-shadow(0 0 12px rgba(190,255,225,.85))}
    .hw-ghost-bob{will-change:transform}
    .hw-tap svg *{pointer-events:auto;cursor:pointer}
    .hw-corner-web{position:fixed;top:0;width:120px;height:120px;pointer-events:none;z-index:99990;opacity:.7;filter:drop-shadow(0 0 4px rgba(255,255,255,.25))}
    .hw-corner-web.left{left:0}
    .hw-corner-web.right{right:0;transform:scaleX(-1)}
    
    .hw-crawling-spider{position:fixed;z-index:99997;pointer-events:auto;cursor:pointer;touch-action:manipulation;transition:transform 0.15s ease}
    
    /* Giftgrüner Spuk-Glow */
    body.hw-card-glow-active ha-card:not(.hw-no-glow) {
      box-shadow: 0 0 14px rgba(60,255,120,0.35), inset 0 0 8px rgba(60,255,120,0.18) !important;
      border: 1px solid rgba(60,255,120,0.45) !important;
      transition: box-shadow 1.2s ease-in-out, border-color 1.2s ease-in-out;
    }
    body.hw-card-glow-active ha-card:not(.hw-no-glow):hover {
      box-shadow: 0 0 22px rgba(60,255,120,0.65), inset 0 0 12px rgba(60,255,120,0.3) !important;
    }

    /* Dashboard-Erschütterung / Shake */
    @keyframes hw-card-shake {
      0% { transform: translate(0, 0) rotate(0deg); }
      15% { transform: translate(-5px, 3px) rotate(-0.5deg); }
      30% { transform: translate(5px, -3px) rotate(0.5deg); }
      45% { transform: translate(-4px, -2px) rotate(-0.3deg); }
      60% { transform: translate(4px, 2px) rotate(0.3deg); }
      75% { transform: translate(-2px, 1px) rotate(-0.1deg); }
      100% { transform: translate(0, 0) rotate(0deg); }
    }
    body.hw-shaking ha-card {
      animation: hw-card-shake 0.45s ease-in-out !important;
    }

    @keyframes hw-flap-l{0%{transform:rotate(-32deg) scaleY(1.1)}100%{transform:rotate(38deg) scaleY(0.6)}}
    @keyframes hw-flap-r{0%{transform:rotate(32deg) scaleY(1.1)}100%{transform:rotate(-38deg) scaleY(0.6)}}
    @keyframes hw-bob{from{transform:translateY(-8px)}to{transform:translateY(8px)}}
  `;
  document.head.appendChild(s);
}

/* ---------- Web-Audio Engine (Synthetisch) ---------- */

let _ctx = null;
function audioCtx() {
  if (!_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      try {
        _ctx = new AC();
      } catch (e) {
        _ctx = null;
      }
    }
  }
  return _ctx;
}

function unlockAudio() {
  const ctx = audioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}

function isKioskStandbyActive() {
  if (document.hidden || document.visibilityState === "hidden") return true;
  if (window.fully) {
    if (typeof window.fully.getScreenOn === "function" && !window.fully.getScreenOn()) return true;
    if (typeof window.fully.isScreenOff === "function" && window.fully.isScreenOff()) return true;
  }
  return false;
}

function audioReady(volume) {
  if (isKioskStandbyActive()) return null;
  const ctx = audioCtx();
  return ctx && ctx.state === "running" && volume > 0 ? ctx : null;
}

function noiseSource(ctx, secs) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * secs), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function playWind(duration, volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(250, t);
  bp.frequency.linearRampToValueAtTime(950, t + duration * 0.5);
  bp.frequency.linearRampToValueAtTime(250, t + duration);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(volume * 0.55, t + duration * 0.5);
  g.gain.linearRampToValueAtTime(0.0001, t + duration);
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(t);
  src.stop(t + duration + 0.1);
}

function playCackle(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime + 0.02;
  const out = ctx.createGain();
  out.gain.value = 1;
  const formant = ctx.createBiquadFilter();
  formant.type = "bandpass";
  formant.frequency.value = 1100;
  formant.Q.value = 3.5;
  formant.connect(out).connect(ctx.destination);

  for (let i = 0; i < 6; i++) {
    const t0 = t + i * 0.13;
    const f0 = 540 - i * 20;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f0 * 0.62, t0 + 0.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(volume * 0.3, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
    osc.connect(g).connect(formant);
    osc.start(t0);
    osc.stop(t0 + 0.13);
  }
  const tf = t + 6 * 0.13 + 0.03;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(620, tf);
  osc.frequency.exponentialRampToValueAtTime(380, tf + 0.7);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 9;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 28;
  lfo.connect(lfoGain).connect(osc.frequency);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, tf);
  g.gain.linearRampToValueAtTime(volume * 0.3, tf + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, tf + 0.75);
  osc.connect(g).connect(formant);
  osc.start(tf);
  lfo.start(tf);
  osc.stop(tf + 0.8);
  lfo.stop(tf + 0.8);
}

function playGhost(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime + 0.02;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  lp.connect(ctx.destination);
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(260, t);
  osc.frequency.linearRampToValueAtTime(420, t + 0.5);
  osc.frequency.linearRampToValueAtTime(180, t + 1.5);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 5.5;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 14;
  lfo.connect(lfoGain).connect(osc.frequency);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(volume * 0.35, t + 0.35);
  g.gain.linearRampToValueAtTime(0.0001, t + 1.5);
  osc.connect(g).connect(lp);
  osc.start(t);
  lfo.start(t);
  osc.stop(t + 1.6);
  lfo.stop(t + 1.6);
}

function playBoo(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime + 0.01;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(240, t);
  osc.frequency.exponentialRampToValueAtTime(115, t + 0.4);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 800;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(volume * 0.45, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  osc.connect(lp).connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.5);
}

function playPoof(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime;
  const src = noiseSource(ctx, 0.4);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1200;
  const g = ctx.createGain();
  g.gain.setValueAtTime(volume * 0.35, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  src.connect(hp).connect(g).connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.4);
}

function playDrip(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(500, t);
  osc.frequency.exponentialRampToValueAtTime(1800, t + 0.08);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(volume * 0.5, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.13);
}

function playKnock(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.09);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 600;
  const g = ctx.createGain();
  g.gain.setValueAtTime(volume * 0.8, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(lp).connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.09);
}

function playCrack(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime;
  const crackNoise = noiseSource(ctx, 0.25);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2400;
  const g = ctx.createGain();
  g.gain.setValueAtTime(volume * 0.85, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  crackNoise.connect(hp).connect(g).connect(ctx.destination);
  crackNoise.start(t);
  crackNoise.stop(t + 0.25);

  const ping = ctx.createOscillator();
  ping.type = "sine";
  ping.frequency.value = 3400;
  const pg = ctx.createGain();
  pg.gain.setValueAtTime(0.0001, t);
  pg.gain.linearRampToValueAtTime(volume * 0.35, t + 0.01);
  pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
  ping.connect(pg).connect(ctx.destination);
  ping.start(t);
  ping.stop(t + 0.85);
}

function playReaperToll(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime;
  [140, 280, 420].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 650;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime((volume * 0.35) / (idx + 1), t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
    osc.connect(lp).connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 2.9);
  });
}

/* Krähen-Krächzen ("Krah! Krah!") */
function playCrowCaw(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime;
  for (let i = 0; i < 2; i++) {
    const t0 = t + i * 0.28;
    const dur = 0.22;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(520, t0);
    osc.frequency.exponentialRampToValueAtTime(320, t0 + dur);

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 950;
    bp.Q.value = 3.5;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(volume * 0.45, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(bp).connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
}

/* Süßigkeiten-Klingeln (Harfen-Glockenspiel) */
function playChime(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, idx) => {
    const t0 = t + idx * 0.08;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(volume * 0.35, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.75);
  });
}

function playThunder(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime;
  const crack = noiseSource(ctx, 0.3);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 800;
  const cg = ctx.createGain();
  cg.gain.setValueAtTime(volume * 0.7, t);
  cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  crack.connect(hp).connect(cg).connect(ctx.destination);
  crack.start(t);
  crack.stop(t + 0.3);

  const rumble = noiseSource(ctx, 3.4);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(240, t);
  lp.frequency.exponentialRampToValueAtTime(70, t + 3);
  const rg = ctx.createGain();
  rg.gain.setValueAtTime(0.0001, t + 0.05);
  rg.gain.linearRampToValueAtTime(volume * 1.1, t + 0.25);
  for (let k = 1; k <= 8; k++) {
    rg.gain.linearRampToValueAtTime(volume * Math.exp(-k * 0.35) * rand(0.5, 1), t + 0.25 + k * 0.32);
  }
  rg.gain.linearRampToValueAtTime(0.0001, t + 3.2);
  rumble.connect(lp).connect(rg).connect(ctx.destination);
  rumble.start(t);
  rumble.stop(t + 3.4);
}

function playScreech(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime + 0.01;
  for (let i = 0; i < 2; i++) {
    const t0 = t + i * 0.18;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2600, t0);
    osc.frequency.exponentialRampToValueAtTime(4200, t0 + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(volume * 0.12, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.16);
  }
}

function playBell(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime + 0.01;
  [[1, 1], [2.76, 0.5], [5.4, 0.25]].forEach(([mult, amp]) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 330 * mult;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(volume * 0.3 * amp, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 2.5);
  });
}

function playHorn(volume) {
  const ctx = audioReady(volume);
  if (!ctx) return;
  const t = ctx.currentTime + 0.01;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(98, t);
  osc.frequency.linearRampToValueAtTime(90, t + 1.8);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 380;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(volume * 0.4, t + 0.3);
  g.gain.setValueAtTime(volume * 0.4, t + 1.2);
  g.gain.linearRampToValueAtTime(0.0001, t + 1.9);
  osc.connect(lp).connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 2);
}

/* ---------- Hilfsfunktionen ---------- */

const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const normTime = (v, fallback) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(v || ""));
  if (!m) return fallback;
  return `${String(clamp(+m[1], 0, 23)).padStart(2, "0")}:${m[2]}`;
};
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fmt = (ts) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/* ---------- DEDIZIERTER CARD-EDITOR (Behebt den HA Schalter-Bug) ---------- */

class HalloweenFlyoverCardEditor extends HTMLElement {
  setConfig(config) {
    // Verschmilzt vorhandene Config mit den echten Standardwerten!
    // Dadurch stehen alle Schalter sofort auf true und die Sliders auf den echten Zahlen.
    this._config = { ...DEFAULT_CONFIG, ...config };
    this._build();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) {
      this._form.hass = hass;
    }
  }

  _build() {
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this.appendChild(this._form);

      this._form.schema = HalloweenFlyoverCard.getConfigSchema(this._hass);
      this._form.computeLabel = (schema) => {
        const lang = (this._hass?.language || "en").slice(0, 2);
        const L = (I18N[lang] || I18N.en);
        const map = {
          title: "ed_title",
          duration: "ed_duration",
          width_percent: "ed_width",
          sound_volume: "ed_sound",
          wind_volume: "ed_wind",
          schedule_start: "ed_start",
          schedule_end: "ed_end",
          countdown: "ed_countdown",
          default_collapsed: "ed_default_collapsed",
          corner_webs: "ed_corner_webs",
          card_glow: "ed_card_glow",
          crawling_spiders: "ed_crawling_spiders",
          shake_fx: "ed_shake_fx",
          enable_witch: "ed_enable_witch",
          enable_ghosts: "ed_enable_ghosts",
          ghost_every: "ed_ghost",
          enable_reaper: "ed_enable_reaper",
          reaper_every: "ed_reaper_every",
          enable_crows: "ed_enable_crows",
          crows_every: "ed_crows_every",
          enable_specials: "ed_enable_specials",
          special_every: "ed_special",
          special_storm: "ed_sp_storm",
          special_bats: "ed_sp_bats",
          special_ship: "ed_sp_ship",
          cameos: "ed_cameos",
          cameo_spider: "ed_cam_spider",
          cameo_hand: "ed_cam_hand",
          cameo_lantern: "ed_cam_lantern",
          cameo_fog: "ed_cam_fog",
          cameo_drip: "ed_cam_drip",
          cameo_crack: "ed_cam_crack",
          cameo_min: "ed_cameo_min",
          cameo_max: "ed_cameo_max",
          kiosk_safe: "ed_kiosk_safe",
        };
        return L[map[schema.name]] || schema.name;
      };

      this._form.addEventListener("value-changed", (ev) => {
        this._config = { ...this._config, ...ev.detail.value };
        const event = new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      });
    }

    this._form.data = this._config;
  }
}

if (!customElements.get("halloween-flyover-card-editor")) {
  customElements.define("halloween-flyover-card-editor", HalloweenFlyoverCardEditor);
}

/* ---------- HAUPTKARTE ---------- */

class HalloweenFlyoverCard extends HTMLElement {
  static async getConfigElement() {
    return document.createElement("halloween-flyover-card-editor");
  }

  static getStubConfig() {
    return { ...DEFAULT_CONFIG };
  }

  static getConfigSchema(hass) {
    const lang = (hass?.language || "en").slice(0, 2);
    const L = I18N[lang] || I18N.en;

    return [
      {
        name: "",
        type: "expandable",
        title: L.sec_general,
        schema: [
          { name: "title", selector: { text: {} } },
          { name: "default_collapsed", selector: { boolean: {} } },
          { name: "countdown", selector: { boolean: {} } },
          { name: "duration", selector: { number: { min: 4, max: 30, step: 1, mode: "box" } } },
          { name: "width_percent", selector: { number: { min: 20, max: 100, step: 5, mode: "slider" } } },
          { name: "sound_volume", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } },
          { name: "wind_volume", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } },
          { name: "schedule_start", selector: { time: {} } },
          { name: "schedule_end", selector: { time: {} } },
        ],
      },
      {
        name: "",
        type: "expandable",
        title: L.sec_decorations,
        schema: [
          { name: "corner_webs", selector: { boolean: {} } },
          { name: "card_glow", selector: { boolean: {} } },
          { name: "crawling_spiders", selector: { boolean: {} } },
          { name: "shake_fx", selector: { boolean: {} } },
        ],
      },
      {
        name: "",
        type: "expandable",
        title: L.sec_flyers,
        schema: [
          { name: "enable_witch", selector: { boolean: {} } },
          { name: "enable_ghosts", selector: { boolean: {} } },
          { name: "ghost_every", selector: { number: { min: 0, max: 10, step: 1, mode: "box" } } },
          { name: "enable_reaper", selector: { boolean: {} } },
          { name: "reaper_every", selector: { number: { min: 0, max: 20, step: 1, mode: "box" } } },
          { name: "enable_crows", selector: { boolean: {} } },
          { name: "crows_every", selector: { number: { min: 0, max: 20, step: 1, mode: "box" } } },
        ],
      },
      {
        name: "",
        type: "expandable",
        title: L.sec_specials,
        schema: [
          { name: "enable_specials", selector: { boolean: {} } },
          { name: "special_every", selector: { number: { min: 0, max: 50, step: 1, mode: "box" } } },
          { name: "special_storm", selector: { boolean: {} } },
          { name: "special_bats", selector: { boolean: {} } },
          { name: "special_ship", selector: { boolean: {} } },
        ],
      },
      {
        name: "",
        type: "expandable",
        title: L.sec_cameos,
        schema: [
          { name: "cameos", selector: { boolean: {} } },
          { name: "cameo_crack", selector: { boolean: {} } },
          { name: "cameo_spider", selector: { boolean: {} } },
          { name: "cameo_hand", selector: { boolean: {} } },
          { name: "cameo_lantern", selector: { boolean: {} } },
          { name: "cameo_fog", selector: { boolean: {} } },
          { name: "cameo_drip", selector: { boolean: {} } },
          { name: "cameo_min", selector: { number: { min: 1, max: 120, step: 1, mode: "box" } } },
          { name: "cameo_max", selector: { number: { min: 1, max: 240, step: 1, mode: "box" } } },
        ],
      },
      {
        name: "",
        type: "expandable",
        title: L.sec_kiosk,
        schema: [
          { name: "kiosk_safe", selector: { boolean: {} } },
        ],
      },
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._flying = false;
    this._timer = null;
    this._built = false;
    this._lang = "en";
    this._cornerWebsEl = null;
    this._miniSpiders = [];
    this._collapsed = false;
  }

  setConfig(config) {
    const defaults = DEFAULT_CONFIG;
    const start = normTime(config?.schedule_start, defaults.schedule_start);
    const end = normTime(config?.schedule_end, defaults.schedule_end);
    this._config = {
      ...defaults,
      ...config,
      schedule_start: start,
      schedule_end: end,
    };
    this._st = this._load();
    if (this._st.start == null) this._st.start = start;
    if (this._st.end == null) this._st.end = end;
    if (this._st.collapsed == null) {
      this._st.collapsed = !!this._config.default_collapsed;
    }
    this._collapsed = !!this._st.collapsed;
    this._build();
    this._render();
    this._syncDecorations();
  }

  set hass(hass) {
    this._hass = hass;
    const lang = (hass?.language || "en").slice(0, 2);
    const l = I18N[lang] ? lang : "en";
    if (l !== this._lang) {
      this._lang = l;
      if (this._built) {
        this._build();
        this._render();
      }
    }
  }

  getCardSize() {
    return this._collapsed ? 1 : 4;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback() {
    this._startTimer();
    this._syncDecorations();
  }

  disconnectedCallback() {
    clearInterval(this._timer);
    this._timer = null;
    this._cleanupDecorations();
  }

  _cleanupDecorations() {
    if (this._cornerWebsEl) {
      this._cornerWebsEl.remove();
      this._cornerWebsEl = null;
    }
    document.body.classList.remove("hw-card-glow-active");
    this._clearMiniSpiders();
  }

  _syncDecorations() {
    const active = !!(this._st?.enabled);
    ensureGlobalStyle();

    if (active && this._config.corner_webs !== false) {
      if (!this._cornerWebsEl) {
        const wrap = document.createElement("div");
        wrap.id = "hw-corner-webs-wrap";
        wrap.innerHTML = `
          <div class="hw-corner-web left">${WEB_CORNER_SVG}</div>
          <div class="hw-corner-web right">${WEB_CORNER_SVG}</div>
        `;
        document.body.appendChild(wrap);
        this._cornerWebsEl = wrap;
      }
    } else if (this._cornerWebsEl) {
      this._cornerWebsEl.remove();
      this._cornerWebsEl = null;
    }

    if (active && this._config.card_glow !== false) {
      document.body.classList.add("hw-card-glow-active");
    } else {
      document.body.classList.remove("hw-card-glow-active");
    }

    if (active && this._config.crawling_spiders !== false) {
      this._spawnMiniSpiders();
    } else {
      this._clearMiniSpiders();
    }
  }

  _spawnMiniSpiders() {
    if (this._miniSpiders.length > 0) return;
    const count = 3;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      s.className = "hw-crawling-spider";
      s.style.width = "22px";
      s.style.height = "22px";
      s.innerHTML = MINI_SPIDER_SVG;
      
      const W = window.innerWidth;
      const H = window.innerHeight;
      let x = rand(20, W - 40);
      let y = rand(20, H - 40);
      let angle = rand(0, 360);
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.transform = `rotate(${angle}deg)`;

      s.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        unlockAudio();
        this._bubble("Krabbel!", x, y, "#9fd37b");
        if (this._soundOn()) playPoof(this._vol("sound_volume", 0.6) * 0.5);
        angle = (angle + 180 + rand(-45, 45)) % 360;
        s.style.transform = `rotate(${angle}deg) scale(1.3)`;
        setTimeout(() => (s.style.transform = `rotate(${angle}deg) scale(1)`), 400);
      });

      document.body.appendChild(s);

      const iv = setInterval(() => {
        if (!this._st?.enabled || this._config.crawling_spiders === false || isKioskStandbyActive()) return;
        angle += rand(-35, 35);
        const rad = (angle * Math.PI) / 180;
        const dist = rand(15, 35);
        x = clamp(x + Math.cos(rad) * dist, 10, window.innerWidth - 32);
        y = clamp(y + Math.sin(rad) * dist, 10, window.innerHeight - 32);
        s.style.transform = `rotate(${angle + 90}deg)`;
        s.animate(
          [{ left: s.style.left, top: s.style.top }, { left: `${x}px`, top: `${y}px` }],
          { duration: 800, easing: "ease-in-out", fill: "forwards" }
        ).onfinish = () => {
          s.style.left = `${x}px`;
          s.style.top = `${y}px`;
        };
      }, rand(2200, 3600));

      this._miniSpiders.push({ el: s, timer: iv });
    }
  }

  _clearMiniSpiders() {
    this._miniSpiders.forEach((sp) => {
      clearInterval(sp.timer);
      sp.el.remove();
    });
    this._miniSpiders = [];
  }

  /* --- Erschütterung des Dashboards (Rüttel-Effekt) --- */
  _shakeDashboard(duration = 550) {
    if (this._config.shake_fx === false) return;
    document.body.classList.add("hw-shaking");
    setTimeout(() => {
      document.body.classList.remove("hw-shaking");
    }, duration);
  }

  /* --- Süßigkeiten-Regen beim Klick auf den Countdown --- */
  _candyRain() {
    ensureGlobalStyle();
    unlockAudio();
    const W = window.innerWidth;
    const H = window.innerHeight;
    const treats = ["🍬", "🍭", "🍫", "🍪", "🧁", "🍩", "🎃", "🍬", "🍭"];
    
    for (let i = 0; i < 30; i++) {
      const el = document.createElement("div");
      el.className = "hw-emoji";
      el.textContent = treats[randInt(0, treats.length - 1)];
      const startX = rand(10, W - 40);
      const size = rand(24, 44);
      el.style.cssText = `left:${startX}px;top:-60px;font-size:${size}px`;
      document.body.appendChild(el);

      el.animate(
        [
          { transform: "translate(0,0) rotate(0deg)" },
          { transform: `translate(${rand(-60, 60)}px,${H + 80}px) rotate(${rand(-480, 480)}deg)` },
        ],
        { duration: rand(1600, 2800), delay: rand(0, 900), easing: "ease-in", fill: "both" }
      ).onfinish = () => el.remove();
    }

    this._bubble("Süßes oder Saures! 🍬", W / 2, H * 0.35, "#ffb347");
    if (this._soundOn()) {
      playChime(this._vol("sound_volume", 0.6));
    }
  }

  _t(key) {
    return (I18N[this._lang] || I18N.en)[key] || key;
  }

  _load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (raw && typeof raw === "object") {
        return { enabled: false, sound: true, mode: "daily", collapsed: false, ...raw };
      }
    } catch (e) {
      /* ignore */
    }
    return { enabled: false, sound: true, mode: "daily", collapsed: false };
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._st));
    } catch (e) {
      /* ignore */
    }
  }

  _build() {
    const t = (k) => this._t(k);
    const cfg = this._config || {};
    const modeOptions = Object.keys(MODES)
      .map((m) => `<option value="${m}">${t("m_" + m)}</option>`)
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block}
        ha-card{
          position:relative;overflow:hidden;padding:12px 14px;
          background:linear-gradient(135deg,#1b0f2e 0%,#2d1442 60%,#3b1a0a 100%);
          color:#ffe2b8;border:1px solid rgba(255,117,24,.35);
          transition:padding 0.25s ease;
        }
        .bar{display:flex;align-items:center;justify-content:space-between;gap:8px}
        .bar-left{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
        .icon{width:38px;height:38px;flex:none;filter:drop-shadow(0 0 6px rgba(155,107,255,.6));cursor:pointer}
        .bar-info{min-width:0;flex:1;display:flex;flex-direction:column;justify-content:center}
        h2{margin:0;font-size:1.05rem;font-weight:700;color:#ff9d3c;line-height:1.2}
        .cd{
          font-size:.82rem;color:#ffb347;font-weight:600;line-height:1.25;margin-top:2px;
          cursor:pointer;white-space:normal;word-break:break-word;
        }
        .cd:hover{color:#ffe27a;text-shadow:0 0 8px rgba(255,179,71,0.8)}
        .bar-right{display:flex;align-items:center;gap:6px;flex:none}
        .btn-icon{
          width:34px;height:34px;border-radius:50%;cursor:pointer;display:inline-flex;
          align-items:center;justify-content:center;padding:0;
          border:1px solid rgba(255,157,60,.4);background:rgba(255,117,24,.12);color:#ffe2b8;
          font-size:1.05rem;transition:all 0.2s ease-in-out;flex:none;
        }
        .btn-icon:hover{background:rgba(255,117,24,.3);border-color:rgba(255,157,60,.8);transform:scale(1.06)}
        .btn-icon.on{
          background:rgba(255,117,24,.28);border-color:#ff7518;
          box-shadow:0 0 10px rgba(255,117,24,.55);color:#ff9d3c;
        }
        .btn-icon.open{
          transform:rotate(90deg);background:rgba(255,117,24,.35);border-color:#ff9d3c;
        }
        
        /* Details (Aufklappbar) */
        .details{display:none;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,117,24,.2)}
        .details.open{display:block}
        .status-row{display:flex;justify-content:space-between;align-items:center;font-size:.82rem;opacity:.9;margin-bottom:8px}
        .grid-buttons{display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));gap:6px;margin-bottom:10px}
        button.action{
          min-height:38px;padding:4px 8px;border-radius:10px;cursor:pointer;
          border:1px solid rgba(255,157,60,.4);background:rgba(255,117,24,.1);color:#ffe2b8;
          font:inherit;font-weight:600;font-size:.78rem;
        }
        button.action:hover{background:rgba(255,117,24,.22)}
        .time-row{display:flex;flex-wrap:wrap;gap:8px}
        label{display:flex;flex-direction:column;gap:3px;font-size:.78rem;flex:1 1 80px}
        input,select{
          min-height:34px;padding:4px 6px;border-radius:8px;font:inherit;font-size:.8rem;
          border:1px solid rgba(255,157,60,.4);background:rgba(0,0,0,.35);color:#ffe2b8;
          color-scheme:dark;
        }
        .err{color:#ff8a8a;font-size:.78rem;margin-top:4px;min-height:1em}
      </style>
      <ha-card class="hw-no-glow">
        <div class="bar">
          <div class="bar-left">
            <div class="icon" id="witchicon">${WITCH_SVG}</div>
            <div class="bar-info">
              <h2 id="title"></h2>
              <div class="cd" id="cd" title="Klick für Süßigkeiten!"></div>
            </div>
          </div>
          <div class="bar-right">
            <button class="btn-icon" id="toggle" title="${t("enable")}"></button>
            <button class="btn-icon" id="sound" title="${t("sound_on")}"></button>
            <button class="btn-icon" id="fold" title="${t("expand")}">⚙️</button>
          </div>
        </div>

        <div class="details" id="details">
          <div class="status-row">
            <div id="status"></div>
            <div id="caught"></div>
          </div>
          <div class="grid-buttons">
            <button class="action" id="test">🎃 ${t("test")}</button>
            <button class="action" id="testghost">👻 ${t("test_ghost")}</button>
            <button class="action" id="testreaper">💀 ${t("test_reaper")}</button>
            <button class="action" id="testcrows">🦅 ${t("test_crows")}</button>
            <button class="action" id="testspecial">⚡ ${t("test_special")}</button>
            <button class="action" id="testcameo">🕷️ ${t("test_cameo")}</button>
          </div>
          <div class="time-row">
            <label>${t("from")}<input type="time" id="start"></label>
            <label>${t("until")}<input type="time" id="end"></label>
            <label>${t("mode")}<select id="mode">${modeOptions}</select></label>
          </div>
          <div class="err" id="err"></div>
        </div>
      </ha-card>
    `;

    const $ = (id) => this.shadowRoot.getElementById(id);
    $("title").textContent = cfg.title || t("title");

    // Süßigkeiten-Regen bei Klick auf den Countdown oder das Icon
    $("cd").addEventListener("click", () => this._candyRain());
    $("witchicon").addEventListener("click", () => this._candyRain());

    $("toggle").addEventListener("click", () => {
      unlockAudio();
      this._st.enabled = !this._st.enabled;
      this._st.plan = null;
      this._st.nextAt = null;
      this._save();
      this._tick();
      this._render();
      this._syncDecorations();
    });
    $("sound").addEventListener("click", () => {
      unlockAudio();
      this._st.sound = !this._st.sound;
      this._save();
      this._render();
    });
    $("fold").addEventListener("click", () => {
      this._collapsed = !this._collapsed;
      this._st.collapsed = this._collapsed;
      this._save();
      this._render();
    });
    $("test").addEventListener("click", () => {
      unlockAudio();
      this._flyWitch();
    });
    $("testghost").addEventListener("click", () => {
      unlockAudio();
      if (!this._flying) this._flyGhosts();
    });
    $("testreaper").addEventListener("click", () => {
      unlockAudio();
      if (!this._flying) this._flyReaper();
    });
    $("testcrows").addEventListener("click", () => {
      unlockAudio();
      if (!this._flying) this._flyCrows();
    });
    $("testcameo").addEventListener("click", () => {
      unlockAudio();
      const kinds = this._getActiveCameoPool();
      if (!kinds.length) kinds.push("crack");
      this._cameoKind = ((this._cameoKind ?? -1) + 1) % kinds.length;
      this._cameoRun(kinds[this._cameoKind]);
    });
    $("testspecial").addEventListener("click", () => {
      unlockAudio();
      if (this._flying) return;
      const kinds = this._getActiveSpecialPool();
      if (!kinds.length) kinds.push("storm");
      this._testKind = ((this._testKind ?? -1) + 1) % kinds.length;
      this._flySpecial(kinds[this._testKind]);
    });
    $("start").addEventListener("change", (e) => this._setTime("start", e.target.value));
    $("end").addEventListener("change", (e) => this._setTime("end", e.target.value));
    $("mode").addEventListener("change", (e) => {
      this._st.mode = e.target.value;
      this._st.plan = null;
      this._st.nextAt = null;
      this._save();
      this._tick();
      this._render();
    });

    this._built = true;
  }

  _setTime(which, value) {
    const v = normTime(value, this._st[which]);
    const other = which === "start" ? this._st.end : this._st.start;
    const ok = which === "start" ? toMin(v) < toMin(other) : toMin(other) < toMin(v);
    if (!ok) {
      this.shadowRoot.getElementById("err").textContent = this._t("bad_time");
      this.shadowRoot.getElementById(which).value = this._st[which];
      return;
    }
    this._st[which] = v;
    this._st.plan = null;
    this._st.nextAt = null;
    this._save();
    this._tick();
    this._render();
  }

  _render() {
    if (!this._built) return;
    const $ = (id) => this.shadowRoot.getElementById(id);
    const st = this._st;
    $("toggle").innerHTML = st.enabled ? "🦇" : `<span style="opacity:0.4">🦇</span>`;
    $("toggle").title = st.enabled ? this._t("disable") : this._t("enable");
    $("toggle").classList.toggle("on", !!st.enabled);

    $("sound").innerHTML = st.sound ? "🔊" : "🔇";
    $("sound").title = st.sound ? this._t("sound_off") : this._t("sound_on");
    $("sound").classList.toggle("on", !!st.sound);

    $("start").value = st.start;
    $("end").value = st.end;
    $("mode").value = st.mode;
    $("err").textContent = "";

    const details = $("details");
    const foldBtn = $("fold");
    if (this._collapsed) {
      details.classList.remove("open");
      foldBtn.classList.remove("open");
      foldBtn.title = this._t("expand");
    } else {
      details.classList.add("open");
      foldBtn.classList.add("open");
      foldBtn.title = this._t("collapse");
    }

    let text;
    if (this._flying) text = this._t("st_flying");
    else if (!st.enabled) text = this._t("st_off");
    else {
      const next = this._nextTs();
      text = next ? this._t("st_next") + fmt(next) : this._t("st_none");
    }
    $("status").textContent = text;
    $("cd").textContent = this._config.countdown === false ? "" : this._countdown();
    $("caught").textContent = `👻 ${this._t("caught")} ${st.caught || 0}`;
  }

  _nextTs() {
    const now = Date.now();
    const st = this._st;
    if (st.mode === "daily") {
      const p = st.plan && st.plan.items.find((i) => !i.done && i.t > now);
      return p ? p.t : null;
    }
    return st.nextAt || null;
  }

  _startTimer() {
    clearInterval(this._timer);
    this._timer = setInterval(() => {
      this._tick();
      this._render();
    }, 15000);
    this._tick();
    this._render();
  }

  _win(now) {
    const d = new Date(now);
    const at = (hhmm) => {
      const [h, m] = hhmm.split(":").map(Number);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0, 0).getTime();
    };
    return { s: at(this._st.start), e: at(this._st.end) };
  }

  _ensurePlan(now) {
    const st = this._st;
    const day = new Date(now).toDateString();
    if (st.plan && st.plan.day === day) return;
    const { s, e } = this._win(now);
    const from = Math.max(now + 30000, s);
    const items = [];
    if (e > from) {
      const n = randInt(1, 10);
      for (let i = 0; i < n; i++) items.push({ t: Math.round(rand(from, e)), done: false });
      items.sort((a, b) => a.t - b.t);
    }
    st.plan = { day, items };
    this._save();
  }

  _nextInterval(now) {
    const [a, b] = MODES[this._st.mode];
    const { s, e } = this._win(now);
    const base = now < s ? s : now;
    let t = base + rand(a, b) * 60000;
    if (t > e) t = s + 864e5 + rand(a, b) * 60000;
    return Math.round(t);
  }

  _tick() {
    if (this._config.kiosk_safe !== false && isKioskStandbyActive()) return;
    this._tickFlights();
    this._tickCameo();
  }

  _getActiveCameoPool() {
    const cfg = this._config;
    const pool = [];
    if (cfg.cameo_spider !== false) pool.push("spider");
    if (cfg.cameo_hand !== false) pool.push("hand");
    if (cfg.cameo_lantern !== false) pool.push("lantern");
    if (cfg.cameo_fog !== false) pool.push("fog");
    if (cfg.cameo_drip !== false) pool.push("drip");
    if (cfg.cameo_crack !== false) pool.push("crack");
    return pool;
  }

  _getActiveSpecialPool() {
    const cfg = this._config;
    const pool = [];
    if (cfg.special_storm !== false) pool.push("storm");
    if (cfg.special_bats !== false) pool.push("bats");
    if (cfg.special_ship !== false) pool.push("ship");
    return pool;
  }

  _tickCameo() {
    const st = this._st;
    const cfg = this._config;
    if (!st || !st.enabled || cfg.cameos === false) return;
    const pool = this._getActiveCameoPool();
    if (!pool.length) return;

    const now = Date.now();
    const { s, e } = this._win(now);
    if (now < s || now > e || isKioskStandbyActive() || this._flying || this._cameo) return;
    const a = clamp(Number(cfg.cameo_min) || 4, 1, 240);
    const b = Math.max(a, Number(cfg.cameo_max) || 12);
    if (!st.cameoAt) {
      st.cameoAt = now + rand(a, b) * 60000;
      this._save();
      return;
    }
    if (now < st.cameoAt) return;
    const fresh = now - st.cameoAt < 90000;
    st.cameoAt = now + rand(a, b) * 60000;
    this._save();
    if (fresh) this._cameoRun();
  }

  _tickFlights() {
    const st = this._st;
    if (!st || !st.enabled) return;
    const now = Date.now();
    const { s, e } = this._win(now);
    const inWin = now >= s && now <= e;
    const canFly = inWin && !isKioskStandbyActive() && !this._flying;

    if (st.mode === "daily") {
      this._ensurePlan(now);
      let changed = false;
      for (const item of st.plan.items) {
        if (!item.done && item.t <= now) {
          item.done = true;
          changed = true;
          if (now - item.t < 90000 && canFly) this._fly();
        }
      }
      if (changed) this._save();
    } else {
      if (!st.nextAt) {
        st.nextAt = this._nextInterval(now);
        this._save();
      }
      if (now >= st.nextAt) {
        const fresh = now - st.nextAt < 90000;
        st.nextAt = this._nextInterval(now);
        this._save();
        if (fresh && canFly) this._fly();
      }
    }
  }

  _fly() {
    if (this._flying) return;
    const cfg = this._config;
    const ghostEvery = Number(cfg.ghost_every);
    const specialEvery = Number(cfg.special_every);
    const reaperEvery = Number(cfg.reaper_every);
    const crowsEvery = Number(cfg.crows_every);
    const n = (this._st.flightCount || 0) + 1;
    this._st.flightCount = n;
    this._save();

    const allowSpecials = cfg.enable_specials !== false && this._getActiveSpecialPool().length > 0;
    const allowReaper = cfg.enable_reaper !== false && reaperEvery > 0;
    const allowCrows = cfg.enable_crows !== false && crowsEvery > 0;
    const allowGhosts = cfg.enable_ghosts !== false && ghostEvery > 0;
    const allowWitch = cfg.enable_witch !== false;

    if (allowSpecials && specialEvery > 0 && n % specialEvery === 0) {
      this._flySpecial();
    } else if (allowReaper && n % reaperEvery === 0) {
      this._flyReaper();
    } else if (allowCrows && n % crowsEvery === 0) {
      this._flyCrows();
    } else if (allowGhosts && n % ghostEvery === 0) {
      this._flyGhosts();
    } else if (allowWitch) {
      this._flyWitch();
    } else if (allowReaper) {
      this._flyReaper();
    } else if (allowCrows) {
      this._flyCrows();
    } else if (allowGhosts) {
      this._flyGhosts();
    } else if (allowSpecials) {
      this._flySpecial();
    }
  }

  /* --- 1. HEXENFLUG --- */
  _flyWitch() {
    this._flying = true;
    this._render();
    ensureGlobalStyle();

    const cfg = this._config;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dur = clamp(Number(cfg.duration) || 10, 4, 30) * 1000;
    const size = clamp(W * (clamp(Number(cfg.width_percent) || 60, 20, 100) / 100) * 0.38, 130, 460);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const y0 = rand(H * 0.12, H * 0.45);

    const overlay = document.createElement("div");
    overlay.className = "hw-overlay";
    const vignette = document.createElement("div");
    vignette.className = "hw-vignette";
    overlay.appendChild(vignette);

    const group = document.createElement("div");
    group.className = "hw-group";
    group.style.top = `${y0}px`;
    group.style.width = `${size}px`;

    const wave = document.createElement("div");
    wave.className = "hw-wave";
    const inner = document.createElement("div");
    inner.className = "hw-inner";
    inner.style.transform = `scaleX(${dir})`;

    const witch = document.createElement("div");
    witch.className = "hw-witch hw-tap";
    witch.innerHTML = WITCH_SVG;
    witch.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (Date.now() < (this._witchCooldown || 0)) return;
      this._witchCooldown = Date.now() + 2500;
      unlockAudio();
      const r = witch.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.2;
      this._poof(cx, cy, r.width * 0.3);
      this._bubble("Hihihi!", cx, cy, "#9fd37b");
      if (this._soundOn()) playCackle(this._vol("sound_volume", 0.6));
    });
    inner.appendChild(witch);

    const bats = [
      { x: -0.35, y: -0.1, s: 0.2, d: 0 },
      { x: -0.6, y: 0.18, s: 0.16, d: 0.3 },
      { x: -0.82, y: -0.2, s: 0.18, d: 0.6 },
      { x: -1.05, y: 0.08, s: 0.14, d: 0.15 },
      { x: -1.3, y: -0.05, s: 0.12, d: 0.45 },
    ];
    for (const b of bats) {
      const el = document.createElement("div");
      el.className = "hw-bat";
      el.style.width = `${size * b.s}px`;
      el.style.left = `${size * b.x}px`;
      el.style.top = `${size * b.y + size * 0.1}px`;
      const bob = document.createElement("div");
      bob.className = "hw-bat-bob";
      bob.style.animationDelay = `-${b.d}s`;
      bob.innerHTML = BAT_SVG;
      el.appendChild(bob);
      inner.appendChild(el);
    }

    wave.appendChild(inner);
    group.appendChild(wave);
    overlay.appendChild(group);
    document.body.appendChild(overlay);

    const startX = dir === 1 ? -size * 1.9 : W + size * 0.5;
    const endX = dir === 1 ? W + size * 0.5 : -size * 1.9;
    const move = group.animate(
      [{ transform: `translateX(${startX}px)` }, { transform: `translateX(${endX}px)` }],
      { duration: dur, easing: "linear", fill: "forwards" }
    );
    const amp = H * 0.05;
    wave.animate(
      [
        { transform: `translateY(0) rotate(${-2 * dir}deg)` },
        { transform: `translateY(${-amp}px) rotate(${2 * dir}deg)`, offset: 0.3 },
        { transform: `translateY(${amp * 0.8}px) rotate(${-3 * dir}deg)`, offset: 0.65 },
        { transform: `translateY(0) rotate(${-2 * dir}deg)` },
      ],
      { duration: dur, easing: "ease-in-out", fill: "forwards" }
    );
    vignette.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], {
      duration: dur,
      fill: "forwards",
    });

    const colors = ["#ff7518", "#ffb347", "#b57bff", "#7CFC00", "#ffd24a"];
    let n = 0;
    const sparkTimer = setInterval(() => {
      const r = witch.getBoundingClientRect();
      if (!r.width) return;
      const x = dir === 1 ? r.left + r.width * 0.05 : r.right - r.width * 0.05;
      const y = r.top + r.height * 0.74;
      n++;
      const pumpkin = n % 14 === 0;
      const el = document.createElement("div");
      if (pumpkin) {
        el.className = "hw-emoji";
        el.textContent = "🎃";
        el.style.fontSize = `${rand(14, 22)}px`;
      } else {
        const px = rand(4, 9);
        const c = colors[randInt(0, colors.length - 1)];
        el.className = "hw-spark";
        el.style.width = el.style.height = `${px}px`;
        el.style.background = c;
        el.style.boxShadow = `0 0 ${px * 2}px ${c}`;
      }
      el.style.left = `${x + rand(-6, 6)}px`;
      el.style.top = `${y + rand(-6, 6)}px`;
      document.body.appendChild(el);
      const dx = -dir * rand(20, 90);
      const dy = rand(20, 110);
      el.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: 0 },
        ],
        { duration: rand(700, 1300), easing: "ease-out", fill: "forwards" }
      ).onfinish = () => el.remove();
    }, 55);

    if (Math.random() < 0.6) {
      const drops = randInt(1, 2);
      for (let i = 0; i < drops; i++) {
        setTimeout(() => {
          if (!this._flying) return;
          const r = witch.getBoundingClientRect();
          if (!r.width) return;
          this._drop(r.left + r.width * 0.5, r.top + r.height * 0.75);
        }, dur * rand(0.3, 0.65));
      }
    }

    if (this._soundOn()) {
      playWind(dur / 1000, this._vol("wind_volume", 0.5));
      setTimeout(() => this._flying && playCackle(this._vol("sound_volume", 0.6)), dur * 0.32);
    }

    const finish = () => {
      clearInterval(sparkTimer);
      overlay.remove();
      this._flying = false;
      this._render();
    };
    move.onfinish = finish;
    move.oncancel = finish;
  }

  /* --- 2. SENSENMANN FLUG --- */
  _flyReaper() {
    this._flying = true;
    this._render();
    ensureGlobalStyle();

    const cfg = this._config;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dur = clamp(Number(cfg.duration) || 10, 4, 30) * 1000 * 1.25;
    const size = clamp(W * (clamp(Number(cfg.width_percent) || 60, 20, 100) / 100) * 0.36, 120, 420);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const y0 = rand(H * 0.15, H * 0.42);

    const overlay = this._overlay(0.9, dur);
    this._fog(dur, true);
    this._shakeDashboard(700);

    const group = document.createElement("div");
    group.className = "hw-group";
    group.style.top = `${y0}px`;
    group.style.width = `${size}px`;

    const wave = document.createElement("div");
    wave.className = "hw-wave";
    const inner = document.createElement("div");
    inner.className = "hw-inner";
    inner.style.transform = `scaleX(${dir})`;

    const reaper = document.createElement("div");
    reaper.className = "hw-reaper hw-tap";
    reaper.innerHTML = REAPER_SVG;
    reaper.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (Date.now() < (this._reaperCooldown || 0)) return;
      this._reaperCooldown = Date.now() + 3000;
      unlockAudio();
      const r = reaper.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.3;
      this._poof(cx, cy, r.width * 0.4, "#00ffaa");
      this._bubble("DEINE ZEIT...", cx, cy, "#7fffd4");
      this._shakeDashboard(400);
      if (this._soundOn()) playReaperToll(this._vol("sound_volume", 0.6) * 1.2);
    });
    inner.appendChild(reaper);
    wave.appendChild(inner);
    group.appendChild(wave);
    overlay.appendChild(group);

    const startX = dir === 1 ? -size * 1.6 : W + size * 0.6;
    const endX = dir === 1 ? W + size * 0.6 : -size * 1.6;
    const move = group.animate(
      [{ transform: `translateX(${startX}px)` }, { transform: `translateX(${endX}px)` }],
      { duration: dur, easing: "linear", fill: "forwards" }
    );
    wave.animate(
      [
        { transform: "translateY(0) rotate(-2deg)" },
        { transform: "translateY(-14px) rotate(2deg)", offset: 0.5 },
        { transform: "translateY(0) rotate(-2deg)" },
      ],
      { duration: 2200, iterations: Infinity, easing: "ease-in-out" }
    );

    const smokeColors = ["#1a102a", "#0d0914", "#00ffaa", "#7fffd4"];
    const smokeTimer = setInterval(() => {
      const r = reaper.getBoundingClientRect();
      if (!r.width) return;
      const x = dir === 1 ? r.left + r.width * 0.15 : r.right - r.width * 0.15;
      const y = r.top + r.height * 0.8;
      const px = rand(10, 22);
      const c = smokeColors[randInt(0, smokeColors.length - 1)];
      const el = document.createElement("div");
      el.className = "hw-spark";
      el.style.width = el.style.height = `${px}px`;
      el.style.background = c;
      el.style.opacity = c === "#00ffaa" ? "0.9" : "0.5";
      el.style.boxShadow = `0 0 ${px * 1.5}px ${c}`;
      el.style.left = `${x + rand(-8, 8)}px`;
      el.style.top = `${y + rand(-8, 8)}px`;
      document.body.appendChild(el);
      el.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 0.7 },
          { transform: `translate(${-dir * rand(30, 80)}px,${rand(-20, 40)}px) scale(.2)`, opacity: 0 },
        ],
        { duration: rand(1000, 1800), easing: "ease-out", fill: "forwards" }
      ).onfinish = () => el.remove();
    }, 90);

    if (this._soundOn()) {
      const vol = this._vol("sound_volume", 0.6);
      playWind(dur / 1000, this._vol("wind_volume", 0.5) * 0.9);
      setTimeout(() => this._flying && playReaperToll(vol), dur * 0.1);
      setTimeout(() => this._flying && playGhost(vol * 0.7), dur * 0.45);
    }

    const finish = () => {
      clearInterval(smokeTimer);
      overlay.remove();
      this._flying = false;
      this._render();
    };
    move.onfinish = finish;
    move.oncancel = finish;
  }

  /* --- 3. KRÄHEN-SCHWARM (Tiefflug mit Krächzen) --- */
  _flyCrows() {
    this._flying = true;
    this._render();
    ensureGlobalStyle();

    const cfg = this._config;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dur = clamp(Number(cfg.duration) || 10, 4, 30) * 1000 * 0.7;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const count = randInt(5, 8);
    const overlay = this._overlay(0.7, dur + 1000);

    let pending = count;
    const done = () => {
      pending -= 1;
      if (pending > 0) return;
      overlay.remove();
      this._flying = false;
      this._render();
    };

    for (let i = 0; i < count; i++) {
      const size = clamp(W * rand(0.08, 0.13), 60, 130);
      const y = H * rand(0.18, 0.75);
      const crowDur = dur * rand(0.85, 1.15);
      const delay = i * rand(120, 280);

      const el = document.createElement("div");
      el.className = "hw-group hw-crow hw-tap";
      el.style.top = `${y}px`;
      el.style.width = `${size}px`;
      el.style.transform = `scaleX(${dir})`;
      el.innerHTML = CROW_SVG;

      el.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        unlockAudio();
        const r = el.getBoundingClientRect();
        this._poof(r.left + r.width / 2, r.top + r.height / 2, size * 0.5, "#222");
        this._bubble("KRAAH!", r.left + r.width / 2, r.top, "#ffe27a");
        if (this._soundOn()) playCrowCaw(this._vol("sound_volume", 0.6));
      });

      overlay.appendChild(el);

      const startX = dir === 1 ? -size * 1.5 : W + size * 0.5;
      const endX = dir === 1 ? W + size * 0.5 : -size * 1.5;
      const m = el.animate(
        [
          { transform: `translateX(${startX}px) scaleX(${dir}) translateY(0)` },
          { transform: `translateX(${endX}px) scaleX(${dir}) translateY(${rand(-40, 40)}px)` },
        ],
        { duration: crowDur, delay, easing: "ease-in-out", fill: "both" }
      );
      m.onfinish = done;
      m.oncancel = done;
    }

    if (this._soundOn()) {
      const vol = this._vol("sound_volume", 0.6);
      playWind(dur / 1000, this._vol("wind_volume", 0.5) * 0.7);
      setTimeout(() => this._flying && playCrowCaw(vol), 200);
      setTimeout(() => this._flying && playCrowCaw(vol * 0.9), dur * 0.45);
    }
  }

  /* --- 4. GEISTERFLUG --- */
  _flyGhosts() {
    this._flying = true;
    this._render();
    ensureGlobalStyle();

    const cfg = this._config;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dur = clamp(Number(cfg.duration) || 10, 4, 30) * 1000;
    const count = randInt(2, 3);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const volOf = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);

    const overlay = document.createElement("div");
    overlay.className = "hw-overlay";
    const vignette = document.createElement("div");
    vignette.className = "hw-vignette";
    overlay.appendChild(vignette);

    const ghosts = [];
    const moves = [];
    let popped = 0;
    let total = 0;
    let pending = count;
    let sparkTimer = null;

    const finish = () => {
      clearInterval(sparkTimer);
      overlay.remove();
      this._flying = false;
      this._render();
    };
    const oneDone = () => {
      pending -= 1;
      if (pending <= 0) finish();
    };

    for (let i = 0; i < count; i++) {
      const size = clamp(W * 0.11, 56, 110) * rand(0.85, 1.2);
      const y = H * (0.12 + (i + rand(0.1, 0.9)) * (0.5 / count));
      const gDur = dur * rand(1.0, 1.25);
      const delay = i * dur * rand(0.1, 0.2);
      total = Math.max(total, gDur + delay);

      const g = document.createElement("div");
      g.className = "hw-ghost";
      g.style.position = "absolute";
      g.style.left = "0px";
      g.style.zIndex = "2";
      g.style.filter = "drop-shadow(0 0 10px rgba(190,255,225,.9)) drop-shadow(0 0 3px rgba(120,80,200,.9))";
      g.style.top = `${y}px`;
      g.style.width = `${size}px`;
      g.style.opacity = String(rand(0.8, 0.95));
      const bob = document.createElement("div");
      bob.className = "hw-ghost-bob";
      bob.innerHTML = GHOST_SVG;
      g.appendChild(bob);
      overlay.appendChild(g);
      ghosts.push(g);

      g.style.pointerEvents = "auto";
      g.style.cursor = "pointer";
      g.style.touchAction = "manipulation";
      g.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (g._popped) return;
        g._popped = true;
        unlockAudio();
        const r = g.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        g.style.visibility = "hidden";
        g.style.pointerEvents = "none";
        this._poof(cx, cy, r.width);
        this._bubble(["Buh!", "Huch!", "Uuuh!"][randInt(0, 2)], cx, cy, "#ffb347");
        if (this._soundOn()) {
          const v = this._vol("sound_volume", 0.6);
          playBoo(v);
          playPoof(v);
        }
        popped += 1;
        this._st.caught = (this._st.caught || 0) + 1;
        this._save();
        this._render();
        if (this._st.caught % 10 === 0) this._pumpkinRain(this._st.caught);
        if (popped >= count) setTimeout(() => moves.forEach((m) => m.cancel()), 700);
      });

      const startX = dir === 1 ? -size * 1.5 : W + size * 0.5;
      const endX = dir === 1 ? W + size * 0.5 : -size * 1.5;
      const move = g.animate(
        [{ transform: `translateX(${startX}px)` }, { transform: `translateX(${endX}px)` }],
        { duration: gDur, delay, easing: "linear", fill: "both" }
      );
      moves.push(move);
      move.onfinish = oneDone;
      move.oncancel = oneDone;

      const amp = rand(14, 28);
      const tilt = rand(3, 7);
      bob.animate(
        [
          { transform: `translateY(${-amp}px) rotate(${-tilt}deg)` },
          { transform: `translateY(${amp}px) rotate(${tilt}deg)` },
        ],
        { duration: rand(1200, 1900), direction: "alternate", iterations: Infinity, easing: "ease-in-out" }
      );
    }

    document.body.appendChild(overlay);

    vignette.animate(
      [{ opacity: 0 }, { opacity: 0.8, offset: 0.2 }, { opacity: 0.8, offset: 0.8 }, { opacity: 0 }],
      { duration: total, fill: "forwards" }
    );

    const colors = ["#e8fff2", "#b9ffd6", "#d9c2ff", "#ffffff"];
    sparkTimer = setInterval(() => {
      for (const g of ghosts) {
        const r = g.getBoundingClientRect();
        if (g._popped || !r.width || r.right < 0 || r.left > W) continue;
        const px = rand(6, 13);
        const c = colors[randInt(0, colors.length - 1)];
        const el = document.createElement("div");
        el.className = "hw-spark";
        el.style.width = el.style.height = `${px}px`;
        el.style.background = c;
        el.style.opacity = "0.7";
        el.style.boxShadow = `0 0 ${px * 2}px ${c}`;
        const x = dir === 1 ? r.left + r.width * 0.1 : r.right - r.width * 0.1;
        el.style.left = `${x + rand(-6, 6)}px`;
        el.style.top = `${r.top + r.height * rand(0.5, 0.9)}px`;
        document.body.appendChild(el);
        el.animate(
          [
            { transform: "translate(0,0) scale(1)", opacity: 0.7 },
            { transform: `translate(${-dir * rand(10, 45)}px,${-rand(10, 50)}px) scale(.2)`, opacity: 0 },
          ],
          { duration: rand(1000, 1700), easing: "ease-out", fill: "forwards" }
        ).onfinish = () => el.remove();
      }
    }, 160);

    if (this._st.sound && cfg.sound !== false) {
      playWind(total / 1000, volOf(cfg.wind_volume, 0.5) * 0.7);
      const v = volOf(cfg.sound_volume, 0.6);
      setTimeout(() => this._flying && playGhost(v), total * 0.22);
      setTimeout(() => this._flying && playGhost(v * 0.8), total * 0.6);
    }
  }

  /* --- Hilfsmethoden --- */
  _vol(key, d) {
    const v = Number(this._config[key]);
    return Number.isFinite(v) ? v : d;
  }

  _soundOn() {
    return !!(this._st.sound && this._config.sound !== false);
  }

  _overlay(vignetteOpacity, total) {
    const overlay = document.createElement("div");
    overlay.className = "hw-overlay";
    const vignette = document.createElement("div");
    vignette.className = "hw-vignette";
    overlay.appendChild(vignette);
    document.body.appendChild(overlay);
    vignette.animate(
      [
        { opacity: 0 },
        { opacity: vignetteOpacity, offset: 0.15 },
        { opacity: vignetteOpacity, offset: 0.85 },
        { opacity: 0 },
      ],
      { duration: total, fill: "forwards" }
    );
    return overlay;
  }

  _poof(x, y, w, customColor = null) {
    const colors = customColor ? [customColor, "#ffffff"] : ["#f4f1ff", "#d9c2ff", "#b9ffd6", "#ffffff"];
    for (let i = 0; i < 12; i++) {
      const px = rand(w * 0.25, w * 0.5);
      const c = colors[randInt(0, colors.length - 1)];
      const el = document.createElement("div");
      el.className = "hw-spark";
      el.style.cssText = `width:${px}px;height:${px}px;left:${x - px / 2}px;top:${y - px / 2}px;background:${c};filter:blur(3px)`;
      document.body.appendChild(el);
      const a = rand(0, Math.PI * 2);
      const d = rand(w * 0.4, w * 1.1);
      el.animate(
        [
          { transform: "translate(0,0) scale(.4)", opacity: 0.9 },
          { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(1.6)`, opacity: 0 },
        ],
        { duration: rand(600, 1000), easing: "ease-out", fill: "forwards" }
      ).onfinish = () => el.remove();
    }
  }

  _bubble(text, x, y, color) {
    const el = document.createElement("div");
    el.className = "hw-emoji";
    el.textContent = text;
    el.style.cssText = `left:${x}px;top:${y}px;font:800 22px system-ui,sans-serif;color:${color};text-shadow:0 0 6px #000,0 0 12px ${color}`;
    document.body.appendChild(el);
    el.animate(
      [
        { transform: "translate(-50%,-50%) scale(.6)", opacity: 0 },
        { transform: "translate(-50%,-120%) scale(1.15)", opacity: 1, offset: 0.25 },
        { transform: "translate(-50%,-260%) scale(1)", opacity: 0 },
      ],
      { duration: 1100, easing: "ease-out", fill: "forwards" }
    ).onfinish = () => el.remove();
  }

  /* --- SPEZIALFLÜGE --- */
  _flySpecial(kind) {
    const pool = this._getActiveSpecialPool();
    if (!pool.length) return;
    const k = pool.includes(kind) ? kind : pool[randInt(0, pool.length - 1)];
    this._flying = true;
    this._render();
    ensureGlobalStyle();
    if (k === "storm") this._flyStorm();
    else if (k === "bats") this._flyBatSwarm();
    else this._flyShip();
  }

  _bolt(W, H, x0) {
    const pts = [[x0, 0]];
    let x = x0;
    let y = 0;
    const yEnd = H * rand(0.45, 0.8);
    while (y < yEnd) {
      y += rand(H * 0.04, H * 0.09);
      x += rand(-W * 0.04, W * 0.04);
      pts.push([x, y]);
    }
    const toPath = (arr) => "M" + arr.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L");
    const k = randInt(1, Math.max(1, pts.length - 3));
    const branch = [pts[k]];
    let bx = pts[k][0];
    let by = pts[k][1];
    const side = Math.random() < 0.5 ? -1 : 1;
    for (let i = 0; i < 3; i++) {
      bx += side * rand(W * 0.02, W * 0.05);
      by += rand(H * 0.03, H * 0.07);
      branch.push([bx, by]);
    }
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position:absolute;inset:0;filter:drop-shadow(0 0 6px #fff) drop-shadow(0 0 18px #9b6bff)";
    wrap.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="${toPath(pts)}" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${toPath(branch)}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
    return wrap;
  }

  _flyStorm() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const strikes = randInt(2, 4);
    const gap = 1700;
    const total = strikes * gap + 2800;
    const overlay = this._overlay(1, total);
    this._fog(total);
    const flash = document.createElement("div");
    flash.style.cssText = "position:absolute;inset:0;opacity:0;background:rgba(225,210,255,.75)";
    overlay.appendChild(flash);

    const sound = this._soundOn();
    const vol = this._vol("sound_volume", 0.6);
    if (sound) playWind(total / 1000, this._vol("wind_volume", 0.5) * 0.8);

    for (let i = 0; i < strikes; i++) {
      setTimeout(() => {
        if (!this._flying) return;
        const bolt = this._bolt(W, H, rand(W * 0.12, W * 0.88));
        overlay.appendChild(bolt);
        bolt.animate(
          [
            { opacity: 0 },
            { opacity: 1, offset: 0.1 },
            { opacity: 0.15, offset: 0.3 },
            { opacity: 1, offset: 0.45 },
            { opacity: 0 },
          ],
          { duration: 520, fill: "forwards" }
        ).onfinish = () => bolt.remove();
        flash.animate(
          [
            { opacity: 0 },
            { opacity: 0.85, offset: 0.1 },
            { opacity: 0.05, offset: 0.3 },
            { opacity: 0.6, offset: 0.45 },
            { opacity: 0 },
          ],
          { duration: 520 }
        );
        this._shakeDashboard(450);
        if (sound) setTimeout(() => playThunder(vol), rand(250, 700));
      }, 600 + i * gap + rand(0, 400));
    }

    setTimeout(() => {
      overlay.remove();
      this._flying = false;
      this._render();
    }, total);
  }

  _flyBatSwarm() {
    const cfg = this._config;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dur = clamp(Number(cfg.duration) || 10, 4, 30) * 1000;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const n = randInt(14, 20);

    const bats = [];
    for (let i = 0; i < n; i++) {
      const giant = i === 0;
      bats.push({
        giant,
        size: giant ? clamp(W * 0.24, 130, 300) : clamp(W * rand(0.035, 0.085), 28, 80),
        bDur: giant ? dur * 1.05 : dur * rand(0.45, 0.8),
        delay: giant ? dur * 0.12 : rand(0, dur * 0.4),
        y: giant ? H * rand(0.25, 0.4) : H * rand(0.05, 0.8),
      });
    }
    const total = Math.max(...bats.map((b) => b.delay + b.bDur));
    const overlay = this._overlay(0.9, total);
    let pending = bats.length;
    const done = () => {
      pending -= 1;
      if (pending > 0) return;
      overlay.remove();
      this._flying = false;
      this._render();
    };

    for (const b of bats) {
      const el = document.createElement("div");
      el.className = "hw-group hw-bat";
      el.style.top = `${b.y}px`;
      el.style.width = `${b.size}px`;
      el.style.filter = "drop-shadow(0 0 6px rgba(155,107,255,.7))";
      const bob = document.createElement("div");
      bob.className = "hw-bat-bob";
      bob.style.animationDuration = `${rand(0.5, 1.2)}s`;
      bob.innerHTML = BAT_SVG;
      el.appendChild(bob);
      overlay.appendChild(el);
      const startX = dir === 1 ? -b.size * 1.5 : W + b.size * 0.5;
      const endX = dir === 1 ? W + b.size * 0.5 : -b.size * 1.5;
      const m = el.animate(
        [{ transform: `translateX(${startX}px)` }, { transform: `translateX(${endX}px)` }],
        { duration: b.bDur, delay: b.delay, easing: "linear", fill: "both" }
      );
      m.onfinish = done;
      m.oncancel = done;
    }

    if (this._soundOn()) {
      const vol = this._vol("sound_volume", 0.6);
      playWind(total / 1000, this._vol("wind_volume", 0.5) * 0.8);
      [0.08, 0.3, 0.5, 0.72].forEach((f) => setTimeout(() => this._flying && playScreech(vol * 0.7), total * f));
    }
  }

  _flyShip() {
    const cfg = this._config;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dur = clamp(Number(cfg.duration) || 10, 4, 30) * 1000 * 1.5;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const size = clamp(W * 0.45, 220, 520);
    const overlay = this._overlay(0.9, dur);

    const group = document.createElement("div");
    group.className = "hw-group";
    group.style.top = `${H * rand(0.2, 0.4)}px`;
    group.style.width = `${size}px`;
    const wave = document.createElement("div");
    wave.className = "hw-wave";
    const inner = document.createElement("div");
    inner.className = "hw-inner";
    inner.style.transform = `scaleX(${dir})`;
    const ship = document.createElement("div");
    ship.className = "hw-tap";
    ship.style.opacity = "0.9";
    ship.style.filter = "drop-shadow(0 0 14px rgba(155,107,255,.75))";
    ship.innerHTML = SHIP_SVG;
    inner.appendChild(ship);
    wave.appendChild(inner);
    group.appendChild(wave);
    overlay.appendChild(group);

    const startX = dir === 1 ? -size * 1.2 : W + size * 0.2;
    const endX = dir === 1 ? W + size * 0.2 : -size * 1.2;
    const move = group.animate(
      [{ transform: `translateX(${startX}px)` }, { transform: `translateX(${endX}px)` }],
      { duration: dur, easing: "linear", fill: "forwards" }
    );
    wave.animate(
      [
        { transform: "translateY(-12px) rotate(-2.5deg)" },
        { transform: "translateY(12px) rotate(2.5deg)" },
      ],
      { duration: 2400, direction: "alternate", iterations: Infinity, easing: "ease-in-out" }
    );

    ship.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (Date.now() < (this._shipCooldown || 0)) return;
      this._shipCooldown = Date.now() + 2500;
      unlockAudio();
      const r = ship.getBoundingClientRect();
      this._bubble("Ahoi!", r.left + r.width * 0.5, r.top + r.height * 0.3, "#ffb347");
      this._shakeDashboard(400);
      if (this._soundOn()) playBell(this._vol("sound_volume", 0.6));
    });

    const colors = ["#e8fff2", "#b9ffd6", "#d9c2ff", "#ffffff"];
    let n = 0;
    const timer = setInterval(() => {
      const r = ship.getBoundingClientRect();
      if (!r.width) return;
      n++;
      const x = dir === 1 ? r.left + r.width * 0.1 : r.right - r.width * 0.1;
      const y = r.top + r.height * 0.85;
      const el = document.createElement("div");
      if (n % 7 === 0) {
        el.className = "hw-emoji";
        el.textContent = "🎃";
        el.style.fontSize = `${rand(16, 24)}px`;
      } else {
        const px = rand(8, 16);
        const c = colors[randInt(0, colors.length - 1)];
        el.className = "hw-spark";
        el.style.width = el.style.height = `${px}px`;
        el.style.background = c;
        el.style.opacity = "0.6";
        el.style.boxShadow = `0 0 ${px * 2}px ${c}`;
      }
      el.style.left = `${x + rand(-8, 8)}px`;
      el.style.top = `${y + rand(-8, 8)}px`;
      document.body.appendChild(el);
      el.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 0.7 },
          { transform: `translate(${-dir * rand(20, 80)}px,${rand(10, 60)}px) scale(.3)`, opacity: 0 },
        ],
        { duration: rand(1000, 1800), easing: "ease-out", fill: "forwards" }
      ).onfinish = () => el.remove();
    }, 140);

    if (this._soundOn()) {
      const vol = this._vol("sound_volume", 0.6);
      playWind(dur / 1000, this._vol("wind_volume", 0.5) * 0.6);
      setTimeout(() => this._flying && playHorn(vol), dur * 0.08);
      setTimeout(() => this._flying && playBell(vol), dur * 0.45);
      setTimeout(() => this._flying && playBell(vol), dur * 0.45 + 900);
    }

    const finish = () => {
      clearInterval(timer);
      overlay.remove();
      this._flying = false;
      this._render();
    };
    move.onfinish = finish;
    move.oncancel = finish;
  }

  /* --- Countdown --- */
  _countdown() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(now.getFullYear(), 9, 31);
    const days = Math.round((target - today) / 864e5);
    if (days > 1) return this._t("cd_n").replace("{n}", days);
    if (days === 1) return this._t("cd_one");
    if (days === 0) return this._t("cd_today");
    return this._t("cd_over");
  }

  /* --- Bonus: Kürbisregen --- */
  _pumpkinRain(n) {
    ensureGlobalStyle();
    const W = window.innerWidth;
    const H = window.innerHeight;
    const icons = ["🎃", "🎃", "🎃", "🦇", "👻"];
    for (let i = 0; i < 26; i++) {
      const el = document.createElement("div");
      el.className = "hw-emoji";
      el.textContent = icons[randInt(0, icons.length - 1)];
      el.style.cssText = `left:${rand(0, W)}px;top:-60px;font-size:${rand(24, 46)}px`;
      document.body.appendChild(el);
      el.animate(
        [
          { transform: "translate(0,0) rotate(0deg)" },
          { transform: `translate(${rand(-70, 70)}px,${H + 100}px) rotate(${rand(-540, 540)}deg)` },
        ],
        { duration: rand(1800, 3200), delay: rand(0, 1400), easing: "ease-in", fill: "both" }
      ).onfinish = () => el.remove();
    }
    this._bubble(`${n} Geister! 🎃`, W / 2, H * 0.3, "#ffb347");
    if (this._soundOn()) playBell(this._vol("sound_volume", 0.6));
  }

  /* --- Fallenlassen --- */
  _drop(x, y) {
    ensureGlobalStyle();
    const H = window.innerHeight;
    const kind = Math.random() < 0.5 ? "potion" : "pumpkin";
    const px = rand(30, 40);
    const el = document.createElement("div");
    el.className = "hw-emoji";
    el.textContent = kind === "potion" ? "🧪" : "🎃";
    el.style.cssText = `left:${x}px;top:${y}px;font-size:${px}px;pointer-events:auto;cursor:pointer;touch-action:manipulation`;
    document.body.appendChild(el);
    const fall = Math.max(H - y - 20, 100);
    const anim = el.animate(
      [
        { transform: "translate(-50%,0) rotate(0deg)" },
        { transform: `translate(-50%,${fall}px) rotate(${rand(-360, 360)}deg)` },
      ],
      { duration: 700 + fall * 1.1, easing: "cubic-bezier(.5,0,1,.6)", fill: "forwards" }
    );
    let hit = false;
    el.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (hit) return;
      hit = true;
      unlockAudio();
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      anim.cancel();
      el.remove();
      this._poof(cx, cy, px * 1.5);
      this._bubble(kind === "potion" ? "Zisch!" : "Mjam!", cx, cy, kind === "potion" ? "#b57bff" : "#ffb347");
      if (this._soundOn()) playPoof(this._vol("sound_volume", 0.6));
    });
    anim.onfinish = () => {
      if (hit) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      this._poof(cx, r.bottom, px);
      this._bubble(kind === "potion" ? "Klirr!" : "Platsch!", cx, r.bottom - 10, "#ffd27a");
      el.remove();
    };
  }

  /* --- Bodennebel --- */
  _fog(duration, withEyes = false) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const box = document.createElement("div");
    box.style.cssText = `position:fixed;left:0;right:0;bottom:0;height:${Math.round(H * 0.3)}px;overflow:hidden;pointer-events:none;z-index:99998`;
    for (let i = 0; i < 6; i++) {
      const b = document.createElement("div");
      b.style.cssText =
        `position:absolute;bottom:${rand(-H * 0.04, H * 0.01)}px;left:${rand(-0.2, 0.8) * W}px;` +
        `width:${W * rand(0.45, 0.8)}px;height:${H * rand(0.12, 0.2)}px;border-radius:50%;` +
        "background:radial-gradient(ellipse at center,rgba(225,235,255,.5),rgba(180,150,255,.18) 55%,transparent 72%);filter:blur(10px)";
      const dx = rand(0.15, 0.35) * W * (Math.random() < 0.5 ? -1 : 1);
      b.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }], {
        duration,
        easing: "ease-in-out",
        fill: "forwards",
      });
      box.appendChild(b);
    }
    if (withEyes) {
      const eyes = document.createElement("div");
      eyes.style.cssText = `position:absolute;left:${rand(W * 0.15, W * 0.8)}px;bottom:${rand(10, 40)}px;display:flex;gap:16px;opacity:0`;
      for (let i = 0; i < 2; i++) {
        const e = document.createElement("div");
        e.style.cssText = "width:9px;height:9px;border-radius:50%;background:#ffe27a;box-shadow:0 0 10px #ffd24a";
        eyes.appendChild(e);
      }
      box.appendChild(eyes);
      eyes.animate(
        [
          { opacity: 0 },
          { opacity: 0, offset: 0.3 },
          { opacity: 1, offset: 0.4 },
          { opacity: 1, offset: 0.6 },
          { opacity: 0, offset: 0.64 },
          { opacity: 1, offset: 0.68 },
          { opacity: 1, offset: 0.85 },
          { opacity: 0 },
        ],
        { duration, fill: "forwards" }
      );
    }
    document.body.appendChild(box);
    box.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], {
      duration,
      fill: "forwards",
    }).onfinish = () => box.remove();
    return box;
  }

  /* --- CAMEOS --- */
  _cameoRun(kind) {
    if (this._cameo) return;
    const pool = this._getActiveCameoPool();
    if (!pool.length) return;
    const k = pool.includes(kind) ? kind : pool[randInt(0, pool.length - 1)];
    this._cameo = true;
    ensureGlobalStyle();
    const done = () => {
      this._cameo = false;
    };
    if (k === "lantern") this._cameoLantern(done);
    else if (k === "spider") this._cameoSpider(done);
    else if (k === "hand") this._cameoHand(done);
    else if (k === "fog") this._cameoFog(done);
    else if (k === "drip") this._cameoDrip(done);
    else if (k === "crack") this._cameoCrack(done);
    else done();
  }

  /* Skelettfinger klopft & zerbricht Bildschirm */
  _cameoCrack(done) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const x = rand(W * 0.3, W * 0.7);
    const y = rand(H * 0.3, H * 0.7);
    const sound = this._soundOn();
    const vol = this._vol("sound_volume", 0.6);

    const finger = document.createElement("div");
    finger.style.cssText =
      `position:fixed;left:${x}px;top:${y}px;width:55px;height:110px;z-index:99999;pointer-events:none;` +
      "transform:translate(-50%,-50%) scale(0.6);opacity:0;filter:drop-shadow(0 0 10px rgba(0,255,170,0.6))";
    finger.innerHTML = SKELETON_FINGER_SVG;
    document.body.appendChild(finger);

    // 1. Klopfen
    setTimeout(() => {
      finger.animate(
        [
          { transform: "translate(-50%,-50%) scale(0.5)", opacity: 0 },
          { transform: "translate(-50%,-50%) scale(1.15)", opacity: 0.9, offset: 0.4 },
          { transform: "translate(-50%,-50%) scale(0.8)", opacity: 0.6 },
        ],
        { duration: 320, fill: "forwards" }
      );
      if (sound) playKnock(vol * 0.8);
    }, 400);

    // 2. Klopfen
    setTimeout(() => {
      finger.animate(
        [
          { transform: "translate(-50%,-50%) scale(0.8)", opacity: 0.6 },
          { transform: "translate(-50%,-50%) scale(1.3)", opacity: 1, offset: 0.4 },
          { transform: "translate(-50%,-50%) scale(0.7)", opacity: 0.5 },
        ],
        { duration: 320, fill: "forwards" }
      );
      if (sound) playKnock(vol);
    }, 900);

    // 3. Durchstoßen / Bruch
    setTimeout(() => {
      if (sound) playCrack(vol * 1.2);
      this._shakeDashboard(600);

      const crackWrap = document.createElement("div");
      const crackW = clamp(W * 0.45, 260, 480);
      const crackH = crackW * 0.9;
      crackWrap.style.cssText =
        `position:fixed;left:${x}px;top:${y}px;width:${crackW}px;height:${crackH}px;z-index:99999;pointer-events:none;` +
        "transform:translate(-50%,-50%);opacity:0";
      crackWrap.innerHTML = SCREEN_CRACK_SVG(crackW, crackH);
      document.body.appendChild(crackWrap);

      crackWrap.animate(
        [
          { opacity: 0, transform: "translate(-50%,-50%) scale(0.4)" },
          { opacity: 1, transform: "translate(-50%,-50%) scale(1)", offset: 0.08 },
          { opacity: 0.9, offset: 0.75 },
          { opacity: 0, transform: "translate(-50%,-50%) scale(1.05)" },
        ],
        { duration: 3500, fill: "forwards" }
      ).onfinish = () => crackWrap.remove();

      this._poof(x, y, 40, "#7fffd4");
      this._bubble("KNACK!", x, y - 40, "#ffffff");

      finger.animate(
        [
          { transform: "translate(-50%,-50%) scale(1.2)", opacity: 1 },
          { transform: "translate(-50%,-50%) scale(0.2)", opacity: 0 },
        ],
        { duration: 500, fill: "forwards" }
      ).onfinish = () => finger.remove();

      setTimeout(done, 3600);
    }, 1450);
  }

  _cameoDrip(done) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const count = randInt(2, 4);
    let pending = count;
    const sound = this._soundOn();
    const vol = this._vol("sound_volume", 0.6);

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = rand(W * 0.1, W * 0.9);
        const drip = document.createElement("div");
        drip.style.cssText =
          `position:fixed;top:0;left:${x}px;width:7px;height:24px;border-radius:0 0 5px 5px;` +
          "background:#900;z-index:99999;box-shadow:0 0 8px rgba(180,0,0,0.8);transform-origin:top center";
        document.body.appendChild(drip);

        const anim = drip.animate(
          [
            { transform: "scaleY(0.1)" },
            { transform: "scaleY(1.6)", offset: 0.35, easing: "ease-in" },
            { transform: `translateY(${H}px) scaleY(1.1)`, offset: 1, easing: "cubic-bezier(.4, 0, 1, 1)" },
          ],
          { duration: rand(1600, 2200), fill: "forwards" }
        );

        anim.onfinish = () => {
          this._poof(x, H - 10, 16, "#900");
          if (sound) playDrip(vol * 0.7);
          drip.remove();
          pending--;
          if (pending <= 0) done();
        };
      }, i * rand(400, 900));
    }
  }

  _cameoFog(done) {
    const duration = rand(12000, 16000);
    this._fog(duration, true);
    if (this._soundOn()) playWind(duration / 1000, this._vol("wind_volume", 0.5) * 0.4);
    setTimeout(done, duration);
  }

  _cameoLantern(done) {
    const W = window.innerWidth;
    const size = clamp(W * 0.09, 56, 96);
    const side = Math.random() < 0.5 ? -1 : 1;
    const hidden = side * -size * 1.3;
    const shown = side * size * 0.12;
    const visible = rand(9000, 12000);
    const total = visible + 1400;

    const el = document.createElement("div");
    el.style.cssText =
      `position:fixed;z-index:99999;bottom:${rand(6, 40)}%;${side === -1 ? "left" : "right"}:0;width:${size}px;` +
      "cursor:pointer;touch-action:manipulation;filter:drop-shadow(0 0 14px rgba(255,170,60,.9))";
    const inner = document.createElement("div");
    inner.innerHTML = pumpkinFaceSvg(false);
    el.appendChild(inner);
    document.body.appendChild(el);

    const slide = el.animate(
      [
        { transform: `translateX(${hidden}px)` },
        { transform: `translateX(${shown}px)`, offset: 0.08 },
        { transform: `translateX(${shown}px)`, offset: 0.92 },
        { transform: `translateX(${hidden}px)` },
      ],
      { duration: total, easing: "ease-in-out", fill: "forwards" }
    );
    inner.animate(
      [{ transform: "rotate(-9deg)" }, { transform: "rotate(9deg)" }],
      { duration: 650, direction: "alternate", iterations: Infinity, easing: "ease-in-out" }
    );
    inner.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.35)" }], {
      duration: 420,
      direction: "alternate",
      iterations: Infinity,
      easing: "steps(2)",
    });

    let grinned = false;
    el.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (grinned) return;
      grinned = true;
      unlockAudio();
      inner.innerHTML = pumpkinFaceSvg(true);
      inner.animate([{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(1)" }], { duration: 450 });
      const r = el.getBoundingClientRect();
      this._bubble("Muahaha!", r.left + r.width / 2, r.top, "#ffb347");
      if (this._soundOn()) {
        const v = this._vol("sound_volume", 0.6);
        playBoo(v);
        setTimeout(() => playCackle(v * 0.8), 250);
      }
    });

    const end = () => {
      el.remove();
      done();
    };
    slide.onfinish = end;
    slide.oncancel = end;
  }

  _cameoSpider(done) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const size = clamp(W * 0.06, 46, 78);
    const x = rand(W * 0.12, W * 0.88 - size);
    const y0 = -size * 1.4;
    const y1 = H * rand(0.18, 0.42);

    const wrap = document.createElement("div");
    wrap.style.cssText = `position:fixed;left:${x}px;top:0;width:${size}px;z-index:99999;pointer-events:none`;
    const thread = document.createElement("div");
    thread.style.cssText =
      "position:absolute;left:50%;bottom:100%;width:0;height:100vh;border-left:1.5px solid rgba(255,255,255,.55)";
    const spider = document.createElement("div");
    spider.style.cssText = "pointer-events:auto;cursor:pointer;touch-action:manipulation";
    spider.innerHTML = SPIDER_SVG;
    wrap.appendChild(thread);
    wrap.appendChild(spider);
    document.body.appendChild(wrap);

    const end = () => {
      wrap.remove();
      done();
    };
    const anim = wrap.animate(
      [
        { transform: `translateY(${y0}px)`, easing: "ease-out" },
        { transform: `translateY(${y1}px)`, offset: 0.22, easing: "ease-in-out" },
        { transform: `translateY(${y1 - 16}px)`, offset: 0.4, easing: "ease-in-out" },
        { transform: `translateY(${y1 + 8}px)`, offset: 0.58, easing: "ease-in-out" },
        { transform: `translateY(${y1}px)`, offset: 0.78, easing: "ease-in" },
        { transform: `translateY(${y0}px)` },
      ],
      { duration: 5200, fill: "forwards" }
    );
    spider.animate([{ transform: "rotate(-5deg)" }, { transform: "rotate(5deg)" }], {
      duration: 700,
      direction: "alternate",
      iterations: Infinity,
      easing: "ease-in-out",
    });
    anim.onfinish = end;

    let scared = false;
    spider.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (scared) return;
      scared = true;
      unlockAudio();
      const r = spider.getBoundingClientRect();
      anim.onfinish = null;
      anim.cancel();
      this._bubble("Iiih!", r.left + r.width / 2, r.top + r.height / 2, "#ff8a8a");
      if (this._soundOn()) playScreech(this._vol("sound_volume", 0.6) * 0.8);
      wrap.animate(
        [{ transform: `translateY(${r.top}px)` }, { transform: `translateY(${y0}px)` }],
        { duration: 260, easing: "ease-in", fill: "forwards" }
      ).onfinish = end;
    });
  }

  _cameoHand(done) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const h = clamp(H * 0.2, 110, 200);
    const w = (h * 70) / 120;
    const x = rand(W * 0.1, W * 0.9 - w);

    const wrap = document.createElement("div");
    wrap.style.cssText = `position:fixed;left:${x}px;bottom:0;width:${w}px;height:${h}px;z-index:99999;pointer-events:none`;
    const hand = document.createElement("div");
    hand.style.cssText =
      "position:absolute;inset:0;pointer-events:auto;cursor:pointer;touch-action:manipulation;transform-origin:50% 100%";
    hand.innerHTML = HAND_SVG;
    wrap.appendChild(hand);
    document.body.appendChild(wrap);

    const end = () => {
      wrap.remove();
      done();
    };
    const anim = wrap.animate(
      [
        { transform: "translateY(105%)", easing: "ease-out" },
        { transform: "translateY(55%)", offset: 0.12, easing: "ease-out" },
        { transform: "translateY(60%)", offset: 0.18, easing: "ease-out" },
        { transform: "translateY(12%)", offset: 0.3 },
        { transform: "translateY(12%)", offset: 0.75, easing: "ease-in" },
        { transform: "translateY(105%)" },
      ],
      { duration: 4200, fill: "forwards" }
    );
    hand.animate([{ transform: "rotate(-8deg)" }, { transform: "rotate(8deg)" }], {
      duration: 500,
      direction: "alternate",
      iterations: Infinity,
      easing: "ease-in-out",
    });
    anim.onfinish = end;

    let hit = false;
    hand.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (hit) return;
      hit = true;
      unlockAudio();
      const r = hand.getBoundingClientRect();
      anim.onfinish = null;
      const cur = r.top - (H - h);
      anim.cancel();
      this._bubble("Grrr!", r.left + r.width / 2, r.top, "#9fd37b");
      if (this._soundOn()) playBoo(this._vol("sound_volume", 0.6));
      wrap.animate(
        [{ transform: `translateY(${cur}px)` }, { transform: "translateY(105%)" }],
        { duration: 220, easing: "ease-in", fill: "forwards" }
      ).onfinish = end;
    });
  }
}

if (!customElements.get("halloween-flyover-card")) {
  customElements.define("halloween-flyover-card", HalloweenFlyoverCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "halloween-flyover-card")) {
  window.customCards.push({
    type: "halloween-flyover-card",
    name: "Halloween Flyover Card",
    description: "Hexe, Sensenmann, Krähen, Geister, Fledermäuse, Spinnennetze und Sound für dein Dashboard.",
    preview: false,
  });
}

console.info(
  `%c HALLOWEEN-FLYOVER-CARD %c v${CARD_VERSION} `,
  "color:#1b0f2e;background:#ff7518;font-weight:700",
  "color:#ff7518;background:#1b0f2e"
);
