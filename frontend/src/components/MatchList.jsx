// MatchList.jsx — Renders the filtered grid of match cards
import MatchCard from './MatchCard';

export default function MatchList({ matches, onPredictionSaved }) {
  if (matches.length === 0) {
    return (
      <div className="empty-state" role="status">
        <span className="empty-icon">📭</span>
        <p className="empty-title">No matches found</p>
        <p className="empty-subtitle">
          Try a different league or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="match-grid" role="list" aria-label="Fixture list">
      {matches.map(match => (
        <MatchCard
          key={match.id}
          match={match}
          onPredictionSaved={onPredictionSaved}
        />
      ))}
    </div>
  );
}
