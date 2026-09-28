export interface SolidWorksToolInfo {
  id: string;
  name: string;
  tab: 'Features' | 'Sketch' | 'Evaluate' | 'Bestand';
  imagePath: string;
  location: string;
  shortcut?: string;
  description: string;
}

export const SOLIDWORKS_TOOLS: Record<string, SolidWorksToolInfo> = {
  'new-part': {
    id: 'new-part',
    name: 'New (Part)',
    tab: 'Bestand',
    imagePath: '/assets/solidworks/new-part.svg',
    location: 'Hoofdmenu linksboven > File > New (of sneltoets Ctrl+N) > Part sjabloon',
    shortcut: 'Ctrl+N',
    description: 'Start een nieuw 3D-onderdeelbestand in SolidWorks.',
  },
  'sketch': {
    id: 'sketch',
    name: 'Sketch',
    tab: 'Sketch',
    imagePath: '/assets/solidworks/sketch.svg',
    location: "CommandManager > Tabblad 'Sketch' > Uiterst links de knop 'Sketch'",
    shortcut: 'S (Snelsnelkoppeling)',
    description: 'Opent een nieuwe 2D-schets op het geselecteerde vlak of oppervlak.',
  },
  'normal-to': {
    id: 'normal-to',
    name: 'Normal To',
    tab: 'Sketch',
    imagePath: '/assets/solidworks/normal-to.svg',
    location: 'Heads-up View Toolbar (bovenaan in het modelleervenster) of sneltoets Ctrl+8',
    shortcut: 'Ctrl+8',
    description: 'Draait de weergave loodrecht op het actieve ontwerpvlak voor nauwkeurig schetsen.',
  },
  'smart-dimension': {
    id: 'smart-dimension',
    name: 'Smart Dimension',
    tab: 'Sketch',
    imagePath: '/assets/solidworks/smart-dimension.svg',
    location: "CommandManager > Tabblad 'Sketch' > Knop 'Smart Dimension'",
    shortcut: 'D of Sneltoets S',
    description: 'Bemaat lijnen, cirkels, hoeken en afstanden om de schets volledig te definiëren (Fully Defined).',
  },
  'circle': {
    id: 'circle',
    name: 'Circle',
    tab: 'Sketch',
    imagePath: '/assets/solidworks/circle.svg',
    location: "CommandManager > Tabblad 'Sketch' > Cirkel gereedschap",
    shortcut: 'Sneltoets S > Circle',
    description: 'Tekent een cirkel vanuit een middelpunt naar een straalpunt.',
  },
  'rectangle': {
    id: 'rectangle',
    name: 'Corner / Center Rectangle',
    tab: 'Sketch',
    imagePath: '/assets/solidworks/rectangle.svg',
    location: "CommandManager > Tabblad 'Sketch' > Rechthoek gereedschap",
    shortcut: 'Sneltoets S > Rectangle',
    description: 'Tekent een hoek- of gecentreerde rechthoek.',
  },
  'extruded-boss': {
    id: 'extruded-boss',
    name: 'Extruded Boss/Base',
    tab: 'Features',
    imagePath: '/assets/solidworks/extruded-boss.svg',
    location: "CommandManager > Tabblad 'Features' > Eerste knop links 'Extruded Boss/Base'",
    shortcut: 'Features Tab',
    description: 'Zet een gesloten 2D-schets om in een massief 3D-volume door lineaire extrusie.',
  },
  'revolved-boss': {
    id: 'revolved-boss',
    name: 'Revolved Boss/Base',
    tab: 'Features',
    imagePath: '/assets/solidworks/revolved-boss.svg',
    location: "CommandManager > Tabblad 'Features' > Tweede knop 'Revolved Boss/Base'",
    shortcut: 'Features Tab > Revolve',
    description: 'Roteert een gesloten schetsprofiel rond een centrale hartlijn (Centerline).',
  },
  'extruded-cut': {
    id: 'extruded-cut',
    name: 'Extruded Cut',
    tab: 'Features',
    imagePath: '/assets/solidworks/extruded-cut.svg',
    location: "CommandManager > Tabblad 'Features' > Midden 'Extruded Cut'",
    shortcut: 'Features Tab > Extruded Cut',
    description: 'Snijdt materiaal weg uit een bestaand 3D-lichaam conform een schetscontour.',
  },
  'hole-wizard': {
    id: 'hole-wizard',
    name: 'Hole Wizard',
    tab: 'Features',
    imagePath: '/assets/solidworks/hole-wizard.svg',
    location: "CommandManager > Tabblad 'Features' > Knop 'Hole Wizard'",
    shortcut: 'Features Tab > Hole Wizard',
    description: 'Genereert gestandaardiseerde schroefdraad-, verzonken of doorlopende gaten volgens ISO/DIN normen.',
  },
  'circular-pattern': {
    id: 'circular-pattern',
    name: 'Circular Pattern',
    tab: 'Features',
    imagePath: '/assets/solidworks/circular-pattern.svg',
    location: "CommandManager > Tabblad 'Features' > Pijltje onder Linear Pattern > 'Circular Pattern'",
    shortcut: 'Pattern Dropdown',
    description: 'Dupliceert features (zoals montagegaten) gelijkmatig rond een centrale referentie-as.',
  },
  'shell': {
    id: 'shell',
    name: 'Shell',
    tab: 'Features',
    imagePath: '/assets/solidworks/shell.svg',
    location: "CommandManager > Tabblad 'Features' > Knop 'Shell'",
    shortcut: 'Features Tab > Shell',
    description: 'Holt een massief 3D-volume uit met een constante wanddikte en opent eventueel gekozen vlakken.',
  },
  'loft': {
    id: 'loft',
    name: 'Lofted Boss/Base',
    tab: 'Features',
    imagePath: '/assets/solidworks/loft.svg',
    location: "CommandManager > Tabblad 'Features' > Knop 'Lofted Boss/Base'",
    shortcut: 'Features Tab > Loft',
    description: 'Vloeit geleidelijk over tussen twee of meer verschillende schetsprofielen op parallelle vlakken.',
  },
  'sweep': {
    id: 'sweep',
    name: 'Swept Boss/Base',
    tab: 'Features',
    imagePath: '/assets/solidworks/sweep.svg',
    location: "CommandManager > Tabblad 'Features' > Knop 'Swept Boss/Base'",
    shortcut: 'Features Tab > Sweep',
    description: 'Trekt een 2D-profiel uit langs een geleidebaan (open of gesloten pad/kromme).',
  },
  'fillet': {
    id: 'fillet',
    name: 'Fillet',
    tab: 'Features',
    imagePath: '/assets/solidworks/fillet.svg',
    location: "CommandManager > Tabblad 'Features' > Knop 'Fillet'",
    shortcut: 'Features Tab > Fillet',
    description: 'Rondt scherpe randen en binnenhoeken af met een gespecificeerde straal (R).',
  },
  'chamfer': {
    id: 'chamfer',
    name: 'Chamfer',
    tab: 'Features',
    imagePath: '/assets/solidworks/chamfer.svg',
    location: "CommandManager > Tabblad 'Features' > Klik op het pijltje onder 'Fillet' > 'Chamfer'",
    shortcut: 'Fillet menu > Chamfer',
    description: 'Brengt een schuine kant (afschuining, bijv. 1x45°) aan op geselecteerde randen.',
  },
  'evaluate-measure': {
    id: 'evaluate-measure',
    name: 'Measure & Section View',
    tab: 'Evaluate',
    imagePath: '/assets/solidworks/evaluate-measure.svg',
    location: "CommandManager > Tabblad 'Evaluate' > Meetlatje 'Measure' en 'Mass Properties'",
    shortcut: 'Evaluate Tab',
    description: 'Controleer maten, wanddiktes, doorsnedes en volumemassa van het model.',
  },
};

