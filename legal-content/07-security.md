# Sicherheit

> **Entwurf – muss vor Veröffentlichung juristisch geprüft werden.**

## 1. Unser Anspruch

Your Dentist wird für Zahnarztpraxen betrieben — mit sensiblen Patienten- und Praxisdaten. Sicherheit ist deshalb Teil der Produktarchitektur, nicht ein nachträglicher Zusatz.

## 2. Zugriffskontrolle

Zugriff auf Workspaces erfolgt über authentifizierte Konten mit rollenbasierter Berechtigung. Sensible Operationen sind auf autorisierte Nutzerinnen beschränkt.

## 3. Verschlüsselung

Daten werden bei der Übertragung verschlüsselt (TLS). Gespeicherte Daten werden nach Stand der Technik geschützt. Details zu Verschlüsselungsstandards werden in der finalen Dokumentation präzisiert.

## 4. Mandantentrennung

Praxisdaten sind logisch voneinander getrennt. Zugriff erfolgt nur im Kontext des jeweiligen Workspaces.

## 5. Protokollierung und Monitoring

Sicherheitsrelevante Ereignisse werden protokolliert und überwacht, um Anomalien frühzeitig zu erkennen. Protokolle werden zweckgebunden und zeitlich begrenzt aufbewahrt.

## 6. Entwicklung und Bereitstellung

Änderungen am System durchlaufen kontrollierte Bereitstellungsprozesse. Sicherheitsrelevante Updates werden priorisiert behandelt.

## 7. Auftragsverarbeiter und Infrastruktur

Wir arbeiten mit sorgfältig ausgewählten Dienstleistern für Hosting, E-Mail und Zahlungsabwicklung. Vertragliche und technische Anforderungen werden an sie herangetragen.

## 8. Verfügbarkeit und Backups

Regelmäßige Backups und Wiederherstellungskonzepte unterstützen die Verfügbarkeit. Wartungsfenster werden nach Möglichkeit angekündigt.

## 9. Meldung von Vorfällen

Bei sicherheitsrelevanten Vorfällen mit Auswirkung auf personenbezogene Daten handeln wir nach einem dokumentierten Incident-Response-Prozess und informieren betroffene Kundinnen und Behörden, soweit gesetzlich erforderlich.

## 10. Verantwortung der Praxis

Praxen schützen Zugangsdaten, vergeben Rollen restriktiv und melden verdächtige Aktivitäten. Ihre internen Prozesse ergänzen die technischen Schutzmaßnahmen von Your Dentist.

## 11. Kontakt

Sicherheitsbezogene Meldungen richten Sie bitte an die im Impressum genannte Kontaktadresse mit dem Betreff „Security“.
