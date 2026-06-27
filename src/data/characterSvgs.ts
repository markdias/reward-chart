/**
 * Inline SVG data URIs for character evolution stages.
 * Used as fallback/supplement when PNG images aren't available.
 * Each SVG is a cute kawaii-style character illustration.
 */

// Helper to create a data URI from SVG string
const svgToDataUri = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

// ─── DINO ──────────────────────────────────────────────
const dinoStage1Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="115" rx="55" ry="65" fill="#a7f3d0" stroke="#059669" stroke-width="3"/>
  <ellipse cx="80" cy="100" rx="8" ry="12" fill="#6ee7b7" opacity="0.6"/>
  <ellipse cx="120" cy="90" rx="6" ry="10" fill="#6ee7b7" opacity="0.6"/>
  <ellipse cx="105" cy="130" rx="10" ry="8" fill="#6ee7b7" opacity="0.4"/>
  <path d="M90 55 Q100 35 110 55" fill="#34d399" stroke="#059669" stroke-width="2"/>
  <circle cx="88" cy="105" r="5" fill="#1e1e1e"/><circle cx="112" cy="105" r="5" fill="#1e1e1e"/>
  <circle cx="89.5" cy="103.5" r="1.5" fill="white"/><circle cx="113.5" cy="103.5" r="1.5" fill="white"/>
  <path d="M94 115 Q100 122 106 115" stroke="#1e1e1e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="78" cy="112" r="6" fill="#fca5a5" opacity="0.5"/>
  <circle cx="122" cy="112" r="6" fill="#fca5a5" opacity="0.5"/>
  <g fill="#fbbf24" opacity="0.8"><polygon points="60,60 63,55 66,60 62,58 64,58"/><polygon points="140,50 143,45 146,50 142,48 144,48"/><polygon points="50,90 53,85 56,90 52,88 54,88"/></g>
  <ellipse cx="100" cy="180" rx="45" ry="8" fill="#bbf7d0" opacity="0.5"/>
</svg>`);

const dinoStage2Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="170" rx="30" ry="6" fill="#a7f3d0" opacity="0.4"/>
  <ellipse cx="100" cy="130" rx="38" ry="42" fill="#6ee7b7"/>
  <ellipse cx="100" cy="75" rx="32" ry="30" fill="#6ee7b7"/>
  <ellipse cx="100" cy="138" rx="25" ry="20" fill="#d1fae5"/>
  <circle cx="88" cy="70" r="8" fill="white"/><circle cx="112" cy="70" r="8" fill="white"/>
  <circle cx="90" cy="69" r="4" fill="#1e1e1e"/><circle cx="114" cy="69" r="4" fill="#1e1e1e"/>
  <circle cx="91.5" cy="67.5" r="1.5" fill="white"/><circle cx="115.5" cy="67.5" r="1.5" fill="white"/>
  <path d="M94 82 Q100 88 106 82" stroke="#1e1e1e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="78" cy="78" r="5" fill="#fca5a5" opacity="0.4"/>
  <circle cx="122" cy="78" r="5" fill="#fca5a5" opacity="0.4"/>
  <path d="M88 50 L85 40 M96 48 L94 38 M104 48 L106 38 M112 50 L115 40" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="68" cy="120" rx="10" ry="6" fill="#6ee7b7" transform="rotate(-20 68 120)"/>
  <ellipse cx="132" cy="120" rx="10" ry="6" fill="#6ee7b7" transform="rotate(20 132 120)"/>
  <path d="M80 165 Q100 175 120 165" stroke="#059669" stroke-width="2" fill="none"/>
  <circle cx="80" cy="165" r="5" fill="#6ee7b7"/><circle cx="120" cy="165" r="5" fill="#6ee7b7"/>
  <path d="M130 135 Q145 130 140 145 Q155 140 148 155" fill="#6ee7b7" stroke="#059669" stroke-width="2"/>
</svg>`);

