/**
 * Register State Reference
 *
 * Visual reference showing all states of the Register component.
 * Useful for design review, QA testing, and documentation.
 */

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, Info } from "lucide-react";

export function RegisterStateReference() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Register Component States</h1>
        <p className="text-gray-600 mb-8">
          All interaction states for design review and QA testing
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* State 1: Default (No Invite) */}
          <StateCard
            title="1. Default State (No Invite)"
            description="All 4 fields visible, empty form"
          >
            <RegisterFormPreview
              showError={false}
              isLoading={false}
              hasInvite={false}
              isFilled={false}
            />
          </StateCard>

          {/* State 2: With Invite */}
          <StateCard
            title="2. With Invite Token"
            description="Invite box shown, workspace field hidden"
          >
            <RegisterFormPreview
              showError={false}
              isLoading={false}
              hasInvite={true}
              isFilled={false}
            />
          </StateCard>

          {/* State 3: Filled (No Invite) */}
          <StateCard
            title="3. Filled State"
            description="User has entered all information"
          >
            <RegisterFormPreview
              showError={false}
              isLoading={false}
              hasInvite={false}
              isFilled={true}
            />
          </StateCard>

          {/* State 4: Loading */}
          <StateCard
            title="4. Loading State"
            description="Form submitted, creating account"
          >
            <RegisterFormPreview
              showError={false}
              isLoading={true}
              hasInvite={false}
              isFilled={true}
            />
          </StateCard>

          {/* State 5: Error */}
          <StateCard
            title="5. Error State"
            description="Registration failed, error shown"
          >
            <RegisterFormPreview
              showError={true}
              isLoading={false}
              hasInvite={false}
              isFilled={true}
            />
          </StateCard>

          {/* State 6: Prefilled Email */}
          <StateCard
            title="6. Prefilled Email"
            description="Email populated from URL param"
          >
            <RegisterFormPreview
              showError={false}
              isLoading={false}
              hasInvite={true}
              isFilled={false}
              prefilledEmail={true}
            />
          </StateCard>
        </div>

        {/* Conditional Logic Guide */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">
            Conditional Logic Guide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without Invite */}
            <div>
              <h3 className="font-medium mb-3 text-lg">Without Invite Token</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium mb-1">Fields Shown:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Vollständiger Name ✓</li>
                    <li>Praxis-Name ✓</li>
                    <li>E-Mail ✓</li>
                    <li>Passwort ✓</li>
                  </ul>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium mb-1">Hidden Elements:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Invite token input</li>
                    <li>Invite info box</li>
                  </ul>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium mb-1">Behavior:</p>
                  <p className="text-gray-700">
                    Creates new workspace with provided name
                  </p>
                </div>
              </div>
            </div>

            {/* With Invite */}
            <div>
              <h3 className="font-medium mb-3 text-lg">With Invite Token</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="font-medium mb-1">Fields Shown:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Vollständiger Name ✓</li>
                    <li>
                      <span className="line-through">Praxis-Name</span> (HIDDEN)
                    </li>
                    <li>E-Mail ✓</li>
                    <li>Passwort ✓</li>
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="font-medium mb-1">Visible Elements:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Hidden invite token input (in form)</li>
                    <li>Invite info box (above form)</li>
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="font-medium mb-1">Behavior:</p>
                  <p className="text-gray-700">
                    Joins existing workspace specified by invite
                  </p>
                </div>
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
                  <th className="text-left p-3 font-semibold">Placeholder</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">Vollständiger Name</td>
                  <td className="p-3 text-gray-600">text</td>
                  <td className="p-3">✅ Always</td>
                  <td className="p-3 text-gray-600">Browser required</td>
                  <td className="p-3 text-gray-600">
                    Dr. med. dent. Jane Doe
                  </td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-medium">Praxis-Name</td>
                  <td className="p-3 text-gray-600">text</td>
                  <td className="p-3">⚠️ Only without invite</td>
                  <td className="p-3 text-gray-600">
                    Browser required (when visible)
                  </td>
                  <td className="p-3 text-gray-600">
                    Zahnarztpraxis am Rathausplatz
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">E-Mail</td>
                  <td className="p-3 text-gray-600">email</td>
                  <td className="p-3">✅ Always</td>
                  <td className="p-3 text-gray-600">
                    Email format + required
                  </td>
                  <td className="p-3 text-gray-600">doc@praxis.de</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Passwort</td>
                  <td className="p-3 text-gray-600">password</td>
                  <td className="p-3">✅ Always</td>
                  <td className="p-3 text-gray-600">
                    Min 8 chars + required
                  </td>
                  <td className="p-3 text-gray-600">••••••••</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Helper text under password: "Mindestens 8 Zeichen."
          </p>
        </div>
      </div>
    </div>
  );
}

