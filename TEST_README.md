# Backend-Frontend Verbindungs-Test

Diese Scripts helfen Ihnen, die Verbindung zwischen Frontend und Backend auf Render zu testen und zu diagnostizieren.

## 🎯 Zweck

Die Scripts überprüfen:
- ✅ Backend-Erreichbarkeit
- ✅ Erstellen von Sessions
- ✅ Abrufen von Daten
- ✅ CORS-Konfiguration
- ✅ Frontend-zu-Backend Weiterleitung

## 📋 Verfügbare Test-Scripts

### 1. Python Script (`test_backend_connection.py`)

**Voraussetzungen:**
```bash
pip install requests
```

**Verwendung:**
```bash
cd /Users/taavoci1/Desktop/testing\ somting/Poker-Tracker
python3 test_backend_connection.py
```

**Anpassen der URLs:**
Öffnen Sie die Datei und ändern Sie:
```python
BACKEND_URL = "https://poker-tracker-backend-3x39.onrender.com"
FRONTEND_URL = "https://ihre-frontend-url.onrender.com"  # Ihre Frontend-URL
```

### 2. JavaScript/Node.js Script (`test_backend_connection.js`)

**Option A: Mit Node.js ausführen**
```bash
cd /Users/taavoci1/Desktop/testing\ somting/Poker-Tracker
node test_backend_connection.js
```

**Option B: Im Browser (Developer Console)**

1. Öffnen Sie Ihre Frontend-Website
2. Öffnen Sie die Developer Console (F12 oder Cmd+Option+I)
3. Kopieren Sie den kompletten Inhalt von `test_backend_connection.js`
4. Fügen Sie ihn in die Console ein und drücken Sie Enter
5. Führen Sie aus:
```javascript
pokerTrackerTest.runAllTests()
```

## 🔍 Häufige Probleme und Lösungen

### Problem 1: Backend nicht erreichbar

**Symptom:** `Backend nicht erreichbar` Fehler

**Lösungen:**
1. Überprüfen Sie, ob das Backend auf Render deployed ist
2. Prüfen Sie die Render-Logs:
   - Gehen Sie zu render.com Dashboard
   - Wählen Sie Ihren Backend-Service
   - Schauen Sie in die "Logs"
3. Stellen Sie sicher, dass der Service nicht im "Suspended" Status ist

### Problem 2: CORS-Fehler im Browser

**Symptom:** `Access to fetch at ... has been blocked by CORS policy`

