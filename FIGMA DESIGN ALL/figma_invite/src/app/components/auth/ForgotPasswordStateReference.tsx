/**
 * Forgot Password State Reference
 *
 * Visual reference showing all states of the ForgotPassword component.
 * Useful for design review, QA testing, and documentation.
 */

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function ForgotPasswordStateReference() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Forgot Password Component States
        </h1>
        <p className="text-gray-600 mb-8">
          All interaction states for design review and QA testing
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* State 1: Default */}
          <StateCard
            title="1. Default State"
            description="Initial state, empty form"
          >
            <ForgotPasswordPreview
              showError={false}
              showSuccess={false}
              isLoading={false}
              hasEmail={false}
            />
          </StateCard>

          {/* State 2: Filled */}
          <StateCard
            title="2. Filled State"
            description="User has entered email"
          >
            <ForgotPasswordPreview
              showError={false}
              showSuccess={false}
              isLoading={false}
              hasEmail={true}
            />
          </StateCard>

          {/* State 3: Loading */}
          <StateCard
            title="3. Loading State"
            description="Form submitted, sending request"
          >
            <ForgotPasswordPreview
              showError={false}
              showSuccess={false}
              isLoading={true}
              hasEmail={true}
            />
          </StateCard>

          {/* State 4: Success */}
          <StateCard
            title="4. Success State"
            description="Email sent confirmation (sent=1)"
          >
            <ForgotPasswordPreview
              showError={false}
              showSuccess={true}
              isLoading={false}
              hasEmail={true}
            />
          </StateCard>

          {/* State 5: Error */}
          <StateCard
            title="5. Error State"
            description="Request failed, error shown"
          >
            <ForgotPasswordPreview
              showError={true}
              showSuccess={false}
              isLoading={false}
              hasEmail={true}
            />
          </StateCard>

          {/* State 6: Prefilled Email */}
          <StateCard
            title="6. Prefilled Email"
            description="Email from URL param or invite"
          >
            <ForgotPasswordPreview
              showError={false}
              showSuccess={false}
              isLoading={false}
              hasEmail={true}
              isPrefilled={true}
            />
          </StateCard>
        </div>

        {/* Message Behavior Guide */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Message Behavior</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Success Message */}
            <div>
              <h3 className="font-medium mb-3 text-lg">Success Message</h3>
              <div className="space-y-3 text-sm">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-green-800">
                        Wenn die E-Mail existiert, wurde ein Link zum
                        Zurücksetzen versendet.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium mb-1">Triggered by:</p>
                  <p className="text-gray-700">URL query param: ?sent=1</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium mb-1">Security Note:</p>
                  <p className="text-gray-700">
                    Message is intentionally vague ("Wenn die E-Mail existiert")
                    to prevent email enumeration attacks.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div>
              <h3 className="font-medium mb-3 text-lg">Error Message</h3>
              <div className="space-y-3 text-sm">
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
                  </AlertDescription>
                </Alert>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium mb-1">Triggered by:</p>
                  <p className="text-gray-700">URL query param: ?error=...</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium mb-1">Common Errors:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mt-1">
                    <li>Rate limit exceeded</li>
                    <li>Server error</li>
                    <li>Invalid email format (fallback)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Query Params */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">
            Navigation & Query Parameters
          </h2>

          <div className="space-y-6">
            {/* Back to Login Link */}
            <div>
              <h3 className="font-medium mb-2">Back to Login Link</h3>
              <p className="text-sm text-gray-600 mb-3">
                Preserves invite and email context when navigating back
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 border-b font-semibold">
                        Context
                      </th>
                      <th className="text-left p-3 border-b font-semibold">
                        Login URL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">No context</td>
                      <td className="p-3 font-mono text-xs">/login</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">With invite</td>
                      <td className="p-3 font-mono text-xs">
                        /login?invite=TOKEN
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">With email</td>
                      <td className="p-3 font-mono text-xs">
                        /login?email=user@test.de
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">With both</td>
                      <td className="p-3 font-mono text-xs">
                        /login?invite=TOKEN&email=user@test.de
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Query Parameters */}
            <div>
              <h3 className="font-medium mb-2">Query Parameters</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 border-b font-semibold">
                        Parameter
                      </th>
                      <th className="text-left p-3 border-b font-semibold">
                        Purpose
                      </th>
                      <th className="text-left p-3 border-b font-semibold">
                        Effect
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-mono text-xs">?invite=TOKEN</td>
                      <td className="p-3">Invite context</td>
                      <td className="p-3">
                        Includes hidden invite_token in form
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-mono text-xs">?email=EMAIL</td>
                      <td className="p-3">Prefill email</td>
                      <td className="p-3">Populates email field</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-mono text-xs">?sent=1</td>
                      <td className="p-3">Success indicator</td>
                      <td className="p-3">Shows success message</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs">?error=MESSAGE</td>
                      <td className="p-3">Error message</td>
                      <td className="p-3">Shows error alert</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Field Requirements */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Field Requirements</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Field</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Required</th>
                  <th className="text-left p-3 font-semibold">Validation</th>
                  <th className="text-left p-3 font-semibold">Autocomplete</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">E-Mail</td>
                  <td className="p-3 text-gray-600">email</td>
                  <td className="p-3">✅ Yes</td>
                  <td className="p-3 text-gray-600">
                    Email format + required
                  </td>
                  <td className="p-3 text-gray-600">email</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Placeholder: "doc@praxis.de"
          </p>
        </div>
      </div>
    </div>
  );
}

interface ForgotPasswordPreviewProps {
  showError: boolean;
  showSuccess: boolean;
  isLoading: boolean;
  hasEmail: boolean;
  isPrefilled?: boolean;
}

function ForgotPasswordPreview({
  showError,
  showSuccess,
  isLoading,
  hasEmail,
  isPrefilled = false,
}: ForgotPasswordPreviewProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      {/* Title */}
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Passwort zurücksetzen
      </h1>

      {/* Body Copy */}
      <p className="text-xs text-gray-600 mb-4">
        Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum
        Zurücksetzen.
      </p>

      {/* Success Message */}
      {showSuccess && (
        <Alert className="mb-4 text-sm bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-xs">
            Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen
            versendet.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {showError && (
        <Alert variant="destructive" className="mb-4 text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="space-y-3">
        {/* Email */}
        <div className="space-y-1">
          <Label className="text-xs">E-Mail</Label>
          <Input
            type="email"
            placeholder="doc@praxis.de"
            value={hasEmail ? "max@beispiel.de" : ""}
            disabled={isLoading}
            className="text-sm bg-white/70 h-9"
            readOnly
          />
          {isPrefilled && (
            <p className="text-xs text-slate-600 mt-1">
              ℹ️ Prefilled from URL param
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          className="w-full bg-slate-700 hover:bg-slate-800 text-white text-sm mt-4 h-9"
          disabled={isLoading}
        >
          {isLoading ? "Wird gesendet..." : "Link zum Zurücksetzen senden"}
        </Button>
      </div>

      {/* Back Link */}
      <div className="mt-4 text-center text-xs">
        <a
          href="#"
          className="text-slate-700 hover:text-slate-900 hover:underline"
        >
          Zurück zum Login
        </a>
      </div>
    </div>
  );
}

interface StateCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function StateCard({ title, description, children }: StateCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
