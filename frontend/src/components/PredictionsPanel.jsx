// PredictionsPanel.jsx — Full predictions dashboard with points & achievements
import { useState, useEffect, useCallback } from 'react';

// ── Helpers ─────────────────────────────────────────────────
const OUTCOME_CONFIG = {
  exact: {
    label:  '⭐ Exact Score',
    points: 3,
    color:  'outcome-exact',
    desc:   'Perfect prediction!',
  },
  correct_result: {
    label:  '✅ Correct Result',
    points: 1,
    color:  'outcome-correct',
    desc:   'Right winner / draw',
  },
  wrong: {
    label:  '❌ Wrong',
    points: 0,
    color:  'outcome-wrong',
    desc:   'Better luck next time',
  },
  live: {
    label:  '🔴 Live',
    points: null,
    color:  'outcome-live',
    desc:   'Match in progress',
  },
  pending: {
    label:  '⏳ Pending',
    points: null,
    color:  'outcome-pending',
    desc:   'Match not finished yet',
  },
};

// Achievement definitions
function calculateAchievements(predictions) {
  const total         = predictions.length;
  const exact         = predictions.filter(p => p.outcome === 'exact').length;
  const correct       = predictions.filter(p => p.outcome === 'exact' || p.outcome === 'correct_result').length;
  const totalPts      = predictions.reduce((s, p) => s + (p.points || 0), 0);
  const settled       = predictions.filter(p => p.outcome !== 'pending' && p.outcome !== 'live');

  // Streak calculation (chronological order)
  const chronological = [...predictions].reverse();
  let streak = 0;
  for (const p of chronological) {
    if (p.outcome === 'exact' || p.outcome === 'correct_result') streak++;
    else if (p.outcome === 'wrong') break;
  }

  const earned = [];

  if (total >= 1)    earned.push({ id:'first',    icon:'🌟', name:'First Prediction', desc:'Submitted your first prediction' });
  if (correct >= 1)  earned.push({ id:'lucky',    icon:'⚡', name:'Lucky Strike',     desc:'Got your first correct result' });
  if (exact >= 1)    earned.push({ id:'sniper',   icon:'🎯', name:'Sniper',           desc:'Predicted an exact score' });
  if (streak >= 3)   earned.push({ id:'fire',     icon:'🔥', name:'On Fire',          desc:'3+ correct predictions in a row' });
  if (exact >= 3)    earned.push({ id:'fortune',  icon:'🏆', name:'Fortune Teller',   desc:'3 exact score predictions' });
  if (total >= 10)   earned.push({ id:'fan',      icon:'📊', name:'Dedicated Fan',    desc:'Made 10+ predictions' });
  if (totalPts >= 20)earned.push({ id:'oracle',   icon:'💎', name:'Oracle',           desc:'Reached 20+ total points' });
  if (totalPts >= 50)earned.push({ id:'champ',    icon:'🥇', name:'Champion',         desc:'Reached 50+ total points' });

  return earned;
}