const dinoStage3Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
  <ellipse cx="100" cy="200" rx="35" ry="6" fill="#a7f3d0" opacity="0.4"/>
  <rect x="72" y="130" rx="15" width="56" height="70" fill="#34d399"/>
  <ellipse cx="100" cy="90" rx="35" ry="32" fill="#34d399"/>
  <ellipse cx="100" cy="155" rx="20" ry="22" fill="#a7f3d0"/>
  <circle cx="86" cy="82" r="9" fill="white"/><circle cx="114" cy="82" r="9" fill="white"/>
  <circle cx="88" cy="81" r="5" fill="#1e1e1e"/><circle cx="116" cy="81" r="5" fill="#1e1e1e"/>
  <circle cx="89.5" cy="79.5" r="2" fill="white"/><circle cx="117.5" cy="79.5" r="2" fill="white"/>
  <path d="M92 98 Q100 106 108 98" stroke="#1e1e1e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="75" cy="92" r="6" fill="#fca5a5" opacity="0.4"/>
  <circle cx="125" cy="92" r="6" fill="#fca5a5" opacity="0.4"/>
  <path d="M82 62 L78 48 M92 58 L90 44 M108 58 L110 44 M118 62 L122 48" stroke="#059669" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="60" cy="130" rx="14" ry="8" fill="#34d399" transform="rotate(-15 60 130)"/>
  <ellipse cx="140" cy="125" rx="14" ry="8" fill="#34d399" transform="rotate(25 140 125)"/>
  <path d="M128 160 Q148 155 143 170 Q160 165 153 180 Q168 178 160 192" fill="#34d399" stroke="#059669" stroke-width="2"/>
  <rect x="78" y="192" rx="6" width="16" height="14" fill="#34d399"/><rect x="106" y="192" rx="6" width="16" height="14" fill="#34d399"/>
</svg>`);

const dinoStage4Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240">
  <ellipse cx="110" cy="225" rx="45" ry="8" fill="#a7f3d0" opacity="0.4"/>
  <rect x="78" y="130" rx="18" width="64" height="85" fill="#059669"/>
  <ellipse cx="110" cy="90" rx="38" ry="35" fill="#059669"/>
  <ellipse cx="110" cy="160" rx="22" ry="28" fill="#a7f3d0"/>
  <circle cx="94" cy="82" r="10" fill="white"/><circle cx="126" cy="82" r="10" fill="white"/>
  <circle cx="96" cy="81" r="5.5" fill="#1e1e1e"/><circle cx="128" cy="81" r="5.5" fill="#1e1e1e"/>
  <circle cx="97.5" cy="79" r="2" fill="white"/><circle cx="129.5" cy="79" r="2" fill="white"/>
  <path d="M100 100 Q110 110 120 100" stroke="#1e1e1e" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="80" cy="95" r="7" fill="#fca5a5" opacity="0.4"/>
  <circle cx="140" cy="95" r="7" fill="#fca5a5" opacity="0.4"/>
  <path d="M88 60 L82 42 M100 55 L98 37 M120 55 L122 37 M132 60 L138 42" stroke="#047857" stroke-width="5" stroke-linecap="round"/>
  <g fill="#fbbf24"><polygon points="82,42 85,34 88,42"/><polygon points="98,37 101,29 104,37"/><polygon points="122,37 125,29 128,37"/><polygon points="138,42 141,34 144,42"/></g>
  <ellipse cx="55" cy="130" rx="18" ry="10" fill="#059669" transform="rotate(-10 55 130)"/>
  <ellipse cx="165" cy="125" rx="18" ry="10" fill="#059669" transform="rotate(15 165 125)"/>
  <path d="M142 165 Q165 158 158 178 Q178 172 170 190 Q188 185 180 205 Q195 200 188 215" fill="#059669" stroke="#047857" stroke-width="2.5"/>
  <g fill="#fbbf24" opacity="0.6"><circle cx="152" cy="172" r="4"/><circle cx="168" cy="185" r="3.5"/><circle cx="178" cy="200" r="4"/><circle cx="186" cy="210" r="3"/></g>
  <rect x="82" y="208" rx="8" width="20" height="18" fill="#059669"/><rect x="118" y="208" rx="8" width="20" height="18" fill="#059669"/>
  <polygon points="110,25 115,15 120,25" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>
</svg>`);

// ─── DRAGON ────────────────────────────────────────────
const dragonStage1Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="115" rx="55" ry="65" fill="#fca5a5" stroke="#dc2626" stroke-width="3"/>
  <ellipse cx="80" cy="95" rx="10" ry="14" fill="#f87171" opacity="0.5"/>
  <ellipse cx="120" cy="105" rx="8" ry="12" fill="#f87171" opacity="0.5"/>
  <ellipse cx="95" cy="135" rx="12" ry="8" fill="#f87171" opacity="0.4"/>
  <path d="M85 55 Q100 30 115 55" fill="#fb923c" stroke="#ea580c" stroke-width="2"/>
  <path d="M92 52 Q100 42 108 52" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>
  <circle cx="88" cy="105" r="5" fill="#1e1e1e"/><circle cx="112" cy="105" r="5" fill="#1e1e1e"/>
  <circle cx="89.5" cy="103.5" r="1.5" fill="white"/><circle cx="113.5" cy="103.5" r="1.5" fill="white"/>
  <path d="M94 118 Q100 125 106 118" stroke="#1e1e1e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="78" cy="112" r="6" fill="#fde68a" opacity="0.5"/>
  <circle cx="122" cy="112" r="6" fill="#fde68a" opacity="0.5"/>
  <g fill="#fb923c" opacity="0.7"><circle cx="55" cy="70" r="4"/><circle cx="145" cy="60" r="3"/><circle cx="50" cy="100" r="3"/><circle cx="150" cy="95" r="4"/></g>
  <ellipse cx="100" cy="182" rx="45" ry="8" fill="#fecaca" opacity="0.5"/>
