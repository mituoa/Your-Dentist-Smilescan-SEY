/**
 * use_figma — Step 1: Page shell + section placeholders
 * skillNames: figma-use,figma-generate-design
 * fileKey: pInIifbClMMZ8rTEJ6dtns (or target file after create_new_file)
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

for (const f of Object.values(FONTS)) {
  await figma.loadFontAsync(f);
}

const PAGE_W = 1440;
const CONTENT_W = 1200;
const MARGIN = (PAGE_W - CONTENT_W) / 2;

let startX = 0;
for (const child of figma.currentPage.children) {
  if ("x" in child && "width" in child) {
    startX = Math.max(startX, child.x + child.width + 120);
  }
}

const page = figma.createFrame();
page.name = "Public Homepage — Desktop 1440";
page.resize(PAGE_W, 4200);
page.x = startX;
page.y = 0;
page.fills = [
  {
    type: "GRADIENT_LINEAR",
    gradientTransform: [
      [0.2, 0.98, 0],
      [-0.98, 0.2, 0.5],
    ],
    gradientStops: [
      { position: 0, color: { ...c("#F8FBFE"), a: 1 } },
      { position: 0.44, color: { ...c("#F1F7FC"), a: 1 } },
      { position: 1, color: { ...c("#E8F1F8"), a: 1 } },
    ],
  },
];
page.layoutMode = "VERTICAL";
page.primaryAxisAlignItems = "MIN";
page.counterAxisAlignItems = "CENTER";
page.itemSpacing = 0;
page.paddingTop = 0;
page.paddingBottom = 96;
page.paddingLeft = 0;
page.paddingRight = 0;
page.clipsContent = false;

const glow = figma.createEllipse();
glow.name = "Hero glow";
glow.resize(520, 320);
glow.x = PAGE_W - 380;
glow.y = 80;
glow.fills = [
  {
    type: "SOLID",
    color: { ...c("#2F80ED"), a: 0.08 },
  },
];
glow.effects = [{ type: "LAYER_BLUR", radius: 80, visible: true }];
page.appendChild(glow);

const content = figma.createFrame();
content.name = "Content column";
content.resize(CONTENT_W, 4000);
content.layoutMode = "VERTICAL";
content.itemSpacing = 96;
content.paddingTop = 0;
content.paddingBottom = 0;
content.paddingLeft = 0;
content.paddingRight = 0;
content.fills = [];
content.strokes = [];
content.layoutSizingHorizontal = "FIXED";
content.layoutSizingVertical = "HUG";
page.appendChild(content);

const slots = [
  "slot-header",
  "slot-hero",
  "slot-problem",
  "slot-functions",
  "slot-praxen",
  "slot-einfuehrung",
  "slot-pricing",
  "slot-demo",
  "slot-footer",
];

const createdNodeIds = [page.id, content.id, glow.id];
for (const name of slots) {
  const slot = figma.createFrame();
  slot.name = name;
  slot.resize(CONTENT_W, 40);
  slot.fills = [];
  slot.strokes = [];
  slot.layoutMode = "VERTICAL";
  slot.layoutSizingHorizontal = "FILL";
  slot.layoutSizingVertical = "HUG";
  content.appendChild(slot);
  createdNodeIds.push(slot.id);
}

return {
  createdNodeIds,
  pageId: page.id,
  contentId: content.id,
  slotIds: Object.fromEntries(
    slots.map((n) => [
      n,
      content.children.find((ch) => ch.name === n)?.id,
    ])
  ),
  startX,
};
