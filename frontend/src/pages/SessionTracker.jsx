import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import './SessionTracker.css';

export function SessionTracker() {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([
        { name: '', buy_in: '', rebuys: 0, endChips: '' }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const addPlayer = () => {
        setPlayers([...players, { name: '', buy_in: '', rebuys: 0, endChips: '' }]);
    };

    const removePlayer = (index) => {
        const newPlayers = [...players];
        newPlayers.splice(index, 1);
        setPlayers(newPlayers);
    };

    const updatePlayer = (index, field, value) => {
        const newPlayers = [...players];
        newPlayers[index][field] = value;
        setPlayers(newPlayers);
    };

    const saveSession = async () => {
        setError(null);
        setSubmitting(true);

        const validPlayers = players.filter(p => p.name.trim() !== '');
        if (validPlayers.length === 0) {
            setError('Add at least one player');
            setSubmitting(false);
            return;
        }

        try {
            const payload = validPlayers.map(p => ({
                name: p.name,
                buy_in: parseFloat(p.buy_in || 0),
                rebuys: parseInt(p.rebuys || 0),
                endChips: parseFloat(p.endChips || 0)
            }));

            await api.post('/sessions', { players: payload });
            navigate('/history');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error saving session. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="tracker-page fade-in">
            <h1>New Session</h1>
            <p className="description">Log the results of your poker night.</p>

            <div className="card tracker-card">
                <div className="tracker-header">
                    <span>Player</span>
                    <span>Buy-In</span>
                    <span>Rebuys</span>
                    <span>End Chips</span>
                    <span></span>
                </div>

                <div className="tracker-list">
                    {players.map((player, index) => (
                        <div key={index} className="tracker-row">
                            <div className="input-group">
                                <label className="mobile-label">Name</label>
                                <input
                                    placeholder="Name"
                                    value={player.name}
                                    onChange={e => updatePlayer(index, 'name', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label className="mobile-label">Buy-In</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={player.buy_in}
                                    onChange={e => updatePlayer(index, 'buy_in', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label className="mobile-label">Rebuys</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={player.rebuys}
                                    onChange={e => updatePlayer(index, 'rebuys', e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label className="mobile-label">End Chips</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={player.endChips}
                                    onChange={e => updatePlayer(index, 'endChips', e.target.value)}
                                />
                            </div>
                            <button
                                className="btn-icon danger delete-btn"
                                onClick={() => removePlayer(index)}
                                disabled={players.length === 1}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="tracker-actions">
                    <button className="btn btn-outline" onClick={addPlayer}>
                        <Plus size={18} /> Add Player
                    </button>
                    <button className="btn btn-primary" onClick={saveSession} disabled={submitting}>
                        <Save size={18} /> {submitting ? 'Saving...' : 'Save Session'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}
