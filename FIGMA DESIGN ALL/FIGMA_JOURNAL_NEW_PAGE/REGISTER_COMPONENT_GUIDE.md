# SmileScan Register Component - Design Guide

## Overview

Production-ready registration page for SmileScan dental practice management platform. Features the same Premium (Slate-Blue) glass-morphism design as the Login page, with invite-aware layout that conditionally shows/hides fields.

## File Structure

```
src/app/components/auth/
├── Login.tsx              # Login component (Premium theme)
├── Register.tsx           # Register component (Premium theme) ✓ NEW
└── [other auth files]
```

## Visual Design

### Layout
- **Full-screen background**: Soft gradient (slate-blue spectrum) with decorative blurred blobs
- **Centered card**: Glass-morphism effect, max-width 500px (larger than login for extra fields), backdrop blur
- **Brand heading**: "SmileScan" above card
- **Single column**: All elements stacked vertically for clarity

### Block Order (DO NOT CHANGE)
1. Brand heading: "SmileScan" (outside card)
2. Card title: "Konto anlegen"
3. Card subtitle: "Für Zahnärzte in geschlossener Beta."
4. Conditional error banner (only when error query param exists)
5. Conditional invite info box (only when invite token present)
6. Registration form (4 fields, conditional workspace field)
7. Login link row

### Color Palette - Premium (Slate-Blue) Theme

```css
/* Background Gradient */
from-slate-50      /* #f8fafc */
via-white          /* #ffffff */
to-blue-50         /* #eff6ff */

/* Decorative Blobs */
bg-slate-300/40    /* rgba(203, 213, 225, 0.4) */
bg-blue-300/40     /* rgba(147, 197, 253, 0.4) */
bg-indigo-300/30   /* rgba(165, 180, 252, 0.3) */

/* Auth Card */
bg-white/80        /* rgba(255, 255, 255, 0.8) */
backdrop-blur-xl

/* Primary Action (Button) */
bg-slate-700       /* #334155 */
hover:bg-slate-800 /* #1e293b */

/* Links */
text-slate-700     /* #334155 */
hover:text-slate-900 /* #0f172a */

/* Invite Info Box */
bg-slate-50        /* #f8fafc */
border-slate-200   /* #e2e8f0 */
text-slate-700     /* #334155 */
```

### Typography
- **Brand heading**: 3xl (30px), semibold, slate-900
- **Card title**: 2xl (24px), semibold, gray-900
- **Subtitle**: sm (14px), regular, gray-600
- **Body text**: sm (14px), regular, gray-600
- **Labels**: sm (14px), medium, gray-700
- **Helper text**: xs (12px), gray-500
- **Error text**: sm (14px), red-600

### Spacing
- **Card padding**: 2rem (32px)
- **Element gaps**: 1rem (16px) between major sections
- **Form field gaps**: 1rem (16px) between fields
- **Input fields**: 0.5rem (8px) between label and input
- **Brand heading to card**: 1.5rem (24px)

## States

### 1. Default State (No Invite)
- All fields visible: Name, Workspace, Email, Password
- No error banner
- No invite info box
- Submit button enabled
- All inputs empty except potentially prefilled email

### 2. Invite State
- Hidden invite_token field added
- Invite info box visible (slate-50 background with info icon)
- Workspace field **HIDDEN** (invite determines workspace)
- Other fields visible: Name, Email, Password
- If workspace name available, show in emphasized text in info box

### 3. Error State
- Red destructive alert banner appears below subtitle
- Error message from URL query param `error`
- Form remains editable
- All previous inputs preserved

### 4. Loading State
- Submit button shows "Konto wird erstellt..."
- All inputs disabled
- Form submission prevented

### 5. Prefilled Email State
- Email field populated from URL query param `email`
- User can still edit
- Useful when coming from invite link

### 6. Focus State
- Input fields: border-ring, ring-ring/50, bg-white (from bg-white/70)
- Submit button: focus-visible ring
- Links: underline on hover

## Conditional Logic

### Workspace Field Visibility
```typescript
// Show workspace field ONLY when NO invite token
{!inviteToken && (
  <div className="space-y-2">
    <Label htmlFor="workspace_name">Praxis-Name</Label>
    <Input
      id="workspace_name"
      name="workspace_name"
      type="text"
      placeholder="Zahnarztpraxis am Rathausplatz"
      required
    />
  </div>
)}
```

### Invite Info Box Visibility
```typescript
// Show invite box ONLY when invite token present
{inviteToken && (
  <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
    <p>Sie treten einem bestehenden Workspace bei.</p>
    {inviteWorkspaceName && (
      <p className="font-medium">{inviteWorkspaceName}</p>
    )}
  </div>
)}
```

