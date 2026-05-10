import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ShieldCheck, Activity, ArrowRight, Building2, Mail, Terminal } from 'lucide-react';
import config from '../config';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, companyName, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection failure to Neural Node');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050805] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-20 h-20 bg-[#c5f82a]/10 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full border-2 border-[#c5f82a] animate-ping opacity-20"></div>
          <ShieldCheck size={40} className="text-[#c5f82a] animate-pulse" />
        </div>
        <h2 className="text-[#c5f82a] text-lg font-bold tracking-widest uppercase mb-2">Registration Complete</h2>
        <p className="text-gray-500 font-mono text-[9px] animate-pulse">Redirecting to Login Interface...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050805] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#c5f82a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c5f82a]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-[#0f1712]/90 backdrop-blur-3xl border border-[#1a281e] rounded-[32px] p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tighter mb-1 uppercase">Initialize <span className="text-[#c5f82a]">Engine</span></h1>
            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">Corporate Node Registration</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-[10px] font-bold mb-6 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="company-name" className="text-[9px] text-gray-500 uppercase tracking-widest font-bold px-1">Company Name</label>
              <div className="relative group">
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ACME CORP"
                  className="w-full bg-[#070c08] border border-[#1a281e] rounded-xl py-3 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-800 focus:outline-none focus:border-[#c5f82a]/40 transition-all font-mono"
                  required
                />
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#c5f82a] transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="specialist-id" className="text-[9px] text-gray-500 uppercase tracking-widest font-bold px-1">Specialist ID</label>
              <div className="relative group">
                <input
                  id="specialist-id"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ADMIN_USER"
                  className="w-full bg-[#070c08] border border-[#1a281e] rounded-xl py-3 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-800 focus:outline-none focus:border-[#c5f82a]/40 transition-all font-mono"
                  required
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#c5f82a] transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="access-phrase" className="text-[9px] text-gray-500 uppercase tracking-widest font-bold px-1">Access Phrase</label>
              <div className="relative group">
                <input
                  id="access-phrase"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070c08] border border-[#1a281e] rounded-xl py-3 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-800 focus:outline-none focus:border-[#c5f82a]/40 transition-all font-mono"
                  required
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#c5f82a] transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#c5f82a] text-[#0a110b] font-black text-xs py-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(197,248,42,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-6 uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#0a110b]/30 border-t-[#0a110b] rounded-full animate-spin"></div>
              ) : (
                <>
                  Register Node
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[10px] text-gray-500 hover:text-[#c5f82a] transition-colors font-bold uppercase tracking-widest">
              Existing specialist? <span className="text-[#c5f82a]">Authorize Link</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
