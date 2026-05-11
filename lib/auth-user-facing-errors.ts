/**
 * Maps provider / Supabase messages to short German copy for redirects and UI.
 * Log the raw message on the server before replacing.
 */
export function userFacingAuthError(raw: string): string {
  const m = (raw || "").trim();
  if (!m) return "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.";

  if (/invalid login credentials|invalid_credentials|invalid email or password/i.test(m)) {
    return "E-Mail oder Passwort ist ungültig.";
  }
  if (/email not confirmed|email_not_confirmed/i.test(m)) {
    return "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse über den Link in der Bestätigungsmail.";
  }
  if (/user already registered|already been registered|already exists/i.test(m)) {
    return "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.";
  }
  if (/password.*at least|password should be at least|password.*8/i.test(m)) {
    return "Das Passwort erfüllt nicht die Anforderungen (mindestens 8 Zeichen).";
  }
  if (/rate limit|too many requests|over_email_send_rate_limit/i.test(m)) {
    return "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
  }
  if (/fetch failed|network|ECONNREFUSED/i.test(m)) {
    return "Verbindung zum Server fehlgeschlagen. Bitte prüfen Sie Ihre Internetverbindung.";
  }
  if (/upload failed|upload exception|missing file/i.test(m)) {
    return "Der Upload ist fehlgeschlagen. Bitte versuchen Sie es erneut oder wählen Sie eine kleinere Datei.";
  }
  if (/^checkout_cancelled$/i.test(m) || /zahlung.*abbruch|checkout.*abgebrochen/i.test(m)) {
    return "Der Zahlungsvorgang wurde abgebrochen. Sie können die Registrierung erneut starten oder sich bei Rückfragen an den Support wenden.";
  }
  if (/stripe|checkout session|no such price|invalid_request/i.test(m)) {
    return "Der Zahlungsvorbereitungsschritt ist fehlgeschlagen. Bitte versuchen Sie es später erneut oder wenden Sie sich an den Support.";
  }

  if (m.length > 160) {
    return "Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.";
  }

  // Keine unbekannten Server-/Provider-Rohstrings in Redirect-URLs (Adresszeile, History, Logs).
  return "Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.";
}
