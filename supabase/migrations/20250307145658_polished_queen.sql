/*
  # Initial Schema Setup for Team Event Scoring System

  1. New Tables
    - `teams`
      - `id` (integer, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `bases`
      - `id` (integer, primary key)
      - `name` (text)
      - `password` (text)
      - `created_at` (timestamp)
    
    - `matches`
      - `id` (uuid, primary key)
      - `base_id` (integer, foreign key)
      - `team1_id` (integer, foreign key)
      - `team2_id` (integer, foreign key)
      - `winner_id` (integer, foreign key, nullable)
      - `completed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public read access where needed
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

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies for teams
CREATE POLICY "Allow public read access to teams"
  ON teams
  FOR SELECT
  TO public
  USING (true);

-- Create policies for bases
CREATE POLICY "Allow public read access to bases"
  ON bases
  FOR SELECT
  TO public
  USING (true);

-- Create policies for matches
CREATE POLICY "Allow public read access to matches"
  ON matches
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert initial data
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