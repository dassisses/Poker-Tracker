# Prozessdokumentation Praxisarbeit Python

**Cian Vonlanthen**  
**Modul 122**

---

**Eingereicht von:** Cian Vonlanthen  
**Projekt:** Poker Tracker Backend (app.py)  
**Eingereicht bei:** Urs Dummermuth (Lehrperson)  
**Datum:** 13. Januar 2026

---

## 1.1 Automatisierungspotenzial erkennen

Ich spiele gerne Poker privat unter Kollegen. Dabei kam mir die Idee, einen Tracker zu bauen, der einerseits die Plus-Minus-Bilanz von jedem Spieler trackt, und nebst dem auch die Möglichkeit bietet, die Gewinnwahrscheinlichkeiten für die jeweilige Hand auszurechnen.

**Probleme beim manuellen Vorgehen:**
- Fehleranfällige manuelle Berechnungen der Gewinne und Verluste
- Zeitaufwändige Abrechnung am Ende jeder Runde
- Keine Möglichkeit, historische Spielerdaten zu analysieren
- Komplexe Wahrscheinlichkeitsberechnungen im Kopf nicht möglich

## 1.2 Ziele

Das Ziel ist es, ein Python-Script (app.py) zu schreiben, das als Backend für eine Webapp dient.

**Hauptfunktionen des Scripts:**
1. **Session-Management:** Verwaltung von Poker-Sessions mit mehreren Spielern
2. **Saldo-Tracking:** Erfassung von Buy-ins, Rebuys und End-Chips für jeden Spieler
3. **Settlement-Algorithmus:** Automatische Berechnung, wer wem wie viel schuldet
4. **Odds-Calculator:** Berechnung der Gewinnwahrscheinlichkeiten basierend auf Hand und Community Cards
5. **Statistiken:** Anzeige von Spielerstatistiken über alle Sessions hinweg

**Technische Anforderungen:**
- **Framework:** Flask als REST-API Backend
- **Datenbank:** SQLite für persistente Speicherung
- **Libraries:** Treys für Poker-Hand-Evaluierung
- **CORS:** Aktiviert für Frontend-Kommunikation

## 1.3 Entwicklungsprozess des app.py Scripts

### Schritt 1: Projekt-Setup und Grundstruktur
- Installation der benötigten Python-Packages (Flask, Flask-CORS, treys)
- Erstellung der Flask-Anwendung mit CORS-Unterstützung
- Definition des Datenbankpfads mit relativer Pfadbestimmung

### Schritt 2: Datenbank-Design und Initialisierung
**Tabellen-Schema entwickelt:**
- `sessions`: Speichert Poker-Sessions (id, date, name)
- `players`: Speichert Spielerdaten (id, session_id, name, rebuys, end_chip, net)

**Implementierte Funktionen:**
- `get_db()`: Datenbankverbindung mit Flask's Application Context
- `init_db()`: Automatische Tabellenerstellung beim Start
- `close_connection()`: Sauberes Schließen der Datenbankverbindung

### Schritt 3: API-Endpunkte implementiert

**1. POST /api/odds - Odds Calculator**
- **Funktionalität:** Monte-Carlo-Simulation zur Berechnung von Gewinnwahrscheinlichkeiten
- **Eingabe:** Spielerhand (2 Karten), Community Cards (0-5), Anzahl Gegner
- **Prozess:**
  - Parsen der Karten-Strings mit treys
  - Erstellen eines Decks und Entfernen bekannter Karten
  - 2000 Iterationen: Zufällige Verteilung restlicher Karten
  - Evaluierung jeder Hand mit treys Evaluator
  - Vergleich der Scores (niedrigster Score = beste Hand)
- **Ausgabe:** Win-Rate, Tie-Rate und Equity in Prozent

**2. POST /api/settle - Settlement-Algorithmus**
- **Funktionalität:** Berechnung optimaler Transaktionen
- **Eingabe:** Liste von Spielern mit Buy-in und End-Chips
- **Algorithmus:**
  - Berechnung des Netto-Gewinns/-Verlusts pro Spieler
  - Sortierung: Verlierer (negative Werte) zuerst, Gewinner (positive) zuletzt
  - Two-Pointer-Approach: Verlierer zahlen direkt an Gewinner
  - Minimierung der Transaktionsanzahl
- **Ausgabe:** Liste von Transaktionen (von, zu, Betrag)