function TeamLogoSmall({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="pred-logo-fallback" aria-hidden="true">
        {(name || '?').charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className="pred-logo"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

// ── Main Component ────────────────────────────────────────────
export default function PredictionsPanel({ userId }) {
  const [predictions, setPredictions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filter,      setFilter]      = useState('all');

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url  = userId ? `/api/my-predictions?userId=${userId}` : '/api/my-predictions';
      const res  = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load');
      setPredictions(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // ── Stats ──────────────────────────────────────────────────
  const totalPoints = predictions.reduce((s, p) => s + (p.points || 0), 0);
  const exactCount  = predictions.filter(p => p.outcome === 'exact').length;
  const correctCount = predictions.filter(p =>
    p.outcome === 'exact' || p.outcome === 'correct_result'
  ).length;
  const settledCount = predictions.filter(p =>
    p.outcome !== 'pending' && p.outcome !== 'live'
  ).length;
  const accuracy = settledCount > 0
    ? Math.round((correctCount / settledCount) * 100)
    : 0;

  const achievements = calculateAchievements(predictions);

  // ── Filter ─────────────────────────────────────────────────
  const FILTERS = [
    { key: 'all',            label: 'All' },
    { key: 'pending',        label: '⏳ Pending' },
    { key: 'live',           label: '🔴 Live' },
    { key: 'exact',          label: '⭐ Exact' },
    { key: 'correct_result', label: '✅ Correct' },
    { key: 'wrong',          label: '❌ Wrong' },
  ];

  const filtered = filter === 'all'
    ? predictions
    : predictions.filter(p => p.outcome === filter);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="predictions-panel">

      {/* ── Points legend banner ─────────────────────────── */}
      <div className="points-legend">
        <div className="legend-item">
          <span className="legend-icon">⭐</span>
          <div>
            <span className="legend-label">Exact Score</span>
            <span className="legend-pts">+3 pts</span>
          </div>
        </div>
        <div className="legend-item">
          <span className="legend-icon">✅</span>
          <div>
            <span className="legend-label">Correct Result</span>
            <span className="legend-pts">+1 pt</span>
          </div>
        </div>
        <div className="legend-item">
          <span className="legend-icon">❌</span>
          <div>
            <span className="legend-label">Wrong</span>
            <span className="legend-pts">+0 pts</span>
          </div>
        </div>
        <div className="legend-item">
          <span className="legend-icon">⏳</span>
          <div>
            <span className="legend-label">Pending</span>
            <span className="legend-pts">TBD</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Loading your predictions…</p>
        </div>
      )}

      {!loading && error && (
        <div className="error-container">
          <span className="error-icon">⚡</span>
          <p className="error-title">Failed to load predictions</p>
          <p className="error-message">{error}</p>
          <button className="btn-retry" onClick={fetchPredictions}>Try Again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Stats grid ─────────────────────────────────── */}
          <div className="stats-grid">
            <div className="stat-card stat-card--pts">
              <span className="stat-card-icon">💎</span>
              <span className="stat-card-value">{totalPoints}</span>
              <span className="stat-card-label">Total Points</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-icon">🎯</span>
              <span className="stat-card-value">{exactCount}</span>
              <span className="stat-card-label">Exact Scores</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-icon">📊</span>
              <span className="stat-card-value">{accuracy}%</span>
              <span className="stat-card-label">Accuracy</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-icon">📋</span>
              <span className="stat-card-value">{predictions.length}</span>
              <span className="stat-card-label">Predictions</span>
            </div>
          </div>

          {/* ── Achievements ───────────────────────────────── */}
          {achievements.length > 0 && (
            <div className="achievements-section">
              <h2 className="achievements-title">🏅 Achievements Unlocked</h2>
              <div className="achievements-grid">
                {achievements.map(a => (
                  <div key={a.id} className="achievement-badge" title={a.desc}>
                    <span className="achievement-icon">{a.icon}</span>
                    <div className="achievement-info">
                      <span className="achievement-name">{a.name}</span>
                      <span className="achievement-desc">{a.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Empty state (no predictions yet) ──────────── */}
          {predictions.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🎯</span>
              <p className="empty-title">No predictions yet</p>
              <p className="empty-subtitle">
                Go to the Fixtures tab, open any upcoming match, and click "+ Predict" to make your first prediction!
              </p>
            </div>
          )}

          {/* ── Filter tabs ────────────────────────────────── */}
          {predictions.length > 0 && (
            <>
              <div className="pred-filter-row">
                <h2 className="pred-list-title">My Predictions</h2>
                <div className="filter-tabs" style={{ margin: 0 }}>
                  {FILTERS.map(({ key, label }) => (
                    <button
                      key={key}
                      id={`pred-filter-${key}`}
                      className={`filter-tab ${filter === key ? 'active' : ''}`}
                      onClick={() => setFilter(key)}
                    >
                      {label}
                      {key !== 'all' && (
                        <span style={{ marginLeft: 4, opacity: 0.6 }}>
                          ({predictions.filter(p => p.outcome === key).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Prediction cards list ─────────────────── */}
              <div className="pred-list">
                {filtered.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <p className="empty-subtitle">No {filter} predictions.</p>
                  </div>
                ) : (
                  filtered.map(pred => {
                    const cfg = OUTCOME_CONFIG[pred.outcome] || OUTCOME_CONFIG.pending;
                    return (
                      <article key={pred.id} className={`pred-card ${cfg.color}`}>
                        {/* Outcome badge */}
                        <div className="pred-card-header">
                          <span className="pred-league">{pred.league || 'Unknown League'}</span>
                          <span className={`pred-outcome-badge ${cfg.color}`}>
                            {cfg.label}
                            {cfg.points != null && (
                              <span className="pred-points-inline">
                                {' '}+{cfg.points} pts
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Match teams + scores comparison */}
                        <div className="pred-card-body">
                          {/* Home team */}
                          <div className="pred-team pred-team--home">
                            <TeamLogoSmall
                              src={pred.home_logo}
                              name={pred.home_team}
                            />
                            <span className="pred-team-name">
                              {pred.home_team || '—'}
                            </span>
                          </div>

                          {/* Score comparison */}
                          <div className="pred-scores">
                            {/* Predicted */}
                            <div className="pred-score-row">
                              <span className="pred-score-label">Predicted</span>
                              <span className="pred-score-val predicted">
                                {pred.predicted_home_score} – {pred.predicted_away_score}
                              </span>
                            </div>
                            {/* Actual */}
                            <div className="pred-score-row">
                              <span className="pred-score-label">Actual</span>
                              <span className={`pred-score-val actual ${
                                pred.actual_home_score != null ? 'has-score' : ''
                              }`}>
                                {pred.actual_home_score != null
                                  ? `${pred.actual_home_score} – ${pred.actual_away_score}`
                                  : pred.outcome === 'live' ? '🔴 Live' : '—'
                                }
                              </span>
                            </div>
                          </div>

                          {/* Away team */}
                          <div className="pred-team pred-team--away">
                            <TeamLogoSmall
                              src={pred.away_logo}
                              name={pred.away_team}
                            />
                            <span className="pred-team-name">
                              {pred.away_team || '—'}
                            </span>
                          </div>
                        </div>

                        {/* Footer: date + desc */}
                        <div className="pred-card-footer">
                          <span className="pred-date">
                            🗓 Match: {formatDate(pred.match_date)}
                          </span>
                          <span className="pred-date">
                            🕐 Predicted: {formatDate(pred.created_at)}
                          </span>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
