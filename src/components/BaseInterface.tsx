import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getBaseById, 
  getAvailableTeamsForBase, 
  addMatch, 
  getTeamById,
  matches,
  fetchMatches,
  getMatches
} from '../data';
import { CheckCircle, LogOut } from 'lucide-react';

const BaseInterface: React.FC = () => {
  const { baseId } = useParams<{ baseId: string }>();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [team1, setTeam1] = useState<number | ''>('');
  const [team2, setTeam2] = useState<number | ''>('');
  const [winner, setWinner] = useState<number | 'tie' | ''>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableTeams, setAvailableTeams] = useState<number[]>([]);
  const [baseMatches, setBaseMatches] = useState<any[]>([]);
  const [savingResult,setSavingResult] = useState<boolean>();

  const baseIdNum = parseInt(baseId || '0', 10);
  const base = getBaseById(baseIdNum);

  let dataLoaded = false;
  useEffect(() => {
    // Redirect if not logged in or wrong base
    if (!currentUser || currentUser.type !== 'base' || currentUser.id !== baseIdNum) {
      navigate('/');
      return;
    }

    // Get available teams for this base
    const teams = getAvailableTeamsForBase(baseIdNum).map(team => team.id);
    setAvailableTeams(teams);

    // Get matches for this base
    if(!dataLoaded){
      fetchMatches().then(() => {
        const baseMatches = getMatches().filter(match => match.baseId === baseIdNum);
        setBaseMatches(baseMatches);
        const teams = getAvailableTeamsForBase(baseIdNum).map(team => team.id);
        setAvailableTeams(teams);
        dataLoaded = true;
      })
    }
    const baseMatches = getMatches().filter(match => match.baseId === baseIdNum);
    setBaseMatches(baseMatches);
  }, [baseIdNum, currentUser, navigate, savingResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (team1 === '' || team2 === '') {
      setError('Please select both teams');
      return;
    }

    if (team1 === team2) {
      setError('Cannot select the same team twice');
      return;
    }

    if (winner === '') {
      setError('Please select a winner or tie');
      return;
    }

    // Create match
    const team1Id = typeof team1 === 'string' ? parseInt(team1, 10) : team1;
    const team2Id = typeof team2 === 'string' ? parseInt(team2, 10) : team2;
    const winnerId = winner === 'tie' ? null : (typeof winner === 'string' ? parseInt(winner, 10) : winner);

    setSavingResult(true)
    await addMatch({
      baseId: baseIdNum,
      team1Id,
      team2Id,
      winnerId,
      completed: true
    });
    setSavingResult(false)

    setSuccess('Match result recorded successfully!');
    
    // Reset form
    setTeam1('');
    setTeam2('');
    setWinner('');
    
    // Update available teams
    const teams = getAvailableTeamsForBase(baseIdNum).map(team => team.id);
    setAvailableTeams(teams);
    
    // Update base matches
    const baseMatches = getMatches().filter(match => match.baseId === baseIdNum);
    setBaseMatches(baseMatches);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!base) {
    return <div>Base not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">{base.name} Interface</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Record Match Result</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                <CheckCircle size={20} className="mr-2" />
                {success}
              </div>
            )}
            
            {availableTeams.length < 2 ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                All teams have already played at this base. No more matches can be recorded.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Team 1
                  </label>
                  <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value ? parseInt(e.target.value, 10) : '')}
                  >
                    <option value="">Select Team 1</option>
                    {availableTeams.map(teamId => (
                      <option key={`team1-${teamId}`} value={teamId}>
                        {getTeamById(teamId)?.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Team 2
                  </label>
                  <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value ? parseInt(e.target.value, 10) : '')}
                    disabled={team1 === ''}
                  >
                    <option value="">Select Team 2</option>
                    {availableTeams
                      .filter(teamId => teamId !== team1)
                      .map(teamId => (
                        <option key={`team2-${teamId}`} value={teamId}>
                          {getTeamById(teamId)?.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                {team1 !== '' && team2 !== '' && (
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Winner
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-indigo-600"
                          name="winner"
                          value={team1}
                          checked={winner === team1}
                          onChange={() => setWinner(team1)}
                        />
                        <span className="ml-2">{getTeamById(typeof team1 === 'string' ? parseInt(team1, 10) : team1)?.name} (10 points)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-indigo-600"
                          name="winner"
                          value={team2}
                          checked={winner === team2}
                          onChange={() => setWinner(team2)}
                        />
                        <span className="ml-2">{getTeamById(typeof team2 === 'string' ? parseInt(team2, 10) : team2)?.name} (10 points)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-indigo-600"
                          name="winner"
                          value="tie"
                          checked={winner === 'tie'}
                          onChange={() => setWinner('tie')}
                        />
                        <span className="ml-2">Tie (5 points each)</span>
                      </label>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-center">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    disabled={team1 === '' || team2 === '' || winner === '' || savingResult}
                  >
                    Record Result
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Previous Matches at {base.name}</h2>
            
            {baseMatches.length === 0 ? (
              <p className="text-gray-500">No matches have been recorded at this base yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teams
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {baseMatches.map((match) => {
                      const team1 = getTeamById(match.team1Id);
                      const team2 = getTeamById(match.team2Id);
                      const winner = match.winnerId === null 
                        ? 'Tie' 
                        : getTeamById(match.winnerId)?.name;
                      const date = new Date(match.timestamp).toLocaleDateString();
                      
                      return (
                        <tr key={match.id}>
                          <td className="py-2 px-4 border-b border-gray-200">
                            {team1?.name} vs {team2?.name}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            {winner === 'Tie' 
                              ? <span className="text-yellow-600">Tie (5 points each)</span>
                              : <span className="text-green-600">Winner: {winner} (10 points)</span>
                            }
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            {date}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BaseInterface;