interface RegisterFormPreviewProps {
  showError: boolean;
  isLoading: boolean;
  hasInvite: boolean;
  isFilled: boolean;
  prefilledEmail?: boolean;
}

function RegisterFormPreview({
  showError,
  isLoading,
  hasInvite,
  isFilled,
  prefilledEmail = false,
}: RegisterFormPreviewProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      {/* Brand Heading */}
      <h1 className="text-2xl font-semibold text-slate-900 text-center mb-4">
        SmileScan
      </h1>

      {/* Title & Subtitle */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Konto anlegen
        </h2>
        <p className="text-xs text-gray-600">
          Für Zahnärzte in geschlossener Beta.
        </p>
      </div>

      {/* Error Banner */}
      {showError && (
        <Alert variant="destructive" className="mb-4 text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Diese E-Mail ist bereits registriert
          </AlertDescription>
        </Alert>
      )}

      {/* Invite Info Box */}
      {hasInvite && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="text-slate-700">
                Sie treten einem bestehenden Workspace bei.
              </p>
              <p className="mt-1 font-medium text-slate-900">
                Praxis Dr. Müller
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-3">
        {/* Name */}
        <div className="space-y-1">
          <Label className="text-xs">Vollständiger Name</Label>
          <Input
            placeholder="Dr. med. dent. Jane Doe"
            value={isFilled ? "Dr. med. dent. Max Mustermann" : ""}
            disabled={isLoading}
            className="text-sm bg-white/70 h-9"
            readOnly
          />
        </div>

        {/* Workspace (only without invite) */}
        {!hasInvite && (
          <div className="space-y-1">
            <Label className="text-xs">Praxis-Name</Label>
            <Input
              placeholder="Zahnarztpraxis am Rathausplatz"
              value={isFilled ? "Zahnarztpraxis Mustermann" : ""}
              disabled={isLoading}
              className="text-sm bg-white/70 h-9"
              readOnly
            />
          </div>
        )}

        {/* Email */}
        <div className="space-y-1">
          <Label className="text-xs">E-Mail</Label>
          <Input
            type="email"
            placeholder="doc@praxis.de"
            value={
              prefilledEmail || isFilled ? "max@beispiel.de" : ""
            }
            disabled={isLoading}
            className="text-sm bg-white/70 h-9"
            readOnly
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label className="text-xs">Passwort</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={isFilled ? "password123" : ""}
            disabled={isLoading}
            className="text-sm bg-white/70 h-9"
            readOnly
          />
          <p className="text-xs text-gray-500">Mindestens 8 Zeichen.</p>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full bg-slate-700 hover:bg-slate-800 text-white text-sm mt-4 h-9"
          disabled={isLoading}
        >
          {isLoading ? "Konto wird erstellt..." : "Konto anlegen"}
        </Button>
      </div>

      {/* Login Link */}
      <div className="mt-4 text-center text-xs text-gray-600">
        Schon ein Konto?{" "}
        <a
          href="#"
          className="text-slate-700 hover:text-slate-900 font-medium hover:underline"
        >
          Anmelden
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
