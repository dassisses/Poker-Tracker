import { useEffect, useState } from 'react';
import { Award, Gamepad2, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Could not load stats. Ensure backend is running.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading">Loading stats...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const topPlayer = stats?.player_stats?.[0];

    return (
        <div className="dashboard fade-in">
            <div className="header-actions">
                <h1>Dashboard</h1>
                <Link to="/session" className="btn btn-primary">
                    <Plus size={20} />
                    New Session
                </Link>
            </div>

            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="icon-wrapper bg-blue">
                        <Gamepad2 size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Total Sessions</h3>
                        <p className="stat-value">{stats?.total_sessions || 0}</p>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="icon-wrapper bg-gold">
                        <Award size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Top Player</h3>
                        <p className="stat-value">{topPlayer?.name || 'N/A'}</p>
                        {topPlayer && (
                            <small className="text-success">
                                +${topPlayer.net_profit?.toFixed(0)} <TrendingUp size={12} />
                            </small>
                        )}
                    </div>
                </div>
            </div>

            {stats?.player_stats?.length > 0 && (
                <div className="card player-table-card">
                    <h2>Player Leaderboard</h2>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Games</th>
                                    <th className="text-right">Net Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.player_stats.map((player, index) => (
                                    <tr key={player.name}>
                                        <td>#{index + 1}</td>
                                        <td>{player.name}</td>
                                        <td>{player.total_games}</td>
                                        <td className={`text-right ${player.net_profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {player.net_profit >= 0 ? '+' : ''}{player.net_profit.toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
