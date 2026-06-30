"use client";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useLocale } from "@/components/i18n/locale-provider";

export function SettingsLanguagePanel() {
  const { messages } = useLocale();

  return (
    <div className="yd-settings-v2__panel">
      <div className="yd-settings-v2__panel-head yd-settings-v2__panel-head--solo">
        <div>
          <h2 className="yd-settings-v2__panel-title">{messages.settings.language.title}</h2>
          <p className="yd-settings-v2__panel-copy">{messages.settings.language.description}</p>
        </div>
      </div>

      <div className="yd-settings-v2__fields">
        <LocaleSwitcher variant="labeled" className="yd-settings-v2__locale-switcher" />
      </div>
    </div>
  );
}
