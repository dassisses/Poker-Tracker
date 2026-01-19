import { useEffect, useState } from 'react';
import { Calendar, Users, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../config/api';
import './SessionHistory.css';

export function SessionHistory() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [details, setDetails] = useState({}); // Cache details by session ID

    useEffect(() => {
        api.get('/history')
            .then(data => {
                setSessions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const toggleSession = async (id) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }

        setExpandedId(id);

        if (!details[id]) {
            try {
                const data = await api.get(`/sessions/${id}`);
                setDetails(prev => ({ ...prev, [id]: data.players }));
            } catch (err) {
                console.error("Failed to load details", err);
            }
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="loading-state">Loading history...</div>;

    return (
        <div className="history-page fade-in">
            <h1>Session History</h1>

            {sessions.length === 0 ? (
                <div className="empty-state">
                    <p>No sessions recorded yet.</p>
                </div>
            ) : (
                <div className="history-list">
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            className={`card history-item ${expandedId === session.id ? 'expanded' : ''}`}
                            onClick={() => toggleSession(session.id)}
                        >
                            <div className="history-summary">
                                <div className="history-header">
                                    <h3>{session.name || 'Poker Session'}</h3>
                                    <span className="date">
                                        <Calendar size={14} /> {formatDate(session.date)}
                                    </span>
                                </div>

                                <div className="history-stats-row">
                                    <div className="stats-group">
                                        <div className="stat-pill">
                                            <Users size={16} />
                                            <span>{session.player_count} Players</span>
                                        </div>
                                        <div className="stat-pill winner">
                                            <Trophy size={16} />
                                            <span>Winner: {session.winner}</span>
                                        </div>
                                    </div>
                                    {expandedId === session.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedId === session.id && details[session.id] && (
                                <div className="history-details fade-in">
                                    <table className="table details-table">
                                        <thead>
                                            <tr>
                                                <th>Player</th>
                                                <th className="text-right">Buy-In</th>
                                                <th className="text-right">Cash-Out</th>
                                                <th className="text-right">Net</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details[session.id]
                                                .sort((a, b) => b.net - a.net)
                                                .map((player) => (
                                                    <tr key={player.id || player.name}>
                                                        <td className="player-name">{player.name}</td>
                                                        <td className="text-right text-secondary">${player.rebuys ? `${(player.end_chip - player.net).toFixed(0)}` : (player.end_chip - player.net).toFixed(0)}</td>
                                                        <td className="text-right text-secondary">${player.end_chip}</td>
                                                        <td className={`text-right font-bold ${player.net >= 0 ? 'text-success' : 'text-danger'}`}>
                                                            {player.net >= 0 ? '+' : ''}{player.net.toFixed(1)}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
