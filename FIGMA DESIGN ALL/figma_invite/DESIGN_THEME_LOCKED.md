# SmileScan Design Theme - LOCKED ✅

## 🎨 Premium (Slate-Blue) Theme

**ALLE zukünftigen Seiten verwenden dieses Theme.**

---

## Farben

### Primary Colors
```css
/* Primary Button & Actions */
bg-slate-700       /* #334155 */
hover:bg-slate-800 /* #1e293b */
text-white

/* Primary Links */
text-slate-700     /* #334155 */
hover:text-slate-900 /* #0f172a */
```

### Background Gradients (für Auth-Seiten)
```css
/* Main Gradient */
from-slate-50 via-white to-blue-50

/* Decorative Blobs */
bg-slate-300/40    /* rgba(203, 213, 225, 0.4) */
bg-blue-300/40     /* rgba(147, 197, 253, 0.4) */
bg-indigo-300/30   /* rgba(165, 180, 252, 0.3) */
```

### Card & Surface
```css
/* Glass-morphism Cards (Auth pages) */
bg-white/80 backdrop-blur-xl

/* Solid Cards (App pages) */
bg-white border border-gray-200

/* Input Fields */
bg-white/70 border-gray-200
focus:bg-white focus:border-slate-500
```

### Text
```css
/* Headings */
text-gray-900 (titles)
text-slate-900 (brand heading)

/* Body */
text-gray-600 (primary body)
text-gray-500 (helper text)
text-muted-foreground (secondary)
```

### Status Colors
```css
/* Error / Destructive */
text-destructive
bg-destructive/10
border-destructive

/* Success */
text-green-800
bg-green-50
border-green-200

/* Warning */
text-orange-800
bg-orange-50
border-orange-200

/* Info */
text-blue-800
bg-blue-50
border-blue-200
```

---

## Typography

### Headings
```css
/* H1 - Page Title */
text-2xl md:text-3xl font-semibold

/* H2 - Section Title */
text-xl font-semibold

/* H3 - Subsection */
text-lg font-medium

/* Brand Heading (SmileScan) */
text-3xl font-semibold text-slate-900 tracking-tight
```

### Body Text
```css
/* Default */
text-base font-normal

/* Small */
text-sm

/* Extra Small */
text-xs
```

### Labels
```css
text-sm font-medium
```

---

## Spacing

### Container Padding
```css
/* Card Padding */
p-8 (32px)

/* Mobile Container */
p-4 (16px)

/* Desktop Container */
p-6 md:p-8 (24px → 32px)
```

### Element Gaps
```css
/* Section Gaps */
space-y-6 md:space-y-8 (24px → 32px)

/* Form Field Gaps */
space-y-4 (16px)

/* Label to Input */
space-y-2 (8px)

/* Inline Elements */
gap-2 (8px)
gap-3 (12px)
gap-4 (16px)
```

---

## Components

### Buttons

**Primary:**
```tsx
className="bg-slate-700 hover:bg-slate-800 text-white h-10 px-6 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
```

**Secondary:**
```tsx
className="bg-secondary hover:bg-secondary/80 text-secondary-foreground h-10 px-6 rounded-md font-medium transition-colors"
```

**Outline:**
```tsx
className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 h-10 px-6 rounded-md font-medium transition-colors"
```

**Ghost:**
```tsx
className="hover:bg-gray-100 text-gray-900 h-10 px-6 rounded-md font-medium transition-colors"
```

**Disabled:**
```tsx
disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
```

### Inputs

**Text/Email/Password:**
```tsx
className="bg-white/70 border border-gray-200 h-10 px-3 rounded-md text-base focus:bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
```

**With Error:**
```tsx
className="... border-destructive focus:border-destructive focus:ring-destructive/20"
```

### Links

**Primary:**
```tsx
className="text-slate-700 hover:text-slate-900 hover:underline transition-colors"
```

**Secondary (muted):**
```tsx
className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
```

### Cards

**Glass-morphism (Auth pages):**
```tsx
className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/5 border border-white/20 p-8"
```

**Solid (App pages):**
```tsx
className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
```

**Card with Title:**
```tsx
<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
  <div className="p-4 border-b bg-gray-50">
    <h3 className="font-semibold">Title</h3>
  </div>
  <div className="p-6">Content</div>
</div>
```

### Alerts

**Error (Destructive):**
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Message</AlertDescription>
</Alert>
```

**Success:**
```tsx
<Alert className="bg-green-50 border-green-200 text-green-800">
  <CheckCircle2 className="h-4 w-4 text-green-600" />
  <AlertDescription>Message</AlertDescription>
</Alert>
```

**Info:**
```tsx
<Alert className="bg-blue-50 border-blue-200 text-blue-800">
  <Info className="h-4 w-4 text-blue-600" />
  <AlertDescription>Message</AlertDescription>
