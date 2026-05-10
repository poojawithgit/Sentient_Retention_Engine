import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, Activity, ArrowRight, Fingerprint, Terminal } from 'lucide-react';
import config from '../config';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('sre_token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log(`Attempting login to: ${config.API_BASE_URL}/auth/login`);
      const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('sre_token', data.token);
        localStorage.setItem('sre_user', JSON.stringify(data.user));
        
        setIsAuthorized(true);
        // Minimal delay for "Authorized" feedback, then instant navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection failure to Neural Node');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050805] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-20 h-20 bg-[#c5f82a]/10 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full border-2 border-[#c5f82a] animate-ping opacity-20"></div>
          <ShieldCheck size={40} className="text-[#c5f82a] animate-pulse" />
        </div>
        <h2 className="text-[#c5f82a] text-lg font-bold tracking-widest uppercase mb-2">Neural Link Established</h2>
        <p className="text-gray-500 font-mono text-[9px] animate-pulse">Syncing Dashboard Environment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050805] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background elements optimized for speed */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#c5f82a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c5f82a]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-300">
        {/* Security Badge */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-[#0f1712] border border-[#c5f82a]/30 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
                <Fingerprint size={24} className="text-[#c5f82a]" />
            </div>
        </div>

        <div className="bg-[#0f1712]/90 backdrop-blur-3xl border border-[#1a281e] rounded-[32px] p-10 shadow-2xl">
          <div className="text-center mb-8 pt-2">
            <h1 className="text-2xl font-black text-white tracking-tighter mb-1 uppercase">Sentient <span className="text-[#c5f82a]">Specialist</span></h1>
            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">Retention Core Access</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-[10px] font-bold mb-6 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label htmlFor="specialist-id" className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Specialist ID</label>
                <Terminal size={10} className="text-gray-700" />
              </div>
              <div className="relative group">
                <input
                  id="specialist-id"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ID_SPECIALIST_X"
                  className="w-full bg-[#070c08] border border-[#1a281e] rounded-xl py-4 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-800 focus:outline-none focus:border-[#c5f82a]/40 transition-all font-mono"
                  required
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#c5f82a] transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label htmlFor="access-phrase" className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Access Phrase</label>
                <Lock size={10} className="text-gray-700" />
              </div>
              <div className="relative group">
                <input
                  id="access-phrase"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070c08] border border-[#1a281e] rounded-xl py-4 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-800 focus:outline-none focus:border-[#c5f82a]/40 transition-all font-mono"
                  required
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#c5f82a] transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#c5f82a] text-[#0a110b] font-black text-xs py-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(197,248,42,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-8 uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#0a110b]/30 border-t-[#0a110b] rounded-full animate-spin"></div>
              ) : (
                <>
                  Connect to Engine
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex items-center justify-between border-t border-[#1a281e] pt-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c5f82a] animate-pulse"></div>
              <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Active Node</span>
            </div>
            <div className="flex gap-4">
              <span className="text-[8px] text-gray-700 font-mono">AUTH_V2</span>
              <span className="text-[8px] text-gray-700 font-mono">TLS_1.3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
