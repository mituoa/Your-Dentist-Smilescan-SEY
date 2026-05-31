/**
 * use_figma — Step 2: Header + Hero + product visual
 * Requires: 01-page-shell.js output (pageId, slotIds)
 * Pass pageId and slot-header, slot-hero IDs via agent context from step 1 return.
 */
const c = (hex) => {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
};

const FONTS = {
  regular: { family: "Inter", style: "Regular" },
  medium: { family: "Inter", style: "Medium" },
  semibold: { family: "Inter", style: "Semi Bold" },
};
for (const f of Object.values(FONTS)) await figma.loadFontAsync(f);

const PAGE_NAME = "Public Homepage — Desktop 1440";
const pageFrame = figma.currentPage.findOne(
  (n) => n.type === "FRAME" && n.name === PAGE_NAME
);
if (!pageFrame) throw new Error(`Frame not found: ${PAGE_NAME}`);

const content = pageFrame.findOne((n) => n.name === "Content column");
const slotHeader = content?.findOne((n) => n.name === "slot-header");
const slotHero = content?.findOne((n) => n.name === "slot-hero");
if (!slotHeader || !slotHero) throw new Error("Slots missing — run 01-page-shell.js first");

const createdNodeIds = [];
const mutatedNodeIds = [slotHeader.id, slotHero.id];

function clearSlot(slot) {
  for (const child of [...slot.children]) child.remove();
}

function text(
  parent,
  chars,
  size,
  font,
  color,
  opts = {}
) {
  const t = figma.createText();
  t.fontName = font;
  t.fontSize = size;
  t.fills = [{ type: "SOLID", color: c(color) }];
  t.characters = chars;
  if (opts.lineHeight) t.lineHeight = { value: opts.lineHeight, unit: "PIXELS" };
  if (opts.letterSpacing) t.letterSpacing = { value: opts.letterSpacing, unit: "PERCENT" };
  parent.appendChild(t);
  t.layoutSizingHorizontal = opts.width === "FILL" ? "FILL" : "HUG";
  t.layoutSizingVertical = "HUG";
  if (opts.maxWidth) {
    t.textAutoResize = "HEIGHT";
    t.resize(opts.maxWidth, t.height);
  }
  createdNodeIds.push(t.id);
  return t;
}

function btn(parent, label, variant) {
  const b = figma.createFrame();
  b.name = `CTA ${label}`;
  b.layoutMode = "HORIZONTAL";
  b.primaryAxisAlignItems = "CENTER";
  b.counterAxisAlignItems = "CENTER";
  b.paddingLeft = 20;
  b.paddingRight = 20;
  b.paddingTop = 12;
  b.paddingBottom = 12;
  b.cornerRadius = 12;
  if (variant === "primary") {
    b.fills = [{ type: "SOLID", color: c("#2F80ED") }];
    b.effects = [
      {
        type: "DROP_SHADOW",
        color: { ...c("#2F80ED"), a: 0.22 },
        offset: { x: 0, y: 6 },
        radius: 16,
        visible: true,
      },
    ];
    text(b, label, 14, FONTS.medium, "#FFFFFF");
  } else {
    b.fills = [{ type: "SOLID", color: { ...c("#FFFFFF"), a: 0.72 } }];
    b.strokes = [{ type: "SOLID", color: { ...c("#B4C6DA"), a: 0.55 } }];
    b.strokeWeight = 1;
    text(b, label, 14, FONTS.medium, "#3D5266");
  }
  parent.appendChild(b);
  b.layoutSizingHorizontal = "HUG";
  b.layoutSizingVertical = "HUG";
  createdNodeIds.push(b.id);
  return b;
}

// —— Header ——
clearSlot(slotHeader);
slotHeader.layoutMode = "VERTICAL";
slotHeader.itemSpacing = 0;
slotHeader.resize(1200, 72);

