import { Link, useLocation } from 'react-router-dom';
import { Home, Calculator, Banknote, History, PlayCircle } from 'lucide-react';
import './Navbar.css';

export function Navbar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/session', label: 'New Session', icon: PlayCircle },
        { path: '/settle', label: 'Settle', icon: Banknote },
        { path: '/odds', label: 'Odds', icon: Calculator },
        { path: '/history', label: 'History', icon: History },
    ];

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="logo">
                    <span className="text-gradient">PokerTracker</span>
                </Link>
                <div className="nav-links">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`nav-link ${isActive(path) ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
