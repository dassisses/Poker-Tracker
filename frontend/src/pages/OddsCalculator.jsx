import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { CardPicker } from '../components/CardPicker';
import { api } from '../config/api';
import './OddsCalculator.css';

export function OddsCalculator() {
    const [hand, setHand] = useState(['', '']);
    const [board, setBoard] = useState(['', '', '', '', '']);
    const [opponents, setOpponents] = useState(1);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [selectingType, setSelectingType] = useState(null); // 'hand' or 'board'
    const [selectingIndex, setSelectingIndex] = useState(null);

    const openPicker = (type, index) => {
        setSelectingType(type);
        setSelectingIndex(index);
        setIsPickerOpen(true);
    };

    const handleCardSelect = (card) => {
        if (selectingType === 'hand') {
            const newHand = [...hand];
            newHand[selectingIndex] = card;
            setHand(newHand);
        } else {
            const newBoard = [...board];
            newBoard[selectingIndex] = card;
            setBoard(newBoard);
        }
        setIsPickerOpen(false);
    };

    const calculateOdds = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        const validHand = hand.filter(c => c);
        const validBoard = board.filter(c => c);

        if (validHand.length < 2) {
            setError('Select 2 cards for your hand');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                player_hand: validHand,
                community_cards: validBoard,
                opponent_count: parseInt(opponents)
            };

            const data = await api.post('/odds', payload);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Calculation error');
        } finally {
            setLoading(false);
        }
    };

    const renderCardSlot = (card, type, index) => {
        const isRed = card && (card.includes('h') || card.includes('d'));
        const isBlack = card && (card.includes('s') || card.includes('c'));
        const suitIcon = card ? (card.includes('s') ? '♠' : card.includes('h') ? '♥' : card.includes('d') ? '♦' : '♣') : '';
        const rank = card ? card.slice(0, -1) : '';

        return (
            <div
                key={`${type}-${index}`}
                className={`card-slot ${card ? 'filled' : 'empty'} ${isRed ? 'red' : ''} ${isBlack ? 'black' : ''}`}
                onClick={() => openPicker(type, index)}
            >
                {card ? (
                    <>
                        <span className="slot-rank">{rank}</span>
                        <span className="slot-suit">{suitIcon}</span>
                    </>
                ) : (
                    <span className="plus">+</span>
                )}
            </div>
        );
    };

    return (
        <div className="odds-page fade-in">
            <h1>Odds Calculator</h1>

            <div className="odds-container">
                <div className="card input-panel">
                    <div className="section">
                        <label>Your Hand</label>
                        <div className="card-inputs">
                            {hand.map((card, i) => renderCardSlot(card, 'hand', i))}
                        </div>
                    </div>

                    <div className="section">
                        <label>Community Cards</label>
                        <div className="card-inputs">
                            {board.map((card, i) => renderCardSlot(card, 'board', i))}
                        </div>
                    </div>

                    <div className="section">
                        <label>Opponents</label>
                        <input
                            type="number"
                            min="1"
                            max="9"
                            value={opponents}
                            onChange={e => setOpponents(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary full-width" onClick={calculateOdds} disabled={loading}>
                        {loading ? 'Calculating...' : 'Calculate Odds'} <Calculator size={18} />
                    </button>

                    {error && <div className="error-message">{error}</div>}
                </div>

                {result && (
                    <div className="card result-panel fade-in">
                        <h2>Results</h2>
                        <div className="result-stats">
                            <div className="result-row">
                                <span>Win Rate</span>
                                <span className="value text-success">{result.win_rate}%</span>
                            </div>
                            <div className="result-row">
                                <span>Tie Rate</span>
                                <span className="value">{result.tie_rate}%</span>
                            </div>
                            <div className="divider"></div>
                            <div className="result-row large">
                                <span>Equity</span>
                                <span className="value text-gradient">{result.equity}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CardPicker
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleCardSelect}
                takenCards={[...hand, ...board]}
            />
        </div>
    );
}
