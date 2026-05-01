// PredictionForm.jsx — Updated: sends full match metadata with prediction
import { useState } from 'react';

export default function PredictionForm({ match, onSuccess }) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [status,    setStatus]    = useState('idle');
  const [message,   setMessage]   = useState('');

  const homeShort = match?.home_team?.split(' ').slice(-1)[0] || 'Home';
  const awayShort = match?.away_team?.split(' ').slice(-1)[0] || 'Away';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setStatus('error');
      setMessage('Please enter valid scores (0 or higher).');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const storedUser = JSON.parse(localStorage.getItem('matchLoggerUser') || 'null');

      const res = await fetch('/api/live-predictions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_external_id:    match.id,
          predicted_home_score: home,
          predicted_away_score: away,
          user_id:     storedUser?.id    || null,
          home_team:   match.home_team,
          away_team:   match.away_team,
          league:      match.league,
          home_logo:   match.home_logo,
          away_logo:   match.away_logo,
          match_date:  match.match_date,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save');

      setStatus('success');
      setMessage(`Saved! ${match.home_team} ${home}–${away} ${match.away_team}`);
      setHomeScore('');
      setAwayScore('');
      if (onSuccess) onSuccess();
      setTimeout(() => setStatus('idle'), 3500);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="prediction-form-wrapper">
      <p className="prediction-form-title">🎯 Your Prediction</p>

      {status === 'success' && <div className="form-success">✅ {message}</div>}
      {status === 'error'   && <div className="form-error">⚠️ {message}</div>}

      {status !== 'success' && (
        <form onSubmit={handleSubmit} id={`pred-form-${match?.id}`}>
          <div className="prediction-inputs">
            <div className="score-input-group">
              <label htmlFor={`home-${match?.id}`}>{homeShort}</label>
              <input
                id={`home-${match?.id}`}
                type="number"
                className="score-input"
                value={homeScore}
                onChange={e => setHomeScore(e.target.value)}
                placeholder="0"
                min="0" max="99"
                required
              />
            </div>

            <span className="vs-dash">–</span>

            <div className="score-input-group">
              <label htmlFor={`away-${match?.id}`}>{awayShort}</label>
              <input
                id={`away-${match?.id}`}
                type="number"
                className="score-input"
                value={awayScore}
                onChange={e => setAwayScore(e.target.value)}
                placeholder="0"
                min="0" max="99"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Saving…' : 'Submit Prediction'}
          </button>
        </form>
      )}
    </div>
  );
}
