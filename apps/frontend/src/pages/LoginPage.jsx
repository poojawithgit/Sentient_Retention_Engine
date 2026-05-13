import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '../components/dashboard/DashboardComponents';
import { Lock, User, ShieldCheck, Activity, ArrowRight, Fingerprint, Terminal, Shield, Cpu, Globe, Database } from 'lucide-react';
import config from '../config';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const caseId = queryParams.get('caseId');
  const isAdminPortal = location.pathname === '/admin/login';

  useEffect(() => {
    const userStr = localStorage.getItem('sre_user');
    const token = localStorage.getItem('sre_token');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (isAdminPortal && user.role === 'admin') {
          navigate('/admin/management' + (caseId ? `?claim=${caseId}` : ''));
        } else if (!isAdminPortal) {
          navigate('/dashboard');
        }
      } catch (e) {
        localStorage.removeItem('sre_token');
        localStorage.removeItem('sre_user');
      }
    }
  }, [navigate, isAdminPortal, caseId]);

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
        const userData = isAdminPortal ? { ...data.user, role: 'admin' } : data.user;
        localStorage.setItem('sre_user', JSON.stringify(userData));
        
        if (isAdminPortal) {
          navigate('/admin/management' + (caseId ? `?claim=${caseId}` : ''));
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection failure to Neural Node');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050805] flex flex-col lg:flex-row items-stretch font-sans relative overflow-hidden">
      {/* Dynamic Background HUD */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hud-grid opacity-20"></div>
        <div className="hud-scanline opacity-30"></div>
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#c5f82a]/5 rounded-full blur-[160px]"
        />
        <motion.div 
          animate={{ 
            opacity: [0.05, 0.15, 0.05],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#c5f82a]/5 rounded-full blur-[160px]"
        />
      </div>

      {/* LEFT SIDE: Branding & Identity (The "Anchor") */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden"
      >
        <div className="relative z-10 text-center space-y-16 px-6 lg:px-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1, type: "spring" }}
          >
            <div className="relative inline-block">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-60px] border border-[#c5f82a]/5 rounded-full border-dashed"
              />
              <div className="scale-[2.2] drop-shadow-[0_0_50px_rgba(197,248,42,0.15)]">
                <BrandLogo hideText={true} />
              </div>
            </div>
          </motion.div>
          
          <div className="space-y-8 max-w-lg mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-display text-white tracking-[0.2em] -mr-[0.2em] uppercase leading-[1.1] font-black">
                Sentient <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/40 via-white/20 to-transparent">Retention</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1 }}
              className="text-[#c5f82a] font-mono text-xs lg:text-sm tracking-[0.4em] -mr-[0.4em] uppercase leading-relaxed max-w-sm mx-auto"
            >
              Autonomous Customer <br />Preservation Engine
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* RIGHT SIDE: Access Portal (The "Action") */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 xl:p-24 relative z-10">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, x: 50 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          {/* Mobile Identity */}
          <div className="lg:hidden mb-12 flex flex-col items-center gap-6">
            <div className="scale-125">
              <BrandLogo hideText={true} />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-display text-white tracking-[0.2em] uppercase font-bold">Sentient</h1>
              <p className="text-[#c5f82a] font-mono text-[10px] tracking-[0.3em] uppercase opacity-70">Customer Preservation</p>
            </div>
          </div>

          <div className="relative">
            {/* Pulsing Security Indicator */}
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 0px rgba(197,248,42,0)", "0 0 20px rgba(197,248,42,0.2)", "0 0 0px rgba(197,248,42,0)"] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 z-20"
            >
                <div className="bg-[#0f1712] border border-[#c5f82a]/30 p-4 rounded-3xl shadow-2xl backdrop-blur-2xl">
                    <Fingerprint size={28} className="text-[#c5f82a]" />
                </div>
            </motion.div>

            <div className="bg-[#0f1712]/40 backdrop-blur-3xl border border-white/5 rounded-[48px] p-8 lg:p-12 xl:p-16 shadow-2xl relative overflow-hidden group hover:border-[#c5f82a]/10 transition-colors duration-700">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-[#c5f82a]/10 rounded-tl-[48px]" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-[#c5f82a]/10 rounded-br-[48px]" />
              
              <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none group-hover:opacity-[0.03] transition-opacity duration-700">
                <Shield size={160} className="text-white" />
              </div>


              <div className="text-center mb-12">
                <AnimatePresence mode="wait">
                  {isAdminPortal ? (
                    <motion.div 
                      key="admin"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#c5f82a]/10 border border-[#c5f82a]/20">
                        <Shield size={14} className="text-[#c5f82a]" />
                        <span className="text-[10px] font-bold text-[#c5f82a] uppercase tracking-[0.25em]">Authority Protocol Active</span>
                      </div>
                      <h2 className="text-4xl font-display text-white tracking-[0.2em] uppercase mb-2">Master Node</h2>
                      <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest italic opacity-60">Authentication Layer 4 Required</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="user"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <h2 className="text-4xl font-display text-white tracking-[0.2em] uppercase mb-2">Access Portal</h2>
                      <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-[0.3em] opacity-60">Secure Link Establishment</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl text-[10px] font-bold mb-8 flex items-center gap-4"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse"></div>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Operator ID</label>
                    <Terminal size={12} className="text-gray-700" />
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ID_SECURE_NODE_01"
                      className="w-full bg-[#070c08] border border-[#1a281e] rounded-2xl py-5 pl-14 pr-6 text-sm text-gray-200 placeholder-gray-800 focus:outline-none focus:border-[#c5f82a]/40 focus:ring-1 focus:ring-[#c5f82a]/20 transition-all font-mono"
                      required
                    />
                    <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#c5f82a] transition-colors" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Access Sequence</label>
                    <Lock size={12} className="text-gray-700" />
                  </div>
                  <div className="relative group">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#070c08] border border-[#1a281e] rounded-2xl py-5 pl-14 pr-6 text-sm text-gray-200 placeholder-gray-800 focus:outline-none focus:border-[#c5f82a]/40 focus:ring-1 focus:ring-[#c5f82a]/20 transition-all font-mono"
                      required
                    />
                    <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-[#c5f82a] transition-colors" />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(197,248,42,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${isAdminPortal ? 'bg-white text-black hover:bg-[#c5f82a]' : 'bg-[#c5f82a] text-[#0a110b]'} font-black text-xs py-5 rounded-2xl transition-all flex items-center justify-center gap-3 mt-12 uppercase tracking-[0.2em] relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  {isLoading ? (
                    <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{isAdminPortal ? 'Authenticate Access' : 'Establish Link'}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-12 flex items-center justify-between border-t border-[#1a281e] pt-8">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-[#c5f82a]"></div>
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#c5f82a] animate-ping opacity-50"></div>
                  </div>
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em]">Neural System Online</span>
                </div>
                <div className="flex gap-6 opacity-30">
                  <span className="text-[9px] text-gray-700 font-mono tracking-widest underline decoration-[#c5f82a]/50">E2E_V4</span>
                  <span className="text-[9px] text-gray-700 font-mono tracking-widest">TLS_WPA3</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
