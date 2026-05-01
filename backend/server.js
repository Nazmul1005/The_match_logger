// server.js — The Match Logger API (with users, leaderboard, live fixtures)
'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./db');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── In-memory leaderboard cache (2 min TTL) ───────────────────
let _lbCache     = null;
let _lbCacheTime = 0;

// ══════════════════════════════════════════════════════════════
//  ESPN HELPERS
// ══════════════════════════════════════════════════════════════

const LEAGUE_SLUGS = {
  'La Liga':               'ESP.1',
  'UEFA Champions League': 'uefa.champions',
  'Premier League':        'ENG.1',
  'Bundesliga':            'GER.1',
  'Ligue 1':               'FRA.1',
  'Serie A':               'ITA.1',
  'UEFA Europa League':    'uefa.europa',
};

function mapESPNStatus(state) {
  if (state === 'in')   return 'live';
  if (state === 'post') return 'finished';
  return 'upcoming';
}

async function fetchESPNLeague(leagueSlug, leagueName) {
  const dateSet = new Set();
  const now = new Date();
  for (let i = -3; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    dateSet.add(d.toISOString().slice(0, 10).replace(/-/g, ''));
  }

  const eventMap = new Map();
  const dates    = Array.from(dateSet);

  for (let i = 0; i < dates.length; i += 5) {
    const batch = dates.slice(i, i + 5);
    await Promise.all(
      batch.map(async (dateStr) => {
        try {
          const url  = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueSlug}/scoreboard?dates=${dateStr}`;
          const r    = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (!r.ok) return;
          const data = await r.json();
          for (const event of data.events || []) {
            if (eventMap.has(event.id)) continue;
            const comp = event.competitions?.[0];
            if (!comp) continue;
            const home  = comp.competitors?.find(c => c.homeAway === 'home');
            const away  = comp.competitors?.find(c => c.homeAway === 'away');
            if (!home || !away) continue;
            const state = comp.status?.type?.state || 'pre';
            eventMap.set(event.id, {
              id:         `espn_${event.id}`,
              league:     leagueName,
              home_team:  home.team?.displayName || 'Home',
              away_team:  away.team?.displayName || 'Away',
              home_logo:  home.team?.logo || null,
              away_logo:  away.team?.logo || null,
              home_score: state !== 'pre' ? parseInt(home.score ?? 0) : null,
              away_score: state !== 'pre' ? parseInt(away.score ?? 0) : null,
              match_date: event.date,
              status:     mapESPNStatus(state),
              venue:      comp.venue?.fullName || null,
              prediction_count: 0,
            });
          }
        } catch (_) { /* skip failed dates */ }
      })
    );
  }
  return Array.from(eventMap.values());
}

// ── Fetch and cache live scores for currently running leagues ──
async function fetchLiveScoreMap(leagues) {
  const slugs    = [...new Set(leagues.filter(l => LEAGUE_SLUGS[l]).map(l => LEAGUE_SLUGS[l]))];
  const scoreMap = {}; // espn_XXXXX → { home_score, away_score, status }

  await Promise.all(slugs.map(async (slug) => {
    try {
      const url  = `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`;
      const r    = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!r.ok) return;
      const data = await r.json();
      for (const event of data.events || []) {
        const comp  = event.competitions?.[0];
        if (!comp) continue;
        const home  = comp.competitors?.find(c => c.homeAway === 'home');
        const away  = comp.competitors?.find(c => c.homeAway === 'away');
        const state = comp.status?.type?.state;
        if (!home || !away) continue;
        scoreMap[`espn_${event.id}`] = {
          home_score: state !== 'pre' ? parseInt(home.score ?? 0) : null,
          away_score: state !== 'pre' ? parseInt(away.score ?? 0) : null,
          status:     mapESPNStatus(state),
        };
      }
    } catch (_) {}
  }));

  return scoreMap;
}

// ── Calculate outcome from predicted vs actual scores ─────────
function calcOutcome(predH, predA, actH, actA) {
  if (actH == null || actA == null) return { outcome: 'pending', points: 0 };
  if (predH === actH && predA === actA) return { outcome: 'exact',          points: 3 };
  const pr = Math.sign(predH - predA);
  const ar = Math.sign(actH  - actA);
  if (pr === ar) return { outcome: 'correct_result', points: 1 };
  return            { outcome: 'wrong',          points: 0 };
}

// ── Refresh outcomes for unsettled predictions ─────────────────
// Called before leaderboard/my-predictions to permanently store results.
async function refreshPredictionOutcomes() {
  const { rows: unsettled } = await pool.query(
    `SELECT DISTINCT match_external_id, league
     FROM live_predictions
     WHERE (outcome IS NULL OR outcome = 'pending') AND league IS NOT NULL`
  );
  if (unsettled.length === 0) return;

  const leagues  = [...new Set(unsettled.map(u => u.league))];
  const scoreMap = await fetchLiveScoreMap(leagues);

  for (const [externalId, live] of Object.entries(scoreMap)) {
    if (live.status !== 'finished') continue; // Only settle finished matches

    const { rows: preds } = await pool.query(
      `SELECT id, predicted_home_score, predicted_away_score
       FROM live_predictions
       WHERE match_external_id = $1 AND (outcome IS NULL OR outcome = 'pending')`,
      [externalId]
    );

    for (const pred of preds) {
      const { outcome, points } = calcOutcome(
        pred.predicted_home_score, pred.predicted_away_score,
        live.home_score, live.away_score
      );
      await pool.query(
        `UPDATE live_predictions
         SET outcome = $1, points = $2,
             actual_home_score = $3, actual_away_score = $4
         WHERE id = $5`,
        [outcome, points, live.home_score, live.away_score, pred.id]
      );
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ══════════════════════════════════════════════════════════════
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ══════════════════════════════════════════════════════════════
//  USER REGISTRATION / LOGIN
//  POST /api/users/register
//  Body: { gmail, nickname }
//  If gmail already exists → returns existing user (acts as login)
// ══════════════════════════════════════════════════════════════
app.post('/api/users/register', async (req, res) => {
  const { gmail, nickname } = req.body;

  if (!gmail || !nickname) {
    return res.status(400).json({ success: false, error: 'gmail and nickname are required.' });
  }

  const gmailTrim    = gmail.trim().toLowerCase();
  const nicknameTrim = nickname.trim();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(gmailTrim)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  if (nicknameTrim.length < 2 || nicknameTrim.length > 30) {
    return res.status(400).json({ success: false, error: 'Nickname must be 2–30 characters.' });
  }

  try {
    // Check if gmail already registered (login)
    const existing = await pool.query(
      `SELECT id, gmail, nickname, created_at FROM users WHERE gmail = $1`,
      [gmailTrim]
    );

    if (existing.rows.length > 0) {
      return res.json({ success: true, data: existing.rows[0], isNewUser: false });
    }

    // New registration
    const { rows } = await pool.query(
      `INSERT INTO users (gmail, nickname) VALUES ($1, $2) RETURNING id, gmail, nickname, created_at`,
      [gmailTrim, nicknameTrim]
    );

    res.status(201).json({ success: true, data: rows[0], isNewUser: true });
  } catch (err) {
    console.error('POST /api/users/register error:', err.message);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  LIVE FIXTURES (ESPN)
//  GET /api/live
// ══════════════════════════════════════════════════════════════
app.get('/api/live', async (_req, res) => {
  try {
    const [laLiga, ucl, pl, bundesliga, ligue1, serieA, uel] = await Promise.all([
      fetchESPNLeague('ESP.1',         'La Liga'),
      fetchESPNLeague('uefa.champions', 'UEFA Champions League'),
      fetchESPNLeague('ENG.1',         'Premier League'),
      fetchESPNLeague('GER.1',         'Bundesliga'),
      fetchESPNLeague('FRA.1',         'Ligue 1'),
      fetchESPNLeague('ITA.1',         'Serie A'),
      fetchESPNLeague('uefa.europa',   'UEFA Europa League'),
    ]);

    const all = [...laLiga, ...ucl, ...pl, ...bundesliga, ...ligue1, ...serieA, ...uel].sort(
      (a, b) => new Date(a.match_date) - new Date(b.match_date)
    );

    if (all.length > 0) {
      const ids = all.map(m => m.id);
      try {
        const { rows } = await pool.query(
          `SELECT match_external_id, COUNT(*)::int AS count
           FROM live_predictions
           WHERE match_external_id = ANY($1::text[])
           GROUP BY match_external_id`,
          [ids]
        );
        const countMap = Object.fromEntries(rows.map(r => [r.match_external_id, r.count]));
        all.forEach(m => { m.prediction_count = countMap[m.id] || 0; });
      } catch (_) {}
    }

    res.json({ success: true, data: all, count: all.length });
  } catch (err) {
    console.error('GET /api/live error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch live fixtures.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  SAVE PREDICTION
//  POST /api/live-predictions
// ══════════════════════════════════════════════════════════════
app.post('/api/live-predictions', async (req, res) => {
  const {
    match_external_id, predicted_home_score, predicted_away_score,
    user_id, home_team, away_team, league, home_logo, away_logo, match_date,
  } = req.body;

  if (!match_external_id || predicted_home_score == null || predicted_away_score == null) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const home = parseInt(predicted_home_score, 10);
  const away = parseInt(predicted_away_score, 10);

  if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
    return res.status(400).json({ success: false, error: 'Scores must be non-negative integers.' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO live_predictions
         (match_external_id, predicted_home_score, predicted_away_score,
          user_id, home_team, away_team, league, home_logo, away_logo, match_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [match_external_id, home, away,
       user_id || null, home_team || null, away_team || null,
       league || null, home_logo || null, away_logo || null, match_date || null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('POST /api/live-predictions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save prediction.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  MY PREDICTIONS
//  GET /api/my-predictions?userId=UUID
// ══════════════════════════════════════════════════════════════
app.get('/api/my-predictions', async (req, res) => {
  const { userId } = req.query;

  try {
    await refreshPredictionOutcomes();

    const query = userId
      ? `SELECT * FROM live_predictions WHERE user_id = $1 ORDER BY created_at DESC`
      : `SELECT * FROM live_predictions ORDER BY created_at DESC`;

    const params = userId ? [userId] : [];
    const { rows: predictions } = await pool.query(query, params);

    if (predictions.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Enrich predictions that are still pending with fresh ESPN data
    const pendingMatchIds = predictions
      .filter(p => !p.outcome || p.outcome === 'pending')
      .map(p => p.match_external_id);

    const pendingLeagues = [...new Set(
      predictions
        .filter(p => pendingMatchIds.includes(p.match_external_id) && p.league)
        .map(p => p.league)
    )];

    const liveScoreMap = pendingLeagues.length > 0
      ? await fetchLiveScoreMap(pendingLeagues)
      : {};

    const enriched = predictions.map(pred => {
      // Already settled in DB
      if (pred.outcome && pred.outcome !== 'pending') {
        return { ...pred, match_status: 'finished' };
      }

      // Check live ESPN data
      const live = liveScoreMap[pred.match_external_id];
      if (live) {
        const { outcome, points } = calcOutcome(
          pred.predicted_home_score, pred.predicted_away_score,
          live.home_score, live.away_score
        );
        return {
          ...pred,
          actual_home_score: live.home_score,
          actual_away_score: live.away_score,
          match_status:      live.status,
          outcome:           live.status === 'live' ? 'live' : outcome,
          points:            live.status === 'live' ? 0 : points,
        };
      }

      return { ...pred, match_status: 'upcoming', outcome: 'pending', points: 0 };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('GET /api/my-predictions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch predictions.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  LEADERBOARD
//  GET /api/leaderboard
// ══════════════════════════════════════════════════════════════
app.get('/api/leaderboard', async (_req, res) => {
  // Serve from cache if fresh
  if (_lbCache && (Date.now() - _lbCacheTime) < 120_000) {
    return res.json(_lbCache);
  }

  try {
    // Refresh outcomes before aggregating
    await refreshPredictionOutcomes();

    const { rows } = await pool.query(`
      SELECT
        u.id                                                          AS user_id,
        u.nickname,
        u.created_at,
        COALESCE(SUM(lp.points), 0)::int                            AS total_points,
        COUNT(lp.id)::int                                            AS total_predictions,
        COUNT(CASE WHEN lp.outcome = 'exact' THEN 1 END)::int       AS exact_count,
        COUNT(CASE WHEN lp.outcome IN ('exact','correct_result') THEN 1 END)::int AS correct_count,
        COUNT(CASE WHEN lp.outcome NOT IN ('pending','live') AND lp.outcome IS NOT NULL THEN 1 END)::int AS settled_count
      FROM users u
      LEFT JOIN live_predictions lp ON lp.user_id = u.id
      GROUP BY u.id, u.nickname, u.created_at
      ORDER BY total_points DESC, exact_count DESC, total_predictions ASC, u.created_at ASC
    `);

    const ranked = rows.map((r, i) => ({
      ...r,
      rank:         i + 1,
      accuracy_pct: r.settled_count > 0
        ? Math.round((r.correct_count / r.settled_count) * 100)
        : 0,
    }));

    const result = { success: true, data: ranked, updatedAt: new Date().toISOString() };
    _lbCache     = result;
    _lbCacheTime = Date.now();

    res.json(result);
  } catch (err) {
    console.error('GET /api/leaderboard error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  LEGACY LOCAL-DB ROUTES (kept for compatibility)
// ══════════════════════════════════════════════════════════════
app.get('/api/matches', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.id, ht.name AS home_team, ht.league, at.name AS away_team,
             m.match_date, m.home_score, m.away_score, m.status,
             COUNT(p.id)::int AS prediction_count
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      LEFT JOIN predictions p ON p.match_id = m.id
      GROUP BY m.id, ht.name, ht.league, at.name
      ORDER BY m.match_date ASC`);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch matches.' });
  }
});

app.post('/api/predictions', async (req, res) => {
  const { match_id, predicted_home_score, predicted_away_score } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO predictions (match_id, predicted_home_score, predicted_away_score)
       VALUES ($1, $2, $3) RETURNING *`,
      [match_id, parseInt(predicted_home_score), parseInt(predicted_away_score)]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save prediction.' });
  }
});

app.put('/api/matches/:id/score', async (req, res) => {
  const { home_score, away_score, status } = req.body;
  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE matches SET home_score=$1, away_score=$2, status=$3 WHERE id=$4 RETURNING *`,
      [home_score, away_score, status || 'finished', parseInt(req.params.id)]
    );
    if (rowCount === 0) return res.status(404).json({ success: false, error: 'Match not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update score.' });
  }
});

// 404
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found.' }));

app.listen(PORT, () => {
  console.log(`\n🚀  Match Logger API running on http://localhost:${PORT}\n`);
});
