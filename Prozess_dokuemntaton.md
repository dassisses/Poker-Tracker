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

Beim privaten Pokerspielen mit Kollegen entstand die Idee, einen digitalen Tracker zu entwickeln. Dieser soll die Plus-Minus-Bilanz jedes Spielers erfassen und zusätzlich Gewinnwahrscheinlichkeiten für beliebige Pokerhände berechnen können.

**Probleme beim manuellen Vorgehen:**
- Fehleranfällige manuelle Berechnungen der Gewinne und Verluste
- Zeitaufwändige Abrechnung am Ende jeder Spielrunde
- Keine Möglichkeit zur Analyse historischer Spielerdaten
- Komplexe Wahrscheinlichkeitsberechnungen sind im Kopf nicht realisierbar
- Unübersichtliche Schulden-Verteilung bei mehreren Spielern

## 1.2 Ziele

Das Ziel ist es, ein Python-Backend-Script (app.py) zu entwickeln, das als REST-API für eine Poker-Tracker-Webapp dient.

**Hauptfunktionen des Scripts:**
1. **Session-Management:** Verwaltung von Poker-Sessions mit mehreren Spielern
2. **Saldo-Tracking:** Erfassung von Buy-ins, Rebuys und End-Chips für jeden Spieler
3. **Settlement-Algorithmus:** Automatische Berechnung optimaler Transaktionen (wer zahlt wem wie viel)
4. **Odds-Calculator:** Berechnung der Gewinnwahrscheinlichkeiten basierend auf eigener Hand, Community Cards und Gegneranzahl
5. **Statistiken:** Anzeige aggregierter Spielerstatistiken über alle Sessions hinweg
6. **Historie:** Persistente Speicherung und Abruf vergangener Sessions

**Technische Anforderungen:**
- **Framework:** Flask als REST-API Backend
- **Datenbank:** SQLite für persistente Datenspeicherung
- **Libraries:** Treys für professionelle Poker-Hand-Evaluierung
- **CORS:** Aktiviert für Frontend-Kommunikation
- **Fehlerbehandlung:** Robuste Exception-Handling-Mechanismen

## 1.3 Entwicklungsprozess des app.py Scripts

### Schritt 1: Projekt-Setup und Grundstruktur
- Installation der benötigten Python-Packages (Flask, Flask-CORS, treys)
- Erstellung der Flask-Anwendung mit CORS-Unterstützung für Frontend-Kommunikation
- Definition des Datenbankpfads mit relativer Pfadbestimmung mittels `os.path`
- Initialisierung des Treys-Evaluators für Poker-Hand-Bewertungen

### Schritt 2: Datenbank-Design und Initialisierung
**Tabellen-Schema entwickelt:**
- `sessions`: Speichert Poker-Sessions (id, date, name)
- `players`: Speichert Spielerdaten pro Session (id, session_id, name, rebuys, end_chip, net)

**Implementierte Datenbankfunktionen:**
- `get_db()`: Datenbankverbindung mit Flask's Application Context und Row Factory
- `init_db()`: Automatische Tabellenerstellung beim Serverstart
- `close_connection()`: Sauberes Schließen der Datenbankverbindung nach Request

### Schritt 3: API-Endpunkte implementiert

**1. POST /api/odds - Odds Calculator**
- **Funktionalität:** Monte-Carlo-Simulation zur Berechnung von Gewinnwahrscheinlichkeiten
- **Eingabe:** Spielerhand (2 Karten), Community Cards (0-5 Karten), Anzahl Gegner
- **Prozess:**
  - Parsen der Karten-Strings (z.B. "Ah", "Ks") mit treys Card.new()
  - Erstellen eines vollständigen Decks und Entfernen bekannter Karten
  - 2000 Simulationsiterationen mit zufälliger Verteilung restlicher Karten
  - Evaluierung jeder Hand mit treys Evaluator
  - Vergleich der Scores (niedrigster Score = beste Hand bei treys)
- **Ausgabe:** Win-Rate, Tie-Rate und Equity in Prozent (±1% Genauigkeit)

