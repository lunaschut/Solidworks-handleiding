import { PresetSketch } from '../types';

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

const flangeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="500" height="400">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="500" height="400" fill="#fafafa"/>
  <rect width="500" height="400" fill="url(#grid)"/>
  
  <!-- Sketch Header -->
  <text x="25" y="30" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#334155">SKETCH #01 - CYLINDRICAL FLANGE WITH BOLT CIRCLE</text>
  <text x="25" y="48" font-family="Courier, monospace" font-size="11" fill="#64748b">Handgetekend concept | Aanzicht &amp; Doorsnede indicatie</text>

  <!-- Centerlines -->
  <line x1="60" y1="210" x2="280" y2="210" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="8,3,2,3"/>
  <line x1="170" y1="100" x2="170" y2="320" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="8,3,2,3"/>

  <!-- Main Flange Outer Circle (Wobbly Hand-drawn feel) -->
  <circle cx="170" cy="210" r="95" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
  <!-- Bolt Circle (Pitch circle diameter) -->
  <circle cx="170" cy="210" r="68" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5,4"/>
  
  <!-- 4 Holes on PCD -->
  <circle cx="170" cy="142" r="9" fill="#f8fafc" stroke="#1e293b" stroke-width="2.5"/>
  <circle cx="238" cy="210" r="9" fill="#f8fafc" stroke="#1e293b" stroke-width="2.5"/>
  <circle cx="170" cy="278" r="9" fill="#f8fafc" stroke="#1e293b" stroke-width="2.5"/>
  <circle cx="102" cy="210" r="9" fill="#f8fafc" stroke="#1e293b" stroke-width="2.5"/>

  <!-- Center Bore Circle & Keyway -->
  <circle cx="170" cy="210" r="32" fill="#f1f5f9" stroke="#1e293b" stroke-width="3"/>
  <rect x="164" y="172" width="12" height="12" fill="#f1f5f9" stroke="#1e293b" stroke-width="2.5"/>

  <!-- 3D Side view / Section hint on right side -->
  <path d="M 330 140 L 390 140 L 390 170 L 430 170 L 430 250 L 390 250 L 390 280 L 330 280 L 330 245 L 360 245 L 360 175 L 330 175 Z" fill="#f8fafc" stroke="#1e293b" stroke-width="2.8" stroke-linejoin="round"/>
  <!-- Centerline side view -->
  <line x1="310" y1="210" x2="450" y2="210" stroke="#0284c7" stroke-width="1" stroke-dasharray="8,3,2,3"/>

  <!-- Hatching lines for section -->
  <line x1="335" y1="145" x2="350" y2="160" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="350" y1="145" x2="375" y2="170" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="370" y1="145" x2="390" y2="165" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="395" y1="175" x2="425" y2="205" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="335" y1="260" x2="355" y2="280" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="355" y1="255" x2="380" y2="280" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="395" y1="215" x2="425" y2="245" stroke="#94a3b8" stroke-width="1.2"/>

  <!-- Annotations / Hand notes -->
  <text x="50" y="95" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0f172a">Ø190 buitendiameter</text>
  <line x1="120" y1="100" x2="150" y2="120" stroke="#0f172a" stroke-width="1"/>
  
  <text x="250" y="115" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0f172a">4x M10 op PCD Ø136</text>
  <line x1="245" y1="120" x2="200" y2="145" stroke="#0f172a" stroke-width="1"/>

  <text x="20" y="270" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0f172a">Asgat Ø64 H7 met spiebaan</text>
  <line x1="90" y1="255" x2="145" y2="225" stroke="#0f172a" stroke-width="1"/>

  <text x="350" y="320" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#b91c1c">R5 afronding in overgang</text>
  <path d="M 390 250 Q 380 250 375 260" stroke="#b91c1c" stroke-width="1.5" fill="none"/>
  
  <text x="340" y="125" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0f172a">Dikte flens = 25 mm, naaf = 60 mm</text>
