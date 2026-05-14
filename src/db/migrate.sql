-- HappyMovie schema — Phase 4
-- Neon Auth (Better Auth) auto-creates the "user" table.
-- Watchlist and history reference it directly.

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  title TEXT,
  poster_path TEXT,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tmdb_id)
);

CREATE TABLE IF NOT EXISTS watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  title TEXT,
  poster_path TEXT,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  watched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tmdb_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON watch_history(user_id);
