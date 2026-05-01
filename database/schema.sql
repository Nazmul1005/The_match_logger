-- ============================================================
--  The Match Logger — Database Schema & Seed Data
-- ============================================================

-- Drop tables if re-running setup
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- ─── TEAMS ───────────────────────────────────────────────────
CREATE TABLE teams (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL UNIQUE,
    league VARCHAR(100) NOT NULL
);

-- ─── MATCHES ─────────────────────────────────────────────────
CREATE TABLE matches (
    id           SERIAL PRIMARY KEY,
    home_team_id INTEGER NOT NULL REFERENCES teams(id),
    away_team_id INTEGER NOT NULL REFERENCES teams(id),
    match_date   TIMESTAMPTZ NOT NULL,
    home_score   INTEGER,
    away_score   INTEGER,
    status       VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                 CHECK (status IN ('upcoming', 'live', 'finished'))
);

-- ─── PREDICTIONS ─────────────────────────────────────────────
CREATE TABLE predictions (
    id                   SERIAL PRIMARY KEY,
    match_id             INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0),
    predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
--  SEED DATA
-- ──────────────────────────────────────────────────────────────

-- Teams
INSERT INTO teams (name, league) VALUES
    ('FC Barcelona',        'La Liga'),
    ('Real Madrid CF',      'La Liga'),
    ('Atletico de Madrid',  'La Liga'),
    ('Sevilla FC',          'La Liga'),
    ('Villarreal CF',       'La Liga'),
    ('Paris Saint-Germain', 'UEFA Champions League'),
    ('Bayern Munich',       'UEFA Champions League'),
    ('Manchester City',     'UEFA Champions League'),
    ('Inter Milan',         'UEFA Champions League'),
    ('Borussia Dortmund',   'UEFA Champions League');

-- Matches
-- La Liga fixtures
INSERT INTO matches (home_team_id, away_team_id, match_date, home_score, away_score, status) VALUES
    -- El Clasico — finished
    (
        (SELECT id FROM teams WHERE name = 'FC Barcelona'),
        (SELECT id FROM teams WHERE name = 'Real Madrid CF'),
        NOW() - INTERVAL '3 days',
        3, 2, 'finished'
    ),
    -- Atletico vs Sevilla — finished
    (
        (SELECT id FROM teams WHERE name = 'Atletico de Madrid'),
        (SELECT id FROM teams WHERE name = 'Sevilla FC'),
        NOW() - INTERVAL '1 day',
        1, 1, 'finished'
    ),
    -- Villarreal vs Barcelona — upcoming
    (
        (SELECT id FROM teams WHERE name = 'Villarreal CF'),
        (SELECT id FROM teams WHERE name = 'FC Barcelona'),
        NOW() + INTERVAL '2 days',
        NULL, NULL, 'upcoming'
    ),
    -- Real Madrid vs Atletico — upcoming
    (
        (SELECT id FROM teams WHERE name = 'Real Madrid CF'),
        (SELECT id FROM teams WHERE name = 'Atletico de Madrid'),
        NOW() + INTERVAL '5 days',
        NULL, NULL, 'upcoming'
    );

-- UEFA Champions League fixtures
INSERT INTO matches (home_team_id, away_team_id, match_date, home_score, away_score, status) VALUES
    -- PSG vs Bayern — finished
    (
        (SELECT id FROM teams WHERE name = 'Paris Saint-Germain'),
        (SELECT id FROM teams WHERE name = 'Bayern Munich'),
        NOW() - INTERVAL '2 days',
        2, 3, 'finished'
    ),
    -- Man City vs Inter — upcoming
    (
        (SELECT id FROM teams WHERE name = 'Manchester City'),
        (SELECT id FROM teams WHERE name = 'Inter Milan'),
        NOW() + INTERVAL '3 days',
        NULL, NULL, 'upcoming'
    ),
    -- Dortmund vs Real Madrid — upcoming (UCL classic)
    (
        (SELECT id FROM teams WHERE name = 'Borussia Dortmund'),
        (SELECT id FROM teams WHERE name = 'Real Madrid CF'),
        NOW() + INTERVAL '7 days',
        NULL, NULL, 'upcoming'
    ),
    -- Barcelona vs PSG — live
    (
        (SELECT id FROM teams WHERE name = 'FC Barcelona'),
        (SELECT id FROM teams WHERE name = 'Paris Saint-Germain'),
        NOW() - INTERVAL '45 minutes',
        1, 0, 'live'
    );

-- Sample predictions
INSERT INTO predictions (match_id, predicted_home_score, predicted_away_score) VALUES
    (1, 2, 1),
    (1, 3, 2),
    (5, 2, 2),
    (8, 2, 1);
