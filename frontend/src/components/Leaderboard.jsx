// Leaderboard.jsx — Rankings with podium and table
import { useState, useEffect, useCallback } from 'react';

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

// Generate a consistent avatar emoji from nickname
function avatarEmoji(nickname = '') {
  const emojis = ['⚽','🏆','🎯','🌟','🔥','⚡','💎','🦁','🐺','🦊','🐯','🦅','🎲','🚀','🌈'];
  const idx = (nickname.charCodeAt(0) + nickname.length) % emojis.length;
  return emojis[idx];
}

// Top-3 Podium
function Podium({ top3, currentUserId }) {
  // Arrange: 2nd | 1st | 3rd
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = { 1: 120, 2: 90, 3: 70 };

  return (
    <div className="podium-wrapper" aria-label="Top 3 Players">
      {order.map((player) => {
        const isMe = player.user_id === currentUserId;
        return (
          <div
            key={player.user_id}
            className={`podium-slot podium-rank-${player.rank} ${isMe ? 'podium-me' : ''}`}
          >
            <div className="podium-avatar">{avatarEmoji(player.nickname)}</div>
            <div className="podium-medal">{RANK_MEDALS[player.rank]}</div>
            <div className="podium-nickname">{player.nickname}</div>
            <div className="podium-points">{player.total_points} pts</div>
            <div
              className="podium-bar"
              style={{ height: `${heights[player.rank]}px` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function Leaderboard({ currentUser }) {
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/leaderboard');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load');
      setData(json.data);
      setLastUpdated(new Date(json.updatedAt).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit',
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const timer = setInterval(fetchLeaderboard, 60_000);
    return () => clearInterval(timer);
  }, [fetchLeaderboard]);

  const top3       = data.slice(0, 3);
  const currentRank = data.find(u => u.user_id === currentUser?.id);

  return (
    <div className="leaderboard-panel">
      {/* Header */}
      <div className="lb-top-row">
        <div>
          <p className="lb-subtitle">
            {data.length} player{data.length !== 1 ? 's' : ''} competing
            {lastUpdated && <span className="lb-updated"> · Updated {lastUpdated}</span>}
          </p>
        </div>
        <button
          id="btn-refresh-lb"
          className="btn-retry"
          onClick={fetchLeaderboard}
          disabled={loading}
          style={{ fontSize: '0.82rem', padding: '6px 16px' }}
        >
          {loading ? '⟳ Loading…' : '⟳ Refresh'}
        </button>
      </div>

      {/* Points legend */}
      <div className="lb-legend">
        <span>⭐ Exact Score = <strong>3 pts</strong></span>
        <span>✅ Correct Result = <strong>1 pt</strong></span>
        <span>❌ Wrong = <strong>0 pts</strong></span>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Calculating rankings…</p>
        </div>
      )}

      {!loading && error && (
        <div className="error-container">
          <span className="error-icon">⚡</span>
          <p className="error-title">Failed to load rankings</p>
          <p className="error-message">{error}</p>
          <button className="btn-retry" onClick={fetchLeaderboard}>Try Again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Podium */}
          {top3.length >= 2 && (
            <Podium top3={top3} currentUserId={currentUser?.id} />
          )}

          {/* Your position callout */}
          {currentRank && (
            <div className="my-rank-banner">
              <span className="my-rank-label">Your Position</span>
              <span className="my-rank-num">#{currentRank.rank}</span>
              <span className="my-rank-pts">{currentRank.total_points} points</span>
              <span className="my-rank-nick">{currentRank.nickname}</span>
            </div>
          )}

          {/* Full Rankings Table */}
          {data.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🏆</span>
              <p className="empty-title">No players yet</p>
              <p className="empty-subtitle">Be the first to register and make predictions!</p>
            </div>
          ) : (
            <div className="lb-table-wrapper">
              <table className="lb-table" aria-label="Leaderboard">
                <thead>
                  <tr>
                    <th className="lb-th lb-th-rank">Rank</th>
                    <th className="lb-th lb-th-player">Player</th>
                    <th className="lb-th lb-th-num">Predictions</th>
                    <th className="lb-th lb-th-num">⭐ Exact</th>
                    <th className="lb-th lb-th-num">✅ Correct</th>
                    <th className="lb-th lb-th-num">Accuracy</th>
                    <th className="lb-th lb-th-pts">💎 Points</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((player) => {
                    const isMe = player.user_id === currentUser?.id;
                    return (
                      <tr
                        key={player.user_id}
                        className={`lb-row ${isMe ? 'lb-row-me' : ''} ${
                          player.rank <= 3 ? `lb-row-top${player.rank}` : ''
                        }`}
                      >
                        <td className="lb-td lb-td-rank">
                          <span className="lb-rank-num">
                            {RANK_MEDALS[player.rank] || `#${player.rank}`}
                          </span>
                        </td>
                        <td className="lb-td lb-td-player">
                          <span className="lb-avatar">{avatarEmoji(player.nickname)}</span>
                          <div className="lb-player-info">
                            <span className="lb-nickname">{player.nickname}</span>
                            {isMe && <span className="lb-you-badge">YOU</span>}
                          </div>
                        </td>
                        <td className="lb-td lb-td-num">{player.total_predictions}</td>
                        <td className="lb-td lb-td-num lb-exact">{player.exact_count}</td>
                        <td className="lb-td lb-td-num lb-correct">{player.correct_count}</td>
                        <td className="lb-td lb-td-num">
                          {player.settled_count > 0 ? `${player.accuracy_pct}%` : '—'}
                        </td>
                        <td className="lb-td lb-td-pts">
                          <span className="lb-points">{player.total_points}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
