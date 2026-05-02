# SmileScan Login Page - Cursor Implementation Prompt

**Copy this prompt into Cursor AI when you're ready to implement the login page in your actual SmileScan project.**

---

## PROMPT FOR CURSOR AI

I need to implement a production-ready login page for SmileScan dental practice management platform at route `/login`. Use the reference implementation and design specifications below.

### DESIGN REFERENCE
[ATTACH: Screenshot of the login page from this Figma Make preview]

### COMPONENT LOCATION
Create file: `src/app/(auth)/login/page.tsx` (adjust path based on your routing structure)

### EXACT REQUIREMENTS

**Layout & Visual Design:**
1. Full-screen background with soft gradient (from-blue-50 via-white to-purple-50)
2. Three decorative blurred blobs (blue, purple, indigo with 40/30% opacity)
3. Centered glass-morphism card: max-width 380px, white/80 background, backdrop-blur-xl
4. Card padding: 2rem (32px), rounded-2xl, shadow-2xl

**Block Order (MUST NOT CHANGE):**
1. Title: "Login" (text-2xl, font-semibold, centered)
2. Disabled Google button: "Mit Google anmelden (bald)" with Google SVG icon
3. Divider: "Oder mit E-Mail anmelden"
4. Conditional error banner (only when error exists)
5. Login form with email and password fields
6. Register link row: "Noch kein Konto? Registrieren"

**Form Fields:**
- Email: type="email", required, placeholder="ihre@email.de"
- Password: type="password", required, placeholder="••••••••"
- Hidden field: invite_token (when present in URL)
- Submit button: "Anmelden" (changes to "Anmelden..." when loading)

**Form Behavior:**
```typescript
// Form submission should call existing server action
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);
  
  try {
    await signIn({ email, password, invite_token: inviteToken });
    // Redirect handled by server action
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

**Invite-Aware Navigation:**
- Forgot-password link: `/forgot-password?invite={token}&email={email}` (include params only when available)
- Register link: `/register?invite={token}` (include param only when available)

**Required States:**
1. Default (empty form)
2. Loading (isLoading=true, inputs disabled, button shows "Anmelden...")
3. Error (error banner visible with destructive Alert component)
4. Focus (input border-ring, ring-ring/50, ring-[3px])
5. Hover (all interactive elements have hover states)

**Color Tokens:**
- Primary button: bg-blue-600 hover:bg-blue-700
- Links: text-blue-600 hover:text-blue-700 (with hover:underline)
- Error: use Alert with variant="destructive"
- Inputs: bg-white/70 border-gray-200, focus:bg-white

**Responsive Breakpoints:**
- Mobile (<640px): Full width with 1rem (16px) padding
- Tablet/Desktop (≥640px): Centered card at 380px max-width

**Import Server Action:**
```typescript
import { signIn } from "@/app/actions/auth";
// or wherever your auth server action is located
```

**Import UI Components:**
```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
```

**Get Invite Token:**
```typescript
// Next.js App Router
import { useSearchParams } from "next/navigation";
const searchParams = useSearchParams();
const inviteToken = searchParams.get("invite");

// OR if using server component
// const inviteToken = searchParams.invite;
```

### CRITICAL: DO NOT CHANGE
- Block order (Google button must come before divider, divider before form, etc.)
- Navigation query parameter logic (forgot-password gets both invite and email)
- Form submission calls existing `signIn` server action
- Hidden invite_token field is included in form when present
- Required field validation (email and password both required)
- Error banner only shows when error state exists

### CRITICAL: DO CHANGE (Adapt to Your Project)
- Import paths (adjust to match your project structure)
- Server action location (use your actual auth action)
- Route structure (adjust based on your routing setup)
- Component export style (default vs named, based on your conventions)

### ACCESSIBILITY REQUIREMENTS
- All inputs must have associated labels (htmlFor/id)
- Error alert must have role="alert"
- Focus indicators visible on all interactive elements
- Color contrast meets WCAG AA standards
- Keyboard navigation fully functional

### TESTING CHECKLIST
After implementation, verify:
- [ ] Page renders at `/login` route
- [ ] Invite token from URL is captured and included in form
- [ ] Email validation works (HTML5 type="email")
- [ ] Both fields required before submission
- [ ] Loading state shows during API call
- [ ] Error state displays when signIn fails
- [ ] Forgot-password link includes invite and email params
- [ ] Register link includes invite param when present
- [ ] Mobile responsive (test at 375px width)
- [ ] Tablet responsive (test at 768px width)
- [ ] Desktop renders correctly (test at 1440px width)
- [ ] Keyboard navigation works (Tab through all elements)
- [ ] Focus states visible
- [ ] Hover states work on buttons and links

### VISUAL QA
Compare your implementation against the reference screenshot:
- [ ] Background gradient matches (soft blue-purple)
- [ ] Decorative blobs present and blurred
- [ ] Card has glass-morphism effect (semi-transparent, backdrop blur)
- [ ] Google button clearly disabled (grayed out)
- [ ] Divider text "Oder mit E-Mail anmelden" visible
- [ ] Spacing matches reference (use 16px/24px/32px increments)
- [ ] Typography matches (2xl title, sm body text)
- [ ] Primary button is blue-600
- [ ] Links are blue-600 with underline on hover

### EDGE CASES TO HANDLE
1. Very long email addresses (should not break layout)
2. Multiple rapid form submissions (prevent with isLoading check)
3. Network timeout on signIn call (add timeout handling)
4. Invalid invite token (server should handle, show error)
5. User hits Enter key in password field (should submit form)
6. Password managers auto-fill (ensure compatibility)
7. Browser back button after login (redirect logic)

### SECURITY NOTES
- Password field uses type="password" (already hides characters)
- Form submits to server action (not exposed API endpoint)
- Invite token validated server-side (don't trust client)
- CSRF protection handled by framework
- Consider rate limiting on signIn endpoint
- Use HTTPS in production

---

## EXAMPLE OUTPUT

After running this prompt, Cursor should generate a file like:

```typescript
// src/app/(auth)/login/page.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
// ... rest of imports

export default function LoginPage() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  
  // ... implementation matching all requirements above
}
```

---

## ADAPTATION TIPS

**If your project uses different routing:**
- Update route path based on your router (e.g., `/auth/login`, `/signin`, etc.)
- Adjust how you get URL params (useSearchParams, useRouter, etc.)

**If your auth implementation differs:**
- Replace signIn with your actual auth function name
- Adjust error handling to match your API response format
- Update redirect logic if needed

**If you use different UI components:**
- Map shadcn/ui components to your design system
- Maintain visual hierarchy and spacing
- Keep same interaction patterns

**If you want to customize colors:**
- Replace blue-600/700 with your primary brand color
- Update gradient colors for different mood
- Keep sufficient contrast ratios

---

## QUESTIONS TO ASK CURSOR IF NEEDED

If Cursor asks for clarification, use these responses:

**Q: Should I create a new file or update existing?**
A: Create new file at the path that matches our routing structure.

**Q: What should happen after successful login?**
A: Redirect is handled by the signIn server action. Don't add redirect logic in component.

**Q: Should I add form validation beyond HTML5?**
A: No, HTML5 validation (required, type="email") is sufficient for now.

**Q: What error messages should I show?**
A: Display whatever error message the signIn function returns. Use generic "Anmeldung fehlgeschlagen" as fallback.

**Q: Should the Google button be functional?**
A: No, it should remain disabled with text "(bald)" indicating coming soon.

---

**After Cursor generates the code, compare it side-by-side with the reference screenshot to ensure visual accuracy.**