</svg>
`;

const bracketSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="500" height="400">
  <defs>
    <pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="500" height="400" fill="#fafafa"/>
  <rect width="500" height="400" fill="url(#grid2)"/>

  <!-- Title -->
  <text x="25" y="30" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#334155">SKETCH #02 - L-VORMIGE MONTAGEBEUGEL</text>
  <text x="25" y="48" font-family="Courier, monospace" font-size="11" fill="#64748b">Handmatige schets | Isometrische 3D aanduiding</text>

  <!-- Hand-drawn 3D Isometric L-Bracket contour -->
  <path d="M 120 180 L 190 140 L 260 175 L 260 215 L 210 240 L 330 300 L 260 340 L 80 250 L 80 200 Z" fill="#f1f5f9" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
  <path d="M 190 140 L 190 230 L 330 300" stroke="#1e293b" stroke-width="2.5" fill="none"/>
  <path d="M 120 180 L 120 230 L 210 275 L 210 240" stroke="#1e293b" stroke-width="2.5" fill="none"/>

  <!-- Corner Fillet indication -->
  <path d="M 120 220 Q 125 235 140 240" stroke="#0284c7" stroke-width="2" fill="none"/>
  
  <!-- Stiffener Gusset / Rib in center -->
  <polygon points="150,210 150,250 200,275 190,230" fill="#e2e8f0" stroke="#0f172a" stroke-width="2.2"/>

  <!-- Top hole on vertical flange -->
  <ellipse cx="225" cy="175" rx="14" ry="8" fill="#ffffff" stroke="#1e293b" stroke-width="2.5" transform="rotate(-15 225 175)"/>
  
  <!-- Slot hole on horizontal base -->
  <path d="M 160 280 C 150 275 145 285 155 290 L 210 320 C 220 325 225 315 215 310 Z" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>

  <!-- Annotations -->
  <text x="240" y="105" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0f172a">Bevestigingsgat Ø14 doorlopend</text>
  <line x1="240" y1="115" x2="230" y2="160" stroke="#0f172a" stroke-width="1.2"/>

  <text x="20" y="320" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0f172a">Sleufgat (slot) 14 x 35 mm</text>
  <line x1="120" y1="310" x2="170" y2="295" stroke="#0f172a" stroke-width="1.2"/>

  <text x="280" y="240" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#b91c1c">Verstevigingsrib (Rib feature) dikte 10mm</text>
  <line x1="280" y1="245" x2="180" y2="245" stroke="#b91c1c" stroke-width="1.2"/>

  <text x="30" y="140" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0369a1">Wanddikte = 15mm uniform</text>
  <text x="30" y="160" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0369a1">Buitenafmetingen ~160x120x80</text>
</svg>
`;

const shaftSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="500" height="400">
  <defs>
    <pattern id="grid3" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="500" height="400" fill="#fafafa"/>
  <rect width="500" height="400" fill="url(#grid3)"/>

  <!-- Title -->
  <text x="25" y="30" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#334155">SKETCH #03 - GETRAPTE DRAAI-AS (REVOLVED PART)</text>
  <text x="25" y="48" font-family="Courier, monospace" font-size="11" fill="#64748b">Asymmetrisch rotatiesymmetrisch werkstuk met spiebaan &amp; schroefdraadtap</text>

  <!-- Centerline of Rotation -->
  <line x1="40" y1="200" x2="460" y2="200" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="10,4,2,4"/>
  <text x="415" y="190" font-family="Courier, monospace" font-size="11" font-weight="bold" fill="#0284c7">DRAAIAS</text>

  <!-- Revolved Profile Half Sketch (SolidWorks Revolve concept) -->
  <path d="M 70 200 L 70 160 L 80 150 L 150 150 L 150 135 L 250 135 L 250 145 L 265 145 L 265 135 L 340 135 L 340 165 L 420 165 L 420 200" 
        fill="#e0f2fe" stroke="#0369a1" stroke-width="3" stroke-linejoin="round"/>
  
  <!-- Mirror contour (Full turned shaft outline) -->
  <path d="M 70 200 L 70 240 L 80 250 L 150 250 L 150 265 L 250 265 L 250 255 L 265 255 L 265 265 L 340 265 L 340 235 L 420 235 L 420 200" 
        fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,3"/>

  <!-- Chamfer notes -->
  <text x="40" y="110" font-family="Comic Sans MS, cursive, sans-serif" font-size="11" fill="#0f172a">Afschuining 2x45°</text>
  <line x1="75" y1="120" x2="75" y2="155" stroke="#0f172a" stroke-width="1"/>

  <!-- Circlip Groove note -->
  <text x="210" y="90" font-family="Comic Sans MS, cursive, sans-serif" font-size="11" fill="#b91c1c">Borgringgroef 3mm breed, Ø26</text>
  <line x1="258" y1="100" x2="258" y2="140" stroke="#b91c1c" stroke-width="1.2"/>

  <!-- Keyway on front section -->
  <rect x="100" y="152" width="35" height="12" fill="#ffffff" stroke="#1e293b" stroke-width="1.8" stroke-dasharray="3,2"/>
  <text x="80" y="310" font-family="Comic Sans MS, cursive, sans-serif" font-size="11" fill="#0f172a">Spiebaan (Keyway) 6x35 mm</text>
  <line x1="120" y1="295" x2="120" y2="170" stroke="#0f172a" stroke-width="1"/>

  <!-- M-thread hole on right end -->
  <path d="M 420 185 L 375 185 L 370 200 L 375 215 L 420 215" fill="#f8fafc" stroke="#dc2626" stroke-width="1.8"/>
  <text x="350" y="270" font-family="Comic Sans MS, cursive, sans-serif" font-size="11" fill="#dc2626">Centrering / Getapt gat M8x20 blind</text>
  <line x1="390" y1="255" x2="390" y2="215" stroke="#dc2626" stroke-width="1"/>

  <text x="25" y="360" font-family="Courier, monospace" font-size="12" fill="#334155">Diameterstappen: Ø30 -> Ø45 -> Ø30 -> Ø25 | Totale aslengte: 350 mm</text>