</svg>`);

const dragonStage2Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="175" rx="30" ry="6" fill="#fecaca" opacity="0.4"/>
  <ellipse cx="100" cy="130" rx="35" ry="40" fill="#f87171"/>
  <ellipse cx="100" cy="78" rx="30" ry="28" fill="#f87171"/>
  <ellipse cx="100" cy="138" rx="22" ry="18" fill="#fecaca"/>
  <circle cx="88" cy="72" r="8" fill="white"/><circle cx="112" cy="72" r="8" fill="white"/>
  <circle cx="90" cy="71" r="4" fill="#1e1e1e"/><circle cx="114" cy="71" r="4" fill="#1e1e1e"/>
  <circle cx="91.5" cy="69.5" r="1.5" fill="white"/><circle cx="115.5" cy="69.5" r="1.5" fill="white"/>
  <path d="M94 84 Q100 90 106 84" stroke="#1e1e1e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="78" cy="80" r="5" fill="#fde68a" opacity="0.4"/>
  <circle cx="122" cy="80" r="5" fill="#fde68a" opacity="0.4"/>
  <path d="M85 52 L80 42 Q85 38 90 42 Z" fill="#fb923c"/><path d="M115 52 L120 42 Q115 38 110 42 Z" fill="#fb923c"/>
  <path d="M65 110 Q55 95 60 85 L65 100 Z" fill="#f87171" opacity="0.7"/>
  <path d="M135 110 Q145 95 140 85 L135 100 Z" fill="#f87171" opacity="0.7"/>
  <path d="M125 140 Q140 138 135 150" fill="#f87171" stroke="#dc2626" stroke-width="2"/>
  <circle cx="80" cy="168" r="5" fill="#f87171"/><circle cx="120" cy="168" r="5" fill="#f87171"/>
</svg>`);

const dragonStage3Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
  <ellipse cx="100" cy="205" rx="35" ry="6" fill="#fecaca" opacity="0.4"/>
  <rect x="72" y="125" rx="15" width="56" height="72" fill="#ef4444"/>
  <ellipse cx="100" cy="88" rx="33" ry="30" fill="#ef4444"/>
  <ellipse cx="100" cy="150" rx="20" ry="20" fill="#fecaca"/>
  <circle cx="86" cy="80" r="9" fill="white"/><circle cx="114" cy="80" r="9" fill="white"/>
  <circle cx="88" cy="79" r="5" fill="#1e1e1e"/><circle cx="116" cy="79" r="5" fill="#1e1e1e"/>
  <circle cx="89.5" cy="77.5" r="2" fill="white"/><circle cx="117.5" cy="77.5" r="2" fill="white"/>
  <path d="M92 96 Q100 104 108 96" stroke="#1e1e1e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="74" cy="90" r="6" fill="#fde68a" opacity="0.4"/>
  <circle cx="126" cy="90" r="6" fill="#fde68a" opacity="0.4"/>
  <path d="M80 60 L72 45 Q80 40 88 48 Z" fill="#fb923c"/><path d="M120 60 L128 45 Q120 40 112 48 Z" fill="#fb923c"/>
  <path d="M60 115 Q45 95 50 80 L58 105 Z" fill="#ef4444" stroke="#dc2626" stroke-width="1.5"/>
  <path d="M140 115 Q155 95 150 80 L142 105 Z" fill="#ef4444" stroke="#dc2626" stroke-width="1.5"/>
  <ellipse cx="58" cy="130" rx="14" ry="8" fill="#ef4444" transform="rotate(-15 58 130)"/>
  <ellipse cx="142" cy="125" rx="14" ry="8" fill="#ef4444" transform="rotate(25 142 125)"/>
  <path d="M128 160 Q148 155 142 175" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
  <rect x="78" y="192" rx="6" width="16" height="14" fill="#ef4444"/><rect x="106" y="192" rx="6" width="16" height="14" fill="#ef4444"/>
