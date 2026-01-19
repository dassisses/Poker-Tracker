# 🚀 Render Deployment Anleitung für Poker Tracker

## Voraussetzungen
- GitHub Repository mit diesem Projekt
- Render Account (kostenlos: https://render.com)

---

## 📝 Deployment Schritte

### Schritt 1: Repository zu GitHub pushen
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DEIN-USERNAME/poker-tracker.git
git push -u origin main
```

### Schritt 2: Render Dashboard öffnen
1. Gehe zu https://dashboard.render.com
2. Verbinde dein GitHub Account (falls noch nicht geschehen)

---

## 🔧 Backend Service Setup

### Option A: Mit render.yaml (Automatisch - EMPFOHLEN)
1. Klicke auf **"New +"** → **"Blueprint"**
2. Wähle dein Repository aus
3. Render erkennt automatisch die `render.yaml` Datei
4. Klicke auf **"Apply"**

⚠️ **WICHTIG:** Nach dem Deployment:
- Gehe zum Backend Service im Dashboard
- Kopiere die URL (z.B. `https://poker-tracker-backend-abc123.onrender.com`)
- Öffne `render.yaml` im Repository
- Ersetze `https://YOUR-BACKEND-URL.onrender.com` mit der echten URL
- Commit und push die Änderung
- Das Frontend wird automatisch neu deployed

### Option B: Manuell
**Backend Service:**
1. Klicke auf **"New +"** → **"Web Service"**
2. Wähle dein Repository
3. Konfiguration:
   - **Name:** `poker-tracker-backend`
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** Free
4. Klicke auf **"Create Web Service"**
5. **Kopiere die Service URL!** (z.B. `https://poker-tracker-backend-abc123.onrender.com`)

**Frontend Service:**
1. Klicke auf **"New +"** → **"Static Site"**
2. Wähle dein Repository
3. Konfiguration:
   - **Name:** `poker-tracker-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (npm install läuft automatisch)
   - **Publish Directory:** `dist`
4. **Redirect/Rewrite Rules** (SEHR WICHTIG):
   
   Füge unter **"Redirects/Rewrites"** folgende Regeln hinzu:
   
   **Regel 1 - API Proxy:**
   - **Source:** `/api/*`
   - **Destination:** `https://DEINE-BACKEND-URL.onrender.com/api/*`
   - **Type:** Rewrite
   
   **Regel 2 - SPA Fallback:**
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Type:** Rewrite

5. Klicke auf **"Create Static Site"**

---

## ⚙️ Wichtige Konfigurationen

### Backend Environment Variables (Optional)
Falls du später Umgebungsvariablen brauchst:
- Im Backend Service → **"Environment"** Tab
- Beispiele:
  ```
  PYTHON_VERSION=3.9.0
  DATABASE_URL=postgresql://... (falls du später PostgreSQL nutzt)
  ```

### CORS Einstellungen
✅ **Bereits konfiguriert** in `backend/app.py`:
```python
CORS(app)
```

### Database
- Standardmäßig nutzt die App SQLite
- ⚠️ **Wichtig:** Render's Free Tier hat ephemeres Storage
- Die Datenbank wird bei jedem Neustart gelöscht
- **Für Production:** Upgrade zu PostgreSQL empfohlen

---

## 🔍 Häufige Probleme & Lösungen

### Problem 1: "502 Bad Gateway" beim API Aufruf
**Lösung:** Backend URL im Frontend nicht richtig konfiguriert
- Prüfe die Rewrite Rules im Static Site
- Stelle sicher, dass die Backend URL korrekt ist (ohne `/` am Ende)

### Problem 2: Backend startet nicht
**Lösung:** Logge dich in Render ein und prüfe die Logs:
- Backend Service → **"Logs"** Tab
- Häufigster Fehler: Fehlende Dependencies in `requirements.txt`

### Problem 3: Frontend zeigt nur weiße Seite
**Lösung:** 
- Prüfe Frontend Build Logs
- Stelle sicher, dass SPA Fallback Rule existiert (`/* → /index.html`)

### Problem 4: Datenbank-Daten gehen verloren
**Lösung:** SQLite ist nicht persistent auf Render Free Tier
- Upgrade zu **Render PostgreSQL** (auch Free Tier verfügbar)
- Oder nutze externe DB wie Supabase/PlanetScale

---

## 🎯 Nach dem Deployment

### Testen
1. Öffne deine Frontend URL (z.B. `https://poker-tracker-frontend.onrender.com`)
2. Teste alle Features:
   - ✅ Odds Calculator
   - ✅ Session Tracker
   - ✅ Settlement Calculator
   - ✅ Dashboard
   - ✅ Session History

### URLs merken
- **Frontend:** `https://poker-tracker-frontend-XYZ.onrender.com`
- **Backend API:** `https://poker-tracker-backend-XYZ.onrender.com`

---

## 📊 Render Free Tier Limits

- ✅ **750 Stunden/Monat** für Web Services
- ✅ **100 GB Bandwidth/Monat** für Static Sites
- ⚠️ **Sleep nach 15 Min Inaktivität** (erste Anfrage dauert ~30 Sek)
- ⚠️ **Ephemeres Storage** (Daten gehen verloren bei Neustart)

### Tipp: Auto-Sleep verhindern
Nutze einen Uptime Monitor wie:
- UptimeRobot (https://uptimerobot.com)
- Cron-Job.org (https://cron-job.org)

Ping dein Backend alle 10 Minuten mit einem GET Request.

---

## 🔄 Updates deployen

### Automatisch (empfohlen)
Render deployed automatisch bei jedem Push zu deinem GitHub Repository:
```bash
git add .
git commit -m "Update feature X"
git push
```

### Manuell
Im Render Dashboard → Service → **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📞 Support

Bei Problemen:
1. Prüfe die Logs im Render Dashboard
2. Render Docs: https://render.com/docs
3. Community Forum: https://community.render.com

---

## ✅ Checkliste für erfolgreichen Deployment

- [ ] Repository auf GitHub gepusht
- [ ] Backend Service erstellt und läuft (grüner Status)
- [ ] Backend URL kopiert
- [ ] Frontend Service erstellt
- [ ] API Rewrite Rule mit echter Backend URL konfiguriert
- [ ] SPA Fallback Rule hinzugefügt (`/* → /index.html`)
- [ ] Frontend deployed und läuft
- [ ] Alle Features getestet
- [ ] Optional: Uptime Monitor eingerichtet

---

## 🎉 Fertig!

Deine Poker Tracker App ist jetzt live und weltweit erreichbar!

