/**
 * Login State Reference
 *
 * Visual reference showing all interaction states of the Login component.
 * Useful for design review, QA testing, and documentation.
 */

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";

export function LoginStateReference() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Login Component States</h1>
        <p className="text-gray-600 mb-8">
          All interaction states for design review and QA testing
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* State 1: Default/Empty */}
          <StateCard
            title="1. Default State"
            description="Initial state, no interaction"
          >
            <LoginFormPreview
              showError={false}
              isLoading={false}
              hasEmail={false}
              hasPassword={false}
            />
          </StateCard>

          {/* State 2: Filled */}
          <StateCard
            title="2. Filled State"
            description="User has entered email and password"
          >
            <LoginFormPreview
              showError={false}
              isLoading={false}
              hasEmail={true}
              hasPassword={true}
            />
          </StateCard>

          {/* State 3: Loading */}
          <StateCard
            title="3. Loading State"
            description="Form submitted, waiting for response"
          >
            <LoginFormPreview
              showError={false}
              isLoading={true}
              hasEmail={true}
              hasPassword={true}
            />
          </StateCard>

          {/* State 4: Error */}
          <StateCard
            title="4. Error State"
            description="Login failed, error message shown"
          >
            <LoginFormPreview
              showError={true}
              isLoading={false}
              hasEmail={true}
              hasPassword={true}
            />
          </StateCard>

          {/* State 5: Focus (Email) */}
          <StateCard
            title="5. Input Focus"
            description="Email field focused (keyboard active)"
          >
            <LoginFormPreview
              showError={false}
              isLoading={false}
              hasEmail={false}
              hasPassword={false}
              focusEmail={true}
            />
          </StateCard>

          {/* State 6: With Invite Token */}
          <StateCard
            title="6. Invite Token Present"
            description="Hidden field contains invite_token value"
          >
            <LoginFormPreview
              showError={false}
              isLoading={false}
              hasEmail={false}
              hasPassword={false}
              hasInvite={true}
            />
          </StateCard>
        </div>

        {/* Interactive Elements Guide */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">
            Interactive Elements Guide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buttons */}
            <div>
              <h3 className="font-medium mb-3 text-lg">Buttons</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Primary (Enabled)
                  </p>
                  <Button className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                    Anmelden
                  </Button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Primary (Loading)
                  </p>
                  <Button
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                    disabled
                  >
                    Anmelden...
                  </Button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Outline (Disabled)
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-white/50 text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                    </svg>
                    Mit Google anmelden (bald)
                  </Button>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <h3 className="font-medium mb-3 text-lg">Input Fields</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Default</p>
                  <Input
                    placeholder="ihre@email.de"
                    className="bg-white/70"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Focused</p>
                  <Input
                    placeholder="ihre@email.de"
                    className="bg-white border-ring ring-ring/50 ring-[3px]"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Disabled</p>
                  <Input
                    placeholder="ihre@email.de"
                    disabled
                    className="bg-white/70"
                  />
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-medium mb-3 text-lg">Links</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Primary Link</p>
                  <a
                    href="#"
                    className="text-slate-700 hover:text-slate-800 hover:underline"
                  >
                    Passwort vergessen?
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Secondary Link (in text)
                  </p>
                  <div className="text-gray-600">
                    Noch kein Konto?{" "}
                    <a
                      href="#"
                      className="text-slate-700 hover:text-slate-800 font-medium hover:underline"
                    >
                      Registrieren
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div>
              <h3 className="font-medium mb-3 text-lg">Error Alert</h3>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und
                  Ihr Passwort.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        {/* Spacing Guide */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Spacing & Sizing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2">Card Container</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>Max Width: 380px</li>
                <li>Padding: 2rem (32px)</li>
                <li>Border Radius: 1rem (16px)</li>
                <li>Background: white/80 + backdrop-blur-xl</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Form Elements</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>Input Height: 2.25rem (36px)</li>
                <li>Button Height: 2.5rem (40px)</li>
                <li>Gap between fields: 1rem (16px)</li>
                <li>Label to input: 0.5rem (8px)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Section Spacing</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>Title to content: 1.5rem (24px)</li>
                <li>Divider margins: 1.5rem (24px)</li>
                <li>Form to register link: 1.5rem (24px)</li>
                <li>Error banner margin: 1rem (16px)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoginFormPreviewProps {
  showError: boolean;
  isLoading: boolean;
  hasEmail: boolean;
  hasPassword: boolean;
  focusEmail?: boolean;
  hasInvite?: boolean;
}

function LoginFormPreview({
  showError,
  isLoading,
  hasEmail,
  hasPassword,
  focusEmail = false,
  hasInvite = false,
}: LoginFormPreviewProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
        Login
      </h2>

      {/* Google Button */}
      <Button
        variant="outline"
        className="w-full mb-3 bg-white/50 text-gray-400 cursor-not-allowed text-sm"
        disabled
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
        </svg>
        Mit Google anmelden (bald)
      </Button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">
            Oder mit E-Mail anmelden
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {showError && (
        <Alert variant="destructive" className="mb-4 text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Ungültige Anmeldedaten</AlertDescription>
        </Alert>
      )}

      {/* Invite Token Indicator */}
      {hasInvite && (
        <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
          ℹ️ Hidden field: invite_token="inv_abc123xyz"
        </div>
      )}

      {/* Form */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-sm">E-Mail</Label>
          <Input
            placeholder="ihre@email.de"
            value={hasEmail ? "max@beispiel.de" : ""}
            disabled={isLoading}
            className={`text-sm ${
              focusEmail
                ? "border-slate-300 ring-slate-700/30 ring-[3px] bg-white"
                : "bg-white/70"
            }`}
            readOnly
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Passwort</Label>
            <a
              href="#"
              className="text-xs text-slate-700 hover:text-slate-800 hover:underline"
            >
              Vergessen?
            </a>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={hasPassword ? "password123" : ""}
            disabled={isLoading}
            className="text-sm bg-white/70"
            readOnly
          />
        </div>

        <Button
          className="mt-4 w-full bg-slate-700 text-sm text-white hover:bg-slate-800"
          disabled={isLoading}
        >
          {isLoading ? "Anmelden..." : "Anmelden"}
        </Button>
      </div>

      <div className="mt-4 text-center text-xs text-gray-600">
        Noch kein Konto?{" "}
        <a
          href="#"
          className="font-medium text-slate-700 hover:text-slate-800 hover:underline"
        >
          Registrieren
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