**Lösung:** Überprüfen Sie `backend/app.py`:
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Diese Zeile muss vorhanden sein
```

### Problem 3: Frontend kann Backend nicht erreichen

**Symptom:** API-Aufrufe vom Frontend schlagen fehl

**Mögliche Ursachen:**

#### A) Falsche Backend-URL in render.yaml

Prüfen Sie `render.yaml`:
```yaml
routes:
  - type: rewrite
    source: /api/*
    destination: https://poker-tracker-backend-3x39.onrender.com/api/*
```

**Die Backend-URL muss korrekt sein!**

So finden Sie die korrekte URL:
1. Gehen Sie zu render.com Dashboard
2. Wählen Sie Ihren Backend-Service
3. Kopieren Sie die URL (z.B. `https://poker-tracker-backend-xyz.onrender.com`)

#### B) Backend schläft (Free Tier)

Render's Free Tier versetzt Services nach Inaktivität in den Schlafmodus.

**Lösung:**
- Warten Sie 30-60 Sekunden beim ersten Aufruf
- Der Service wird automatisch "aufgeweckt"

#### C) Umgebungsvariablen fehlen

**Lösung:**
1. Gehen Sie zu Render Dashboard → Backend Service → Environment
2. Fügen Sie benötigte Variablen hinzu
3. Deployen Sie neu

### Problem 4: Datenbank wird nicht gefunden

**Symptom:** `no such table: sessions` oder ähnliche Fehler

**Lösung:** Die Datenbank wird automatisch beim Start erstellt. Prüfen Sie:

1. Ob `init_db()` in `app.py` aufgerufen wird
2. Render-Logs auf Fehler bei der DB-Initialisierung
3. Ob die Datei `poker_sessions.db` Schreibrechte hat

## 🧪 Einzelne Tests ausführen

### Python
```python
# In Python-Konsole
import test_backend_connection as test

# Einzelne Tests
test.test_backend_health()
session_id = test.create_test_session()
test.verify_session(session_id)
test.test_history_endpoint()
```

### JavaScript (Browser Console)
```javascript
// Einzelne Tests
await pokerTrackerTest.testBackendHealth()
const sessionId = await pokerTrackerTest.createTestSession()
await pokerTrackerTest.verifySession(sessionId)
await pokerTrackerTest.testHistoryEndpoint()
await pokerTrackerTest.testOddsCalculator()
```

## 📊 Test-Ausgabe verstehen

### ✓ PASS - Grün
Der Test war erfolgreich. Alles funktioniert wie erwartet.

### ✗ FAIL - Rot
Der Test ist fehlgeschlagen. Prüfen Sie die Fehlermeldung.

### ⚠ Warning - Gelb
Warnung - nicht kritisch, aber beachtenswert.

## 🔧 Manuelle API-Tests mit curl

### Session erstellen
```bash
curl -X POST https://poker-tracker-backend-3x39.onrender.com/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "players": [
      {"name": "Alice", "buy_in": 100, "rebuys": 1, "endChips": 150},
      {"name": "Bob", "buy_in": 100, "rebuys": 0, "endChips": 80}
    ]
  }'
```

### History abrufen
```bash
curl https://poker-tracker-backend-3x39.onrender.com/api/history
```

### Spezifische Session abrufen
```bash
curl https://poker-tracker-backend-3x39.onrender.com/api/sessions/1
```

### Stats abrufen
```bash
curl https://poker-tracker-backend-3x39.onrender.com/api/stats
```

## 🌐 Frontend-spezifische Tests

Wenn Ihr Frontend deployed ist, testen Sie direkt im Browser:

1. Öffnen Sie die Developer Console
2. Testen Sie einen API-Aufruf:

```javascript
// Test mit relativer URL (geht über Frontend-Routing)
fetch('/api/stats')
  .then(r => r.json())
  .then(data => console.log('Stats:', data))
  .catch(e => console.error('Fehler:', e))

// Test mit direkter Backend-URL
fetch('https://poker-tracker-backend-3x39.onrender.com/api/stats')
  .then(r => r.json())
  .then(data => console.log('Stats:', data))
  .catch(e => console.error('Fehler:', e))
```

## 📝 Nächste Schritte nach erfolgreichen Tests

1. **Alle Tests PASS:**
   - Ihr Backend funktioniert einwandfrei!
   - Prüfen Sie das Frontend (siehe unten)

2. **Einige Tests FAIL:**
   - Überprüfen Sie die Render-Logs
   - Prüfen Sie die URLs in `render.yaml`
   - Stellen Sie sicher, dass alle Dependencies installiert sind

3. **Frontend-Integration:**
   - Stellen Sie sicher, dass alle `fetch()`-Aufrufe die korrekte URL verwenden
   - In `render.yaml` sollte die Backend-URL korrekt sein
   - Testen Sie die App im Browser und prüfen Sie die Network-Tab

## 🐛 Debugging-Tipps

### Render Logs ansehen
```bash
# Wenn Sie die Render CLI installiert haben
render logs -s poker-tracker-backend
```

### Netzwerk-Tab im Browser
1. Öffnen Sie Developer Tools (F12)
2. Gehen Sie zum "Network" Tab
3. Führen Sie eine Aktion aus (z.B. Session speichern)
4. Schauen Sie sich die Request/Response an:
   - Status Code (sollte 200 sein)
   - Request URL (korrekt?)
   - Response Body (Fehlermeldungen?)

### Backend-Logs auf Render
1. render.com → Ihr Service → Logs
2. Suchen Sie nach Fehlern oder Exceptions
3. Achten Sie besonders auf:
   - Import-Fehler
   - Datenbank-Fehler
   - CORS-Warnungen

## ❓ Support

Bei weiteren Problemen:
1. Führen Sie die Test-Scripts aus und notieren Sie die Fehler
2. Prüfen Sie die Render-Logs
3. Prüfen Sie die Browser-Console (F12)
4. Vergleichen Sie Ihre URLs in `render.yaml` mit den tatsächlichen Render-URLs

## 📚 Zusätzliche Ressourcen

- [Render Documentation](https://render.com/docs)
- [Flask CORS Documentation](https://flask-cors.readthedocs.io/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

