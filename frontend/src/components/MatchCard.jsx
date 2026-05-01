// MatchCard.jsx — Individual fixture card with real team logos
import { useState } from 'react';
import PredictionForm from './PredictionForm';

const LEAGUE_SHORT = {
  'La Liga':               '🇪🇸 La Liga',
  'UEFA Champions League': '⭐ UCL',
  'Premier League':        '🏴󠁧󠁢󠁥󠁮󠁧󠁿 PL',
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day:     '2-digit',
    month:   'short',
    hour:    '2-digit',
    minute:  '2-digit',
    hour12:  true,
  });
}

// Team logo with automatic fallback to styled initials
function TeamLogo({ src, name, side }) {
  const [failed, setFailed] = useState(false);

  const initial = (name || '?').charAt(0).toUpperCase();

  if (!src || failed) {
    return (
      <div className={`team-logo-fallback team-logo-fallback--${side}`} aria-hidden="true">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="team-logo"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export default function MatchCard({ match, onPredictionSaved }) {
  const [showForm,   setShowForm]   = useState(false);
  const [predCount,  setPredCount]  = useState(match.prediction_count || 0);

  const {
    id,
    home_team,
    away_team,
    home_logo,
    away_logo,
    league,
    match_date,
    home_score,
    away_score,
    status,
    venue,
  } = match;

  const isLive     = status === 'live';
  const isFinished = status === 'finished';
  const isUpcoming = status === 'upcoming';

  const statusLabel = {
    upcoming: 'Upcoming',
    live:     '● Live',
    finished: 'Full Time',
  }[status];

  const handlePredictionSaved = () => {
    setPredCount(c => c + 1);
    setShowForm(false);
    if (onPredictionSaved) onPredictionSaved();
  };

  return (
    <article
      className={`match-card status-${status}`}
      aria-label={`${home_team} vs ${away_team}`}
    >
      {/* League + Status */}
      <div className="card-meta">
        <span className="league-badge">{LEAGUE_SHORT[league] || league}</span>
        <span className={`status-badge ${status}`}>{statusLabel}</span>
      </div>

      {/* Teams & Score */}
      <div className="teams-row">
        {/* Home */}
        <div className="team home">
          <TeamLogo src={home_logo} name={home_team} side="home" />
          <span className="team-name">{home_team}</span>
        </div>

        {/* Score / VS */}
        <div className="score-block">
          {(isLive || isFinished) && home_score != null ? (
            <span className="score-digits">
              {home_score}
              <span className="score-separator"> – </span>
              {away_score}
            </span>
          ) : (
            <span className="score-vs">VS</span>
          )}
          {isLive && (
            <span className="live-pulse" aria-hidden="true">LIVE</span>
          )}
        </div>

        {/* Away */}
        <div className="team away">
          <TeamLogo src={away_logo} name={away_team} side="away" />
          <span className="team-name">{away_team}</span>
        </div>
      </div>

      {/* Date & Venue */}
      <p className="match-date">
        🗓 {formatDate(match_date)}
        {venue && <><span className="dot-sep">·</span>🏟 {venue}</>}
      </p>

      {/* Footer */}
      <div className="card-footer">
        <span className="prediction-count">
          🎯 {predCount} prediction{predCount !== 1 ? 's' : ''}
        </span>

        {(isUpcoming || isLive) && (
          <button
            id={`btn-predict-${id}`}
            className={`btn-predict ${showForm ? 'active' : ''}`}
            onClick={() => setShowForm(v => !v)}
            aria-expanded={showForm}
          >
            {showForm ? '✕ Cancel' : '+ Predict'}
          </button>
        )}
      </div>

      {/* Inline prediction form */}
      {showForm && (
        <PredictionForm
          match={match}
          onSuccess={handlePredictionSaved}
        />
      )}
    </article>
  );
}
