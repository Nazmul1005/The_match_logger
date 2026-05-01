// RegisterModal.jsx — One-time registration overlay
import { useState } from 'react';

export default function RegisterModal({ onRegistered }) {
  const [gmail,     setGmail]     = useState('');
  const [nickname,  setNickname]  = useState('');
  const [status,    setStatus]    = useState('idle'); // idle | loading | error
  const [errorMsg,  setErrorMsg]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res  = await fetch('/api/users/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ gmail: gmail.trim(), nickname: nickname.trim() }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Registration failed');
      }

      // Persist user in localStorage
      const user = json.data;
      localStorage.setItem('matchLoggerUser', JSON.stringify(user));
      onRegistered(user);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="register-overlay" role="dialog" aria-modal="true" aria-label="Registration">
      <div className="register-card">

        {/* Branding */}
        <div className="register-logo">
          <span className="register-logo-icon">⚽</span>
          <h1 className="register-logo-title">The Match Logger</h1>
        </div>

        <div className="register-hero">
          <h2 className="register-headline">Welcome to the Game</h2>
          <p className="register-subline">
            Predict football scores, earn points, and climb the rankings.
            <br />
            <strong>Register once — free forever.</strong>
          </p>
        </div>

        {/* Feature pills */}
        <div className="register-features">
          <span className="reg-feat">🎯 Predict Scores</span>
          <span className="reg-feat">💎 Earn Points</span>
          <span className="reg-feat">🏆 Climb Rankings</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="reg-field">
            <label htmlFor="reg-gmail" className="reg-label">
              📧 Gmail Address
            </label>
            <input
              id="reg-gmail"
              type="email"
              className="reg-input"
              placeholder="you@gmail.com"
              value={gmail}
              onChange={e => { setGmail(e.target.value); setStatus('idle'); }}
              required
              autoFocus
            />
          </div>

          <div className="reg-field">
            <label htmlFor="reg-nickname" className="reg-label">
              👤 Nickname
            </label>
            <input
              id="reg-nickname"
              type="text"
              className="reg-input"
              placeholder="FootballKing, Nazmul, ..."
              value={nickname}
              onChange={e => { setNickname(e.target.value); setStatus('idle'); }}
              minLength={2}
              maxLength={30}
              required
            />
            <span className="reg-hint">2–30 characters · shown on the leaderboard</span>
          </div>

          {status === 'error' && (
            <div className="reg-error">⚠️ {errorMsg}</div>
          )}

          <button
            type="submit"
            id="btn-register"
            className="btn-register"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <span className="btn-spinner" aria-hidden="true" /> Joining…
              </>
            ) : (
              '🚀 Join Now — It\'s Free!'
            )}
          </button>
        </form>

        <p className="register-footer-note">
          Already registered with this Gmail? Just enter it again — we'll log you in automatically.
        </p>
      </div>
    </div>
  );
}