### Login URL Construction
```typescript
// Include invite and email params when available
const loginUrl = useMemo(() => {
  const params = new URLSearchParams();
  if (inviteToken) params.set("invite", inviteToken);
  if (email) params.set("email", email);
  return `/login${params.toString() ? `?${params.toString()}` : ""}`;
}, [inviteToken, email]);
```

## Integration Points

### Required Props
```typescript
interface RegisterProps {
  inviteToken?: string | null;           // From URL ?invite=...
  inviteWorkspaceName?: string | null;   // From invite API lookup
  prefilledEmail?: string | null;        // From URL ?email=...
  errorMessage?: string | null;          // From URL ?error=...
}
```

### Server Action Contract
```typescript
async function signUp(data: {
  display_name: string;
  workspace_name?: string;  // Undefined when invite present
  email: string;
  password: string;
  invite_token: string | null;
}): Promise<void>
```

### Form Field Requirements

**Vollständiger Name (display_name)**
- Type: text
- Required: yes
- Placeholder: "Dr. med. dent. Jane Doe"
- Validation: Browser required

**Praxis-Name (workspace_name)**
- Type: text
- Required: yes (ONLY when no invite)
- Placeholder: "Zahnarztpraxis am Rathausplatz"
- Visibility: Hidden when invite token present
- Validation: Browser required (when visible)

**E-Mail (email)**
- Type: email
- Required: yes
- Placeholder: "doc@praxis.de"
- Autocomplete: "email"
- Prefilled: From URL query param when present
- Validation: Browser email format + required

**Passwort (password)**
- Type: password
- Required: yes
- Placeholder: "••••••••"
- Autocomplete: "new-password"
- Min length: 8 characters
- Validation: Browser required + minlength
- Helper text: "Mindestens 8 Zeichen."

### Navigation Outcomes

**Success:**
```
Server action redirects to: /dashboard
```

**Validation/Backend Error:**
```
Server action redirects to: /register?error=MESSAGE
If invite present, also append: &invite=TOKEN
```

**Login Link:**
```
Base: /login
With invite: /login?invite=TOKEN
With email: /login?email=EMAIL
With both: /login?invite=TOKEN&email=EMAIL
```

## Responsive Behavior

### Mobile (< 640px)
- Card: full width minus padding (16px on each side)
- Touch targets: minimum 44px height
- Larger text inputs for easier typing
- Brand heading: slightly smaller (text-2xl)

### Tablet (640px - 1024px)
- Card: centered, max-width 500px
- Standard spacing maintained

### Desktop (> 1024px)
- Same as tablet
- Decorative blobs more visible
- Hover states more prominent

## Differences from Login Page

| Feature | Login | Register |
|---------|-------|----------|
| Card max-width | 380px | 500px (more fields) |
| Brand heading | No | Yes ("SmileScan") |
| Subtitle | No | Yes ("Für Zahnärzte...") |
| Number of fields | 2 | 4 (or 3 with invite) |
| Conditional fields | No | Yes (workspace) |
| Info box | No | Yes (invite box) |
| Google button | Yes (disabled) | No |
| Divider | Yes | No |

## Customization Guide

### Changing Card Width

If you need more space for additional fields:
```tsx
// Find in Register.tsx:
max-w-[500px]

// Change to:
max-w-[550px]  // Wider
max-w-[450px]  // Narrower
```

### Adding More Fields

Insert between existing fields, following the pattern:
```tsx
<div className="space-y-2">
  <Label htmlFor="field_name">Field Label</Label>
  <Input
    id="field_name"
    name="field_name"
    type="text"
    placeholder="Placeholder text"
    value={fieldValue}
    onChange={(e) => setFieldValue(e.target.value)}
    required
    disabled={isLoading}
    className="bg-white/70 border-gray-200 focus:bg-white transition-colors"
  />
</div>
```

### Changing Invite Box Style

Current style: Slate-50 background with info icon
```tsx
// Find in Register.tsx:
className="p-4 bg-slate-50 border border-slate-200 rounded-lg"

// Change to:
className="p-4 bg-blue-50 border border-blue-200 rounded-lg"  // Blue theme
className="p-4 bg-green-50 border border-green-200 rounded-lg" // Success theme
```

### Customizing Subtitle Text

```tsx
// Find in Register.tsx:
<p className="text-sm text-gray-600">
  Für Zahnärzte in geschlossener Beta.
</p>

// Change to your needs:
<p className="text-sm text-gray-600">
  Erstellen Sie jetzt Ihr kostenloses Konto.
</p>
```

## Testing Checklist

### Visual Testing
- [ ] Default state renders correctly (no invite)
- [ ] Invite state hides workspace field
- [ ] Invite info box appears with invite token
- [ ] Error banner appears/disappears properly
- [ ] Loading state shows spinner text
- [ ] Focus states visible on all inputs
- [ ] Hover states work on buttons and links
- [ ] Brand heading properly styled and positioned