**2. POST /api/settle - Settlement-Algorithmus**
- **Funktionalität:** Berechnung optimaler Transaktionen zur Schuldenbegleichung
- **Eingabe:** Liste von Spielern mit Buy-in und End-Chips
- **Algorithmus (Two-Pointer-Approach):**
  - Berechnung des Netto-Gewinns/-Verlusts pro Spieler
  - Sortierung: Verlierer (negative Werte) zuerst, Gewinner (positive) zuletzt
  - Iteratives Matching: Verlierer zahlen direkt an Gewinner
  - Minimierung der Transaktionsanzahl durch optimales Pairing
- **Ausgabe:** Liste von Transaktionen (von, zu, Betrag)

**3. POST /api/sessions - Session speichern**
- **Funktionalität:** Persistierung einer abgeschlossenen Poker-Runde
- **Eingabe:** Liste von Spielern mit Name, Rebuys, Buy-in, End-Chips
- **Prozess:**
  - Transaction-Handling für atomare Datenbankoperationen
  - Speicherung der Session mit aktuellem ISO-Timestamp
  - Berechnung und Speicherung des Netto-Ergebnisses pro Spieler (net = end_chip - buy_in_total)
  - Fehlerbehandlung mit automatischem Rollback bei Problemen
  - Robuste Typ-Konvertierung (String zu Float/Int) für Frontend-Kompatibilität

**4. GET /api/history - Session-Historie**
- **Funktionalität:** Abruf der letzten 50 Poker-Sessions
- **Ausgabe:** Für jede Session: ID, Datum, Session-Name, Gewinner, Spieleranzahl
- **Features:** Automatische Ermittlung des Gewinners basierend auf höchstem Net-Wert
- **Sortierung:** Chronologisch absteigend (neueste zuerst)

**5. GET /api/sessions/<id> - Session-Details**
- **Funktionalität:** Detaillierte Ansicht einer einzelnen Session
- **Ausgabe:** Vollständige Spielerdaten inklusive Rebuys und Netto-Ergebnisse
- **Fehlerbehandlung:** 404-Response bei nicht existierender Session-ID

**6. GET /api/stats - Spieler-Statistiken**
- **Funktionalität:** Aggregierte Statistiken über alle Sessions
- **Berechnungen pro Spieler:**
  - Anzahl gespielter Runden (total_games)
  - Gesamt Buy-in (berechnet aus end_chip - net)
  - Gesamt Cashout (end_chip)
  - Netto-Profit über alle Sessions (Summe aller net-Werte)
- **Ausgabe:** Nach Netto-Profit sortierte Spielerliste (beste Spieler zuerst)

### Schritt 4: Fehlerbehandlung und Robustheit
- Try-Except-Blöcke für alle API-Endpunkte mit detaillierten Fehlerausgaben
- Validierung von Eingabedaten mit robusten Typ-Konvertierungen (Float/Int)
- HTTP-Statuscodes für verschiedene Fehlerszenarien (400 Bad Request, 404 Not Found, 500 Internal Server Error)
- Debug-Logging mit Traceback für Entwicklung und Fehlersuche
- Datenbankabfragen mit parametrisierten Statements (SQL-Injection-Schutz)

### Schritt 5: Testing und Optimierung
- Manuelle Tests aller API-Endpunkte mit verschiedenen Eingabeszenarien
- Optimierung der Monte-Carlo-Simulation auf 2000 Iterationen (Balance zwischen Geschwindigkeit und Genauigkeit)
- Anpassung des Settlement-Algorithmus für Edge-Cases (Werte nahe 0 mit 0.01 Toleranz)
- Performance-Tests mit verschiedenen Spieleranzahlen (1-10 Spieler)
- Validierung der Datenbank-Transaktionen und Rollback-Mechanismen

## 1.4 Technische Herausforderungen und Lösungen

**Herausforderung 1: Poker-Hand-Evaluierung**
- **Problem:** Komplexe Logik für Poker-Hand-Rankings und -Vergleiche
- **Lösung:** Verwendung der treys-Library für zuverlässige, professionelle Evaluierung