</svg>
`;

const enclosureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="500" height="400">
  <defs>
    <pattern id="grid4" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="500" height="400" fill="#fafafa"/>
  <rect width="500" height="400" fill="url(#grid4)"/>

  <!-- Title -->
  <text x="25" y="30" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#334155">SKETCH #04 - GEGOTEN BEHUIZING (SHELL &amp; POCKET)</text>
  <text x="25" y="48" font-family="Courier, monospace" font-size="11" fill="#64748b">Sensorbehuizing met holte, bevestigingsnokken en kabelinvoer</text>

  <!-- Outer Rounded Box -->
  <rect x="80" y="90" width="260" height="220" rx="25" fill="#f8fafc" stroke="#1e293b" stroke-width="3"/>
  <!-- Inner Shell Pocket (Cavity) -->
  <rect x="102" y="112" width="216" height="176" rx="14" fill="#f1f5f9" stroke="#1e293b" stroke-width="2.5"/>

  <!-- 4 Corner Bosses with screw holes (Nokken) -->
  <circle cx="120" cy="130" r="16" fill="#e2e8f0" stroke="#1e293b" stroke-width="2"/>
  <circle cx="120" cy="130" r="5" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>

  <circle cx="300" cy="130" r="16" fill="#e2e8f0" stroke="#1e293b" stroke-width="2"/>
  <circle cx="300" cy="130" r="5" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>

  <circle cx="120" cy="270" r="16" fill="#e2e8f0" stroke="#1e293b" stroke-width="2"/>
  <circle cx="120" cy="270" r="5" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>

  <circle cx="300" cy="270" r="16" fill="#e2e8f0" stroke="#1e293b" stroke-width="2"/>
  <circle cx="300" cy="270" r="5" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>

  <!-- Side cut out for cable gland -->
  <rect x="330" y="180" width="45" height="40" rx="8" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
  <circle cx="355" cy="200" r="12" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>

  <!-- Annotations -->
  <text x="360" y="120" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0f172a">Wanddikte = 3mm uniform (Shell?)</text>
  <line x1="355" y1="125" x2="310" y2="150" stroke="#0f172a" stroke-width="1"/>

  <text x="20" y="80" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0f172a">Buitenstraal R20 hoeken</text>

  <text x="360" y="270" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#b91c1c">Lossingshoek (Draft) 1.5° voor spuitgieten?</text>
  <line x1="360" y1="275" x2="315" y2="280" stroke="#b91c1c" stroke-width="1.2"/>

  <text x="70" y="350" font-family="Comic Sans MS, cursive, sans-serif" font-size="12" fill="#0284c7">4x M3 tapgat in cilindrische nokken</text>
  <text x="310" y="245" font-family="Comic Sans MS, cursive, sans-serif" font-size="11" fill="#0f172a">M16 warteldoorvoer</text>
</svg>
`;

export const PRESET_SKETCHES: PresetSketch[] = [
  {
    id: 'flange',
    title: 'Cilindrische Flens met Steekcirkel & Naaf',
    category: 'Rotatiesymmetrisch / Flens',
    description: 'Buitendiameter Ø190, centrale H7 asboring met spiebaan, 4x M10 boutgaten op PCD Ø136 en afronding.',
    svgDataUrl: svgToDataUrl(flangeSvg),
  },
  {
    id: 'bracket',
    title: 'L-Montagebeugel met Verstevigingsrib',
    category: 'Plaat / Hoekconstructie',
    description: 'Haakse beugel met doorlopend bevestigingsgat, sleufgat (slot), interne hoekafronding en verstevigingsrib.',
    svgDataUrl: svgToDataUrl(bracketSvg),
  },
  {
    id: 'shaft',
    title: 'Getrapte Draai-as met Groef & Centering',
    category: 'Draaideel / Revolve',
    description: 'Rotatiesymmetrische as met verschillende diametersecties, circlipgroef, spiebaan, afschuining en M8 draadboring.',
    svgDataUrl: svgToDataUrl(shaftSvg),
  },
  {
    id: 'enclosure',
    title: 'Gegoten Sensorbehuizing met Holte & Nokken',
    category: 'Behuizing / Pocket / Shell',
    description: 'Rechthoekige behuizing met afgeronde hoeken, interne pocket, 4 schroefnokken en zijdelingse kabeldoorvoer.',
    svgDataUrl: svgToDataUrl(enclosureSvg),
  },
];