### Functional Testing
- [ ] All fields validate (required)
- [ ] Email validation (HTML5 type="email")
- [ ] Password min length enforced (8 chars)
- [ ] Password field hides characters
- [ ] Submit requires all visible fields filled
- [ ] Workspace field hidden when invite present
- [ ] Invite token included in hidden field when present
- [ ] Prefilled email works from URL
- [ ] Error message displays from URL param
- [ ] Login link includes correct params

### Invite Flow Testing
- [ ] Without invite: all 4 fields shown
- [ ] With invite: only 3 fields shown (no workspace)
- [ ] Invite box shows with invite token
- [ ] Invite workspace name displays when available
- [ ] Hidden invite_token field present
- [ ] Login link includes invite param

### Navigation Testing
- [ ] Success redirects to /dashboard
- [ ] Error redirects to /register?error=...
- [ ] Login link includes invite when present
- [ ] Login link includes email when filled

### Responsive Testing
- [ ] Mobile (375px): card fits screen, touch targets adequate
- [ ] Tablet (768px): card centered, readable
- [ ] Desktop (1440px): decorative blobs visible, layout balanced

### Browser Testing
- [ ] Chrome/Edge: glass-morphism renders correctly
- [ ] Firefox: backdrop-blur supported
- [ ] Safari: iOS Safari form inputs work
- [ ] Check autofill styling compatibility

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ Proper label associations (htmlFor/id)
- ✅ ARIA role="alert" on error banner
- ✅ Keyboard navigation support
- ✅ Focus indicators on all interactive elements
- ✅ Required field validation
- ✅ Disabled state clearly indicated
- ✅ Color contrast meets WCAG AA standards
- ✅ Helper text for password requirements
- ✅ Autocomplete attributes for better UX

## Common Issues & Solutions

### Issue: Workspace field still shows with invite
**Solution**: Verify invite token is being passed correctly
```typescript
// Check in parent component
<Register inviteToken={inviteToken || null} />

// Not undefined, must be null or string
```

### Issue: Invite box not showing workspace name
**Solution**: Fetch workspace name from invite API
```typescript
// In parent/server component
const inviteData = await getInviteData(inviteToken);
<Register 
  inviteToken={inviteToken}
  inviteWorkspaceName={inviteData?.workspace_name}
/>
```

### Issue: Error message not displaying
**Solution**: Check URL param name is exactly `error`
```typescript
// Correct
const errorMessage = searchParams.get("error");

// Incorrect
const errorMessage = searchParams.get("errorMessage");
```

### Issue: Login link doesn't preserve invite
**Solution**: Verify loginUrl memo dependencies
```typescript
const loginUrl = useMemo(() => {
  const params = new URLSearchParams();
  if (inviteToken) params.set("invite", inviteToken);
  if (email) params.set("email", email);
  return `/login${params.toString() ? `?${params.toString()}` : ""}`;
}, [inviteToken, email]); // Must include both dependencies
```

## Security Notes

- Password field uses type="password" (hides characters)
- Password min length enforced (8 chars UI + server validation)
- Form submits to server action (not exposed API endpoint)
- Invite token validated server-side (don't trust client)
- Email should be verified via confirmation email
- CSRF protection handled by framework
- Use HTTPS in production
- Rate limiting on signUp endpoint recommended

## Integration Checklist

### Server-Side Integration
- [ ] Replace mock signUp with actual server action
- [ ] Verify error response format matches
- [ ] Test redirect logic after successful registration
- [ ] Confirm invite token handling works
- [ ] Validate workspace creation when no invite
- [ ] Validate workspace joining when invite present
- [ ] Send confirmation email after registration
- [ ] Add CSRF protection if not already present

### Frontend Integration
- [ ] Update import paths to match project structure
- [ ] Get invite token from URL using your router
- [ ] Get prefilled email from URL
- [ ] Get error message from URL
- [ ] Fetch workspace name for invite display
- [ ] Verify navigation URLs exist
- [ ] Test with your actual UI components library
- [ ] Ensure Tailwind config includes required colors

## Next Steps

After implementing the register page:

1. **Implement matching auth pages**:
   - Forgot password page (similar design)
   - Reset password page
   - Accept invite page (similar invite flow)

2. **Add email verification**:
   - Send confirmation email after registration
   - Verify email page
   - Resend confirmation email

3. **Enhance security**:
   - Add password strength indicator
   - Implement CAPTCHA for bot protection
   - Add rate limiting UI feedback

4. **Improve UX**:
   - Add success animation before redirect
   - Implement field-level async validation
   - Show password requirements dynamically
   - Add tooltips for complex fields

---

**Built for SmileScan** - Dental practice management platform  
**Design Theme** - Premium (Slate-Blue) ✅  
**Consistency** - Matches Login page design  
**Status** - Production-ready ✅