</Alert>
```

### Info Boxes (Invite, etc.)

**Default (Slate):**
```tsx
<div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
  <div className="flex gap-3">
    <Info className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-slate-700">
      <p>Message</p>
    </div>
  </div>
</div>
```

---

## Layout Patterns

### Auth Pages (Login, Register, Forgot)
```tsx
<div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
  {/* Background gradient + blobs */}
  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
  <div className="absolute top-0 left-0 w-96 h-96 bg-slate-300/40 rounded-full blur-3xl" />
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl" />
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl" />
  
  {/* Card */}
  <div className="relative w-full max-w-[380px|448px|500px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/5 border border-white/20 p-8">
    {/* Content */}
  </div>
</div>
```

### App Pages (Dashboard, Inbox, etc.)
```tsx
<div className="min-h-screen bg-gray-50">
  {/* Optional: Sidebar/Header */}
  
  <main className="p-4 md:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      {/* Page Content */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {/* ... */}
      </div>
    </div>
  </main>
</div>
```

---

## Responsive Breakpoints

```css
/* Tailwind Default Breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices (large desktops) */
2xl: 1536px /* 2X Extra large devices */
```

### Common Patterns
```tsx
/* Text Size */
className="text-base md:text-lg"

/* Padding */
className="p-4 md:p-6 lg:p-8"

/* Grid Columns */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

/* Hidden/Visible */
className="hidden md:block"  /* Hide on mobile, show on tablet+ */
className="block md:hidden"  /* Show on mobile, hide on tablet+ */
```

---

## Focus States

**All interactive elements MUST have visible focus states:**

```css
/* Focus Ring (default) */
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-slate-500
focus-visible:ring-offset-2

/* Focus with Border Change */
focus:border-slate-500
focus:ring-2
focus:ring-slate-500/20
```

---

## Animations

### Transitions
```css
/* Default */
transition-colors

/* With Duration */
transition-all duration-200

/* Custom */
transition-[property] duration-[time] ease-[function]
```

### Hover States
```css
/* Button */
hover:bg-slate-800

/* Link */
hover:underline

/* Card */
hover:shadow-md
```

---

## Accessibility

### Required Attributes
```tsx
/* Labels */
<Label htmlFor="field-id">Label</Label>
<Input id="field-id" />

/* Buttons */
<Button type="submit">Submit</Button>
<Button type="button" disabled>Disabled</Button>

/* Links */
<a href="/path">Link text</a>

/* Images */
<img src="..." alt="Description" />
```

### ARIA
```tsx
/* Alerts */
<Alert role="alert">

/* Loading */
<div role="status" aria-live="polite">Loading...</div>

/* Hidden */
<div aria-hidden="true">Decorative</div>
```

---

## Dark Mode Support

**Note:** Currently not implemented, but prepared with semantic tokens.

When implementing, use:
```tsx
/* Light mode (default) */
bg-white text-gray-900

/* Dark mode */
dark:bg-gray-900 dark:text-white

/* With semantic tokens */
bg-background text-foreground
bg-card text-card-foreground
```

---

## Brand Assets

### Logo
- SVG preferred
- Responsive sizing
- Color: Slate-900 or match theme

### SmileScan Text
```css
font-family: serif (system default) or custom brand font
font-weight: 600 (semibold)
color: slate-900
tracking: tight
```

---

## Do's and Don'ts

### ✅ Do:
- Use semantic color tokens (primary, destructive, muted)
- Maintain consistent spacing (4px/8px/16px/24px/32px grid)
- Use consistent border radius (rounded-md, rounded-lg, rounded-2xl)
- Include focus states on all interactive elements
- Test on mobile, tablet, desktop
- Use disabled states that are clearly visible
- Include loading states for async actions
- Show helpful error messages in German

### ❌ Don't:
- Use random colors outside the palette
- Mix different spacing values (stick to grid)
- Forget focus states
- Use tiny text (<12px / text-xs minimum)
- Create inaccessible color contrasts
- Hide important actions on mobile
- Use placeholders instead of labels
- Skip loading/error states

---

## Quick Copy-Paste Snippets

### Full Auth Page Template
```tsx
<div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
  <div className="absolute top-0 left-0 w-96 h-96 bg-slate-300/40 rounded-full blur-3xl" />
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl" />
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl" />
  
  <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/5 border border-white/20 p-8">
    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Title</h1>
    {/* Content */}
  </div>
</div>
```

### Form Field
```tsx
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input
    id="field"
    type="text"
    placeholder="Placeholder"
    className="bg-white/70 border-gray-200 focus:bg-white transition-colors"
  />
</div>
```

### Primary Button
```tsx
<Button
  type="submit"
  className="w-full bg-slate-700 hover:bg-slate-800 text-white"
  disabled={isLoading}
>
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

---

**Status:** LOCKED ✅  
**Applies to:** ALL future SmileScan pages  
**Last Updated:** Current session

This theme will be maintained consistently across all 30 pages.
