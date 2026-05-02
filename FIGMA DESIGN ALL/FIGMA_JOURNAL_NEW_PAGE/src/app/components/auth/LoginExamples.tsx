/**
 * Login Component - State Examples & Integration Guide
 *
 * This file demonstrates all states and configurations of the Login component.
 * Use these examples to test different scenarios during development.
 */

import { Login } from "./Login";

// Example 1: Default state (no invite)
export function LoginDefault() {
  return <Login />;
}

// Example 2: With invite token (from email invitation)
export function LoginWithInvite() {
  return <Login inviteToken="inv_abc123xyz" />;
}

// Example 3: Test error state
// To trigger error state in the current implementation:
// Enter email: error@test.com with any password
export function LoginErrorDemo() {
  return (
    <div>
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        <p className="font-medium">Demo Instructions:</p>
        <p>Enter email "error@test.com" to trigger error state</p>
      </div>
      <Login />
    </div>
  );
}

/**
 * INTEGRATION CHECKLIST
 *
 * [ ] 1. Server Action Integration
 *    Replace the mock signIn function with your actual server action:
 *
 *    import { signIn } from "@/app/actions/auth";
 *
 *    Then in handleSubmit:
 *    const result = await signIn({ email, password, invite_token: inviteToken });
 *
 * [ ] 2. Error Handling
 *    Update error handling to match your API response format:
 *
 *    if (result.error) {
 *      setError(result.error.message);
 *    } else {
 *      // Redirect handled by server action
 *    }
 *
 * [ ] 3. Invite Token Source
 *    Update App.tsx to get invite token from your router:
 *
 *    Next.js App Router:
 *    const searchParams = useSearchParams();
 *    const inviteToken = searchParams.get("invite");
 *
 *    React Router:
 *    const [searchParams] = useSearchParams();
 *    const inviteToken = searchParams.get("invite");
 *
 * [ ] 4. Navigation URLs
 *    Verify these routes exist in your application:
 *    - /forgot-password
 *    - /register
 *
 * [ ] 5. Redirect Logic
 *    After successful login, users should be redirected based on:
 *    - Invite token presence → accept-invite flow
 *    - No invite → dashboard or intended destination
 *
 * [ ] 6. Responsive Testing
 *    Test on breakpoints:
 *    - Mobile: 375px, 414px
 *    - Tablet: 768px, 1024px
 *    - Desktop: 1440px+
 *
 * [ ] 7. Browser Testing
 *    - Chrome/Edge (Chromium)
 *    - Firefox
 *    - Safari (especially iOS Safari for mobile)
 *
 * [ ] 8. Accessibility
 *    - Keyboard navigation (Tab, Enter)
 *    - Screen reader testing
 *    - Focus indicators visible
 *    - Error messages announced
 *
 * [ ] 9. Security
 *    - HTTPS in production
 *    - Password field uses type="password"
 *    - CSRF protection in server action
 *    - Rate limiting on login endpoint
 *
 * [ ] 10. Analytics (Optional)
 *     Track key events:
 *     - Login page viewed
 *     - Login attempted
 *     - Login succeeded
 *     - Login failed (with error type)
 *     - Forgot password clicked
 *     - Register clicked
 */

/**
 * STYLING CUSTOMIZATION
 *
 * The component uses Tailwind CSS with these key design tokens:
 *
 * Background Gradient:
 * - from-blue-50 via-white to-purple-50
 * - Change to match your brand colors
 *
 * Decorative Blobs:
 * - bg-blue-200/40, bg-purple-200/40, bg-indigo-200/30
 * - Adjust colors and opacity for different mood
 *
 * Auth Card:
 * - bg-white/80 backdrop-blur-xl (glass morphism)
 * - shadow-2xl shadow-black/5
 * - max-w-[380px]
 *
 * Primary Button:
 * - bg-blue-600 hover:bg-blue-700
 * - Change to your primary brand color
 *
 * Links:
 * - text-blue-600 hover:text-blue-700
 * - Should match primary button color
 *
 * To create a medical/dental theme:
 * - Use cooler tones: blues, teals, soft greens
 * - Increase whitespace (padding)
 * - Use softer shadows
 * - Consider adding subtle tooth/smile icon watermark
 */

/**
 * STATE MANAGEMENT NOTES
 *
 * Current state variables:
 * - email: string
 * - password: string
 * - error: string | null
 * - isLoading: boolean
 *
 * State transitions:
 * 1. Initial → email/password entered → form valid
 * 2. Submit → isLoading=true → API call
 * 3. Success → redirect (handled by server)
 * 4. Error → isLoading=false, error=message → show error banner
 *
 * Error clearing:
 * - Error clears on next submit attempt
 * - Consider clearing on input change for better UX
 *
 * Form validation:
 * - Browser native HTML5 validation (required, type="email")
 * - Consider adding custom validation for better error messages
 */
