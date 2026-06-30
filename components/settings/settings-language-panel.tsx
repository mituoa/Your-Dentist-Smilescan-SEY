"use client";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { localeUsesEnglishUiFallback } from "@/lib/locale";

export function SettingsLanguagePanel() {
  const { locale, messages } = useLocale();
  const partial = localeUsesEnglishUiFallback(locale);

  return (
    <div className="yd-settings-v2__panel yd-settings-v2__panel--language">
      <div className="yd-settings-v2__panel-head yd-settings-v2__panel-head--solo">
        <div>
          <h2 className="yd-settings-v2__panel-title">{messages.settings.language.title}</h2>
          <p className="yd-settings-v2__panel-copy">{messages.settings.language.description}</p>
        </div>
      </div>

      <div className="yd-settings-v2__fields yd-settings-v2__fields--language">
        {partial ? (
          <p className="yd-settings-language__hint" role="status">
            {messages.settings.language.partialActive}
          </p>
        ) : null}
        <LocaleSwitcher variant="grid" />
      </div>
    </div>
  );
}
