// App.jsx — Root: registration gate + 3-view navigation
import { useState, useEffect, useCallback } from 'react';
import RegisterModal    from './components/RegisterModal';
import MatchList        from './components/MatchList';
import PredictionsPanel from './components/PredictionsPanel';
import Leaderboard      from './components/Leaderboard';

const STATUS_FILTERS = [
  { key: 'all',      label: 'All Fixtures' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live',     label: '🔴 Live' },
  { key: 'finished', label: 'Finished' },
];

const LEAGUE_FILTERS = [
  { key: 'all',                   label: 'All Leagues' },
  { key: 'La Liga',               label: '🇪🇸 La Liga' },
  { key: 'Premier League',        label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League' },
  { key: 'Bundesliga',            label: '🇩🇪 Bundesliga' },
  { key: 'Ligue 1',               label: '🇫🇷 Ligue 1' },
  { key: 'Serie A',               label: '🇮🇹 Serie A' },
  { key: 'UEFA Champions League', label: '⭐ UCL' },
  { key: 'UEFA Europa League',    label: '🟠 UEL' },
];

function countByStatus(matches, status) {
  return matches.filter(m => m.status === status).length;
}

export default function App() {
  // ── User state ─────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('matchLoggerUser') || 'null');
    } catch {
      return null;
    }
  });

  // ── Navigation ─────────────────────────────────────────────
  const [view,         setView]         = useState('fixtures'); // fixtures | predictions | leaderboard

  // ── Fixtures state ─────────────────────────────────────────
  const [matches,      setMatches]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/live');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Unknown error');
      setMatches(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return; // Don't fetch until registered
    fetchMatches();
    const timer = setInterval(fetchMatches, 90_000);
    return () => clearInterval(timer);
  }, [fetchMatches, currentUser]);

  const handleRegistered = (user) => {
    setCurrentUser(user);
  };

  const liveCount     = countByStatus(matches, 'live');
  const upcomingCount = countByStatus(matches, 'upcoming');
  const finishedCount = countByStatus(matches, 'finished');

  const filtered = matches.filter(m => {
    const statusOk = statusFilter === 'all' || m.status === statusFilter;
    const leagueOk = leagueFilter === 'all' || m.league === leagueFilter;
    return statusOk && leagueOk;
  });

  // ── Show registration modal if no user ─────────────────────
  if (!currentUser) {
    return <RegisterModal onRegistered={handleRegistered} />;
  }

  return (
    <div className="app-wrapper">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="app-header" role="banner">
        <div className="header-inner header-inner--wide">
          {/* Logo */}
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">⚽</span>
            <div className="logo-text">
              <span className="logo-title">The Match Logger</span>
              <span className="logo-subtitle">Live Fixtures & Predictions</span>
            </div>
          </div>

          {/* Main nav */}
          <nav className="main-nav" aria-label="Main navigation">
            <button
              id="nav-fixtures"
              className={`nav-tab ${view === 'fixtures' ? 'active' : ''}`}
              onClick={() => setView('fixtures')}
            >
              📅 Fixtures
            </button>
            <button
              id="nav-predictions"
              className={`nav-tab ${view === 'predictions' ? 'active' : ''}`}
              onClick={() => setView('predictions')}
            >
              🎯 My Predictions
            </button>
            <button
              id="nav-leaderboard"
              className={`nav-tab ${view === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setView('leaderboard')}
            >
              🏆 Rankings
            </button>
          </nav>

          {/* User info */}
          <div className="header-user">
            <span className="user-greeting">
              👤 <strong>{currentUser.nickname}</strong>
            </span>
            {view === 'fixtures' && (
              <div className="header-stats">
                {liveCount > 0 && (
                  <div className="stat-pill live-pill">
                    <span className="stat-dot live" aria-hidden="true" />
                    {liveCount} Live
                  </div>
                )}
                <div className="stat-pill">
                  <span className="stat-dot upcoming" aria-hidden="true" />
                  {upcomingCount}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="app-main" id="main-content">

        {/* ═══ FIXTURES ═══════════════════════════════════════ */}
        {view === 'fixtures' && (
          <>
            <div className="section-header">
              <h1 className="section-title">Fixtures</h1>
              {!loading && !error && (
                <span className="section-count">
                  {filtered.length} of {matches.length} matches
                </span>
              )}
            </div>

            {!loading && !error && matches.length > 0 && (
              <>
                <nav className="filter-tabs league-tabs" aria-label="Filter by league">
                  {LEAGUE_FILTERS.map(({ key, label }) => (
                    <button
                      key={key}
                      id={`league-tab-${key.replace(/\s/g,'-')}`}
                      className={`filter-tab ${leagueFilter === key ? 'active' : ''}`}
                      onClick={() => setLeagueFilter(key)}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
                <nav className="filter-tabs" style={{ marginTop: '8px' }} aria-label="Filter by status">
                  {STATUS_FILTERS.map(({ key, label }) => (
                    <button
                      key={key}
                      id={`filter-tab-${key}`}
                      className={`filter-tab ${statusFilter === key ? 'active' : ''}`}
                      onClick={() => setStatusFilter(key)}
                    >
                      {label}
                      {key !== 'all' && (
                        <span style={{ marginLeft: '6px', opacity: 0.65 }}>
                          ({countByStatus(matches, key)})
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </>
            )}

            {loading && (
              <div className="loading-container" role="status">
                <div className="spinner" aria-hidden="true" />
                <p className="loading-text">Fetching live fixtures…</p>
              </div>
            )}

            {!loading && error && (
              <div className="error-container" role="alert">
                <span className="error-icon">⚡</span>
                <h2 className="error-title">Connection Error</h2>
                <p className="error-message">
                  {error}<br /><br />
                  Make sure the backend is running on{' '}
                  <code style={{ color: 'var(--accent-green)' }}>localhost:3001</code>
                </p>
                <button id="btn-retry" className="btn-retry" onClick={fetchMatches}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <MatchList matches={filtered} onPredictionSaved={fetchMatches} />
            )}
          </>
        )}

        {/* ═══ MY PREDICTIONS ══════════════════════════════════ */}
        {view === 'predictions' && (
          <>
            <div className="section-header">
              <h1 className="section-title">My Predictions</h1>
              <span className="section-count">as {currentUser.nickname}</span>
            </div>
            <PredictionsPanel userId={currentUser.id} />
          </>
        )}

        {/* ═══ LEADERBOARD ═════════════════════════════════════ */}
        {view === 'leaderboard' && (
          <>
            <div className="section-header">
              <h1 className="section-title">🏆 Rankings</h1>
            </div>
            <Leaderboard currentUser={currentUser} />
          </>
        )}
      </main>

      <footer className="app-footer" role="contentinfo">
        <p>⚽ The Match Logger · Live data · Auto-refreshes every 90s</p>
      </footer>
    </div>
  );
}
