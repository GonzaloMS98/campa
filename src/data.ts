import { Team, Match, Base, User } from './types';
import { supabase } from './supabase/client';

// Initial data for teams and bases (used for reference)
export const teams: Team[] = [
  { id: 1, name: 'Team Alpha' },
  { id: 2, name: 'Team Beta' },
  { id: 3, name: 'Team Gamma' },
  { id: 4, name: 'Team Delta' },
  { id: 5, name: 'Team Epsilon' },
  { id: 6, name: 'Team Zeta' },
  { id: 7, name: 'Team Eta' },
  { id: 8, name: 'Team Theta' },
  { id: 9, name: 'Team Iota' },
  { id: 10, name: 'Team Kappa' },
];

export const bases: Base[] = [
  { id: 1, name: 'Base 1', password: 'base1pass' },
  { id: 2, name: 'Base 2', password: 'base2pass' },
  { id: 3, name: 'Base 3', password: 'base3pass' },
  { id: 4, name: 'Base 4', password: 'base4pass' },
  { id: 5, name: 'Base 5', password: 'base5pass' },
  { id: 6, name: 'Base 6', password: 'base6pass' },
  { id: 7, name: 'Base 7', password: 'base7pass' },
  { id: 8, name: 'Base 8', password: 'base8pass' },
  { id: 9, name: 'Base 9', password: 'base9pass' },
  { id: 10, name: 'Base 10', password: 'base10pass' },
];

export const users: User[] = [
  { type: 'admin', id: 0, password: 'adminpass' },
  ...bases.map(base => ({ type: 'base' as const, id: base.id, password: base.password }))
];

// Cache for matches
let matchesCache: Match[] = [];

// Export matches for components to use
export const matches = matchesCache;

// Add a new match
export const addMatch = async (match: Omit<Match, 'id' | 'timestamp'>) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .insert({
        base_id: match.baseId,
        team1_id: match.team1Id,
        team2_id: match.team2Id,
        winner_id: match.winnerId,
        completed: match.completed
      })
      .select()
      .single();

    if (error) throw error;

    const newMatch: Match = {
      id: data.id,
      baseId: data.base_id,
      team1Id: data.team1_id,
      team2Id: data.team2_id,
      winnerId: data.winner_id,
      completed: data.completed,
      timestamp: data.created_at
    };

    matchesCache.push(newMatch);
    return newMatch;
  } catch (error) {
    console.error('Error adding match:', error);
    throw error;
  }
};

// Fetch all matches
export const fetchMatches = async (): Promise<Match[]> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    matchesCache = data.map(match => ({
      id: match.id,
      baseId: match.base_id,
      team1Id: match.team1_id,
      team2Id: match.team2_id,
      winnerId: match.winner_id,
      completed: match.completed,
      timestamp: match.created_at
    }));

    return matchesCache;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

// Get cached matches
export const getMatches = () => matchesCache;

// Calculate team scores
export const calculateScores = () => {
  const scores: Record<number, number> = {};
  
  // Initialize scores for all teams
  teams.forEach(team => {
    scores[team.id] = 0;
  });
  
  // Calculate scores based on matches
  matchesCache.filter(match => match.completed).forEach(match => {
    if (match.winnerId === null) {
      // Tie - both teams get 5 points
      scores[match.team1Id] += 5;
      scores[match.team2Id] += 5;
    } else {
      // Winner gets 10 points
      scores[match.winnerId] += 10;
    }
  });
  
  return scores;
};

// Get team by ID
export const getTeamById = (id: number) => {
  return teams.find(team => team.id === id);
};

// Get base by ID
export const getBaseById = (id: number) => {
  return bases.find(base => base.id === id);
};

// Check if a team has already played at a base
export const hasTeamPlayedAtBase = (teamId: number, baseId: number) => {
  return matchesCache.some(match => 
    match.baseId === baseId && (match.team1Id === teamId || match.team2Id === teamId)
  );
};

// Get teams that haven't played at a specific base yet
export const getAvailableTeamsForBase = (baseId: number) => {
  return teams.filter(team => !hasTeamPlayedAtBase(team.id, baseId));
};

// Authenticate user
export const authenticateUser = async (id: number, password: string, type: 'admin' | 'base'): Promise<User | null> => {
  try {
    const email = type === 'admin' ? 'admin@example.com' : `base${id}@example.com`;
    
    // Sign in with Supabase auth
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return null;
    }

    if (!session) {
      return null;
    }

    // Return the appropriate user object
    if (type === 'admin' && id === 0) {
      return { type: 'admin', id: 0, password };
    } else if (type === 'base' && id >= 1 && id <= 10) {
      return { type: 'base', id, password };
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Reset all event data
export const resetAllData = async () => {
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
    
    matchesCache = [];
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
};

// Sync data from Supabase
export const syncFromSupabase = async () => {
  try {
    await fetchMatches();
    return true;
  } catch (error) {
    console.error('Error syncing from Supabase:', error);
    return false;
  }
};