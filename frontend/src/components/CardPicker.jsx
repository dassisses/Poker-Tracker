import { X } from 'lucide-react';
import './CardPicker.css';

const SUITS = [
    { id: 's', label: 'Spades', icon: '♠️', color: 'black' },
    { id: 'h', label: 'Hearts', icon: '♥️', color: 'red' },
    { id: 'd', label: 'Diamonds', icon: '♦️', color: 'red' },
    { id: 'c', label: 'Clubs', icon: '♣️', color: 'black' }
];

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function CardPicker({ isOpen, onClose, onSelect, takenCards = [] }) {
    if (!isOpen) return null;

    const isTaken = (card) => takenCards.includes(card);

    return (
        <div className="picker-overlay fade-in" onClick={onClose}>
            <div className="picker-modal" onClick={e => e.stopPropagation()}>
                <div className="picker-header">
                    <h3>Select Card</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="picker-grid">
                    {SUITS.map(suit => (
                        <div key={suit.id} className="suit-row">
                            <div className={`suit-icon ${suit.color}`}>{suit.icon}</div>
                            <div className="rank-list">
                                {RANKS.map(rank => {
                                    const card = `${rank}${suit.id}`;
                                    const taken = isTaken(card);
                                    return (
                                        <button
                                            key={card}
                                            className={`card-btn ${suit.color} ${taken ? 'taken' : ''}`}
                                            disabled={taken}
                                            onClick={() => onSelect(card)}
                                        >
                                            <span className="rank">{rank}</span>
                                            <span className="small-suit">{suit.icon}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
