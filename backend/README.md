# Poker App Backend

This is the Flask-based backend for the Poker Application. It provides APIs for odds calculation, game settlement, session management, and player statistics.

## Prerequisites

- Python 3.8+
- pip

## Installation

1.  Navigate to the project root directory.
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    -   **Mac/Linux:** `source venv/bin/activate`
    -   **Windows:** `venv\Scripts\activate`
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Application

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Run the Flask application:
    ```bash
    python app.py
    ```
    The server will start on `http://localhost:5001`.

## Database

The application uses an SQLite database (`poker_sessions.db`) which is automatically created in the `backend` directory upon the first run.

-   **sessions**: Stores game session metadata (date, name).
-   **players**: Stores player details per session (buy-in, cash-out, net profit, rebuys).

## API Endpoints

### 1. Odds Calculator
**POST** `/api/odds`
Calculates win rate, tie rate, and equity for a given hand.

**Request Body:**
```json
{
  "player_hand": ["Ah", "Kh"],
  "community_cards": ["Td", "Jd", "Qs"],
  "opponent_count": 1
}
```

### 2. Game Settlement
**POST** `/api/settle`
Calculates the optimal payouts to settle debts between players.

**Request Body:**
```json
{
  "players": [
    { "name": "Alice", "buy_in": 100, "end_chip": 150 },
    { "name": "Bob", "buy_in": 100, "end_chip": 50 }
  ]
}
```

### 3. Session Management
-   **GET** `/api/history`: Returns the last 50 game sessions.
-   **POST** `/api/sessions`: Saves a new game session.
-   **GET** `/api/sessions/<id>`: Returns details for a specific session.

### 4. Statistics
**GET** `/api/stats`
Returns aggregated statistics for all players, including total games played, total buy-ins, total cash-outs, and net profit.
