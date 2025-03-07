import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  calculateScores, 
  teams, 
  bases, 
  matches, 
  getTeamById, 
  getBaseById,
  resetAllData,
  syncFromSupabase,
  fetchMatches,
  getMatches
} from '../data';
import { Trophy, Medal, LogOut, Award, RefreshCw, Trash2 } from 'lucide-react';
import ResetModal from './ResetModal';

const AdminInterface: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'matches' | 'bases'>('leaderboard');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  let dataLoaded = false;
  useEffect(() => {
    // Redirect if not logged in as admin
    if (!currentUser || currentUser.type !== 'admin') {
      navigate('/');
      return;
    }
    if (!dataLoaded) {
      fetchMatches().then(() => {
        setScores(calculateScores());
        dataLoaded = true;
      })
    }

    // Calculate scores
    setScores(calculateScores());
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResetConfirm = async () => {
    await resetAllData();
    setScores(calculateScores());
    setIsResetModalOpen(false);
    setSyncMessage('All data has been reset successfully!');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSyncMessage('');
    }, 3000);
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncMessage('Using local storage for match data...');
    fetchMatches().then(() => {
      setScores(calculateScores());
      setSyncMessage("")
      setIsSyncing(false);
    })
    // We're using local storage only now
   
  };

  // Sort teams by score (descending)
  const sortedTeams = [...teams].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  // Get medal color based on position
  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500'; // Gold
      case 1: return 'text-gray-400'; // Silver
      case 2: return 'text-amber-700'; // Bronze
      default: return 'text-gray-300'; // No medal
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Trophy size={24} className="mr-2" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleSyncData()}
              className="flex items-center bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded"
              disabled={isSyncing}
            >
              <RefreshCw size={18} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <button 
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              <Trash2 size={18} className="mr-2" />
              Reset Event
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {syncMessage && (
          <div className={`mb-4 p-3 rounded ${syncMessage.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {syncMessage}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'leaderboard' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Trophy size={18} className="inline mr-2" />
              Leaderboard
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'matches' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('matches')}
            >
              <Award size={18} className="inline mr-2" />
              All Matches
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'bases' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('bases')}
            >
              <Medal size={18} className="inline mr-2" />
              Base Status
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'leaderboard' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Trophy size={24} className="mr-2 text-yellow-500" />
                  Team Leaderboard
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bases Completed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeams.map((team, index) => {
                        const basesCompleted = getMatches().filter(
                          match => match.completed && (match.team1Id === team.id || match.team2Id === team.id)
                        ).map(match => match.baseId);
                        
                        // Remove duplicates
                        const uniqueBasesCompleted = [...new Set(basesCompleted)];
                        
                        return (
                          <tr key={team.id} className={index < 3 ? 'bg-indigo-50' : ''}>
                            <td className="py-3 px-4 border-b border-gray-200 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="font-medium">{index + 1}</span>
                                {index < 3 && (
                                  <Medal size={20} className={`ml-2 ${getMedalColor(index)}`} />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              <div className="font-medium text-gray-900">{team.name}</div>
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              <div className="text-lg font-bold text-indigo-600">{scores[team.id] || 0}</div>
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200">
                              <div className="flex items-center">
                                <span>{uniqueBasesCompleted.length} / 10</span>
                                <div className="ml-2 w-24 bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-indigo-600 h-2.5 rounded-full" 
                                    style={{ width: `${(uniqueBasesCompleted.length / 10) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'matches' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">All Matches</h2>
                
                {getMatches().length === 0 ? (
                  <p className="text-gray-500">No matches have been recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Base
                          </th>
                          <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teams
                          </th>
                          <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Result
                          </th>
                          <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...getMatches()]
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((match) => {
                            const base = getBaseById(match.baseId);
                            const team1 = getTeamById(match.team1Id);
                            const team2 = getTeamById(match.team2Id);
                            const winner = match.winnerId === null 
                              ? 'Tie' 
                              : getTeamById(match.winnerId)?.name;
                            const date = new Date(match.timestamp).toLocaleDateString();
                            
                            return (
                              <tr key={match.id}>
                                <td className="py-3 px-4 border-b border-gray-200">
                                  {base?.name}
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200">
                                  {team1?.name} vs {team2?.name}
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200">
                                  {winner === 'Tie' 
                                    ? <span className="text-yellow-600">Tie (5 points each)</span>
                                    : <span className="text-green-600">Winner: {winner} (10 points)</span>
                                  }
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200">
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
            )}

            {activeTab === 'bases' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Base Status</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bases.map((base) => {
                    const baseMatches = getMatches().filter(match => match.baseId === base.id);
                    const teamsPlayed = new Set();
                    
                    baseMatches.forEach(match => {
                      teamsPlayed.add(match.team1Id);
                      teamsPlayed.add(match.team2Id);
                    });
                    
                    const progress = (teamsPlayed.size / teams.length) * 100;
                    
                    return (
                      <div key={base.id} className="bg-white border rounded-lg shadow-sm p-4">
                        <h3 className="font-semibold text-lg mb-2">{base.name}</h3>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Teams played: {teamsPlayed.size} / {teams.length}</span>
                          <span className="text-sm font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm font-medium">Matches recorded: {baseMatches.length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <ResetModal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
};

export default AdminInterface;