const header = figma.createFrame();
header.name = "Header";
header.resize(1200, 72);
header.layoutMode = "HORIZONTAL";
header.primaryAxisAlignItems = "SPACE_BETWEEN";
header.counterAxisAlignItems = "CENTER";
header.fills = [{ type: "SOLID", color: { ...c("#F8FBFE"), a: 0.92 } }];
header.strokes = [];
header.paddingLeft = 0;
header.paddingRight = 0;
slotHeader.appendChild(header);
header.layoutSizingHorizontal = "FILL";
createdNodeIds.push(header.id);

const brand = figma.createFrame();
brand.layoutMode = "VERTICAL";
brand.itemSpacing = 2;
brand.fills = [];
header.appendChild(brand);
text(brand, "Your Dentist", 18, FONTS.semibold, "#0F172A");
text(brand, "Neutral Practice Platform", 10, FONTS.regular, "#8BA3B8");
brand.layoutSizingHorizontal = "HUG";
createdNodeIds.push(brand.id);

const nav = figma.createFrame();
nav.layoutMode = "HORIZONTAL";
nav.itemSpacing = 28;
nav.fills = [];
header.appendChild(nav);
[
  "Lösung",
  "Funktionen",
  "Für Praxen",
  "Preise",
  "Einführung",
].forEach((label) => text(nav, label, 14, FONTS.medium, "#3D5266"));
nav.layoutSizingHorizontal = "HUG";
createdNodeIds.push(nav.id);

const actions = figma.createFrame();
actions.layoutMode = "HORIZONTAL";
actions.itemSpacing = 16;
actions.counterAxisAlignItems = "CENTER";
actions.fills = [];
header.appendChild(actions);
btn(actions, "Demo buchen", "ghost");
text(actions, "Anmelden", 14, FONTS.medium, "#2F80ED");
actions.layoutSizingHorizontal = "HUG";
createdNodeIds.push(actions.id);

// —— Hero ——
clearSlot(slotHero);
slotHero.layoutMode = "VERTICAL";
slotHero.itemSpacing = 0;

const heroRow = figma.createFrame();
heroRow.name = "Hero row";
heroRow.resize(1200, 520);
heroRow.layoutMode = "HORIZONTAL";
heroRow.itemSpacing = 48;
heroRow.counterAxisAlignItems = "CENTER";
heroRow.fills = [];
slotHero.appendChild(heroRow);
heroRow.layoutSizingHorizontal = "FILL";
createdNodeIds.push(heroRow.id);

const heroCopy = figma.createFrame();
heroCopy.layoutMode = "VERTICAL";
heroCopy.itemSpacing = 20;
heroCopy.fills = [];
heroCopy.resize(560, 480);
heroRow.appendChild(heroCopy);
heroCopy.layoutSizingHorizontal = "FILL";
createdNodeIds.push(heroCopy.id);

text(heroCopy, "PRAXISBETRIEBSSYSTEM", 11, FONTS.medium, "#8BA3B8", {
  letterSpacing: 8,
});
text(
  heroCopy,
  "Patientenanfragen.\nDirekt verstanden.\nSicher organisiert.",
  40,
  FONTS.semibold,
  "#0C1929",
  { lineHeight: 44, maxWidth: 520 }
);
text(
  heroCopy,
  "Patient:innen senden Anliegen und Bilder sicher an Ihre Praxis. Your Dentist strukturiert den Fall, bereitet nächste Schritte vor und verbindet Behandlung, Team und Kommunikation.",
  15,
  FONTS.regular,
  "#3D5266",
  { lineHeight: 22, maxWidth: 500 }
);

const ctaRow = figma.createFrame();
ctaRow.layoutMode = "HORIZONTAL";
ctaRow.itemSpacing = 12;
ctaRow.fills = [];
heroCopy.appendChild(ctaRow);
btn(ctaRow, "Demo buchen", "primary");
btn(ctaRow, "Zugang anfordern", "ghost");
ctaRow.layoutSizingHorizontal = "HUG";
createdNodeIds.push(ctaRow.id);

text(
  heroCopy,
  "Bereits registriert? Anmelden",
  13,
  FONTS.regular,
  "#5E7389"
);

