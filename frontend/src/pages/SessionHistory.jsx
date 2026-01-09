import { useEffect, useState } from 'react';
import { Calendar, Users, Trophy } from 'lucide-react';
import './SessionHistory.css';

export function SessionHistory() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/history')
            .then(res => res.json())
            .then(data => {
                setSessions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading history...</div>;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                        <div key={session.id} className="card history-item">
                            <div className="history-header">
                                <h3>{session.name || 'Poker Session'}</h3>
                                <span className="date">
                                    <Calendar size={14} /> {formatDate(session.date)}
                                </span>
                            </div>

                            <div className="history-stats">
                                <div className="stat-pill">
                                    <Users size={16} />
                                    <span>{session.player_count} Players</span>
                                </div>
                                <div className="stat-pill winner">
                                    <Trophy size={16} />
                                    <span>Winner: {session.winner}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