</svg>`);

const dragonStage4Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 250">
  <ellipse cx="120" cy="235" rx="50" ry="8" fill="#fecaca" opacity="0.4"/>
  <rect x="88" y="130" rx="18" width="64" height="90" fill="#dc2626"/>
  <ellipse cx="120" cy="90" rx="38" ry="35" fill="#dc2626"/>
  <ellipse cx="120" cy="165" rx="22" ry="28" fill="#fecaca"/>
  <circle cx="104" cy="82" r="10" fill="white"/><circle cx="136" cy="82" r="10" fill="white"/>
  <circle cx="106" cy="81" r="5.5" fill="#1e1e1e"/><circle cx="138" cy="81" r="5.5" fill="#1e1e1e"/>
  <circle cx="107.5" cy="79" r="2" fill="white"/><circle cx="139.5" cy="79" r="2" fill="white"/>
  <path d="M110 100 Q120 110 130 100" stroke="#1e1e1e" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="90" cy="95" r="7" fill="#fde68a" opacity="0.4"/>
  <circle cx="150" cy="95" r="7" fill="#fde68a" opacity="0.4"/>
  <path d="M95 58 L82 38 Q92 30 100 42 Z" fill="#fb923c"/><path d="M145 58 L158 38 Q148 30 140 42 Z" fill="#fb923c"/>
  <path d="M65 120 Q40 85 50 60 L70 105 Z" fill="#dc2626" stroke="#b91c1c" stroke-width="2"/>
  <path d="M175 120 Q200 85 190 60 L170 105 Z" fill="#dc2626" stroke="#b91c1c" stroke-width="2"/>
  <path d="M55 95 Q35 80 45 65" stroke="#fb923c" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M185 95 Q205 80 195 65" stroke="#fb923c" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M152 170 Q175 162 168 185 Q190 178 182 200 Q200 195 195 215" fill="#dc2626" stroke="#b91c1c" stroke-width="2.5"/>
  <g fill="#fb923c" opacity="0.7"><circle cx="40" cy="70" r="5"/><circle cx="200" cy="70" r="5"/><circle cx="162" cy="178" r="3"/><circle cx="180" cy="192" r="3.5"/></g>
  <rect x="92" y="215" rx="8" width="20" height="18" fill="#dc2626"/><rect x="128" y="215" rx="8" width="20" height="18" fill="#dc2626"/>
  <polygon points="120,25 126,10 132,25" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
</svg>`);

// ─── CAT ───────────────────────────────────────────────
const catStage1Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="115" rx="50" ry="60" fill="#c4b5fd" stroke="#7c3aed" stroke-width="3"/>
  <ellipse cx="85" cy="100" rx="8" ry="12" fill="#a78bfa" opacity="0.5"/>
  <ellipse cx="118" cy="95" rx="6" ry="10" fill="#a78bfa" opacity="0.5"/>
  <circle cx="75" cy="70" r="12" fill="#c4b5fd" stroke="#7c3aed" stroke-width="2.5"/>
  <circle cx="75" cy="70" r="5" fill="#818cf8" opacity="0.5"/>
  <circle cx="88" cy="105" r="5" fill="#1e1e1e"/><circle cx="112" cy="105" r="5" fill="#1e1e1e"/>
  <circle cx="89.5" cy="103.5" r="1.5" fill="white"/><circle cx="113.5" cy="103.5" r="1.5" fill="white"/>
  <path d="M94 118 Q100 124 106 118" stroke="#1e1e1e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="78" cy="114" r="6" fill="#fca5a5" opacity="0.4"/>
  <circle cx="122" cy="114" r="6" fill="#fca5a5" opacity="0.4"/>
  <g fill="#a78bfa" opacity="0.6"><polygon points="60,55 63,48 66,55"/><polygon points="135,50 138,43 141,50"/><polygon points="50,85 53,78 56,85"/><polygon points="150,80 153,73 156,80"/></g>
  <ellipse cx="100" cy="178" rx="40" ry="7" fill="#ddd6fe" opacity="0.5"/>
</svg>`);

const catStage2Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="175" rx="25" ry="5" fill="#ddd6fe" opacity="0.4"/>
  <ellipse cx="100" cy="128" rx="30" ry="35" fill="#1e1b4b"/>
  <ellipse cx="100" cy="78" rx="28" ry="25" fill="#1e1b4b"/>
  <ellipse cx="100" cy="135" rx="18" ry="15" fill="#312e81"/>
  <path d="M75 60 L70 35 L88 52 Z" fill="#1e1b4b" stroke="#312e81" stroke-width="1.5"/>
  <path d="M125 60 L130 35 L112 52 Z" fill="#1e1b4b" stroke="#312e81" stroke-width="1.5"/>
  <circle cx="88" cy="72" r="8" fill="#fbbf24"/><circle cx="112" cy="72" r="8" fill="#fbbf24"/>
  <ellipse cx="90" cy="72" rx="3" ry="5" fill="#1e1e1e"/><ellipse cx="114" cy="72" rx="3" ry="5" fill="#1e1e1e"/>
  <circle cx="91" cy="70" r="1.5" fill="white"/><circle cx="115" cy="70" r="1.5" fill="white"/>
  <ellipse cx="100" cy="84" rx="4" ry="3" fill="#f9a8d4"/>
  <path d="M96 88 L88 90 M104 88 L112 90" stroke="#4c1d95" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M94 90 Q100 95 106 90" stroke="#1e1e1e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="78" cy="80" r="5" fill="#f9a8d4" opacity="0.3"/>
  <circle cx="122" cy="80" r="5" fill="#f9a8d4" opacity="0.3"/>
  <path d="M130 140 Q145 135 148 150 Q155 148 152 160" fill="#1e1b4b" stroke="#312e81" stroke-width="1.5"/>
  <circle cx="85" cy="165" r="5" fill="#1e1b4b"/><circle cx="115" cy="165" r="5" fill="#1e1b4b"/>
  <path d="M85 45 Q100 25 100 20" stroke="#7c3aed" stroke-width="4" fill="none" stroke-linecap="round"/>
  <polygon points="100,20 96,12 104,12" fill="#a78bfa"/>
</svg>`);

