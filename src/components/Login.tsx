import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

const Login: React.FC = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState<'admin' | 'base'>('base');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      setError('Please enter a valid ID');
      return;
    }

    // Validate ID range
    if (type === 'admin' && idNumber !== 0) {
      setError('Admin ID must be 0');
      return;
    }

    if (type === 'base' && (idNumber < 1 || idNumber > 10)) {
      setError('Base ID must be between 1 and 10');
      return;
    }

    // Validate password is not empty
    if (!password.trim()) {
      setError('Password cannot be empty');
      return;
    }

    const success = await login(idNumber, password, type);
    if (success) {
      navigate(type === 'admin' ? '/admin' : `/base/${idNumber}`);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Trophy size={48} className="text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">CAMPA 2025</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Login As
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-indigo-600"
                  checked={type === 'base'}
                  onChange={() => setType('base')}
                />
                <span className="ml-2">Base</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-indigo-600"
                  checked={type === 'admin'}
                  onChange={() => setType('admin')}
                />
                <span className="ml-2">Admin</span>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="id">
              {type === 'admin' ? 'Admin ID' : 'Base ID'}
            </label>
            <input
              id="id"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={type === 'admin' ? 'Enter admin ID (0)' : 'Enter base ID (1-10)'}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            {type === 'admin' && (
              <p className="text-xs text-gray-500 mt-1">Default admin password: adminpass</p>
            )}
            {type === 'base' && (
              <p className="text-xs text-gray-500 mt-1">Default base passwords: base1pass, base2pass, etc.</p>
            )}
          </div>
          
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;