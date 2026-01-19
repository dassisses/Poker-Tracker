// API Configuration für Poker Tracker
// Diese Datei zentralisiert alle API-Aufrufe

// Backend-URL - wird automatisch aus Umgebungsvariable gelesen
// Fallback: Direkter Backend-Link
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
                     'https://poker-tracker-backend-3x39.onrender.com/api';

// Timeout für API-Anfragen (in Millisekunden)
const REQUEST_TIMEOUT = 30000; // 30 Sekunden (wichtig für Render Free Tier)

// Helper-Funktion für API-Aufrufe mit Timeout
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - Backend könnte im Sleep-Mode sein. Bitte nochmal versuchen.');
        }
        throw error;
    }
}

// API Client
export const api = {
    // GET request
    async get(endpoint) {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    },

    // POST request
    async post(endpoint, data) {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            throw error;
        }
    },

    // Health check
    async healthCheck() {
        try {
            await this.get('/stats');
            return true;
        } catch (error) {
            console.warn('Backend health check failed:', error);
            return false;
        }
    }
};

// Exportiere auch die Base-URL für direkte Verwendung
export { API_BASE_URL };

// Verwendung in Komponenten:
// import { api } from './config/api';
//
// // GET
// const sessions = await api.get('/history');
//
// // POST
// const result = await api.post('/sessions', { players: [...] });

