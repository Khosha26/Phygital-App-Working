-- Phygital showcase — Postgres schema
-- Local:   createdb phygital && psql -d phygital -f db/schema.sql
-- Hosted:  psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS projects (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,           -- e.g. 'embassy-citadel'
  name          TEXT NOT NULL,                  -- app name
  description   TEXT,                            -- app description
  category      TEXT,                            -- app category (e.g. 'Real Estate')
  sub           TEXT,                            -- optional short one-liner
  logo          TEXT NOT NULL,                  -- web path, e.g. /assets/logos/embassy.png
  live_url      TEXT,                            -- the Netlify (or other host) URL
  deploy_repo   TEXT,
  source_repo   TEXT,
  accent        TEXT DEFAULT '#fe347e',
  sort_order    INT  DEFAULT 100,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- migrate existing databases (no-ops if columns already exist)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category    TEXT;

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_touch ON projects;
CREATE TRIGGER trg_projects_touch BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