// Product visual
const visual = figma.createFrame();
visual.name = "Hero product moment";
visual.resize(480, 420);
visual.cornerRadius = 32;
visual.layoutMode = "VERTICAL";
visual.itemSpacing = 14;
visual.paddingLeft = 28;
visual.paddingRight = 28;
visual.paddingTop = 28;
visual.paddingBottom = 28;
visual.fills = [
  {
    type: "GRADIENT_LINEAR",
    gradientTransform: [
      [0, 1, 0],
      [1, 0, 0],
    ],
    gradientStops: [
      { position: 0, color: { ...c("#FFFFFF"), a: 1 } },
      { position: 0.48, color: { ...c("#F8FBFE"), a: 1 } },
      { position: 1, color: { ...c("#EFF5FA"), a: 1 } },
    ],
  },
];
visual.strokes = [{ type: "SOLID", color: { ...c("#FFFFFF"), a: 0.72 } }];
visual.strokeWeight = 1;
visual.effects = [
  {
    type: "DROP_SHADOW",
    color: { ...c("#1E5BBD"), a: 0.1 },
    offset: { x: 0, y: 12 },
    radius: 36,
    visible: true,
  },
  {
    type: "INNER_SHADOW",
    color: { ...c("#FFFFFF"), a: 0.9 },
    offset: { x: 0, y: 1 },
    radius: 0,
    visible: true,
  },
];
heroRow.appendChild(visual);
visual.layoutSizingHorizontal = "HUG";
createdNodeIds.push(visual.id);

text(visual, "Neue Anfrage", 11, FONTS.medium, "#8BA3B8", { letterSpacing: 6 });
text(visual, "Sila Özmen", 20, FONTS.semibold, "#0C1929");
text(visual, "Schmerzen Unterkiefer", 14, FONTS.regular, "#5E7389");

const checks = figma.createFrame();
checks.layoutMode = "VERTICAL";
checks.itemSpacing = 8;
checks.fills = [];
visual.appendChild(checks);
[
  "Fotos erhalten",
  "Ersteinschätzung vorbereitet",
  "Antwortentwurf erstellt",
].forEach((line) => {
  const row = figma.createFrame();
  row.layoutMode = "HORIZONTAL";
  row.itemSpacing = 8;
  row.fills = [];
  checks.appendChild(row);
  text(row, "✓", 13, FONTS.medium, "#22C55E");
  text(row, line, 13, FONTS.regular, "#3D5266");
  row.layoutSizingHorizontal = "HUG";
  createdNodeIds.push(row.id);
});
checks.layoutSizingHorizontal = "FILL";
createdNodeIds.push(checks.id);

btn(visual, "Freigeben", "primary");

const cmd = figma.createFrame();
cmd.name = "Command AI block";
cmd.layoutMode = "VERTICAL";
cmd.itemSpacing = 8;
cmd.paddingLeft = 16;
cmd.paddingRight = 16;
cmd.paddingTop = 14;
cmd.paddingBottom = 14;
cmd.cornerRadius = 16;
cmd.fills = [{ type: "SOLID", color: c("#F2F7FB") }];
visual.appendChild(cmd);
text(cmd, "Command AI", 10, FONTS.medium, "#8BA3B8", { letterSpacing: 4 });
text(cmd, "„Rückruf an Rezeption übergeben“", 13, FONTS.regular, "#0C1929");
cmd.layoutSizingHorizontal = "FILL";
createdNodeIds.push(cmd.id);

const taskRow = figma.createFrame();
taskRow.layoutMode = "HORIZONTAL";
taskRow.itemSpacing = 8;
taskRow.fills = [];
visual.appendChild(taskRow);
text(taskRow, "✓", 13, FONTS.medium, "#22C55E");
text(taskRow, "Aufgabe erstellt", 13, FONTS.regular, "#3D5266");
taskRow.layoutSizingHorizontal = "HUG";
createdNodeIds.push(taskRow.id);

return { createdNodeIds, mutatedNodeIds, pageId: pageFrame.id };