const catStage3Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
  <ellipse cx="100" cy="205" rx="30" ry="5" fill="#ddd6fe" opacity="0.4"/>
  <rect x="72" y="120" rx="15" width="56" height="75" fill="#1e1b4b"/>
  <ellipse cx="100" cy="85" rx="32" ry="28" fill="#1e1b4b"/>
  <ellipse cx="100" cy="148" rx="18" ry="18" fill="#312e81"/>
  <path d="M72 68 L62 35 L85 58 Z" fill="#1e1b4b"/><path d="M128 68 L138 35 L115 58 Z" fill="#1e1b4b"/>
  <circle cx="86" cy="78" r="9" fill="#fbbf24"/><circle cx="114" cy="78" r="9" fill="#fbbf24"/>
  <ellipse cx="88" cy="78" rx="3.5" ry="6" fill="#1e1e1e"/><ellipse cx="116" cy="78" rx="3.5" ry="6" fill="#1e1e1e"/>
  <circle cx="89.5" cy="76" r="2" fill="white"/><circle cx="117.5" cy="76" r="2" fill="white"/>
  <ellipse cx="100" cy="92" rx="4.5" ry="3.5" fill="#f9a8d4"/>
  <path d="M94 96 L84 98 M106 96 L116 98" stroke="#4c1d95" stroke-width="2" stroke-linecap="round"/>
  <path d="M94 98 Q100 104 106 98" stroke="#1e1e1e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="140" rx="12" ry="7" fill="#1e1b4b" transform="rotate(-15 60 140)"/>
  <ellipse cx="140" cy="135" rx="12" ry="7" fill="#1e1b4b" transform="rotate(25 140 135)"/>
  <path d="M128 160 Q150 155 152 170 Q160 168 156 182" fill="#1e1b4b" stroke="#312e81" stroke-width="2"/>
  <rect x="78" y="190" rx="6" width="16" height="14" fill="#1e1b4b"/><rect x="106" y="190" rx="6" width="16" height="14" fill="#1e1b4b"/>
  <path d="M82 42 Q100 15 100 10" stroke="#7c3aed" stroke-width="5" fill="none" stroke-linecap="round"/>
  <polygon points="100,10 95,0 105,0" fill="#a78bfa"/>
  <circle cx="100" cy="0" r="4" fill="#fbbf24"/>
</svg>`);

const catStage4Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240">
  <ellipse cx="110" cy="228" rx="40" ry="6" fill="#ddd6fe" opacity="0.4"/>
  <rect x="82" y="125" rx="18" width="56" height="85" fill="#1e1b4b"/>
  <ellipse cx="110" cy="88" rx="35" ry="32" fill="#1e1b4b"/>
  <ellipse cx="110" cy="158" rx="20" ry="22" fill="#312e81"/>
  <path d="M78 70 L65 30 L92 58 Z" fill="#1e1b4b"/><path d="M142 70 L155 30 L128 58 Z" fill="#1e1b4b"/>
  <circle cx="96" cy="80" r="10" fill="#fbbf24"/><circle cx="124" cy="80" r="10" fill="#fbbf24"/>
  <ellipse cx="98" cy="80" rx="4" ry="7" fill="#1e1e1e"/><ellipse cx="126" cy="80" rx="4" ry="7" fill="#1e1e1e"/>
  <circle cx="99.5" cy="77.5" r="2.5" fill="white"/><circle cx="127.5" cy="77.5" r="2.5" fill="white"/>
  <ellipse cx="110" cy="96" rx="5" ry="4" fill="#f9a8d4"/>
  <path d="M103 100 L90 103 M117 100 L130 103" stroke="#4c1d95" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M102 102 Q110 110 118 102" stroke="#1e1e1e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="140" rx="16" ry="9" fill="#1e1b4b" transform="rotate(-10 60 140)"/>
  <ellipse cx="160" cy="135" rx="16" ry="9" fill="#1e1b4b" transform="rotate(15 160 135)"/>
  <path d="M138 165 Q165 158 160 180 Q178 175 172 195 Q188 192 182 210" fill="#1e1b4b" stroke="#312e81" stroke-width="2"/>
  <rect x="86" y="205" rx="8" width="18" height="18" fill="#1e1b4b"/><rect x="116" y="205" rx="8" width="18" height="18" fill="#1e1b4b"/>
  <path d="M90 40 Q110 5 110 0" stroke="#7c3aed" stroke-width="6" fill="none" stroke-linecap="round"/>
  <polygon points="110,0 104,-12 116,-12" fill="#a78bfa"/>
  <circle cx="110" cy="-12" r="6" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>
  <g fill="#818cf8" opacity="0.5"><circle cx="55" cy="110" r="3"/><circle cx="165" cy="105" r="3"/><circle cx="45" cy="150" r="2.5"/><circle cx="175" cy="145" r="2.5"/></g>
  <g fill="#a78bfa" opacity="0.3">
    <rect x="50" y="125" width="8" height="25" rx="2" transform="rotate(-20 54 137)"/>
    <rect x="162" y="120" width="8" height="25" rx="2" transform="rotate(15 166 132)"/>
  </g>
</svg>`);

