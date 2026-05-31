/**
 * use_figma — Step 5: Preise + Demo + Footer
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
const slotPricing = content?.findOne((n) => n.name === "slot-pricing");
const slotDemo = content?.findOne((n) => n.name === "slot-demo");
const slotFooter = content?.findOne((n) => n.name === "slot-footer");
if (!slotPricing || !slotDemo || !slotFooter) throw new Error("Slots missing");

const createdNodeIds = [];
const mutatedNodeIds = [slotPricing.id, slotDemo.id, slotFooter.id];

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
function primaryBtn(parent, label) {
  const b = figma.createFrame();
  b.layoutMode = "HORIZONTAL";
  b.paddingLeft = 20;
  b.paddingRight = 20;
  b.paddingTop = 12;
  b.paddingBottom = 12;
  b.cornerRadius = 12;
  b.fills = [{ type: "SOLID", color: c("#2F80ED") }];
  parent.appendChild(b);
  text(b, label, 14, FONTS.medium, "#FFFFFF");
  b.layoutSizingHorizontal = "HUG";
  createdNodeIds.push(b.id);
  return b;
}

// Pricing
clearSlot(slotPricing);
slotPricing.layoutMode = "VERTICAL";
slotPricing.itemSpacing = 36;
text(slotPricing, "Preise", 11, FONTS.medium, "#8BA3B8");
text(slotPricing, "Transparente Praxiszugänge", 28, FONTS.semibold, "#0C1929");

const tiers = figma.createFrame();
tiers.layoutMode = "HORIZONTAL";
tiers.itemSpacing = 20;
tiers.fills = [];
slotPricing.appendChild(tiers);
tiers.layoutSizingHorizontal = "FILL";
createdNodeIds.push(tiers.id);

const tierData = [
  ["Professional", "Für Einzelpraxen und kleine Teams"],
  ["Enterprise", "Für MVZ und mehrere Standorte"],
  ["Pilotphase", "Begleiteter Start auf Anfrage"],
];
for (const [name, desc] of tierData) {
  const card = figma.createFrame();
  card.layoutMode = "VERTICAL";
  card.itemSpacing = 12;
  card.paddingLeft = 28;
  card.paddingRight = 28;
  card.paddingTop = 32;
  card.paddingBottom = 32;
  card.cornerRadius = 24;
  card.fills = [{ type: "SOLID", color: { ...c("#FFFFFF"), a: 0.92 } }];
  card.strokes = [{ type: "SOLID", color: { ...c("#B4C6DA"), a: 0.45 } }];
  card.strokeWeight = 1;
  tiers.appendChild(card);
  text(card, name, 18, FONTS.semibold, "#0C1929");
  text(card, desc, 14, FONTS.regular, "#5E7389");
  text(card, "Auf Anfrage", 13, FONTS.medium, "#8BA3B8");
  card.layoutSizingHorizontal = "FILL";
  createdNodeIds.push(card.id);
}

const priceCtas = figma.createFrame();
priceCtas.layoutMode = "HORIZONTAL";
priceCtas.itemSpacing = 12;
priceCtas.fills = [];
slotPricing.appendChild(priceCtas);
primaryBtn(priceCtas, "Zugang anfordern");
const ghost = figma.createFrame();
ghost.layoutMode = "HORIZONTAL";
ghost.paddingLeft = 20;
ghost.paddingRight = 20;
ghost.paddingTop = 12;
ghost.paddingBottom = 12;
ghost.cornerRadius = 12;
ghost.fills = [];
ghost.strokes = [{ type: "SOLID", color: { ...c("#B4C6DA"), a: 0.55 } }];
ghost.strokeWeight = 1;
priceCtas.appendChild(ghost);
text(ghost, "Demo buchen", 14, FONTS.medium, "#3D5266");
ghost.layoutSizingHorizontal = "HUG";
createdNodeIds.push(priceCtas.id, ghost.id);

// Demo
clearSlot(slotDemo);
slotDemo.layoutMode = "VERTICAL";
slotDemo.itemSpacing = 20;
slotDemo.paddingLeft = 48;
slotDemo.paddingRight = 48;
slotDemo.paddingTop = 48;
slotDemo.paddingBottom = 48;
slotDemo.cornerRadius = 32;
slotDemo.fills = [{ type: "SOLID", color: { ...c("#FFFFFF"), a: 0.75 } }];
slotDemo.strokes = [{ type: "SOLID", color: { ...c("#B4C6DA"), a: 0.35 } }];
slotDemo.strokeWeight = 1;
text(slotDemo, "Einen Praxisablauf ansehen", 24, FONTS.semibold, "#0C1929");
text(
  slotDemo,
  "Wir zeigen in einem kurzen Einblick, wie Patienteneingänge, Command AI, Relay und Aufgaben in einem Praxisbereich zusammenspielen.",
  15,
  FONTS.regular,
  "#3D5266"
);
primaryBtn(slotDemo, "Demo buchen");

// Footer
clearSlot(slotFooter);
slotFooter.layoutMode = "VERTICAL";
slotFooter.itemSpacing = 16;
slotFooter.paddingTop = 32;
const footRow = figma.createFrame();
footRow.layoutMode = "HORIZONTAL";
footRow.primaryAxisAlignItems = "SPACE_BETWEEN";
footRow.counterAxisAlignItems = "CENTER";
footRow.fills = [];
slotFooter.appendChild(footRow);
footRow.layoutSizingHorizontal = "FILL";
createdNodeIds.push(footRow.id);

const footLeft = figma.createFrame();
footLeft.layoutMode = "VERTICAL";
footLeft.itemSpacing = 4;
footLeft.fills = [];
footRow.appendChild(footLeft);
text(footLeft, "Your Dentist", 14, FONTS.semibold, "#0C1929");
text(footLeft, "Neutral Practice Platform", 12, FONTS.regular, "#8BA3B8");
footLeft.layoutSizingHorizontal = "HUG";
createdNodeIds.push(footLeft.id);

const links = figma.createFrame();
links.layoutMode = "HORIZONTAL";
links.itemSpacing = 24;
links.fills = [];
footRow.appendChild(links);
["Datenschutz", "Impressum", "Kontakt", "Anmelden"].forEach((l) =>
  text(links, l, 13, FONTS.regular, "#5E7389")
);
links.layoutSizingHorizontal = "HUG";
createdNodeIds.push(links.id);

// Resize page to hug content
pageFrame.layoutMode = "VERTICAL";
pageFrame.layoutSizingVertical = "HUG";

return {
  createdNodeIds,
  mutatedNodeIds,
  pageId: pageFrame.id,
  fileUrl: "https://www.figma.com/design/pInIifbClMMZ8rTEJ6dtns/SS",
};
