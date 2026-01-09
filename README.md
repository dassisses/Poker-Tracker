# Poker Tracker

A modern web application for tracking poker sessions, calculating settlement payouts, and analyzing Texas Hold'em odds.

## Features
- **Session Tracking**: Log buy-ins, cash-outs, and rebuys.
- **Settlement Calculator**: Automatically calculate who pays whom after a game.
- **Odds Calculator**: Real-time win/tie/equity calculation.
- **Dashboard**: View statistics and history.
- **Modern UI**: Dark mode with animated backgrounds and glassmorphism.

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm

### Installation

1.  **Backend Setup**
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```

## Usage

You need to run both the backend (API) and frontend (UI) simultaneously.

**Terminal 1: Backend**
```bash
cd backend
python3 app.py
```
*Server runs on port 5001.*

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```
*App runs on http://localhost:5173.*

## Project Structure
- `backend/`: Flask API & SQLite Database
- `frontend/`: React + Vite Application