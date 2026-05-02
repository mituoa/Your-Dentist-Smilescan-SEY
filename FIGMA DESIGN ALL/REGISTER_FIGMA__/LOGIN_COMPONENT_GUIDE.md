# SmileScan Login Component - Design Guide

## Overview

Production-ready login page for SmileScan dental practice management platform. Features a modern glass-morphism design with soft gradients and decorative elements that convey medical professionalism and trustworthiness.

## File Structure

```
src/app/components/auth/
├── Login.tsx              # Main login component
└── LoginExamples.tsx      # State examples & integration guide
```

## Visual Design

### Layout
- **Full-screen background**: Soft gradient (blue-purple spectrum) with decorative blurred blobs
- **Centered card**: Glass-morphism effect, max-width 380px, backdrop blur
- **Single column**: All elements stacked vertically for clarity

### Block Order (DO NOT CHANGE)
1. Title: "Login"
2. Disabled Google button: "Mit Google anmelden (bald)"
3. Divider: "Oder mit E-Mail anmelden"
4. Conditional error banner (only when error exists)
5. Login form (email + password fields)
6. Register link row

### Color Palette

```css
/* Background Gradient */
from-blue-50      /* #eff6ff */
via-white         /* #ffffff */
to-purple-50      /* #faf5ff */

/* Decorative Blobs */
bg-blue-200/40    /* rgba(191, 219, 254, 0.4) */
bg-purple-200/40  /* rgba(233, 213, 255, 0.4) */
bg-indigo-200/30  /* rgba(199, 210, 254, 0.3) */

/* Auth Card */
bg-white/80       /* rgba(255, 255, 255, 0.8) */
backdrop-blur-xl

/* Primary Action (Button) */
bg-blue-600       /* #2563eb */
hover:bg-blue-700 /* #1d4ed8 */

/* Links */
text-blue-600     /* #2563eb */
hover:text-blue-700
```

### Typography
- **Title**: 2xl (24px), semibold, gray-900
- **Body text**: sm (14px), regular, gray-600
- **Labels**: sm (14px), medium, gray-700
- **Error text**: sm (14px), red-600

### Spacing
- **Card padding**: 2rem (32px)
- **Element gaps**: 1rem (16px) between major sections
- **Input fields**: 0.5rem (8px) between label and input

## States

### 1. Default State
- All fields empty
- Submit button enabled
- No error banner
- Google button disabled with "(bald)" text

### 2. Focus State
- Input fields: border-ring, ring-ring/50, bg-white
- Submit button: focus-visible ring
- Links: underline on hover

### 3. Loading State
- Submit button shows "Anmelden..."
- All inputs disabled
- Form submission prevented

### 4. Error State
- Red destructive alert banner appears above form
- Alert includes AlertCircle icon
- Error message displayed
- Form remains editable

### 5. With Invite Token
- Hidden input field with invite_token value
- Forgot-password link includes invite + email params
- Register link includes invite param

## Responsive Behavior

### Mobile (< 640px)
- Card: full width minus padding (16px on each side)
- Touch targets: minimum 44px height
- Larger text inputs for easier typing

### Tablet (640px - 1024px)
- Card: centered, max-width 380px
- Standard spacing maintained

### Desktop (> 1024px)
- Same as tablet
- Decorative blobs more visible
- Hover states more prominent

## Integration Points

### Required Props
```typescript
interface LoginProps {
  inviteToken?: string | null;
}
```

### Server Action Contract
```typescript
async function signIn(data: {
  email: string;
  password: string;
  invite_token: string | null;
}): Promise<void>
```

### Navigation URLs

**Forgot Password**
- Base: `/forgot-password`
- With invite: `/forgot-password?invite=TOKEN&email=EMAIL`

**Register**
- Base: `/register`
- With invite: `/register?invite=TOKEN`

## Customization Guide

### Changing Brand Colors

Replace blue-600/700 with your primary color throughout:

```tsx
// Find and replace in Login.tsx
bg-blue-600 → bg-[your-color]-600
hover:bg-blue-700 → hover:bg-[your-color]-700
text-blue-600 → text-[your-color]-600
```

