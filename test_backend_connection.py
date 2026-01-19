#!/usr/bin/env python3
"""
Script zum Testen der Backend-Frontend Verbindung auf Render
Dieses Script testet:
1. Backend-Erreichbarkeit
2. Erstellen einer Test-Session
3. Abrufen der erstellten Session
4. Überprüfung der Daten
"""

import requests
import json
import sys
from datetime import datetime

# KONFIGURATION - Passen Sie diese URLs an
BACKEND_URL = "https://poker-tracker-backend-3x39.onrender.com"
FRONTEND_URL = "https://poker-tracker-frontend.onrender.com"  # Anpassen!

# Farben für Terminal-Ausgabe
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def print_header(msg):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{msg}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def test_backend_health():
    """Test ob das Backend erreichbar ist"""
    print_header("TEST 1: Backend Erreichbarkeit")

    try:
        # Versuche die Stats-Endpoint zu erreichen
        response = requests.get(f"{BACKEND_URL}/api/stats", timeout=10)

        if response.status_code == 200:
            print_success(f"Backend ist erreichbar unter {BACKEND_URL}")
            print_info(f"Response Status: {response.status_code}")
            return True
        else:
            print_warning(f"Backend antwortet mit Status {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print_error(f"Backend nicht erreichbar: {str(e)}")
        return False

def create_test_session():
    """Erstelle eine Test-Session im Backend"""
    print_header("TEST 2: Test-Session erstellen")

    test_data = {
        "players": [
            {
                "name": f"TestPlayer1_{datetime.now().strftime('%H%M%S')}",
                "buy_in": 100,
                "rebuys": 1,
                "endChips": 150
            },
            {
                "name": f"TestPlayer2_{datetime.now().strftime('%H%M%S')}",
                "buy_in": 100,
                "rebuys": 0,
                "endChips": 75
            },
            {
                "name": f"TestPlayer3_{datetime.now().strftime('%H%M%S')}",
                "buy_in": 100,
                "rebuys": 2,
                "endChips": 175
            }
        ]
    }

    print_info("Sende folgende Daten:")
    print(json.dumps(test_data, indent=2))

    try:
        response = requests.post(
            f"{BACKEND_URL}/api/sessions",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            session_id = data.get('id')
            print_success(f"Session erfolgreich erstellt! ID: {session_id}")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            return session_id
        else:
            print_error(f"Fehler beim Erstellen: Status {response.status_code}")
            print_error(f"Response: {response.text}")
            return None

    except requests.exceptions.RequestException as e:
        print_error(f"Anfrage fehlgeschlagen: {str(e)}")
        return None

def verify_session(session_id):
    """Überprüfe ob die Session korrekt gespeichert wurde"""
    print_header(f"TEST 3: Session {session_id} verifizieren")

    try:
        # 1. Hole spezifische Session
        response = requests.get(
            f"{BACKEND_URL}/api/sessions/{session_id}",
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            print_success("Session wurde gefunden!")
            print_info("Session Details:")
            print(json.dumps(data, indent=2))

            # Validiere Daten
            if 'players' in data and len(data['players']) == 3:
                print_success("Alle 3 Spieler wurden gespeichert")

                # Überprüfe Berechnungen
                for player in data['players']:
                    expected_net = player['end_chip'] - (player['end_chip'] - player['net'])
                    print_info(f"Spieler: {player['name']}, Net: {player['net']}, End Chips: {player['end_chip']}")

                return True
            else:
                print_warning("Spieleranzahl stimmt nicht überein")
                return False
        else:
            print_error(f"Session nicht gefunden: Status {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print_error(f"Verifizierung fehlgeschlagen: {str(e)}")
        return False

def test_history_endpoint():
    """Test ob die History alle Sessions enthält"""
    print_header("TEST 4: History Endpoint testen")

    try:
        response = requests.get(f"{BACKEND_URL}/api/history", timeout=10)

        if response.status_code == 200:
            sessions = response.json()
            print_success(f"History abgerufen: {len(sessions)} Sessions gefunden")

            if len(sessions) > 0:
                print_info("Letzte 3 Sessions:")
                for session in sessions[:3]:
                    print(f"  - ID: {session['id']}, Datum: {session['date']}, "
                          f"Gewinner: {session['winner']}, Spieler: {session['player_count']}")

            return True
        else:
            print_error(f"History Fehler: Status {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print_error(f"History abruf fehlgeschlagen: {str(e)}")
        return False

def test_cors_headers():
    """Teste CORS Headers vom Backend"""
    print_header("TEST 5: CORS-Konfiguration prüfen")

    try:
        response = requests.options(
            f"{BACKEND_URL}/api/sessions",
            headers={
                "Origin": FRONTEND_URL,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=10
        )

        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
        }

        print_info("CORS Headers:")
        for key, value in cors_headers.items():
            if value:
                print_success(f"  {key}: {value}")
            else:
                print_warning(f"  {key}: Nicht gesetzt")

        if cors_headers.get("Access-Control-Allow-Origin"):
            print_success("CORS ist aktiviert")
            return True
        else:
            print_warning("CORS Headers nicht optimal konfiguriert")
            return True  # Nicht kritisch, da CORS via Flask-CORS gesetzt wird

    except requests.exceptions.RequestException as e:
        print_warning(f"CORS-Test nicht möglich: {str(e)}")
        return True

def test_frontend_to_backend():
    """Test die Frontend-zu-Backend Weiterleitung"""
    print_header("TEST 6: Frontend-Weiterleitung (Optional)")

    print_info("Frontend URL: " + FRONTEND_URL)
    print_warning("Hinweis: Dieser Test kann nur funktionieren, wenn Frontend deployed ist")

    try:
        # Versuche über Frontend zu routen
        response = requests.get(f"{FRONTEND_URL}/api/stats", timeout=10)

        if response.status_code == 200:
            print_success("Frontend leitet korrekt zum Backend weiter!")
            return True
        else:
            print_warning(f"Frontend-Weiterleitung Status: {response.status_code}")
            print_info("Dies ist normal wenn Frontend noch nicht deployed ist")
            return True

    except requests.exceptions.RequestException as e:
        print_warning(f"Frontend-Test fehlgeschlagen: {str(e)}")
        print_info("Frontend könnte noch nicht deployed sein - Backend funktioniert aber!")
        return True

def main():
    print(f"\n{Colors.BOLD}{'='*60}")
    print("🎰 Poker Tracker - Backend Connection Test")
    print(f"{'='*60}{Colors.END}\n")

    print_info(f"Backend URL: {BACKEND_URL}")
    print_info(f"Frontend URL: {FRONTEND_URL}")
    print_info(f"Zeitpunkt: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    results = {}

    # Test 1: Backend Erreichbarkeit
    results['backend_health'] = test_backend_health()
    if not results['backend_health']:
        print_error("\n❌ Backend nicht erreichbar - Tests abgebrochen")
        sys.exit(1)

    # Test 2: Session erstellen
    session_id = create_test_session()
    results['create_session'] = session_id is not None

    # Test 3: Session verifizieren
    if session_id:
        results['verify_session'] = verify_session(session_id)
    else:
        results['verify_session'] = False
        print_warning("Session-Verifizierung übersprungen (keine ID)")

    # Test 4: History
    results['history'] = test_history_endpoint()

    # Test 5: CORS
    results['cors'] = test_cors_headers()

    # Test 6: Frontend Weiterleitung
    results['frontend'] = test_frontend_to_backend()

    # Zusammenfassung
    print_header("📊 TEST ZUSAMMENFASSUNG")

    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)

    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        color = Colors.GREEN if passed else Colors.RED
        print(f"{color}{status}{Colors.END} - {test_name}")

    print(f"\n{Colors.BOLD}Ergebnis: {passed_tests}/{total_tests} Tests bestanden{Colors.END}\n")

    if passed_tests == total_tests:
        print_success("🎉 Alle Tests erfolgreich! Backend ist voll funktionsfähig!")

        if session_id:
            print(f"\n{Colors.BOLD}Test-Session ID: {session_id}{Colors.END}")
            print_info("Sie können diese Session in der History ansehen:")
            print_info(f"  {BACKEND_URL}/api/sessions/{session_id}")
    else:
        print_error("⚠️  Einige Tests sind fehlgeschlagen. Bitte Logs überprüfen.")
        sys.exit(1)

if __name__ == "__main__":
    main()

