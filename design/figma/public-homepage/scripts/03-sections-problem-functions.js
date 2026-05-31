/**
 * use_figma — Step 3: Problem + Funktionen
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
const slotProblem = content?.findOne((n) => n.name === "slot-problem");
const slotFunctions = content?.findOne((n) => n.name === "slot-functions");
if (!slotProblem || !slotFunctions) throw new Error("Slots missing");

const createdNodeIds = [];
const mutatedNodeIds = [slotProblem.id, slotFunctions.id];

function clearSlot(slot) {
  for (const child of [...slot.children]) child.remove();
}
function text(parent, chars, size, font, color, opts = {}) {
  const t = figma.createText();
  t.fontName = font;
  t.fontSize = size;
  t.fills = [{ type: "SOLID", color: c(color) }];
  t.characters = chars;
  if (opts.lineHeight) t.lineHeight = { value: opts.lineHeight, unit: "PIXELS" };
  parent.appendChild(t);
  t.layoutSizingHorizontal = "HUG";
  t.layoutSizingVertical = "HUG";
  createdNodeIds.push(t.id);
  return t;
}
function featureCard(parent, title, body, iconChar) {
  const card = figma.createFrame();
  card.layoutMode = "VERTICAL";
  card.itemSpacing = 12;
  card.paddingLeft = 24;
  card.paddingRight = 24;
  card.paddingTop = 24;
  card.paddingBottom = 24;
  card.cornerRadius = 24;
  card.fills = [
    {
      type: "GRADIENT_LINEAR",
      gradientTransform: [
        [0, 1, 0],
        [1, 0, 0],
      ],
      gradientStops: [
        { position: 0, color: { ...c("#FFFFFF"), a: 1 } },
        { position: 1, color: { ...c("#EFF5FA"), a: 1 } },
      ],
    },
  ];
  card.effects = [
    {
      type: "DROP_SHADOW",
      color: { ...c("#1E5BBD"), a: 0.06 },
      offset: { x: 0, y: 8 },
      radius: 24,
      visible: true,
    },
  ];
  parent.appendChild(card);
  const icon = figma.createFrame();
  icon.resize(36, 36);
  icon.cornerRadius = 12;
  icon.fills = [{ type: "SOLID", color: { ...c("#2F80ED"), a: 0.1 } }];
  icon.layoutMode = "HORIZONTAL";
  icon.primaryAxisAlignItems = "CENTER";
  icon.counterAxisAlignItems = "CENTER";
  card.appendChild(icon);
  text(icon, iconChar, 16, FONTS.medium, "#2F80ED");
  text(card, title, 17, FONTS.semibold, "#0C1929", { lineHeight: 22 });
  text(card, body, 14, FONTS.regular, "#5E7389", { lineHeight: 20 });
  card.layoutSizingHorizontal = "FILL";
  createdNodeIds.push(card.id);
  return card;
}

// Problem
clearSlot(slotProblem);
slotProblem.layoutMode = "VERTICAL";
slotProblem.itemSpacing = 32;
text(slotProblem, "Was heute verloren geht", 28, FONTS.semibold, "#0C1929", {
  lineHeight: 34,
});

const problemCols = figma.createFrame();
problemCols.layoutMode = "HORIZONTAL";
problemCols.itemSpacing = 48;
problemCols.fills = [];
slotProblem.appendChild(problemCols);
problemCols.layoutSizingHorizontal = "FILL";
createdNodeIds.push(problemCols.id);

const left = figma.createFrame();
left.layoutMode = "VERTICAL";
left.itemSpacing = 12;
left.fills = [];
problemCols.appendChild(left);
[
  "Patientenfotos in WhatsApp",
  "Rückrufe auf Zetteln",
  "Übergaben zwischen Türen",
  "vergessene Nachrichten",
].forEach((line) => text(left, `· ${line}`, 15, FONTS.regular, "#5E7389"));
left.layoutSizingHorizontal = "FILL";
createdNodeIds.push(left.id);

const right = figma.createFrame();
right.layoutMode = "VERTICAL";
right.itemSpacing = 12;
right.paddingLeft = 32;
right.paddingRight = 32;
right.paddingTop = 28;
right.paddingBottom = 28;
right.cornerRadius = 24;
right.fills = [{ type: "SOLID", color: { ...c("#FFFFFF"), a: 0.85 } }];
right.strokes = [{ type: "SOLID", color: { ...c("#B4C6DA"), a: 0.35 } }];
right.strokeWeight = 1;
problemCols.appendChild(right);
text(right, "Mit Your Dentist", 13, FONTS.medium, "#2F80ED");
[
  "ein Eingang",
  "ein Fallverlauf",
  "ein Team",
  "eine Entscheidung",
].forEach((line) => text(right, `✓ ${line}`, 15, FONTS.medium, "#0C1929"));
right.layoutSizingHorizontal = "FILL";
createdNodeIds.push(right.id);

// Funktionen
clearSlot(slotFunctions);
slotFunctions.layoutMode = "VERTICAL";
slotFunctions.itemSpacing = 40;
text(slotFunctions, "Funktionen", 11, FONTS.medium, "#8BA3B8", { letterSpacing: 6 });
text(slotFunctions, "Vier Säulen im Praxisalltag", 28, FONTS.semibold, "#0C1929");

const grid = figma.createFrame();
grid.layoutMode = "HORIZONTAL";
grid.layoutWrap = "WRAP";
grid.itemSpacing = 20;
grid.counterAxisSpacing = 20;
grid.fills = [];
grid.resize(1200, 400);
slotFunctions.appendChild(grid);
grid.layoutSizingHorizontal = "FILL";
createdNodeIds.push(grid.id);

const cards = [
  ["◎", "Patientenanfragen strukturiert erfassen", "Fotos, Symptome, Verlauf und nächster Schritt bleiben an einem Ort.", "Tracker"],
  ["◇", "Ein Satz. Die Arbeit vorbereitet.", "Patient informieren, Aufgabe erstellen oder Team benachrichtigen — Command AI bereitet den nächsten Schritt vor.", "Command AI"],
  ["◈", "Kommunikation bleibt beim Fall", "Rückfragen, Übergaben und Aufgaben bleiben im Zusammenhang des Patientenfalls.", "Relay"],
  ["▣", "Jede Entscheidung nachvollziehbar", "Antworten, Aufgaben und interne Schritte bleiben sauber dokumentiert.", "Journal"],
];
for (const [icon, title, body, label] of cards) {
  const wrap = figma.createFrame();
  wrap.resize(580, 180);
  wrap.layoutMode = "VERTICAL";
  wrap.fills = [];
  grid.appendChild(wrap);
  featureCard(wrap, title, body, icon);
  text(wrap, label, 10, FONTS.medium, "#8BA3B8", { letterSpacing: 4 });
  wrap.layoutSizingHorizontal = "FIXED";
  createdNodeIds.push(wrap.id);
}

return { createdNodeIds, mutatedNodeIds, pageId: pageFrame.id };