// ─── BUNNY ─────────────────────────────────────────────
const bunnyStage1Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="115" rx="50" ry="58" fill="#e9d5ff" stroke="#9333ea" stroke-width="3"/>
  <ellipse cx="82" cy="100" rx="8" ry="12" fill="#d8b4fe" opacity="0.5"/>
  <ellipse cx="120" cy="95" rx="6" ry="10" fill="#d8b4fe" opacity="0.5"/>
  <circle cx="75" cy="60" r="15" fill="#e9d5ff" stroke="#9333ea" stroke-width="2.5"/>
  <circle cx="75" cy="60" r="6" fill="#a855f7" opacity="0.3"/>
  <circle cx="125" cy="55" r="12" fill="#e9d5ff" stroke="#9333ea" stroke-width="2.5"/>
  <circle cx="125" cy="55" r="5" fill="#a855f7" opacity="0.3"/>
  <circle cx="88" cy="105" r="5" fill="#1e1e1e"/><circle cx="112" cy="105" r="5" fill="#1e1e1e"/>
  <circle cx="89.5" cy="103.5" r="1.5" fill="white"/><circle cx="113.5" cy="103.5" r="1.5" fill="white"/>
  <path d="M94 118 Q100 124 106 118" stroke="#1e1e1e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="78" cy="114" r="6" fill="#fca5a5" opacity="0.4"/>
  <circle cx="122" cy="114" r="6" fill="#fca5a5" opacity="0.4"/>
  <g fill="#a855f7" opacity="0.5"><polygon points="55,75 58,68 61,75"/><polygon points="140,65 143,58 146,65"/><polygon points="155,95 158,88 161,95"/></g>
  <ellipse cx="100" cy="178" rx="40" ry="7" fill="#ede9fe" opacity="0.5"/>
</svg>`);

const bunnyStage2Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <ellipse cx="100" cy="175" rx="25" ry="5" fill="#ede9fe" opacity="0.4"/>
  <ellipse cx="100" cy="130" rx="30" ry="35" fill="#d8b4fe"/>
  <ellipse cx="100" cy="82" rx="26" ry="24" fill="#d8b4fe"/>
  <ellipse cx="100" cy="138" rx="18" ry="15" fill="#f3e8ff"/>
  <path d="M82 65 Q78 25 85 15 Q92 25 88 55" fill="#d8b4fe" stroke="#a855f7" stroke-width="2"/>
  <path d="M83 35 Q85 20 86 35" fill="#f9a8d4" opacity="0.5"/>
  <path d="M118 65 Q122 25 115 15 Q108 25 112 55" fill="#d8b4fe" stroke="#a855f7" stroke-width="2"/>
  <path d="M117 35 Q115 20 114 35" fill="#f9a8d4" opacity="0.5"/>
  <circle cx="88" cy="76" r="7" fill="white"/><circle cx="112" cy="76" r="7" fill="white"/>
  <circle cx="90" cy="75" r="4" fill="#1e1e1e"/><circle cx="114" cy="75" r="4" fill="#1e1e1e"/>
  <circle cx="91" cy="73.5" r="1.5" fill="white"/><circle cx="115" cy="73.5" r="1.5" fill="white"/>
  <ellipse cx="100" cy="86" rx="4" ry="3" fill="#f9a8d4"/>
  <path d="M94 90 Q100 95 106 90" stroke="#1e1e1e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="78" cy="82" r="5" fill="#fca5a5" opacity="0.3"/>
  <circle cx="122" cy="82" r="5" fill="#fca5a5" opacity="0.3"/>
  <circle cx="85" cy="168" r="5" fill="#d8b4fe"/><circle cx="115" cy="168" r="5" fill="#d8b4fe"/>
  <circle cx="120" cy="155" r="8" fill="#d8b4fe"/>
</svg>`);

