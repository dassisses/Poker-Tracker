#!/usr/bin/env node
/**
 * Script zum Testen der Backend-Frontend Verbindung auf Render
 * Kann im Browser (Developer Console) oder mit Node.js ausgeführt werden
 */

// KONFIGURATION - Passen Sie diese URLs an
const BACKEND_URL = "https://poker-tracker-backend-3x39.onrender.com";
const FRONTEND_URL = "https://poker-tracker-frontend.onrender.com"; // Anpassen!

// Hilfsfunktionen für Console-Ausgabe
const log = {
    success: (msg) => console.log(`✓ ${msg}`),
    error: (msg) => console.error(`✗ ${msg}`),
    info: (msg) => console.log(`ℹ ${msg}`),
    warning: (msg) => console.warn(`⚠ ${msg}`),
    header: (msg) => {
        console.log('\n' + '='.repeat(60));
        console.log(msg);
        console.log('='.repeat(60) + '\n');
    }
};

// Test 1: Backend Erreichbarkeit
async function testBackendHealth() {
    log.header('TEST 1: Backend Erreichbarkeit');

    try {
        const response = await fetch(`${BACKEND_URL}/api/stats`);

        if (response.ok) {
            log.success(`Backend ist erreichbar unter ${BACKEND_URL}`);
            log.info(`Response Status: ${response.status}`);
            return true;
        } else {
            log.warning(`Backend antwortet mit Status ${response.status}`);
            return false;
        }
    } catch (error) {
        log.error(`Backend nicht erreichbar: ${error.message}`);
        return false;
    }
}

// Test 2: Test-Session erstellen
async function createTestSession() {
    log.header('TEST 2: Test-Session erstellen');

    const timestamp = new Date().toTimeString().split(' ')[0].replace(/:/g, '');

    const testData = {
        players: [
            {
                name: `TestPlayer1_${timestamp}`,
                buy_in: 100,
                rebuys: 1,
                endChips: 150
            },
            {
                name: `TestPlayer2_${timestamp}`,
                buy_in: 100,
                rebuys: 0,
                endChips: 75
            },
            {
                name: `TestPlayer3_${timestamp}`,
                buy_in: 100,
                rebuys: 2,
                endChips: 175
            }
        ]
    };

    log.info('Sende folgende Daten:');
    console.log(JSON.stringify(testData, null, 2));

    try {
        const response = await fetch(`${BACKEND_URL}/api/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        if (response.ok) {
            const data = await response.json();
            const sessionId = data.id;
            log.success(`Session erfolgreich erstellt! ID: ${sessionId}`);
            log.info(`Response: ${JSON.stringify(data, null, 2)}`);
            return sessionId;
        } else {
            log.error(`Fehler beim Erstellen: Status ${response.status}`);
            const text = await response.text();
            log.error(`Response: ${text}`);
            return null;
        }
    } catch (error) {
        log.error(`Anfrage fehlgeschlagen: ${error.message}`);
        return null;
    }
}

// Test 3: Session verifizieren
async function verifySession(sessionId) {
    log.header(`TEST 3: Session ${sessionId} verifizieren`);

    try {
        const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`);

        if (response.ok) {
            const data = await response.json();
            log.success('Session wurde gefunden!');
            log.info('Session Details:');
            console.log(JSON.stringify(data, null, 2));

            if (data.players && data.players.length === 3) {
                log.success('Alle 3 Spieler wurden gespeichert');

                data.players.forEach(player => {
                    log.info(`Spieler: ${player.name}, Net: ${player.net}, End Chips: ${player.end_chip}`);
                });

                return true;
            } else {
                log.warning('Spieleranzahl stimmt nicht überein');
                return false;
            }
        } else {
            log.error(`Session nicht gefunden: Status ${response.status}`);
            return false;
        }
    } catch (error) {
        log.error(`Verifizierung fehlgeschlagen: ${error.message}`);
        return false;
    }
}

