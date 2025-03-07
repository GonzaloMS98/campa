/*
  # Initial schema for team event scoring app

  1. New Tables
    - `teams`
      - `id` (integer, primary key)
      - `name` (text, not null)
      - `created_at` (timestamp with time zone, default now())
    - `bases`
      - `id` (integer, primary key)
      - `name` (text, not null)
      - `password` (text, not null)
      - `created_at` (timestamp with time zone, default now())
    - `matches`
      - `id` (uuid, primary key)
      - `base_id` (integer, foreign key to bases.id)
      - `team1_id` (integer, foreign key to teams.id)
      - `team2_id` (integer, foreign key to teams.id)
      - `winner_id` (integer, foreign key to teams.id, nullable for ties)
      - `completed` (boolean, default true)
      - `created_at` (timestamp with time zone, default now())
    - `admins`
      - `id` (integer, primary key)
      - `password` (text, not null)
      - `created_at` (timestamp with time zone, default now())
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id integer PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bases table
CREATE TABLE IF NOT EXISTS bases (
  id integer PRIMARY KEY,
  name text NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id integer REFERENCES bases(id) NOT NULL,
  team1_id integer REFERENCES teams(id) NOT NULL,
  team2_id integer REFERENCES teams(id) NOT NULL,
  winner_id integer REFERENCES teams(id),
  completed boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id integer PRIMARY KEY,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Teams policies
CREATE POLICY "Anyone can read teams" 
  ON teams FOR SELECT 
  USING (true);

-- Bases policies
CREATE POLICY "Anyone can read bases" 
  ON bases FOR SELECT 
  USING (true);

-- Matches policies
CREATE POLICY "Anyone can read matches" 
  ON matches FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert matches" 
  ON matches FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Admins policies
CREATE POLICY "Anyone can read admins" 
  ON admins FOR SELECT 
  USING (true);

-- Insert initial data
-- Teams
INSERT INTO teams (id, name) VALUES
  (1, 'Team Alpha'),
  (2, 'Team Beta'),
  (3, 'Team Gamma'),
  (4, 'Team Delta'),
  (5, 'Team Epsilon'),
  (6, 'Team Zeta'),
  (7, 'Team Eta'),
  (8, 'Team Theta'),
  (9, 'Team Iota'),
  (10, 'Team Kappa')
ON CONFLICT (id) DO NOTHING;

-- Bases
INSERT INTO bases (id, name, password) VALUES
  (1, 'Base 1', 'base1pass'),
  (2, 'Base 2', 'base2pass'),
  (3, 'Base 3', 'base3pass'),
  (4, 'Base 4', 'base4pass'),
  (5, 'Base 5', 'base5pass'),
  (6, 'Base 6', 'base6pass'),
  (7, 'Base 7', 'base7pass'),
  (8, 'Base 8', 'base8pass'),
  (9, 'Base 9', 'base9pass'),
  (10, 'Base 10', 'base10pass')
ON CONFLICT (id) DO NOTHING;

-- Admin
INSERT INTO admins (id, password) VALUES
  (0, 'adminpass')
ON CONFLICT (id) DO NOTHING;