**Herausforderung 2: Wahrscheinlichkeitsberechnung**
- **Problem:** Exakte Berechnung aller Kombinationen zu rechenintensiv (Millionen Möglichkeiten)
- **Lösung:** Monte-Carlo-Simulation mit 2000 Iterationen (±1% Genauigkeit bei <1s Rechenzeit)

**Herausforderung 3: Settlement-Optimierung**
- **Problem:** Minimierung der Anzahl Transaktionen bei mehreren Spielern
- **Lösung:** Two-Pointer-Algorithmus mit Sortierung, der Verlierer direkt mit Gewinnern verbindet

**Herausforderung 4: Datenkonsistenz**
- **Problem:** Verschiedene Datenformate vom Frontend (Strings vs. Numbers, unterschiedliche Feldnamen)
- **Lösung:** Robuste Typ-Konvertierung mit try-except-Blöcken und flexible Feldnamen-Behandlung

**Herausforderung 5: Datenbankpfad-Verwaltung**
- **Problem:** Absolute Pfade funktionieren nicht auf verschiedenen Systemen
- **Lösung:** Verwendung von `os.path` für relative Pfadbestimmung basierend auf Script-Verzeichnis

## 1.5 Fazit

Das app.py Script erfüllt alle gesetzten Ziele und bietet ein solides Backend für den Poker Tracker. Durch die Verwendung von Flask wurde eine klare REST-API-Struktur geschaffen, die einfach vom Frontend konsumiert werden kann.

**Erreichte Funktionen:**
- ✓ Vollständiges Session-Management mit SQLite-Datenbank
- ✓ Präziser Odds-Calculator mit Monte-Carlo-Simulation
- ✓ Effizienter Settlement-Algorithmus mit minimaler Transaktionsanzahl
- ✓ Umfassende Statistik-Features über alle Sessions hinweg
- ✓ Robuste Fehlerbehandlung und Validierung
- ✓ Persistente Datenspeicherung mit Historie-Funktion

**Gewonnene Erkenntnisse:**
- Die Verwendung externer Libraries (treys) beschleunigt die Entwicklung erheblich und erhöht die Codequalität
- Monte-Carlo-Simulationen sind ein praktischer Ansatz für komplexe Wahrscheinlichkeitsberechnungen
- Saubere API-Struktur mit RESTful-Prinzipien erleichtert die Frontend-Integration
- SQLite eignet sich hervorragend für kleine bis mittlere Datenmengen mit relationalen Strukturen
- Transaction-Handling ist essentiell für Datenkonsistenz bei Mehrfach-Inserts

**Persönliche Reflexion:**

Das Projekt hat mir wirklich Spaß gemacht und ich konnte viel lernen über API-Entwicklung mit Flask und Datenbank-Management mit SQLite. Besonders interessant war die Implementierung des Odds-Calculators mit Monte-Carlo-Simulation – eine Technik, die ich vorher nur theoretisch kannte.

Ich bin mit dem Ergebnis sehr zufrieden. Das Backend ist stabil, performant und erfüllt alle Anforderungen. Der nächste Schritt wäre, die Anwendung auf einem Server zu hosten (z.B. Heroku, Railway oder DigitalOcean), damit ich von überall darauf zugreifen kann.

**Ausblick und mögliche Erweiterungen:**
- Multi-User-Authentifizierung für private Poker-Gruppen
- Export-Funktion für Spieler-Statistiken (CSV/PDF)
- Erweiterte Analytics (Charts, Trends, Performance über Zeit)
- Push-Benachrichtigungen für ausstehende Schulden
- Integration mit Payment-Services für automatische Transaktionen

Das Projekt zeigt erfolgreich, wie Python-Automatisierung manuelle, fehleranfällige Prozesse ersetzen und gleichzeitig neue Funktionen ermöglichen kann, die manuell nicht realisierbar wären. Die Kombination aus mathematischer Präzision (Odds-Calculation) und praktischer Anwendbarkeit (Settlement-Algorithmus) macht das Tool zu einem wertvollen Begleiter für Poker-Runden.