// Test 4: History Endpoint
async function testHistoryEndpoint() {
    log.header('TEST 4: History Endpoint testen');

    try {
        const response = await fetch(`${BACKEND_URL}/api/history`);

        if (response.ok) {
            const sessions = await response.json();
            log.success(`History abgerufen: ${sessions.length} Sessions gefunden`);

            if (sessions.length > 0) {
                log.info('Letzte 3 Sessions:');
                sessions.slice(0, 3).forEach(session => {
                    console.log(`  - ID: ${session.id}, Datum: ${session.date}, ` +
                              `Gewinner: ${session.winner}, Spieler: ${session.player_count}`);
                });
            }

            return true;
        } else {
            log.error(`History Fehler: Status ${response.status}`);
            return false;
        }
    } catch (error) {
        log.error(`History abruf fehlgeschlagen: ${error.message}`);
        return false;
    }
}

// Test 5: Odds Calculator
async function testOddsCalculator() {
    log.header('TEST 5: Odds Calculator testen');

    const testData = {
        player_hand: ['Ah', 'Kh'],
        community_cards: ['Qh', 'Jh', '2c'],
        opponent_count: 2
    };

    log.info('Teste Odds Calculation mit:');
    console.log(JSON.stringify(testData, null, 2));

    try {
        const response = await fetch(`${BACKEND_URL}/api/odds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        if (response.ok) {
            const data = await response.json();
            log.success('Odds Calculator funktioniert!');
            log.info(`Win Rate: ${data.win_rate}%, Equity: ${data.equity}%`);
            return true;
        } else {
            log.error(`Odds Calculator Fehler: Status ${response.status}`);
            return false;
        }
    } catch (error) {
        log.error(`Odds Calculator fehlgeschlagen: ${error.message}`);
        return false;
    }
}

// Hauptfunktion
async function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🎰 Poker Tracker - Backend Connection Test');
    console.log('='.repeat(60) + '\n');

    log.info(`Backend URL: ${BACKEND_URL}`);
    log.info(`Frontend URL: ${FRONTEND_URL}`);
    log.info(`Zeitpunkt: ${new Date().toLocaleString()}\n`);

    const results = {};

    // Test 1: Backend Erreichbarkeit
    results.backend_health = await testBackendHealth();
    if (!results.backend_health) {
        log.error('\n❌ Backend nicht erreichbar - Tests abgebrochen');
        return;
    }

    // Test 2: Session erstellen
    const sessionId = await createTestSession();
    results.create_session = sessionId !== null;

    // Test 3: Session verifizieren
    if (sessionId) {
        results.verify_session = await verifySession(sessionId);
    } else {
        results.verify_session = false;
        log.warning('Session-Verifizierung übersprungen (keine ID)');
    }

    // Test 4: History
    results.history = await testHistoryEndpoint();

    // Test 5: Odds Calculator
    results.odds = await testOddsCalculator();

    // Zusammenfassung
    log.header('📊 TEST ZUSAMMENFASSUNG');

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(v => v).length;

    Object.entries(results).forEach(([testName, passed]) => {
        const status = passed ? '✓ PASS' : '✗ FAIL';
        console.log(`${status} - ${testName}`);
    });

    console.log(`\nErgebnis: ${passedTests}/${totalTests} Tests bestanden\n`);

    if (passedTests === totalTests) {
        log.success('🎉 Alle Tests erfolgreich! Backend ist voll funktionsfähig!');

        if (sessionId) {
            console.log(`\nTest-Session ID: ${sessionId}`);
            log.info('Sie können diese Session in der History ansehen:');
            log.info(`  ${BACKEND_URL}/api/sessions/${sessionId}`);
        }
    } else {
        log.error('⚠️  Einige Tests sind fehlgeschlagen. Bitte Logs überprüfen.');
    }

    return results;
}

// Exportiere für Browser oder Node.js
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = { runAllTests, testBackendHealth, createTestSession, verifySession };

    // Wenn direkt ausgeführt
    if (require.main === module) {
        runAllTests().catch(console.error);
    }
} else {
    // Browser - Stelle Funktionen global zur Verfügung
    window.pokerTrackerTest = {
        runAllTests,
        testBackendHealth,
        createTestSession,
        verifySession,
        testHistoryEndpoint,
        testOddsCalculator
    };

    console.log('🎰 Poker Tracker Test geladen!');
    console.log('Führe aus: pokerTrackerTest.runAllTests()');
}

