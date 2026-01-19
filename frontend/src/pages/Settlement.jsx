import { useState } from 'react';
import { Plus, Trash2, ArrowRightCircle } from 'lucide-react';
import { api } from '../config/api';
import './Settlement.css';

export function Settlement() {
    const [players, setPlayers] = useState([
        { name: '', buy_in: '', end_chip: '' },
        { name: '', buy_in: '', end_chip: '' }
    ]);
    const [transactions, setTransactions] = useState(null);
    const [discrepancy, setDiscrepancy] = useState(0);
    const [error, setError] = useState(null);

    const addPlayer = () => {
        setPlayers([...players, { name: '', buy_in: '', end_chip: '' }]);
    };

    const removePlayer = (index) => {
        if (players.length <= 2) return;
        const newPlayers = [...players];
        newPlayers.splice(index, 1);
        setPlayers(newPlayers);
    };

    const updatePlayer = (index, field, value) => {
        const newPlayers = [...players];
        newPlayers[index][field] = value;
        setPlayers(newPlayers);
    };

    const calculateSettlement = async () => {
        setError(null);
        setTransactions(null);
        setDiscrepancy(0);

        // Validate
        const validPlayers = players.filter(p => p.name.trim() !== '');
        if (validPlayers.length < 2) {
            setError('Need at least 2 players');
            return;
        }

        try {
            const payload = validPlayers.map(p => ({
                name: p.name,
                buy_in: parseFloat(p.buy_in || 0),
                end_chip: parseFloat(p.end_chip || 0)
            }));

            const data = await api.post('/settle', { players: payload });
            setTransactions(data.transactions);
            setDiscrepancy(data.discrepancy || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to calculate settlement');
        }
    };

    return (
        <div className="settlement-page fade-in">
            <h1>Settlement Calculator</h1>
            <p className="description">Enter buy-ins and end chips to calculate who pays whom.</p>

            <div className="settlement-grid">
                <div className="card input-section">
                    <div className="player-list">
                        {players.map((player, index) => (
                            <div key={index} className="player-row">
                                <input
                                    className="player-input"
                                    placeholder="Player Name"
                                    value={player.name}
                                    onChange={e => updatePlayer(index, 'name', e.target.value)}
                                />
                                <input
                                    className="amount-input"
                                    type="number"
                                    placeholder="Buy In"
                                    value={player.buy_in}
                                    onChange={e => updatePlayer(index, 'buy_in', e.target.value)}
                                />
                                <input
                                    className="amount-input"
                                    type="number"
                                    placeholder="End Chips"
                                    value={player.end_chip}
                                    onChange={e => updatePlayer(index, 'end_chip', e.target.value)}
                                />
                                {players.length > 2 && (
                                    <button className="btn-icon danger delete-btn" onClick={() => removePlayer(index)}>
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="actions">
                        <button className="btn btn-outline" onClick={addPlayer}>
                            <Plus size={18} /> Add Player
                        </button>
                        <button className="btn btn-primary" onClick={calculateSettlement}>
                            Calculate Payouts
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                </div>

                {transactions && (
                    <div className="card result-section fade-in">
                        <h2>Payouts</h2>
                        
                        {Math.abs(discrepancy) > 0.01 && (
                            <div className="alert warning">
                                <strong>⚠️ Mismatch Detected:</strong> ${Math.abs(discrepancy).toFixed(2)} 
                                {discrepancy > 0 ? ' extra in pot' : ' missing from pot'}.
                                <br/><span style={{fontSize: '0.85em', opacity: 0.8}}>Transactions include "Pot Mismatch" to balance.</span>
                            </div>
                        )}

                        {transactions.length === 0 ? (
                            <p className="no-transactions">All settled up!</p>
                        ) : (
                            <div className="transaction-list">
                                {transactions.map((t, i) => (
                                    <div key={i} className={`transaction-item ${t.is_error ? 'error-transaction' : ''}`}>
                                        <span className="name loser">{t.from}</span>
                                        <div className="arrow">
                                            <span className="amount">${t.amount.toFixed(2)}</span>
                                            <ArrowRightCircle size={20} className={t.is_error ? 'text-warning' : ''} />
                                        </div>
                                        <span className="name winner">{t.to}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
