/**
 * Login Theme Variants
 *
 * Visual reference showing different styling options for the Login component.
 * Use this to quickly preview and choose a design direction.
 */

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function LoginThemeShowcase() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        SmileScan Login - Theme Variants
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Variant 1: Default (Blue-Purple) */}
        <ThemeCard
          title="Default (Blue-Purple)"
          description="Soft medical professional feel"
          gradient="from-blue-50 via-white to-purple-50"
          blobs={[
            "top-0 left-0 bg-blue-200/40",
            "bottom-0 right-0 bg-purple-200/40",
            "top-1/2 left-1/2 bg-indigo-200/30",
          ]}
          primaryColor="bg-blue-600 hover:bg-blue-700"
          linkColor="text-blue-600 hover:text-blue-700"
        />

        {/* Variant 2: Medical (Teal-Cyan) */}
        <ThemeCard
          title="Medical (Teal-Cyan)"
          description="Clinical, clean, sterile"
          gradient="from-teal-50 via-white to-cyan-50"
          blobs={[
            "top-0 left-0 bg-teal-200/40",
            "bottom-0 right-0 bg-cyan-200/40",
            "top-1/2 left-1/2 bg-emerald-200/30",
          ]}
          primaryColor="bg-teal-600 hover:bg-teal-700"
          linkColor="text-teal-600 hover:text-teal-700"
        />

        {/* Variant 3: Premium (Slate-Blue) */}
        <ThemeCard
          title="Premium (Slate-Blue)"
          description="Modern tech, sophisticated"
          gradient="from-slate-50 via-white to-blue-50"
          blobs={[
            "top-0 left-0 bg-slate-300/40",
            "bottom-0 right-0 bg-blue-300/40",
            "top-1/2 left-1/2 bg-indigo-300/30",
          ]}
          primaryColor="bg-slate-700 hover:bg-slate-800"
          linkColor="text-slate-700 hover:text-slate-800"
        />

        {/* Variant 4: Warm (Orange-Pink) */}
        <ThemeCard
          title="Warm (Orange-Pink)"
          description="Friendly, approachable"
          gradient="from-orange-50 via-white to-pink-50"
          blobs={[
            "top-0 left-0 bg-orange-200/40",
            "bottom-0 right-0 bg-pink-200/40",
            "top-1/2 left-1/2 bg-rose-200/30",
          ]}
          primaryColor="bg-orange-600 hover:bg-orange-700"
          linkColor="text-orange-600 hover:text-orange-700"
        />

        {/* Variant 5: Minimal (Pure White) */}
        <ThemeCard
          title="Minimal (Pure White)"
          description="Clean, simple, no decoration"
          gradient="from-white via-gray-50 to-white"
          blobs={[]}
          primaryColor="bg-gray-900 hover:bg-gray-800"
          linkColor="text-gray-900 hover:text-gray-700"
        />

        {/* Variant 6: Dark Mode */}
        <ThemeCardDark
          title="Dark Mode"
          description="Modern, reduces eye strain"
        />
      </div>
    </div>
  );
}

interface ThemeCardProps {
  title: string;
  description: string;
  gradient: string;
  blobs: string[];
  primaryColor: string;
  linkColor: string;
}

function ThemeCard({
  title,
  description,
  gradient,
  blobs,
  primaryColor,
  linkColor,
}: ThemeCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Preview */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {/* Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {/* Blobs */}
        {blobs.map((blobClass, idx) => (
          <div
            key={idx}
            className={`absolute w-48 h-48 ${blobClass} rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2`}
          />
        ))}

        {/* Mini Auth Card */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-[280px] bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 p-6 scale-90 origin-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Login
            </h2>

            {/* Mini disabled Google button */}
            <Button
              variant="outline"
              className="w-full text-xs mb-3 bg-white/50 text-gray-400 cursor-not-allowed"
              disabled
              size="sm"
            >
              Mit Google anmelden (bald)
            </Button>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/80 px-2 text-gray-500">
                  Oder mit E-Mail
                </span>
              </div>
            </div>

            {/* Mini form */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">E-Mail</Label>
                <Input
                  placeholder="ihre@email.de"
                  className="h-8 text-xs bg-white/70"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Passwort</Label>
                  <a
                    href="#"
                    className={`text-xs ${linkColor} hover:underline`}
                  >
                    Vergessen?
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-8 text-xs bg-white/70"
                />
              </div>

              <Button className={`w-full text-xs ${primaryColor} text-white`}>
                Anmelden
              </Button>
            </div>

            <div className="mt-3 text-center text-xs text-gray-600">
              Noch kein Konto?{" "}
              <a href="#" className={`${linkColor} font-medium hover:underline`}>
                Registrieren
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeCardDark({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Preview */}
      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
        {/* Dark blobs */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl" />

        {/* Mini Auth Card (Dark) */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-[280px] bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 p-6 scale-90 origin-center">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">
              Login
            </h2>

            {/* Mini disabled Google button */}
            <Button
              variant="outline"
              className="w-full text-xs mb-3 bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed"
              disabled
              size="sm"
            >
              Mit Google anmelden (bald)
            </Button>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gray-800/80 px-2 text-gray-400">
                  Oder mit E-Mail
                </span>
              </div>
            </div>

            {/* Mini form */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-300">E-Mail</Label>
                <Input
                  placeholder="ihre@email.de"
                  className="h-8 text-xs bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-300">Passwort</Label>
                  <a
                    href="#"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Vergessen?
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-8 text-xs bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <Button className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white">
                Anmelden
              </Button>
            </div>

            <div className="mt-3 text-center text-xs text-gray-400">
              Noch kein Konto?{" "}
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
              >
                Registrieren
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
