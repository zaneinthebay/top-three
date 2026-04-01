-- Top Three Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facebook_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_picture TEXT,
  expo_push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily prompts
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text VARCHAR(255) NOT NULL,         -- e.g. "cheeses"
  full_text VARCHAR(255) NOT NULL,    -- e.g. "Rank your top 3 cheeses"
  emoji VARCHAR(10),                  -- e.g. "🧀"
  scheduled_date DATE UNIQUE NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User responses (one per user per prompt)
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  rank1 VARCHAR(255) NOT NULL,
  rank2 VARCHAR(255) NOT NULL,
  rank3 VARCHAR(255) NOT NULL,
  share_token VARCHAR(64) UNIQUE,     -- for Wordle-style share links
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Friend relationships (mutual)
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK(user_id != friend_id)
);

-- Indexes
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_responses_prompt_id ON responses(prompt_id);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_responses_share_token ON responses(share_token);
CREATE INDEX idx_prompts_scheduled_date ON prompts(scheduled_date);

-- Seed some prompts
INSERT INTO prompts (text, full_text, emoji, scheduled_date) VALUES
  ('cheeses', 'Rank your top 3 cheeses', '🧀', CURRENT_DATE),
  ('pizza toppings', 'Rank your top 3 pizza toppings', '🍕', CURRENT_DATE + 1),
  ('movies of all time', 'Rank your top 3 movies of all time', '🎬', CURRENT_DATE + 2),
  ('travel destinations', 'Rank your top 3 travel destinations', '✈️', CURRENT_DATE + 3),
  ('podcasts', 'Rank your top 3 podcasts', '🎙️', CURRENT_DATE + 4),
  ('ice cream flavors', 'Rank your top 3 ice cream flavors', '🍦', CURRENT_DATE + 5),
  ('TV shows', 'Rank your top 3 TV shows', '📺', CURRENT_DATE + 6),
  ('restaurants in your city', 'Rank your top 3 restaurants in your city', '🍽️', CURRENT_DATE + 7);
