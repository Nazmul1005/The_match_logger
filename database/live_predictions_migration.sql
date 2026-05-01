-- Migration: live predictions table (keyed by ESPN external match ID)
CREATE TABLE IF NOT EXISTS live_predictions (
    id                   SERIAL PRIMARY KEY,
    match_external_id    VARCHAR(100) NOT NULL,
    predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0),
    predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_pred_match_id
    ON live_predictions(match_external_id);
