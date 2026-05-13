import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, ShieldAlert, Activity, ArrowRight, Fingerprint, Terminal } from 'lucide-react';
import { BrandLogo } from '../components/dashboard/DashboardComponents';
import config from '../config';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract caseId from query params if coming from "Take Ownership"
  const queryParams = new URLSearchParams(location.search);
  const caseId = queryParams.get('caseId');

  useEffect(() => {
    // If already logged in as admin, just redirect to management
    const user = JSON.parse(localStorage.getItem('sre_user') || '{}');
    if (localStorage.getItem('sre_token') && user.role === 'admin') {
      navigate('/admin/management' + (caseId ? `?claim=${caseId}` : ''));
    }
  }, [navigate, caseId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('sre_token', data.token);
        localStorage.setItem('sre_user', JSON.stringify({ ...data.user, role: 'admin' })); // Force admin role for this portal demo
        
        navigate('/admin/management' + (caseId ? `?claim=${caseId}` : ''));
      } else {
        setError(data.message || 'Invalid Admin Credentials');
      }
    } catch (err) {
      setError('Connection failure to Security Node');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050805] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background HUD elements */}
      <div className="hud-grid opacity-40"></div>
      <div className="hud-scanline"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c5f82a]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-xl relative animate-in fade-in zoom-in-95 duration-700">
        
        {/* Login Card */}
        <div className="w-full relative">
          {/* Mobile Branding */}
          <div className="mb-10 flex justify-center animate-in slide-in-from-top-4 duration-700">
            <BrandLogo />
          </div>

          {/* Security Badge */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-[#0f1712] border border-[#c5f82a]/30 p-4 rounded-2xl shadow-2xl backdrop-blur-xl group cursor-help">
                  <Fingerprint size={28} className="text-[#c5f82a] group-hover:scale-110 transition-transform duration-500" />
              </div>
          </div>

          <div className="bg-[#0f1712]/90 backdrop-blur-3xl border border-[#1a281e] rounded-[40px] p-14 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
              <Terminal size={120} className="text-white" />
            </div>

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5f82a]/10 border border-[#c5f82a]/20 mb-4">
                <ShieldAlert size={14} className="text-[#c5f82a]" />
                <span className="text-[10px] font-bold text-[#c5f82a] uppercase tracking-[0.2em]">High Authority Access</span>
              </div>
              <h1 className="text-3xl font-display text-white mb-2">Admin Portal</h1>
              <p className="text-gray-500 text-sm font-medium italic">"Secure entry for core engine command."</p>
            </div>

            {caseId && (
              <div className="mb-8 bg-[#c5f82a]/5 border border-[#c5f82a]/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#c5f82a]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Activity size={18} className="text-[#c5f82a]" />
                  </div>
                  <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Target Handover</div>
                      <div className="text-[#c5f82a] text-sm font-mono font-bold">CASE_ID: {caseId}</div>
                  </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[11px] font-bold mb-8 flex items-center gap-3 animate-shake">
                <ShieldAlert size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="admin-identifier" className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Admin Identifier</label>
                  <Terminal size={12} className="text-gray-700" />
                </div>
                <div className="relative group">
                  <input
                    id="admin-identifier"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#070c08] border border-[#1a281e] rounded-2xl py-5 pl-14 pr-6 text-sm text-gray-200 focus:outline-none focus:border-[#c5f82a]/40 focus:ring-1 focus:ring-[#c5f82a]/20 transition-all font-mono"
                    placeholder="ID_SEC_ALPHA"
                    required
                  />
                  <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#c5f82a] transition-colors" />
                </div>
              </div>

              <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                      <label htmlFor="security-phrase" className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Security Phrase</label>
                      <Lock size={12} className="text-gray-700" />
                  </div>
                <div className="relative group">
                  <input
                    id="security-phrase"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#070c08] border border-[#1a281e] rounded-2xl py-5 pl-14 pr-6 text-sm text-gray-200 focus:outline-none focus:border-[#c5f82a]/40 focus:ring-1 focus:ring-[#c5f82a]/20 transition-all font-mono"
                    placeholder="••••••••••••"
                    required
                  />
                  <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#c5f82a] transition-colors" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-[#050805] hover:bg-[#c5f82a] font-black text-sm py-5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(197,248,42,0.2)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <>
                    Verify Credentials
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 flex items-center justify-center gap-8">
              <div className="flex flex-col items-center">
                  <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Auth Protocol</span>
                  <span className="text-[10px] text-gray-400 font-mono">JWT_RSA_256</span>
              </div>
              <div className="w-[1px] h-6 bg-gray-800"></div>
              <div className="flex flex-col items-center">
                  <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Enforcement</span>
                  <span className="text-[10px] text-gray-400 font-mono">AES_256_GCM</span>
              </div>
            </div>
          </div>
          
          <p className="text-center mt-8 text-gray-700 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-loose">
              Unauthorized access is strictly monitored. All sessions are logged by the neural core.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