**3. POST /api/sessions - Session speichern**
- **Funktionalität:** Persistierung einer abgeschlossenen Poker-Runde
- **Eingabe:** Liste von Spielern mit Name, Rebuys, Buy-in, End-Chips
- **Prozess:**
  - Transaction-Handling für atomare Datenbankoperationen
  - Speicherung der Session mit aktuellem Timestamp
  - Berechnung und Speicherung des Netto-Ergebnisses pro Spieler
  - Fehlerbehandlung mit Rollback-Mechanismus

**4. GET /api/history - Session-Historie**
- **Funktionalität:** Abruf der letzten 50 Poker-Sessions
- **Ausgabe:** Für jede Session: ID, Datum, Gewinner, Spieleranzahl
- **Features:** Automatische Ermittlung des Gewinners basierend auf höchstem Net-Wert

**5. GET /api/sessions/<id> - Session-Details**
- **Funktionalität:** Detaillierte Ansicht einer einzelnen Session
- **Ausgabe:** Vollständige Spielerdaten inklusive Rebuys und Netto-Ergebnisse

**6. GET /api/stats - Spieler-Statistiken**
- **Funktionalität:** Aggregierte Statistiken über alle Sessions
- **Berechnungen pro Spieler:**
  - Anzahl gespielter Runden
  - Gesamt Buy-in (berechnet aus end_chip - net)
  - Gesamt Cashout (end_chip)
  - Netto-Profit über alle Sessions
- **Ausgabe:** Nach Netto-Profit sortierte Spielerliste

### Schritt 4: Fehlerbehandlung und Robustheit
- Exception-Handling für alle API-Endpunkte
- Validierung von Eingabedaten (Typ-Konvertierungen)
- HTTP-Statuscodes für verschiedene Fehlerszenarien (400, 404, 500)
- Debug-Logging für Entwicklung

### Schritt 5: Testing und Optimierung
- Manuelle Tests aller API-Endpunkte
- Optimierung der Monte-Carlo-Simulation (2000 Iterationen als Balance zwischen Geschwindigkeit und Genauigkeit)
- Anpassung des Settlement-Algorithmus für Edge-Cases (≈0 Werte)
- Performance-Tests mit verschiedenen Spieleranzahlen

## 1.4 Technische Herausforderungen und Lösungen

**Herausforderung 1: Poker-Hand-Evaluierung**
- **Problem:** Komplexe Logik für Poker-Hand-Rankings
- **Lösung:** Verwendung der treys-Library für zuverlässige Evaluierung

**Herausforderung 2: Wahrscheinlichkeitsberechnung**
- **Problem:** Exakte Berechnung aller Kombinationen zu rechenintensiv
- **Lösung:** Monte-Carlo-Simulation mit 2000 Iterationen (±1% Genauigkeit)

**Herausforderung 3: Settlement-Optimierung**
- **Problem:** Minimierung der Anzahl Transaktionen
- **Lösung:** Two-Pointer-Algorithmus, der Verlierer direkt mit Gewinnern verbindet

**Herausforderung 4: Datenkonsistenz**
- **Problem:** Verschiedene Datenformate vom Frontend (Strings vs. Numbers)
- **Lösung:** Robuste Typ-Konvertierung mit try-except-Blöcken

## 1.5 Fazit

Das app.py Script erfüllt alle gesetzten Ziele und bietet ein solides Backend für den Poker Tracker. Durch die Verwendung von Flask wurde eine klare REST-API-Struktur geschaffen, die einfach vom Frontend konsumiert werden kann.

**Erreichte Funktionen:**
- ✓ Vollständiges Session-Management mit SQLite-Datenbank
- ✓ Präziser Odds-Calculator mit Monte-Carlo-Simulation
- ✓ Effizienter Settlement-Algorithmus
- ✓ Umfassende Statistik-Features
- ✓ Robuste Fehlerbehandlung

**Erkenntnisse:**
- Die Verwendung externer Libraries (treys) beschleunigt die Entwicklung erheblich
- Monte-Carlo-Simulationen sind ein praktischer Ansatz für komplexe Wahrscheinlichkeitsberechnungen
- Saubere API-Struktur erleichtert die Frontend-Integration
- SQLite eignet sich hervorragend für kleine bis mittlere Datenmengen

**Mögliche Erweiterungen:**
- WebSocket-Integration für Live-Updates
- Erweiterte Statistiken (Biggest Win, Longest Winning Streak)
- Export-Funktion für Daten (CSV, PDF)
- User-Authentication für Multi-User-Support

Das Projekt zeigt erfolgreich, wie Python-Automatisierung manuelle, fehleranfällige Prozesse ersetzen und gleichzeitig neue Funktionen ermöglichen kann, die manuell nicht realisierbar wären.
