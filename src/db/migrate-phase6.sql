-- HappyMovie schema — Phase 6: Collections

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_curated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  tmdb_id TEXT NOT NULL,
  title TEXT,
  poster_path TEXT,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, tmdb_id)
);

CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_movies_coll ON collection_movies(collection_id);

-- Seed curated collections
INSERT INTO collections (id, user_id, name, description, is_curated) VALUES
  ('00000000-0000-0000-0000-000000000001', 'system', 'Film Noir Essentials', 'The best of shadowy crime dramas from the golden age of Hollywood', true),
  ('00000000-0000-0000-0000-000000000002', 'system', 'Silent Horror Classics', 'Terrifying tales from the silent era that still haunt today', true),
  ('00000000-0000-0000-0000-000000000003', 'system', 'Golden Age Comedies', 'Side-splitting comedies from Hollywood''s golden era', true),
  ('00000000-0000-0000-0000-000000000004', 'system', 'Public Domain Gems', 'Outstanding films in the public domain you can watch for free', true),
  ('00000000-0000-0000-0000-000000000005', 'system', 'Sci-Fi Pioneers', 'The films that invented science fiction cinema', true)
ON CONFLICT DO NOTHING;

-- Seed curated collection movies
INSERT INTO collection_movies (collection_id, tmdb_id, title, poster_path, position) VALUES
  -- Film Noir Essentials
  ('00000000-0000-0000-0000-000000000001', 'tt0038355', 'The Big Sleep', NULL, 0),
  ('00000000-0000-0000-0000-000000000001', 'tt0036775', 'Double Indemnity', NULL, 1),
  ('00000000-0000-0000-0000-000000000001', 'tt0041959', 'The Third Man', NULL, 2),
  ('00000000-0000-0000-0000-000000000001', 'tt0035575', 'The Glass Key', NULL, 3),
  ('00000000-0000-0000-0000-000000000001', 'tt0038787', 'The Killers', NULL, 4),
  -- Silent Horror Classics
  ('00000000-0000-0000-0000-000000000002', 'tt0013442', 'Nosferatu', NULL, 0),
  ('00000000-0000-0000-0000-000000000002', 'tt0010323', 'The Cabinet of Dr. Caligari', NULL, 1),
  ('00000000-0000-0000-0000-000000000002', 'tt0017136', 'The Phantom of the Opera', NULL, 2),
  ('00000000-0000-0000-0000-000000000002', 'tt0024894', 'The Ghoul', NULL, 3),
  -- Golden Age Comedies
  ('00000000-0000-0000-0000-000000000003', 'tt0025316', 'It Happened One Night', NULL, 0),
  ('00000000-0000-0000-0000-000000000003', 'tt0032599', 'His Girl Friday', NULL, 1),
  ('00000000-0000-0000-0000-000000000003', 'tt0031725', 'Mr. Smith Goes to Washington', NULL, 2),
  ('00000000-0000-0000-0000-000000000003', 'tt0029947', 'Bringing Up Baby', NULL, 3),
  -- Public Domain Gems
  ('00000000-0000-0000-0000-000000000004', 'tt0038650', 'It''s a Wonderful Life', NULL, 0),
  ('00000000-0000-0000-0000-000000000004', 'tt0048028', 'Night of the Hunter', NULL, 1),
  ('00000000-0000-0000-0000-000000000004', 'tt0022100', 'All Quiet on the Western Front', NULL, 2),
  ('00000000-0000-0000-0000-000000000004', 'tt0032138', 'The Wizard of Oz', NULL, 3),
  -- Sci-Fi Pioneers
  ('00000000-0000-0000-0000-000000000005', 'tt0017136', 'Metropolis', NULL, 0),
  ('00000000-0000-0000-0000-000000000005', 'tt0049223', 'Invasion of the Body Snatchers', NULL, 1),
  ('00000000-0000-0000-0000-000000000005', 'tt0044207', 'The Day the Earth Stood Still', NULL, 2),
  ('00000000-0000-0000-0000-000000000005', 'tt0060397', 'Fantastic Voyage', NULL, 3)
ON CONFLICT DO NOTHING;
