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

  // Bereits deutsch / produktseitig formulierte Meldungen aus Registrierung & Redirects — nicht durch den generischen Fallback ersetzen.
  const looksTechnical =
    /https?:\/\/|\b(?:supabase|postgres|typeerror|referenceerror|syntaxerror|econnrefused|jwt|jsonb?)\b|invalid_request|No such |undefined is not|Cannot read properties/i.test(
      m
    );
  if (!looksTechnical && m.length <= 500) {
    const t = m.trim();
    if (
      /^(Bitte|Die |Das |Der |Diese |E-Mail|Passwort|Ungültig|Einladung|Zahlung|Ihre |Sie |Beitritt|Nicht |Konnte |Zu |Verbindung)/i.test(t) ||
      /^E-Mail\b/i.test(t)
    ) {
      return m;
    }
  }

  if (m.length > 160) {
    return "Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.";
  }

  // Keine unbekannten Server-/Provider-Rohstrings in Redirect-URLs (Adresszeile, History, Logs).
  return "Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.";
}

/**
 * Passwort-Reset anfordern (`resetPasswordForEmail`): Rohfehler nur serverseitig loggen.
 * Supabase meldet bei unbekannter E-Mail typischerweise keinen Fehler (Enumeration-Schutz).
 * Tritt hier ein Fehler auf, liegt es meist an Infrastruktur (Rate Limit, Redirect-URL, Mail, Env).
 */
export function userFacingPasswordResetRequestError(raw: string): string {
  const m = (raw || "").trim();
  if (!m) {
    return "Der Link konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.";
  }
  if (/rate limit|too many requests|over_email_send_rate_limit/i.test(m)) {
    return "Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
  }
  if (/fetch failed|network|ECONNREFUSED/i.test(m)) {
    return "Verbindung zum Server fehlgeschlagen. Bitte prüfen Sie Ihre Internetverbindung.";
  }
  if (/redirect|not allowed|invalid.*callback|email link is invalid/i.test(m)) {
    return "Der Reset-Link ist für diese Website noch nicht freigegeben. Bitte wenden Sie sich an den Support.";
  }
  if (/smtp|sending recovery email|error sending|mail delivery|email provider/i.test(m)) {
    return "Der Link konnte gerade nicht gesendet werden. Bitte versuchen Sie es später erneut oder wenden Sie sich an den Support.";
  }
  if (/Missing NEXT_PUBLIC_SUPABASE|Invalid NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY/i.test(m)) {
    return "Der Dienst ist vorübergehend nicht erreichbar. Bitte versuchen Sie es später erneut.";
  }
  return "Der Link konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.";
}
