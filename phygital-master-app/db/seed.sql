-- Seed the three ready experiences.
-- Idempotent: re-running updates the same rows by slug.
-- Local:  psql -d phygital -f db/seed.sql      Hosted: psql "$DATABASE_URL" -f db/seed.sql

INSERT INTO projects (slug, name, description, category, logo, live_url, sort_order) VALUES
  ('universe',        'Universe',        'Premium residences sales suite.',                      'Sales Suite',  '/assets/logos/universe.png',   'https://the-universe-salessuite.netlify.app/',   1),
  ('living-tree',     'Living Tree',     'Interactive sales experience for Kalyani Developers.', 'Sales Suite',  '/assets/logos/livingtree.png', 'https://living-tree.netlify.app/',               2),
  ('embassy-citadel', 'Embassy Citadel', 'Ultra-luxury tower sales suite — a world unto itself.','Sales Suite',  '/assets/logos/embassy.png',    'https://embassy-citadel.netlify.app/intro.html', 3),
  ('embassy-developments','Embassy Developments','Explore Embassy''s projects across India.',      'Sales Suite',  '/assets/logos/embassy-developments.png','https://sunny-squirrel-3f220f.netlify.app/', 4),
  ('embassy-ai',      'Embassy AI',      'AI concierge chatbot for Embassy Developments.',       'AI Assistant', '/assets/logos/embassy.png',    'https://embassy-chat-concierge.netlify.app/',    5),
  ('embassy-citadel-gre','Embassy Citadel GRE','Guest relations experience for Embassy Citadel.',  'GRE',          '/assets/logos/embassy.png',    'https://embassy-citadel-gre.netlify.app/',       6)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  category    = EXCLUDED.category,
  logo        = EXCLUDED.logo,
  live_url    = EXCLUDED.live_url,
  sort_order  = EXCLUDED.sort_order;
