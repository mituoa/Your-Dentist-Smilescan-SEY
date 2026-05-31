/**
 * use_figma — Step 4: Für Praxen + Einführung
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
const slotPraxen = content?.findOne((n) => n.name === "slot-praxen");
const slotEinf = content?.findOne((n) => n.name === "slot-einfuehrung");
if (!slotPraxen || !slotEinf) throw new Error("Slots missing");

const createdNodeIds = [];
const mutatedNodeIds = [slotPraxen.id, slotEinf.id];

function clearSlot(slot) {
  for (const child of [...slot.children]) child.remove();
}
function text(parent, chars, size, font, color) {
  const t = figma.createText();
  t.fontName = font;
  t.fontSize = size;
  t.fills = [{ type: "SOLID", color: c(color) }];
  t.characters = chars;
  parent.appendChild(t);
  t.layoutSizingHorizontal = "HUG";
  t.layoutSizingVertical = "HUG";
  createdNodeIds.push(t.id);
  return t;
}

// Für Praxen
clearSlot(slotPraxen);
slotPraxen.layoutMode = "VERTICAL";
slotPraxen.itemSpacing = 36;
text(slotPraxen, "Für Praxen", 11, FONTS.medium, "#8BA3B8");
text(slotPraxen, "Für jede Praxisgröße", 28, FONTS.semibold, "#0C1929");

const praxenRow = figma.createFrame();
praxenRow.layoutMode = "HORIZONTAL";
praxenRow.itemSpacing = 20;
praxenRow.fills = [];
slotPraxen.appendChild(praxenRow);
praxenRow.layoutSizingHorizontal = "FILL";
createdNodeIds.push(praxenRow.id);

const audiences = [
  ["Einzelpraxis", "Mehr Struktur ohne mehr Personal."],
  ["Mehrbehandlerpraxis / MVZ", "Einheitliche Abläufe über Teams und Standorte."],
  ["Rezeption & Assistenz", "Klare Aufgaben statt Nachfragen."],
];
for (const [title, body] of audiences) {
  const card = figma.createFrame();
  card.layoutMode = "VERTICAL";
  card.itemSpacing = 10;
  card.paddingLeft = 24;
  card.paddingRight = 24;
  card.paddingTop = 28;
  card.paddingBottom = 28;
  card.cornerRadius = 24;
  card.fills = [{ type: "SOLID", color: { ...c("#FFFFFF"), a: 0.9 } }];
  card.strokes = [{ type: "SOLID", color: { ...c("#B4C6DA"), a: 0.4 } }];
  card.strokeWeight = 1;
  praxenRow.appendChild(card);
  text(card, title, 16, FONTS.semibold, "#0C1929");
  text(card, body, 14, FONTS.regular, "#5E7389");
  card.layoutSizingHorizontal = "FILL";
  createdNodeIds.push(card.id);
}

// Einführung
clearSlot(slotEinf);
slotEinf.layoutMode = "VERTICAL";
slotEinf.itemSpacing = 28;
text(slotEinf, "Einführung", 11, FONTS.medium, "#8BA3B8");
text(slotEinf, "Kein Großprojekt.", 28, FONTS.semibold, "#0C1929");
text(
  slotEinf,
  "Wir richten den Praxisbereich kontrolliert ein und begleiten den Start im Team.",
  15,
  FONTS.regular,
  "#3D5266"
);

const steps = figma.createFrame();
steps.layoutMode = "HORIZONTAL";
steps.itemSpacing = 0;
steps.primaryAxisAlignItems = "SPACE_BETWEEN";
steps.fills = [];
slotEinf.appendChild(steps);
steps.layoutSizingHorizontal = "FILL";
createdNodeIds.push(steps.id);

const stepData = [
  ["1", "Analyse"],
  ["2", "Einrichtung"],
  ["3", "Teamstart"],
  ["4", "Begleitung"],
];
stepData.forEach(([num, label], i) => {
  const step = figma.createFrame();
  step.layoutMode = "VERTICAL";
  step.itemSpacing = 8;
  step.counterAxisAlignItems = "CENTER";
  step.fills = [];
  steps.appendChild(step);
  const circle = figma.createEllipse();
  circle.resize(40, 40);
  circle.fills = [{ type: "SOLID", color: { ...c("#2F80ED"), a: 0.12 } }];
  step.appendChild(circle);
  const numT = figma.createText();
  numT.fontName = FONTS.semibold;
  numT.fontSize = 16;
  numT.fills = [{ type: "SOLID", color: c("#2F80ED") }];
  numT.characters = num;
  numT.x = 14;
  numT.y = 10;
  step.appendChild(numT);
  text(step, label, 14, FONTS.medium, "#0C1929");
  step.layoutSizingHorizontal = "HUG";
  createdNodeIds.push(step.id, circle.id, numT.id);
  if (i < stepData.length - 1) {
    const line = figma.createFrame();
    line.resize(120, 2);
    line.fills = [{ type: "SOLID", color: { ...c("#B4C6DA"), a: 0.5 } }];
    steps.appendChild(line);
    line.layoutSizingHorizontal = "HUG";
    createdNodeIds.push(line.id);
  }
});

return { createdNodeIds, mutatedNodeIds, pageId: pageFrame.id };
