import "server-only";

import { escapeHtml } from "@/lib/mail/escape-html";

interface MailData {
  taskTitle: string;
  taskUrl: string;
  actorName: string;
  recipientEmail: string;
  commentText?: string;
  rejectionReason?: string;
}

export function buildTaskSubmittedForReview(d: MailData) {
  const subject = `Aufgabe wartet auf Bestätigung: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat die Aufgabe "${d.taskTitle}" als erledigt gemeldet.\n\nBitte überprüfen und bestätigen Sie:\n${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat die Aufgabe "<strong>${escapeHtml(d.taskTitle)}</strong>" als erledigt gemeldet.</p><p>Bitte überprüfen und bestätigen Sie.</p><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Aufgabe öffnen</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}

export function buildTaskApproved(d: MailData) {
  const subject = `Aufgabe bestätigt: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat Ihre Erledigung der Aufgabe "${d.taskTitle}" bestätigt.\n\n${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat Ihre Erledigung der Aufgabe "<strong>${escapeHtml(d.taskTitle)}</strong>" bestätigt.</p><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Aufgabe ansehen</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}

export function buildTaskRejected(d: MailData) {
  const reason = d.rejectionReason || "Keine Begründung angegeben.";
  const subject = `Aufgabe zurückgewiesen: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat Ihre Erledigung der Aufgabe "${d.taskTitle}" zurückgewiesen.\n\nBegründung: ${reason}\n\nAufgabe öffnen: ${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat Ihre Erledigung der Aufgabe "<strong>${escapeHtml(d.taskTitle)}</strong>" zurückgewiesen.</p><p><strong>Begründung:</strong><br>${escapeHtml(reason)}</p><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Aufgabe öffnen</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}

export function buildTaskComment(d: MailData) {
  const comment = d.commentText || "";
  const subject = `Neuer Kommentar: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat einen Kommentar zur Aufgabe "${d.taskTitle}" hinterlassen:\n\n"${comment}"\n\nAufgabe öffnen: ${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat einen Kommentar zur Aufgabe "<strong>${escapeHtml(d.taskTitle)}</strong>" hinterlassen:</p><blockquote style="border-left: 3px solid #D4D1C7; padding: 8px 16px; margin: 16px 0; color: #5F5E5A; font-style: italic;">${escapeHtml(comment)}</blockquote><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Antworten</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}

export function buildTaskAssigned(d: MailData) {
  const subject = `Neue Aufgabe: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat Ihnen eine neue Aufgabe zugewiesen: "${d.taskTitle}"\n\n${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat Ihnen eine neue Aufgabe zugewiesen:</p><p><strong>${escapeHtml(d.taskTitle)}</strong></p><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Aufgabe öffnen</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}
