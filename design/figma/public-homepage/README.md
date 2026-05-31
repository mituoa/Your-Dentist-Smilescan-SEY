# Public Homepage — Figma Build

Premium medical SaaS landing page for **Your Dentist** (public `/` only).

## Files

| File | Purpose |
|------|---------|
| [YOUR-DENTIST-PUBLIC-HOMEPAGE-SPEC.md](./YOUR-DENTIST-PUBLIC-HOMEPAGE-SPEC.md) | Full copy, layout, tokens, QA checklist |
| `scripts/01-page-shell.js` … `05-…` | Incremental `use_figma` scripts |

## Prerequisites

1. **Figma MCP connected** in Cursor (approve `mcp_auth` for `plugin-figma-figma`).
2. Open target file: [SS on Figma](https://www.figma.com/design/pInIifbClMMZ8rTEJ6dtns/SS)  
   Or create: `create_new_file` → `Your Dentist — Public Homepage`.

## Build order

Run each script body via **`use_figma`** with:

- `fileKey`: `pInIifbClMMZ8rTEJ6dtns` (or your new file key)
- `skillNames`: `figma-use,figma-generate-design`
- `code`: contents of the `.js` file (without the comment header block if the tool expects raw plugin code)

1. `01-page-shell.js`
2. `02-header-hero.js`
3. `03-sections-problem-functions.js`
4. `04-sections-praxen-einfuehrung.js`
5. `05-sections-pricing-demo-footer.js`

Then capture **`get_screenshot`** on frame `Public Homepage — Desktop 1440`.

## Design choices (locked)

- **Hero headline:** Option A — *Patientenanfragen. Direkt verstanden. Sicher organisiert.*
- **Nav:** Lösung · Funktionen · Für Praxen · Preise · Einführung · Demo buchen · Anmelden
- **Hero visual:** Single Sila Özmen case card + Command AI + Freigeben
- **No** dashboard, login, or register screens in this frame

## After Figma

Optional: align live site copy in `lib/marketing/public-site-ia.ts` to this spec in a separate task (code change, not required for Figma).