const bunnyStage3Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
  <ellipse cx="100" cy="205" rx="30" ry="5" fill="#ede9fe" opacity="0.4"/>
  <rect x="72" y="120" rx="15" width="56" height="72" fill="#c084fc"/>
  <ellipse cx="100" cy="88" rx="30" ry="27" fill="#c084fc"/>
  <ellipse cx="100" cy="148" rx="18" ry="18" fill="#f3e8ff"/>
  <path d="M80 72 Q74 20 82 5 Q92 20 86 62" fill="#c084fc" stroke="#a855f7" stroke-width="2"/>
  <path d="M81 30 Q83 12 84 30" fill="#f9a8d4" opacity="0.5"/>
  <path d="M120 72 Q126 20 118 5 Q108 20 114 62" fill="#c084fc" stroke="#a855f7" stroke-width="2"/>
  <path d="M119 30 Q117 12 116 30" fill="#f9a8d4" opacity="0.5"/>
  <circle cx="86" cy="80" r="9" fill="white"/><circle cx="114" cy="80" r="9" fill="white"/>
  <circle cx="88" cy="79" r="5" fill="#1e1e1e"/><circle cx="116" cy="79" r="5" fill="#1e1e1e"/>
  <circle cx="89.5" cy="77" r="2" fill="white"/><circle cx="117.5" cy="77" r="2" fill="white"/>
  <ellipse cx="100" cy="94" rx="5" ry="3.5" fill="#f9a8d4"/>
  <path d="M93 98 Q100 105 107 98" stroke="#1e1e1e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="74" cy="90" r="6" fill="#fca5a5" opacity="0.3"/>
  <circle cx="126" cy="90" r="6" fill="#fca5a5" opacity="0.3"/>
  <ellipse cx="60" cy="135" rx="12" ry="7" fill="#c084fc" transform="rotate(-15 60 135)"/>
  <ellipse cx="140" cy="130" rx="12" ry="7" fill="#c084fc" transform="rotate(25 140 130)"/>
  <rect x="78" y="188" rx="6" width="16" height="14" fill="#c084fc"/><rect x="106" y="188" rx="6" width="16" height="14" fill="#c084fc"/>
  <circle cx="120" cy="172" r="10" fill="#c084fc"/>
  <ellipse cx="90" cy="50" rx="6" ry="3" fill="#c4b5fd" opacity="0.5" transform="rotate(-10 90 50)"/>
  <ellipse cx="110" cy="48" rx="6" ry="3" fill="#c4b5fd" opacity="0.5" transform="rotate(10 110 48)"/>
</svg>`);

const bunnyStage4Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240">
  <ellipse cx="110" cy="228" rx="40" ry="6" fill="#ede9fe" opacity="0.4"/>
  <rect x="82" y="125" rx="18" width="56" height="85" fill="#9333ea"/>
  <ellipse cx="110" cy="88" rx="34" ry="32" fill="#9333ea"/>
  <ellipse cx="110" cy="158" rx="20" ry="22" fill="#e9d5ff"/>
  <path d="M90 72 Q82 10 92 -8 Q104 15 96 60" fill="#9333ea" stroke="#7e22ce" stroke-width="2.5"/>
  <path d="M91 25 Q93 5 95 25" fill="#f9a8d4" opacity="0.5"/>
  <path d="M130 72 Q138 10 128 -8 Q116 15 124 60" fill="#9333ea" stroke="#7e22ce" stroke-width="2.5"/>
  <path d="M129 25 Q127 5 125 25" fill="#f9a8d4" opacity="0.5"/>
  <circle cx="96" cy="80" r="10" fill="white"/><circle cx="124" cy="80" r="10" fill="white"/>
  <circle cx="98" cy="79" r="5.5" fill="#1e1e1e"/><circle cx="126" cy="79" r="5.5" fill="#1e1e1e"/>
  <circle cx="99.5" cy="77" r="2.5" fill="white"/><circle cx="127.5" cy="77" r="2.5" fill="white"/>
  <ellipse cx="110" cy="96" rx="5.5" ry="4" fill="#f9a8d4"/>
  <path d="M102 100 Q110 110 118 100" stroke="#1e1e1e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="82" cy="92" r="7" fill="#fca5a5" opacity="0.3"/>
  <circle cx="138" cy="92" r="7" fill="#fca5a5" opacity="0.3"/>
  <ellipse cx="60" cy="140" rx="16" ry="9" fill="#9333ea" transform="rotate(-10 60 140)"/>
  <ellipse cx="160" cy="135" rx="16" ry="9" fill="#9333ea" transform="rotate(15 160 135)"/>
  <rect x="86" y="205" rx="8" width="18" height="18" fill="#9333ea"/><rect x="116" y="205" rx="8" width="18" height="18" fill="#9333ea"/>
  <circle cx="130" cy="185" r="12" fill="#9333ea"/>
  <circle cx="90" cy="42" r="5" fill="#d8b4fe" opacity="0.5"/><circle cx="130" cy="40" r="5" fill="#d8b4fe" opacity="0.5"/>
  <path d="M75 115 Q58 100 62 88" stroke="#d8b4fe" stroke-width="3" fill="none" stroke-linecap="round"/>
  <polygon points="62,88 56,80 68,82" fill="#d8b4fe"/>
  <path d="M145 115 Q162 100 158 88" stroke="#d8b4fe" stroke-width="3" fill="none" stroke-linecap="round"/>
  <polygon points="158,88 164,80 152,82" fill="#d8b4fe"/>
  <g fill="#a855f7" opacity="0.4"><circle cx="50" cy="130" r="3"/><circle cx="170" cy="125" r="3"/></g>
</svg>`);

