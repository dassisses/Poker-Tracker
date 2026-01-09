import sqlite3
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from treys import Card, Evaluator, Deck
from datetime import datetime

app = Flask(__name__)
CORS(app)

import os

# ... imports ...

evaluator = Evaluator()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'poker_sessions.db')

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        db.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                name TEXT
            )
        ''')
        db.execute('''
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                name TEXT NOT NULL,
                rebuys INTEGER DEFAULT 0,
                end_chip REAL DEFAULT 0,
                net REAL DEFAULT 0,
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        ''')
        db.commit()

# Initialize DB on start
init_db()

# Helper: Parse card string (e.g., "Ah", "Ks") to treys int
def parse_card(card_str):
    if len(card_str) < 2: return None
    return Card.new(card_str)

@app.route('/api/odds', methods=['POST'])
def get_odds():
    data = request.json
    try:
        player_hand_str = data.get('player_hand', [])
        board_str = data.get('community_cards', [])
        opponent_count = int(data.get('opponent_count', 1))

        # 1. Parse known cards
        player_hand = [Card.new(c) for c in player_hand_str]
        board = [Card.new(c) for c in board_str]

        # 2. Setup Deck (remove known cards)
        deck = Deck()
        known_cards = player_hand + board
        full_deck = deck.GetFullDeck()
        available_cards = [c for c in full_deck if c not in known_cards]

        # 3. Monte Carlo Simulation
        wins = 0
        ties = 0
        iterations = 2000

        import random
        
        for _ in range(iterations):
            random.shuffle(available_cards)
            cards_needed_board = 5 - len(board)
            cards_needed_opponents = opponent_count * 2
            
            sim_board = board + available_cards[:cards_needed_board]
            sim_opponents_cards = available_cards[cards_needed_board : cards_needed_board + cards_needed_opponents]
            
            p_score = evaluator.evaluate(sim_board, player_hand)
            
            opp_scores = []
            for i in range(opponent_count):
                opp_hand = sim_opponents_cards[i*2 : (i+1)*2]
                opp_scores.append(evaluator.evaluate(sim_board, opp_hand))
            
            best_opp_score = min(opp_scores)
            
            if p_score < best_opp_score:
                wins += 1
            elif p_score == best_opp_score:
                ties += 1

        win_rate = wins / iterations
        tie_rate = ties / iterations
        equity = (win_rate + (tie_rate / 2)) * 100

        return jsonify({
            "win_rate": round(win_rate * 100, 1),
            "tie_rate": round(tie_rate * 100, 1),
            "equity": round(equity, 1)
        })

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "message": "Invalid card data or calculation error. Please check your inputs."}), 400


@app.route('/api/settle', methods=['POST'])
def settle_game():
    data = request.json
    # Expecting: list of { name: "Alice", buy_in: 100, end_chip: 150 }
    players = data.get('players', [])
    
    # Calculate net profit/loss
    net_results = []
    for p in players:
        net = p['end_chip'] - p['buy_in']
        net_results.append({ 'name': p['name'], 'net': net })

    # Sort by net: losers first (negative), winners last (positive)
    net_results.sort(key=lambda x: x['net'])

    transactions = []
    
    # Settlement Algorithm
    i = 0 # loser index
    j = len(net_results) - 1 # winner index
    
    while i < j:
        loser = net_results[i]
        winner = net_results[j]
        
        amount = min(abs(loser['net']), winner['net'])
        
        if amount == 0:
            if loser['net'] == 0: i += 1
            if winner['net'] == 0: j -= 1
            continue
            
        transactions.append({
            "from": loser['name'],
            "to": winner['name'],
            "amount": amount
        })
        
        loser['net'] += amount
        winner['net'] -= amount
        
        if abs(loser['net']) < 0.01: i += 1
        if abs(winner['net']) < 0.01: j -= 1
        
    return jsonify({"transactions": transactions})

@app.route('/api/history', methods=['GET'])
def get_history():
    db = get_db()
    # Get recent sessions
    cur = db.execute('SELECT * FROM sessions ORDER BY date DESC LIMIT 50')
    sessions = []
    for row in cur.fetchall():
        s = dict(row)
        # Get details for quick view (e.g. total chips/winner)
        p_cur = db.execute('SELECT * FROM players WHERE session_id = ?', (s['id'],))
        players = [dict(p) for p in p_cur.fetchall()]
        
        # Determine winner
        winner = max(players, key=lambda x: x['net']) if players else None
        
        sessions.append({
            "id": s['id'],
            "date": s['date'],
            "name": s['name'],
            "winner": winner['name'] if winner else "N/A",
            "player_count": len(players)
        })
    return jsonify(sessions)

@app.route('/api/sessions', methods=['POST'])
def save_session():
    data = request.json
    players = data.get('players', [])
    game_date = datetime.now().isoformat()
    
    db = get_db()
    try:
        cur = db.execute('INSERT INTO sessions (date, name) VALUES (?, ?)', (game_date, 'Poker Round'))
        session_id = cur.lastrowid
        
        for p in players:
            name = p.get('name', 'Unknown')
            rebuys = p.get('rebuys', 0)
            
            # Calculate net
            # frontend sends 'buy_in' or 'buy_in_total' depending on version
            buy_in_total = p.get('buy_in_total', p.get('buy_in', 0))
            end_chip = p.get('endChips', p.get('end_chip', 0))
            
            # Note: frontend sends inputs as strings sometimes
            try:
                buy_in_total = float(buy_in_total)
                end_chip = float(end_chip)
                rebuys = int(rebuys)
            except:
                pass
                
            net = end_chip - buy_in_total
            
            db.execute('INSERT INTO players (session_id, name, rebuys, end_chip, net) VALUES (?, ?, ?, ?, ?)',
                       (session_id, name, rebuys, end_chip, net))
        
        db.commit()
        return jsonify({"success": True, "id": session_id})
    except Exception as e:
        print(f"Error saving session: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sessions/<int:session_id>', methods=['GET'])
def get_session_details(session_id):
    db = get_db()
    s = db.execute('SELECT * FROM sessions WHERE id = ?', (session_id,)).fetchone()
    if not s:
        return jsonify({"error": "Session not found"}), 404
        
    p_cur = db.execute('SELECT * FROM players WHERE session_id = ?', (session_id,))
    players = [dict(p) for p in p_cur.fetchall()]
    
    return jsonify({
        "id": s['id'],
        "date": s['date'],
        "players": players
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    db = get_db()
    # Fetch all players from all sessions
    cur = db.execute('SELECT * FROM players')
    all_players = [dict(row) for row in cur.fetchall()]
    
    # Fetch total sessions count
    s_cur = db.execute('SELECT COUNT(*) as count FROM sessions')
    total_sessions = s_cur.fetchone()['count']
    
    stats = {}
    
    for p in all_players:
        name = p['name']
        if name not in stats:
            stats[name] = {
                'name': name,
                'total_games': 0,
                'total_buyin': 0,
                'total_cashout': 0,
                'net_profit': 0
            }
        
        # Calculations
        # database stores: rebuys, end_chip, net
        # We know: net = end_chip - total_buyin
        # So: total_buyin = end_chip - net
        
        net = p['net']
        end_chip = p['end_chip']
        buyin = end_chip - net
        
        stats[name]['total_games'] += 1
        stats[name]['total_buyin'] += buyin
        stats[name]['total_cashout'] += end_chip
        stats[name]['net_profit'] += net
        
    # Convert to list and sort
    stats_list = list(stats.values())
    
    # Sort by net profit descending
    stats_list.sort(key=lambda x: x['net_profit'], reverse=True)
    
    return jsonify({
        "total_sessions": total_sessions,
        "player_stats": stats_list
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