/**
 * Matches any text to find the best matching SolidWorks tool info
 */
export function findSolidWorksTool(text: string): SolidWorksToolInfo | null {
  if (!text) return null;
  const lower = text.toLowerCase();

  if (lower.includes('new') || lower.includes('nieuw part') || lower.includes('part sjabloon')) {
    return SOLIDWORKS_TOOLS['new-part'];
  }
  if (lower.includes('smart dimension') || lower.includes('dimension') || lower.includes('bemat')) {
    return SOLIDWORKS_TOOLS['smart-dimension'];
  }
  if (lower.includes('normal to') || lower.includes('ctrl+8')) {
    return SOLIDWORKS_TOOLS['normal-to'];
  }
  if (lower.includes('revolved boss') || lower.includes('revolve')) {
    return SOLIDWORKS_TOOLS['revolved-boss'];
  }
  if (lower.includes('extruded cut') || lower.includes('cut-extrude') || lower.includes('cut')) {
    return SOLIDWORKS_TOOLS['extruded-cut'];
  }
  if (lower.includes('extruded boss') || lower.includes('boss/base') || lower.includes('extrude')) {
    return SOLIDWORKS_TOOLS['extruded-boss'];
  }
  if (lower.includes('hole wizard') || lower.includes('hole') || lower.includes('tapgat') || lower.includes('boring')) {
    return SOLIDWORKS_TOOLS['hole-wizard'];
  }
  if (lower.includes('circular pattern') || lower.includes('pattern') || lower.includes('patroon')) {
    return SOLIDWORKS_TOOLS['circular-pattern'];
  }
  if (lower.includes('chamfer') || lower.includes('afschuin')) {
    return SOLIDWORKS_TOOLS['chamfer'];
  }
  if (lower.includes('fillet') || lower.includes('afronding')) {
    return SOLIDWORKS_TOOLS['fillet'];
  }
  if (lower.includes('circle') || lower.includes('cirkel')) {
    return SOLIDWORKS_TOOLS['circle'];
  }
  if (lower.includes('rectangle') || lower.includes('rechthoek')) {
    return SOLIDWORKS_TOOLS['rectangle'];
  }
  if (lower.includes('sketch') || lower.includes('schets')) {
    return SOLIDWORKS_TOOLS['sketch'];
  }
  if (lower.includes('measure') || lower.includes('mass') || lower.includes('section view') || lower.includes('doorsnede')) {
    return SOLIDWORKS_TOOLS['evaluate-measure'];
  }

  return null;
}
