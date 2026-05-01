-- Add match metadata columns to live_predictions
-- so we can display predictions even after ESPN data expires
ALTER TABLE live_predictions
  ADD COLUMN IF NOT EXISTS home_team  VARCHAR(150),
  ADD COLUMN IF NOT EXISTS away_team  VARCHAR(150),
  ADD COLUMN IF NOT EXISTS league     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS home_logo  TEXT,
  ADD COLUMN IF NOT EXISTS away_logo  TEXT,
  ADD COLUMN IF NOT EXISTS match_date TIMESTAMPTZ;
