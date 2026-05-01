-- ── Users table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gmail      VARCHAR(255) NOT NULL UNIQUE,
    nickname   VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Add user tracking + outcome caching to live_predictions ──
ALTER TABLE live_predictions
    ADD COLUMN IF NOT EXISTS user_id           UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS actual_home_score INTEGER,
    ADD COLUMN IF NOT EXISTS actual_away_score INTEGER,
    ADD COLUMN IF NOT EXISTS outcome           VARCHAR(20),
    ADD COLUMN IF NOT EXISTS points            INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_live_pred_user ON live_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_pred_outcome ON live_predictions(outcome);
