# Sicherheit

> **Entwurf – muss vor Veröffentlichung durch eine deutsche Rechtsanwaltskanzlei (IT-/Medizinrecht) geprüft und freigegeben werden.**

Stand: [PLATZHALTER – Datum der finalen Fassung] · Version 0.2 (Entwurf)

## 1. Unser Anspruch

Your Dentist wird für Zahnarztpraxen betrieben, mit sensiblen Patienten- und Praxisdaten. Sicherheit ist deshalb Teil der Produktarchitektur und nicht ein nachträglicher Zusatz. Die nachfolgenden Maßnahmen dienen der Umsetzung von Art. 32 DSGVO, der ein dem Risiko angemessenes Schutzniveau verlangt.

## 2. Zugriffskontrolle

Zugriff auf Workspaces erfolgt über authentifizierte Konten mit rollenbasierter Berechtigung. Sensible Operationen sind auf autorisierte Nutzerinnen und Nutzer beschränkt. Berechtigungen werden je Praxis-Workspace granular vergeben.

## 3. Verschlüsselung

Daten werden bei der Übertragung verschlüsselt (TLS). Gespeicherte Daten werden nach dem Stand der Technik des eingesetzten Hosting-Anbieters geschützt. [PLATZHALTER – konkrete Verschlüsselungsstandards bei Daten im Ruhezustand sind vor Veröffentlichung aus der technischen Konfiguration zu bestätigen und hier zu benennen.]

## 4. Mandantentrennung

Praxisdaten sind logisch je Praxis-Workspace voneinander getrennt. Der Zugriff auf Datensätze ist technisch auf den jeweiligen Workspace-Kontext beschränkt, sodass eine Praxis keinen Zugriff auf Daten anderer Praxen erhält.

## 5. Protokollierung und Monitoring

Sicherheitsrelevante Ereignisse, insbesondere Anmeldevorgänge und sicherheitsrelevante Statusänderungen, werden protokolliert, um Anomalien frühzeitig zu erkennen. Protokolle werden zweckgebunden und zeitlich begrenzt aufbewahrt.

## 6. Entwicklung und Bereitstellung

Änderungen am System durchlaufen kontrollierte Bereitstellungsprozesse. Sicherheitsrelevante Updates werden priorisiert behandelt.

## 7. Auftragsverarbeiter und Infrastruktur

Wir setzen sorgfältig ausgewählte Dienstleister für Hosting und Datenbank, KI-gestützte Assistenzfunktionen, Zahlungsabwicklung und E-Mail-Versand ein. Die vollständige Übersicht der eingesetzten Auftragsverarbeiter, einschließlich des Vertragsstatus, findet sich im Auftragsverarbeitungsvertrag (Anlage 2) und in der Datenschutzerklärung.

## 8. Verfügbarkeit und Backups

Regelmäßige Datensicherungen durch den eingesetzten Hosting-Anbieter sowie ein Wiederherstellungskonzept unterstützen die Verfügbarkeit der Plattform. Wartungsfenster werden nach Möglichkeit im Voraus angekündigt.

## 9. Meldung von Sicherheitsvorfällen

Bei einer Verletzung des Schutzes personenbezogener Daten mit voraussichtlichem Risiko für die Rechte und Freiheiten betroffener Personen handeln wir nach einem dokumentierten Incident-Response-Prozess. Wir unterstützen betroffene Praxen bei der Erfüllung ihrer eigenen Meldepflichten gegenüber Aufsichtsbehörden (Art. 33 DSGVO, Meldefrist von 72 Stunden ab Kenntnis) und gegenüber betroffenen Personen (Art. 34 DSGVO), soweit dies erforderlich ist.

## 10. Keine unbelegten Zertifizierungen

Your Dentist führt zum Zeitpunkt dieser Fassung keine extern auditierten Zertifizierungen (z. B. ISO 27001, SOC 2). Sollte eine solche Zertifizierung künftig erlangt werden, wird dies an dieser Stelle mit Verweis auf den entsprechenden Nachweis dokumentiert. Bis dahin werden keine entsprechenden Aussagen getroffen oder impliziert.

## 11. Verantwortung der Praxis

Praxen schützen Zugangsdaten, vergeben Rollen restriktiv, schulen Mitarbeitende im Umgang mit der Plattform und melden verdächtige Aktivitäten unverzüglich. Diese internen Prozesse der Praxis ergänzen die technischen Schutzmaßnahmen von Your Dentist und sind Voraussetzung für ein wirksames Gesamtschutzniveau.

## 12. Kontakt

Sicherheitsbezogene Meldungen richten Sie bitte an die im Impressum genannte Kontaktadresse mit dem Betreff „Security".
