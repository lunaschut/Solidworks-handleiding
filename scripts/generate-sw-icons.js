import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/assets/solidworks');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function createSwRibbonSvg({
  filename,
  title,
  activeTab, // 'Features' | 'Sketch' | 'Evaluate' | 'File'
  toolName,
  shortcut,
  locationText,
  tools, // Array of { name: string, iconType: string, isTarget: boolean }
}) {
  const width = 640;
  const height = 200;

  const tabs = ['Features', 'Sketch', 'Evaluate', 'DimXpert'];

  let toolButtonsSvg = '';
  const startX = 20;
  const startY = 68;
  const buttonWidth = 72;
  const buttonGap = 8;

  let targetX = 0;
  let targetY = 0;
  let targetW = 0;
  let targetH = 0;

  tools.forEach((t, i) => {
    const x = startX + i * (buttonWidth + buttonGap);
    const y = startY;
    const w = buttonWidth;
    const h = 76;

    if (t.isTarget) {
      targetX = x;
      targetY = y;
      targetW = w;
      targetH = h;
    }

    const iconSvg = renderToolIcon(t.iconType, x + w / 2, y + 26);
    const labelLines = t.name.split('\n');

    let textSvg = '';
    if (labelLines.length === 1) {
      textSvg = `<text x="${x + w / 2}" y="${y + 60}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="${t.isTarget ? '700' : '500'}" fill="${t.isTarget ? '#0f172a' : '#475569'}" text-anchor="middle">${labelLines[0]}</text>`;
    } else {
      textSvg = `
        <text x="${x + w / 2}" y="${y + 55}" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="${t.isTarget ? '700' : '500'}" fill="${t.isTarget ? '#0f172a' : '#475569'}" text-anchor="middle">${labelLines[0]}</text>
        <text x="${x + w / 2}" y="${y + 67}" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="${t.isTarget ? '700' : '500'}" fill="${t.isTarget ? '#0f172a' : '#475569'}" text-anchor="middle">${labelLines[1]}</text>
      `;
    }

    toolButtonsSvg += `
      <g>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${t.isTarget ? '#ffffff' : '#f8fafc'}" stroke="${t.isTarget ? '#cbd5e1' : '#e2e8f0'}" stroke-width="1" />
        ${iconSvg}
        ${textSvg}
      </g>
    `;
  });

  // Highlight overlay
  const highlightSvg = `
    <!-- Glowing Red Highlight Frame/Circle -->
    <rect x="${targetX - 4}" y="${targetY - 4}" width="${targetW + 8}" height="${targetH + 8}" rx="12" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-dasharray="none" filter="url(#redGlow)" />
    <!-- Pulse badge -->
    <rect x="${targetX + targetW / 2 - 42}" y="${targetY - 14}" width="84" height="20" rx="10" fill="#dc2626" />
    <text x="${targetX + targetW / 2}" y="${targetY}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">HIER KLIKKEN</text>
    <!-- Arrow pointer -->
    <polygon points="${targetX + targetW / 2 - 5},${targetY + 6} ${targetX + targetW / 2 + 5},${targetY + 6} ${targetX + targetW / 2},${targetY + 12}" fill="#dc2626" />
  `;

  const tabsSvg = tabs
    .map((tab, idx) => {
      const tx = 20 + idx * 88;
      const isActive = tab.toLowerCase() === activeTab.toLowerCase();
      return `
      <g>
        <text x="${tx + 40}" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="${isActive ? '700' : '500'}" fill="${isActive ? '#0284c7' : '#64748b'}" text-anchor="middle">${tab}</text>
        ${isActive ? `<rect x="${tx + 4}" y="34" width="72" height="3" rx="1.5" fill="#0284c7" />` : ''}
      </g>
    `;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #f1f5f9; border-radius: 12px; overflow: hidden;">
  <defs>
    <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ef4444" flood-opacity="0.6"/>
    </filter>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>

  <!-- Top bar / Window Header -->
  <rect x="0" y="0" width="${width}" height="38" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  ${tabsSvg}

  <!-- Ribbon Background -->
  <rect x="0" y="38" width="${width}" height="118" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />

  <!-- Divider line -->
  <line x1="0" y1="38" x2="${width}" y2="38" stroke="#cbd5e1" stroke-width="1" />

  <!-- Tool buttons -->
  ${toolButtonsSvg}

  <!-- Red highlight ring & pointer -->
  ${highlightSvg}

  <!-- Footer information strip -->
  <rect x="0" y="156" width="${width}" height="44" fill="#0f172a" />
  
  <!-- Location pin icon -->
  <circle cx="28" cy="178" r="8" fill="#ef4444" fill-opacity="0.2" />
  <circle cx="28" cy="178" r="4" fill="#ef4444" />
  
  <text x="44" y="182" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#f8fafc">
    ${locationText}
  </text>

  ${
    shortcut
      ? `
    <rect x="${width - 150}" y="166" width="130" height="24" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="${width - 85}" y="182" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="10" font-weight="600" fill="#38bdf8" text-anchor="middle">
      Sneltoets: ${shortcut}
    </text>
  `
      : ''
  }
</svg>`;

  fs.writeFileSync(path.join(outDir, filename), svg, 'utf-8');
  console.log(`Generated: ${filename}`);
}

function renderToolIcon(type, cx, cy) {
  switch (type) {
    case 'sketch':
      return `
        <!-- Sketch Pencil & Grid -->
        <rect x="${cx - 14}" y="${cy - 12}" width="28" height="24" rx="3" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" />
        <line x1="${cx - 8}" y1="${cy - 12}" x2="${cx - 8}" y2="${cy + 12}" stroke="#bae6fd" stroke-width="1" stroke-dasharray="2 2" />
        <line x1="${cx + 2}" y1="${cy - 12}" x2="${cx + 2}" y2="${cy + 12}" stroke="#bae6fd" stroke-width="1" stroke-dasharray="2 2" />
        <line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}" stroke="#bae6fd" stroke-width="1" stroke-dasharray="2 2" />
        <!-- Red/Yellow Pencil -->
        <path d="M${cx + 2},${cy - 8} L${cx + 10},${cy} L${cx - 4},${cy + 14} L${cx - 10},${cy + 12} L${cx - 8},${cy + 6} Z" fill="#f59e0b" stroke="#b45309" stroke-width="1" />
        <polygon points="${cx - 10},${cy + 12} ${cx - 12},${cy + 15} ${cx - 7},${cy + 14}" fill="#1e293b" />
      `;

    case 'smart-dimension':
      return `
        <!-- Caliper / Dimension Arrows -->
        <line x1="${cx - 12}" y1="${cy - 10}" x2="${cx - 12}" y2="${cy + 10}" stroke="#0f172a" stroke-width="2" />
        <line x1="${cx + 12}" y1="${cy - 10}" x2="${cx + 12}" y2="${cy + 10}" stroke="#0f172a" stroke-width="2" />
        <line x1="${cx - 10}" y1="${cy}" x2="${cx + 10}" y2="${cy}" stroke="#2563eb" stroke-width="2" />
        <polygon points="${cx - 10},${cy} ${cx - 5},${cy - 4} ${cx - 5},${cy + 4}" fill="#2563eb" />
        <polygon points="${cx + 10},${cy} ${cx + 5},${cy - 4} ${cx + 5},${cy + 4}" fill="#2563eb" />
        <rect x="${cx - 6}" y="${cy - 6}" width="12" height="12" rx="2" fill="#ffffff" stroke="#2563eb" stroke-width="1" />
        <text x="${cx}" y="${cy + 3}" font-family="ui-monospace, monospace" font-size="8" font-weight="700" fill="#2563eb" text-anchor="middle">50</text>
      `;

    case 'circle':
      return `
        <!-- Sketch Circle -->
        <circle cx="${cx}" cy="${cy}" r="11" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
        <circle cx="${cx}" cy="${cy}" r="2" fill="#dc2626" />
        <line x1="${cx}" y1="${cy}" x2="${cx + 8}" y2="${cy - 8}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="2 1" />
        <circle cx="${cx + 8}" cy="${cy - 8}" r="2" fill="#dc2626" />
      `;

    case 'rectangle':
      return `
        <!-- Sketch Rectangle -->
        <rect x="${cx - 12}" y="${cy - 10}" width="24" height="20" rx="1" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
        <circle cx="${cx - 12}" cy="${cy - 10}" r="2.5" fill="#dc2626" />
        <circle cx="${cx + 12}" cy="${cy + 10}" r="2.5" fill="#dc2626" />
      `;

    case 'extruded-boss':
      return `
        <!-- Extruded 3D Cube -->
        <!-- Back top face -->
        <polygon points="${cx - 6},${cy - 12} ${cx + 10},${cy - 12} ${cx + 4},${cy - 4} ${cx - 12},${cy - 4}" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5" />
        <!-- Front face -->
        <polygon points="${cx - 12},${cy - 4} ${cx + 4},${cy - 4} ${cx + 4},${cy + 10} ${cx - 12},${cy + 10}" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
        <!-- Right side face -->
        <polygon points="${cx + 4},${cy - 4} ${cx + 10},${cy - 12} ${cx + 10},${cy + 2} ${cx + 4},${cy + 10}" fill="#0284c7" stroke="#0369a1" stroke-width="1.5" />
        <!-- Upward extrusion arrow -->
        <line x1="${cx - 4}" y1="${cy + 4}" x2="${cx - 4}" y2="${cy - 8}" stroke="#f59e0b" stroke-width="2" />
        <polygon points="${cx - 4},${cy - 10} ${cx - 7},${cy - 6} ${cx - 1},${cy - 6}" fill="#f59e0b" />
      `;

    case 'revolved-boss':
      return `
        <!-- Revolved Cylinder with Arrow -->
        <ellipse cx="${cx}" cy="${cy - 8}" rx="10" ry="4" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5" />
        <path d="M${cx - 10},${cy - 8} L${cx - 10},${cy + 8} A10,4 0 0,0 ${cx + 10},${cy + 8} L${cx + 10},${cy - 8}" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
        <!-- Centerline axis -->
        <line x1="${cx - 14}" y1="${cy - 12}" x2="${cx - 14}" y2="${cy + 14}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 2" />
        <!-- Rotational curved arrow -->
        <path d="M${cx - 6},${cy - 2} A12,6 0 1,1 ${cx + 6},${cy - 2}" fill="none" stroke="#f59e0b" stroke-width="2" />
        <polygon points="${cx + 6},${cy - 4} ${cx + 9},${cy} ${cx + 4},${cy + 2}" fill="#f59e0b" />
      `;

    case 'extruded-cut':
      return `
        <!-- Extruded Cut Cube with Hole Cutout -->
        <polygon points="${cx - 10},${cy - 2} ${cx + 6},${cy - 2} ${cx + 6},${cy + 10} ${cx - 10},${cy + 10}" fill="#94a3b8" stroke="#475569" stroke-width="1.5" />
        <polygon points="${cx - 10},${cy - 2} ${cx - 4},${cy - 8} ${cx + 12},${cy - 8} ${cx + 6},${cy - 2}" fill="#cbd5e1" stroke="#475569" stroke-width="1.5" />
        <polygon points="${cx + 6},${cy - 2} ${cx + 12},${cy - 8} ${cx + 12},${cy + 4} ${cx + 6},${cy + 10}" fill="#64748b" stroke="#475569" stroke-width="1.5" />
        <!-- Cutout in center with red removal arrow -->
        <rect x="${cx - 4}" y="${cy + 1}" width="8" height="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1" stroke-dasharray="2 1" />
        <line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy + 6}" stroke="#dc2626" stroke-width="2" />
        <polygon points="${cx},${cy + 8} ${cx - 3},${cy + 4} ${cx + 3},${cy + 4}" fill="#dc2626" />
      `;

    case 'hole-wizard':
      return `
        <!-- Hole Wizard / Counterbore Drill -->
        <rect x="${cx - 8}" y="${cy - 10}" width="16" height="5" fill="#f8fafc" stroke="#0284c7" stroke-width="1.5" />
        <polygon points="${cx - 5},${cy - 5} ${cx + 5},${cy - 5} ${cx + 5},${cy + 6} ${cx},${cy + 11} ${cx - 5},${cy + 6}" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
        <!-- Thread lines -->
        <line x1="${cx - 4}" y1="${cy - 2}" x2="${cx + 4}" y2="${cy}" stroke="#0369a1" stroke-width="1" />
        <line x1="${cx - 4}" y1="${cy + 2}" x2="${cx + 4}" y2="${cy + 4}" stroke="#0369a1" stroke-width="1" />
        <circle cx="${cx + 8}" cy="${cy - 8}" r="4" fill="#f59e0b" />
        <text x="${cx + 8}" y="${cy - 6}" font-family="sans-serif" font-size="6" font-weight="900" fill="#ffffff" text-anchor="middle">★</text>
      `;

    case 'circular-pattern':
      return `
        <!-- Circular Pattern 4 items in circle -->
        <circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2 2" />
        <circle cx="${cx}" cy="${cy - 9}" r="3" fill="#0284c7" stroke="#0369a1" stroke-width="1" />
        <circle cx="${cx + 9}" cy="${cy}" r="3" fill="#0284c7" stroke="#0369a1" stroke-width="1" />
        <circle cx="${cx}" cy="${cy + 9}" r="3" fill="#0284c7" stroke="#0369a1" stroke-width="1" />
        <circle cx="${cx - 9}" cy="${cy}" r="3" fill="#0284c7" stroke="#0369a1" stroke-width="1" />
        <path d="M${cx - 4},${cy - 4} A5,5 0 0,1 ${cx + 4},${cy + 4}" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      `;

    case 'fillet':
      return `
        <!-- Fillet Curved Corner -->
        <path d="M${cx - 10},${cy - 10} L${cx - 10},${cy + 10} L${cx + 10},${cy + 10}" fill="none" stroke="#94a3b8" stroke-width="2" />
        <path d="M${cx - 10},${cy} Q${cx - 10},${cy + 10} ${cx},${cy + 10}" fill="none" stroke="#2563eb" stroke-width="3" />
        <circle cx="${cx - 4}" cy="${cy + 4}" r="1.5" fill="#dc2626" />
        <line x1="${cx - 4}" y1="${cy + 4}" x2="${cx - 9}" y2="${cy + 6}" stroke="#dc2626" stroke-width="1" />
        <text x="${cx + 3}" y="${cy - 3}" font-family="ui-monospace, monospace" font-size="8" font-weight="700" fill="#2563eb">R</text>
      `;

    case 'chamfer':
      return `
        <!-- Chamfer Beveled Corner 45 deg -->
        <path d="M${cx - 10},${cy - 10} L${cx - 10},${cy + 10} L${cx + 10},${cy + 10}" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2 2" />
        <line x1="${cx - 10}" y1="${cy}" x2="${cx}",${cy + 10} stroke="#2563eb" stroke-width="3" />
        <text x="${cx + 2}" y="${cy - 2}" font-family="ui-monospace, monospace" font-size="7" font-weight="700" fill="#2563eb">45°</text>
      `;

    case 'new-part':
      return `
        <!-- New Document / Part Template -->
        <polygon points="${cx - 10},${cy - 12} ${cx + 4},${cy - 12} ${cx + 10},${cy - 6} ${cx + 10},${cy + 12} ${cx - 10},${cy + 12}" fill="#ffffff" stroke="#0284c7" stroke-width="1.5" />
        <polygon points="${cx + 4},${cy - 12} ${cx + 4},${cy - 6} ${cx + 10},${cy - 6}" fill="#bae6fd" stroke="#0284c7" stroke-width="1" />
        <!-- Red SolidWorks cube icon -->
        <rect x="${cx - 4}" y="${cy - 1}" width="8" height="8" rx="1" fill="#dc2626" />
      `;

    case 'normal-to':
      return `
        <!-- Normal To (Ctrl+8) Glasses/Eye and Face -->
        <polygon points="${cx - 8},${cy - 8} ${cx + 8},${cy - 8} ${cx + 8},${cy + 8} ${cx - 8},${cy + 8}" fill="#e2e8f0" stroke="#0284c7" stroke-width="1.5" />
        <!-- Eye perpendicular vector -->
        <circle cx="${cx}" cy="${cy}" r="3" fill="#dc2626" />
        <circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="2 2" />
      `;

    case 'measure':
      return `
        <!-- Evaluate Measure Ruler / Tape -->
        <rect x="${cx - 12}" y="${cy - 6}" width="24" height="12" rx="2" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" />
        <line x1="${cx - 8}" y1="${cy - 6}" x2="${cx - 8}" y2="${cy - 1}" stroke="#854d0e" stroke-width="1" />
        <line x1="${cx - 4}" y1="${cy - 6}" x2="${cx - 4}" y2="${cy - 3}" stroke="#854d0e" stroke-width="1" />
        <line x1="${cx}" y1="${cy - 6}" x2="${cx}" y2="${cy - 1}" stroke="#854d0e" stroke-width="1" />
        <line x1="${cx + 4}" y1="${cy - 6}" x2="${cx + 4}" y2="${cy - 3}" stroke="#854d0e" stroke-width="1" />
        <line x1="${cx + 8}" y1="${cy - 6}" x2="${cx + 8}" y2="${cy - 1}" stroke="#854d0e" stroke-width="1" />
      `;

    default:
      return `<circle cx="${cx}" cy="${cy}" r="8" fill="#94a3b8" />`;
  }
}

// 1. New Part
createSwRibbonSvg({
  filename: 'new-part.svg',
  title: 'SolidWorks - New Part',
  activeTab: 'Features',
  toolName: 'New Part',
  shortcut: 'Ctrl+N',
  locationText: 'Hoofdwerkbalk linksboven > New (Ctrl+N) > Kies Part sjabloon',
  tools: [
    { name: 'New\nPart', iconType: 'new-part', isTarget: true },
    { name: 'Open\nDoc', iconType: 'new-part', isTarget: false },
    { name: 'Save\n(Ctrl+S)', iconType: 'new-part', isTarget: false },
    { name: 'Options\nUnits', iconType: 'measure', isTarget: false },
  ],
});

// 2. Sketch Button in Sketch tab
createSwRibbonSvg({
  filename: 'sketch.svg',
  title: 'SolidWorks - Sketch Tab',
  activeTab: 'Sketch',
  toolName: 'Sketch',
  shortcut: 'S of D',
  locationText: 'CommandManager > Tabblad Sketch > Uiterst links: Sketch knop',
  tools: [
    { name: 'Sketch', iconType: 'sketch', isTarget: true },
    { name: 'Smart\nDimension', iconType: 'smart-dimension', isTarget: false },
    { name: 'Line', iconType: 'sketch', isTarget: false },
    { name: 'Circle', iconType: 'circle', isTarget: false },
    { name: 'Corner\nRectangle', iconType: 'rectangle', isTarget: false },
  ],
});

// 3. Normal To (Ctrl+8)
createSwRibbonSvg({
  filename: 'normal-to.svg',
  title: 'SolidWorks - Heads-up View Toolbar',
  activeTab: 'Sketch',
  toolName: 'Normal To',
  shortcut: 'Ctrl+8',
  locationText: 'Heads-up View Toolbar (bovenaan model) of druk direct Ctrl+8',
  tools: [
    { name: 'Zoom to\nFit (F)', iconType: 'measure', isTarget: false },
    { name: 'Normal\nTo', iconType: 'normal-to', isTarget: true },
    { name: 'View\nOrientation', iconType: 'normal-to', isTarget: false },
    { name: 'Section\nView', iconType: 'extruded-cut', isTarget: false },
  ],
});

// 4. Smart Dimension
createSwRibbonSvg({
  filename: 'smart-dimension.svg',
  title: 'SolidWorks - Smart Dimension',
  activeTab: 'Sketch',
  toolName: 'Smart Dimension',
  shortcut: 'D of Sneltoets S',
  locationText: 'CommandManager > Tabblad Sketch > Tweede knop: Smart Dimension',
  tools: [
    { name: 'Sketch', iconType: 'sketch', isTarget: false },
    { name: 'Smart\nDimension', iconType: 'smart-dimension', isTarget: true },
    { name: 'Line', iconType: 'sketch', isTarget: false },
    { name: 'Circle', iconType: 'circle', isTarget: false },
    { name: 'Rectangle', iconType: 'rectangle', isTarget: false },
  ],
});

// 5. Circle Tool
createSwRibbonSvg({
  filename: 'circle.svg',
  title: 'SolidWorks - Circle Tool',
  activeTab: 'Sketch',
  toolName: 'Circle',
  shortcut: 'Sneltoets S > Circle',
  locationText: 'CommandManager > Tabblad Sketch > Cirkel gereedschap',
  tools: [
    { name: 'Sketch', iconType: 'sketch', isTarget: false },
    { name: 'Smart\nDimension', iconType: 'smart-dimension', isTarget: false },
    { name: 'Line', iconType: 'sketch', isTarget: false },
    { name: 'Circle', iconType: 'circle', isTarget: true },
    { name: 'Rectangle', iconType: 'rectangle', isTarget: false },
  ],
});

// 6. Rectangle Tool
createSwRibbonSvg({
  filename: 'rectangle.svg',
  title: 'SolidWorks - Corner Rectangle',
  activeTab: 'Sketch',
  toolName: 'Rectangle',
  shortcut: 'Sneltoets S > Rectangle',
  locationText: 'CommandManager > Tabblad Sketch > Corner/Center Rectangle',
  tools: [
    { name: 'Sketch', iconType: 'sketch', isTarget: false },
    { name: 'Smart\nDimension', iconType: 'smart-dimension', isTarget: false },
    { name: 'Line', iconType: 'sketch', isTarget: false },
    { name: 'Circle', iconType: 'circle', isTarget: false },
    { name: 'Corner\nRectangle', iconType: 'rectangle', isTarget: true },
  ],
});

// 7. Extruded Boss/Base
createSwRibbonSvg({
  filename: 'extruded-boss.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Extruded Boss/Base',
  shortcut: 'Features Tab > Extruded Boss',
  locationText: 'CommandManager > Tabblad Features > Uiterst links: Extruded Boss/Base',
  tools: [
    { name: 'Extruded\nBoss/Base', iconType: 'extruded-boss', isTarget: true },
    { name: 'Revolved\nBoss/Base', iconType: 'revolved-boss', isTarget: false },
    { name: 'Extruded\nCut', iconType: 'extruded-cut', isTarget: false },
    { name: 'Hole\nWizard', iconType: 'hole-wizard', isTarget: false },
    { name: 'Fillet', iconType: 'fillet', isTarget: false },
  ],
});

// 8. Revolved Boss/Base
createSwRibbonSvg({
  filename: 'revolved-boss.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Revolved Boss/Base',
  shortcut: 'Features Tab > Revolve',
  locationText: 'CommandManager > Tabblad Features > Tweede knop: Revolved Boss/Base',
  tools: [
    { name: 'Extruded\nBoss/Base', iconType: 'extruded-boss', isTarget: false },
    { name: 'Revolved\nBoss/Base', iconType: 'revolved-boss', isTarget: true },
    { name: 'Extruded\nCut', iconType: 'extruded-cut', isTarget: false },
    { name: 'Hole\nWizard', iconType: 'hole-wizard', isTarget: false },
    { name: 'Fillet', iconType: 'fillet', isTarget: false },
  ],
});

// 9. Extruded Cut
createSwRibbonSvg({
  filename: 'extruded-cut.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Extruded Cut',
  shortcut: 'Features Tab > Extruded Cut',
  locationText: 'CommandManager > Tabblad Features > Midden: Extruded Cut',
  tools: [
    { name: 'Extruded\nBoss/Base', iconType: 'extruded-boss', isTarget: false },
    { name: 'Revolved\nBoss/Base', iconType: 'revolved-boss', isTarget: false },
    { name: 'Extruded\nCut', iconType: 'extruded-cut', isTarget: true },
    { name: 'Hole\nWizard', iconType: 'hole-wizard', isTarget: false },
    { name: 'Fillet', iconType: 'fillet', isTarget: false },
  ],
});

// 10. Hole Wizard
createSwRibbonSvg({
  filename: 'hole-wizard.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Hole Wizard',
  shortcut: 'Features Tab > Hole Wizard',
  locationText: 'CommandManager > Tabblad Features > Knop: Hole Wizard',
  tools: [
    { name: 'Extruded\nBoss/Base', iconType: 'extruded-boss', isTarget: false },
    { name: 'Extruded\nCut', iconType: 'extruded-cut', isTarget: false },
    { name: 'Hole\nWizard', iconType: 'hole-wizard', isTarget: true },
    { name: 'Fillet', iconType: 'fillet', isTarget: false },
    { name: 'Linear\nPattern', iconType: 'circular-pattern', isTarget: false },
  ],
});

// 11. Circular Pattern
createSwRibbonSvg({
  filename: 'circular-pattern.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Circular Pattern',
  shortcut: 'Onder Linear Pattern pijltje',
  locationText: 'CommandManager > Tabblad Features > Dropdown Linear Pattern > Circular Pattern',
  tools: [
    { name: 'Hole\nWizard', iconType: 'hole-wizard', isTarget: false },
    { name: 'Fillet', iconType: 'fillet', isTarget: false },
    { name: 'Circular\nPattern', iconType: 'circular-pattern', isTarget: true },
    { name: 'Shell', iconType: 'extruded-boss', isTarget: false },
  ],
});

// 12. Fillet
createSwRibbonSvg({
  filename: 'fillet.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Fillet',
  shortcut: 'Features Tab > Fillet',
  locationText: 'CommandManager > Tabblad Features > Knop: Fillet',
  tools: [
    { name: 'Extruded\nCut', iconType: 'extruded-cut', isTarget: false },
    { name: 'Hole\nWizard', iconType: 'hole-wizard', isTarget: false },
    { name: 'Fillet', iconType: 'fillet', isTarget: true },
    { name: 'Chamfer', iconType: 'chamfer', isTarget: false },
    { name: 'Circular\nPattern', iconType: 'circular-pattern', isTarget: false },
  ],
});

// 13. Chamfer
createSwRibbonSvg({
  filename: 'chamfer.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Chamfer',
  shortcut: 'Pijltje onder Fillet knop',
  locationText: 'CommandManager > Tabblad Features > Klik op pijltje onder Fillet > Chamfer',
  tools: [
    { name: 'Extruded\nCut', iconType: 'extruded-cut', isTarget: false },
    { name: 'Hole\nWizard', iconType: 'hole-wizard', isTarget: false },
    { name: 'Fillet', iconType: 'fillet', isTarget: false },
    { name: 'Chamfer', iconType: 'chamfer', isTarget: true },
    { name: 'Circular\nPattern', iconType: 'circular-pattern', isTarget: false },
  ],
});

// 14. Shell
createSwRibbonSvg({
  filename: 'shell.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Shell',
  shortcut: 'Features Tab > Shell',
  locationText: "CommandManager > Tabblad Features > Knop: Shell (hol maken met wanddikte)",
  tools: [
    { name: 'Extruded\nBoss/Base', iconType: 'extruded-boss', isTarget: false },
    { name: 'Extruded\nCut', iconType: 'extruded-cut', isTarget: false },
    { name: 'Fillet', iconType: 'fillet', isTarget: false },
    { name: 'Shell', iconType: 'extruded-boss', isTarget: true },
    { name: 'Rib', iconType: 'sketch', isTarget: false },
  ],
});

// 15. Loft
createSwRibbonSvg({
  filename: 'loft.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Lofted Boss/Base',
  shortcut: 'Features Tab > Loft',
  locationText: "CommandManager > Tabblad Features > Knop: Lofted Boss/Base",
  tools: [
    { name: 'Extruded\nBoss/Base', iconType: 'extruded-boss', isTarget: false },
    { name: 'Revolved\nBoss/Base', iconType: 'revolved-boss', isTarget: false },
    { name: 'Swept\nBoss/Base', iconType: 'revolved-boss', isTarget: false },
    { name: 'Lofted\nBoss/Base', iconType: 'extruded-boss', isTarget: true },
    { name: 'Fillet', iconType: 'fillet', isTarget: false },
  ],
});

// 16. Sweep
createSwRibbonSvg({
  filename: 'sweep.svg',
  title: 'SolidWorks - Features Tab',
  activeTab: 'Features',
  toolName: 'Swept Boss/Base',
  shortcut: 'Features Tab > Sweep',
  locationText: "CommandManager > Tabblad Features > Knop: Swept Boss/Base",
  tools: [
    { name: 'Extruded\nBoss/Base', iconType: 'extruded-boss', isTarget: false },
    { name: 'Revolved\nBoss/Base', iconType: 'revolved-boss', isTarget: false },
    { name: 'Swept\nBoss/Base', iconType: 'revolved-boss', isTarget: true },
    { name: 'Fillet', iconType: 'fillet', isTarget: false },
  ],
});

// 17. Evaluate Measure / Mass Properties
createSwRibbonSvg({
  filename: 'evaluate-measure.svg',
  title: 'SolidWorks - Evaluate Tab',
  activeTab: 'Evaluate',
  toolName: 'Measure',
  shortcut: 'Evaluate Tab > Measure',
  locationText: 'CommandManager > Tabblad Evaluate > Meetlatje: Measure & Mass Properties',
  tools: [
    { name: 'Measure\n(Meetlat)', iconType: 'measure', isTarget: true },
    { name: 'Mass\nProperties', iconType: 'measure', isTarget: false },
    { name: 'Section\nView', iconType: 'normal-to', isTarget: false },
  ],
});

console.log('All SolidWorks tool ribbon SVGs created successfully!');