### Adjusting Background

Current: Soft blue-purple gradient
Medical/Clinical: Use teal-cyan-blue
Tech/Modern: Use slate-blue-indigo
Warm/Friendly: Use orange-yellow-pink

```tsx
// Background gradient
from-blue-50 via-white to-purple-50

// Replace with:
from-teal-50 via-white to-cyan-50      // Clinical
from-slate-50 via-white to-blue-50     // Tech
from-orange-50 via-white to-pink-50    // Warm
```

### Card Style Variants

**More Transparent** (lighter feel):
```tsx
bg-white/60 backdrop-blur-2xl
```

**Solid** (traditional form):
```tsx
bg-white backdrop-blur-none
```

**Darker** (modern/tech):
```tsx
bg-gray-900/90 backdrop-blur-xl text-white
```

### Removing Decorative Blobs

If you prefer a cleaner look without the blurred blobs:

```tsx
// Remove these divs from Login.tsx
<div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
<div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
```

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ Proper label associations (htmlFor/id)
- ✅ ARIA role="alert" on error banner
- ✅ Keyboard navigation support
- ✅ Focus indicators on all interactive elements
- ✅ Required field validation
- ✅ Disabled state clearly indicated
- ✅ Color contrast meets WCAG AA standards

## Testing Checklist

### Visual Testing
- [ ] Default state renders correctly
- [ ] Error banner appears/disappears properly
- [ ] Loading state shows spinner text
- [ ] Focus states visible on all inputs
- [ ] Hover states work on buttons and links
- [ ] Disabled Google button clearly not clickable

### Functional Testing
- [ ] Email validation (HTML5 type="email")
- [ ] Password field hides characters
- [ ] Submit requires both fields filled
- [ ] Error clears on re-submit
- [ ] Invite token included in form when present
- [ ] Forgot-password link includes correct params
- [ ] Register link includes invite when available

### Responsive Testing
- [ ] Mobile (375px): card fits screen, touch targets adequate
- [ ] Tablet (768px): card centered, readable
- [ ] Desktop (1440px): decorative blobs visible, layout balanced

### Browser Testing
- [ ] Chrome/Edge: glass-morphism renders correctly
- [ ] Firefox: backdrop-blur supported
- [ ] Safari: iOS Safari form inputs work
- [ ] Check autofill styling compatibility

## Performance Notes

- Component is "use client" (client-side React)
- Minimal dependencies (only UI components + lucide-react icons)
- No heavy images or animations
- CSS backdrop-blur is GPU-accelerated
- Form state managed locally (no global state needed)

## Common Issues & Solutions

### Issue: Backdrop blur not working
**Solution**: Ensure browser supports backdrop-filter. Add fallback:
```tsx
bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80
```

### Issue: Gradient looks different on mobile
**Solution**: Mobile browsers may render gradients slightly differently. Test on actual devices, not just DevTools.

### Issue: Invite token not persisting through navigation
**Solution**: Verify URL parameter parsing in App.tsx matches your routing library (Next.js, React Router, etc.)

### Issue: Focus ring cut off by overflow
**Solution**: Add padding to parent container or use outline instead of ring:
```tsx
focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring
```

## Version History

**v1.0** (Current)
- Initial production-ready implementation
- Glass-morphism design
- Full invite-aware navigation
- All states implemented
- Responsive mobile/tablet/desktop
- Comprehensive documentation

## Next Steps

1. **Integrate with actual auth backend** - Replace mock signIn function
2. **Add analytics tracking** - Track login attempts, errors, conversions
3. **Implement OAuth** - Enable Google button when OAuth configured
4. **Add password strength indicator** - For better security
5. **Remember me checkbox** - Optional persistent login
6. **Social proof** - Add testimonial or trust badge below form
7. **Loading skeleton** - Pre-render form structure for faster perceived load

## Support

For questions or customization help, refer to:
- LoginExamples.tsx - Integration patterns
- SmileScan design system docs
- Tailwind CSS documentation