// ─── ROBOT STAGE 4 ─────────────────────────────────────
const robotStage4Svg = svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240">
  <ellipse cx="110" cy="228" rx="45" ry="7" fill="#cffafe" opacity="0.4"/>
  <rect x="82" y="125" rx="18" width="56" height="88" fill="#94a3b8"/>
  <ellipse cx="110" cy="88" rx="36" ry="33" fill="#cbd5e1"/>
  <rect x="88" y="140" rx="10" width="44" height="40" fill="#06b6d4" opacity="0.3"/>
  <circle cx="110" cy="155" r="8" fill="#22d3ee" opacity="0.6"/>
  <rect x="90" y="62" width="40" height="22" rx="5" fill="#0f172a"/>
  <circle cx="100" cy="73" r="6" fill="#22d3ee"/><circle cx="120" cy="73" r="6" fill="#22d3ee"/>
  <circle cx="100" cy="73" r="2.5" fill="white" opacity="0.8"/><circle cx="120" cy="73" r="2.5" fill="white" opacity="0.8"/>
  <rect x="100" y="88" width="20" height="6" rx="3" fill="#94a3b8"/>
  <circle cx="110" cy="91" r="2" fill="#f87171"/>
  <rect x="86" cy="50" width="10" height="15" rx="3" fill="#cbd5e1" transform="rotate(-15 91 57)"/>
  <rect x="124" cy="50" width="10" height="15" rx="3" fill="#cbd5e1" transform="rotate(15 129 57)"/>
  <circle cx="91" cy="48" r="4" fill="#22d3ee"/><circle cx="129" cy="48" r="4" fill="#22d3ee"/>
  <path d="M60 120 Q45 105 48 90 L62 110 Z" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
  <path d="M160 120 Q175 105 172 90 L158 110 Z" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
  <circle cx="50" cy="92" r="5" fill="#06b6d4" opacity="0.5"/><circle cx="170" cy="92" r="5" fill="#06b6d4" opacity="0.5"/>
  <rect x="56" cy="130" width="26" height="10" rx="5" fill="#94a3b8"/><rect x="138" cy="130" width="26" height="10" rx="5" fill="#94a3b8"/>
  <rect x="86" y="208" rx="8" width="18" height="20" fill="#64748b"/><rect x="116" y="208" rx="8" width="18" height="20" fill="#64748b"/>
  <circle cx="95" cy="218" r="3" fill="#22d3ee" opacity="0.6"/><circle cx="125" cy="218" r="3" fill="#22d3ee" opacity="0.6"/>
  <path d="M98 40 L105 28 L110 32 L115 28 L122 40" fill="#22d3ee" stroke="#0891b2" stroke-width="1.5"/>
  <g fill="#22d3ee" opacity="0.3"><circle cx="55" cy="115" r="2.5"/><circle cx="165" cy="110" r="2.5"/><circle cx="95" cy="150" r="2"/><circle cx="125" cy="150" r="2"/></g>
</svg>`);

// ─── EXPORTS ───────────────────────────────────────────
export const CHARACTER_SVG_FALLBACKS: Record<string, Record<number, string>> = {
  dino: {
    1: dinoStage1Svg,
    2: dinoStage2Svg,
    3: dinoStage3Svg,
    4: dinoStage4Svg,
  },
  dragon: {
    1: dragonStage1Svg,
    2: dragonStage2Svg,
    3: dragonStage3Svg,
    4: dragonStage4Svg,
  },
  cat: {
    1: catStage1Svg,
    2: catStage2Svg,
    3: catStage3Svg,
    4: catStage4Svg,
  },
  bunny: {
    1: bunnyStage1Svg,
    2: bunnyStage2Svg,
    3: bunnyStage3Svg,
    4: bunnyStage4Svg,
  },
  robot: {
    4: robotStage4Svg,
  },
};
