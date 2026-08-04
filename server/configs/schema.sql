-- Quick.ai database schema (Neon / PostgreSQL)
-- Run this once on your database before deploying.

CREATE TABLE IF NOT EXISTS creations (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  prompt      TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  type        TEXT        NOT NULL,
  publish     BOOLEAN     DEFAULT FALSE,
  likes       TEXT[]      DEFAULT ARRAY[]::TEXT[],
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations (user_id);
CREATE INDEX IF NOT EXISTS idx_creations_publish ON creations (publish);
