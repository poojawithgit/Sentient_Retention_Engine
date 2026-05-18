import React from 'react';
import { 
  Shield, Gavel, History, CheckCircle, XCircle, 
  AlertTriangle, Clock, Activity, ArrowRight, ShieldCheck,
  ShieldAlert, Lock, Unlock, Eye, Database, Filter, UserCheck,
  ShieldX, Fingerprint, List
} from 'lucide-react';

const GovernanceView = ({ 
  view, 
  setView, 
  approvals, 
  logs, 
  policies, 
  agentScopes,
  trustLevels,
  isLoading, 
  onAction,
  onUpdateTrust
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Sub-Navigation ── */}
      <div className="flex items-center gap-2 bg-[#0a110b] border border-[#1a281e] p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setView('approvals')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            view === 'approvals' ? 'bg-[#c5f82a] text-[#0a110b]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <Gavel size={14} />
          Approval Queue
          {approvals.length > 0 && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${view === 'approvals' ? 'bg-black/10' : 'bg-[#c5f82a]/10 text-[#c5f82a]'}`}>
              {approvals.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setView('logs')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            view === 'logs' ? 'bg-[#c5f82a] text-[#0a110b]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <History size={14} />
          Audit Trail
        </button>
        <button 
          onClick={() => setView('security')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            view === 'security' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <ShieldAlert size={14} />
          Security Audit
          {logs.filter(l => l.action === 'UNAUTHORIZED_ACTION_BLOCKED').length > 0 && (
            <span className="ml-2 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          )}
        </button>
        <button 
          onClick={() => setView('policies')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            view === 'policies' ? 'bg-[#c5f82a] text-[#0a110b]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <List size={14} />
          Agent Scopes
        </button>
        <button 
          onClick={() => setView('trust')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            view === 'trust' ? 'bg-[#c5f82a] text-[#0a110b]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <UserCheck size={14} />
          Agent Trust
        </button>
      </div>

      {/* ── Content Sections ── */}
      {view === 'approvals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <StatSmall label="Pending Requests" value={approvals.length} icon={Clock} color="text-orange-400" />
            <StatSmall label="High Risk Actions" value={approvals.filter(a => a.metadata?.risk_level === 'high').length} icon={AlertTriangle} color="text-red-400" />
            <StatSmall label="Avg Decision Time" value="4.2m" icon={Activity} color="text-blue-400" />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <LoadingState />
            ) : approvals.length > 0 ? (
              approvals.map((req) => (
                <ApprovalCard key={req.id} request={req} onAction={onAction} />
              ))
            ) : (
              <EmptyState 
                icon={CheckCircle} 
                title="All Clear" 
                subtitle="No pending agent actions require manual authorization." 
              />
            )}
          </div>
        </div>
      )}

      {view === 'logs' && (
        <div className="bg-[#0a110b] border border-[#1a281e] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-[#1a281e] flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database size={18} className="text-[#c5f82a]" />
              Immutable Governance Log
            </h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <Activity size={12} className="text-[#c5f82a]" />
                  Active Stream
               </div>
              <button className="p-3 bg-[#1a281e] text-gray-400 rounded-xl hover:text-white transition-colors border border-[#2a4230]">
                <Filter size={18} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#060c08] border-b border-[#1a281e]">
                <tr>
                  <th className="p-6 text-[10px] text-gray-600 font-bold uppercase tracking-widest">Event ID</th>
                  <th className="p-6 text-[10px] text-gray-600 font-bold uppercase tracking-widest">Type</th>
                  <th className="p-6 text-[10px] text-gray-600 font-bold uppercase tracking-widest">Details</th>
                  <th className="p-6 text-[10px] text-gray-600 font-bold uppercase tracking-widest">Security</th>
                  <th className="p-6 text-[10px] text-gray-600 font-bold uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a281e]">
                {logs.map((log, i) => (
                  <tr key={log.id || i} className={`hover:bg-white/5 transition-colors group ${log.action === 'UNAUTHORIZED_ACTION_BLOCKED' ? 'bg-red-500/5' : ''}`}>
                    <td className="p-6 text-xs text-gray-500 font-mono">#{log.id ? log.id.slice(-6) : `00${i}`}</td>
                    <td className="p-6">
                      <div className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest w-fit mb-1 ${
                        log.action === 'UNAUTHORIZED_ACTION_BLOCKED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        {log.action?.replace('GOVERNANCE_', '')}
                      </div>
                      <div className="text-sm font-bold text-gray-200">{log.action === 'UNAUTHORIZED_ACTION_BLOCKED' ? 'Security Violation' : 'System Event'}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs text-gray-400 max-w-md truncate">{log.reason}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-tighter">Admin: {log.admin_id}</div>
                    </td>
                    <td className="p-6">
                      {log.action === 'UNAUTHORIZED_ACTION_BLOCKED' ? (
                        <div className="flex items-center gap-2 text-red-400">
                          <ShieldX size={14} />
                          <span className="text-[10px] font-bold uppercase">Blocked</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#c5f82a]">
                          <ShieldCheck size={14} />
                          <span className="text-[10px] font-bold uppercase">Safe</span>
                        </div>
                      )}
                    </td>
                    <td className="p-6 text-xs text-gray-500 font-mono">{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'security' && (
        <div className="space-y-6">
          <div className="bg-[#1a0f0f] border border-red-900/30 p-8 rounded-3xl flex items-center justify-between shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
                  <ShieldAlert size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Security Enforcement Stream</h3>
                  <p className="text-sm text-red-400/60 uppercase tracking-widest font-bold">Real-time Permission Validation Monitoring</p>
               </div>
            </div>
            <div className="text-right">
               <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Critical Alerts</div>
               <div className="text-3xl font-bold text-white font-mono">{logs.filter(l => l.action === 'UNAUTHORIZED_ACTION_BLOCKED').length}</div>
            </div>
          </div>

          <div className="grid gap-4">
            {logs.filter(l => l.action === 'UNAUTHORIZED_ACTION_BLOCKED').length > 0 ? (
              logs.filter(l => l.action === 'UNAUTHORIZED_ACTION_BLOCKED').map((log, i) => (
                <div key={i} className="bg-[#0a110b] border-l-4 border-l-red-500 border-y border-r border-[#1a281e] p-6 rounded-2xl flex items-center justify-between group hover:bg-red-500/5 transition-all">
                   <div className="flex items-center gap-6">
                      <div className="p-3 bg-red-500/10 rounded-xl text-red-400 border border-red-500/10">
                         <Fingerprint size={20} />
                      </div>
                      <div>
                         <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-bold text-white uppercase tracking-tight">Security Violation Detected</span>
                            <span className="px-2 py-0.5 bg-red-500 text-[9px] font-black uppercase text-white rounded">Denied</span>
                         </div>
                         <p className="text-xs text-gray-400 font-mono italic">"{log.reason}"</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-8">
                      <div className="text-right">
                         <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Enforced By</div>
                         <div className="text-xs font-bold text-gray-300 font-mono">GOVERNANCE_v4.2</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Timestamp</div>
                         <div className="text-xs font-bold text-gray-500 font-mono">{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</div>
                      </div>
                   </div>
                </div>
              ))
            ) : (
              <EmptyState 
                icon={ShieldCheck} 
                title="No Security Violations" 
                subtitle="All agent actions are currently operating within authorized permission scopes." 
              />
            )}
          </div>
        </div>
      )}

      {view === 'policies' && (
        <div className="space-y-10">
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(agentScopes).map(([agentName, scope]) => (
              <div key={agentName} className="bg-[#0a110b] border border-[#1a281e] p-8 rounded-3xl group hover:border-[#c5f82a]/30 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-white/5 text-[#c5f82a]">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight">{agentName}</h4>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Permission Scope</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-[9px] text-[#c5f82a] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CheckCircle size={10} />
                      Allowed Actions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scope.allowed.map(action => (
                        <span key={action} className="px-2 py-1 bg-[#c5f82a]/10 text-[#c5f82a] text-[9px] font-bold rounded border border-[#c5f82a]/20 uppercase">
                          {action.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-red-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <XCircle size={10} />
                      Blocked Actions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scope.blocked.map(action => (
                        <span key={action} className="px-2 py-1 bg-red-500/10 text-red-400 text-[9px] font-bold rounded border border-red-500/20 uppercase">
                          {action.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-[#1a281e]">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Database size={14} />
              Global Business Policies
            </h3>
            <div className="grid grid-cols-2 gap-8">
              {policies.map((policy) => (
                <div key={policy.id} className="bg-[#0a110b] border border-[#1a281e] p-8 rounded-3xl group hover:border-[#c5f82a]/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield size={100} className="text-[#c5f82a]" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className={`p-3 rounded-2xl ${policy.enabled ? 'bg-[#c5f82a]/10 text-[#c5f82a]' : 'bg-red-500/10 text-red-400'}`}>
                      {policy.enabled ? <Lock size={20} /> : <Unlock size={20} />}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-display tracking-tight">{policy.name}</h4>
                      <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{policy.id}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 relative z-10">
                    <p className="text-sm text-gray-400 leading-relaxed italic">"{policy.description}"</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/40 border border-[#1a281e] rounded-2xl">
                        <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">Max Discount</div>
                        <div className="text-lg font-bold text-white font-mono">{policy.rules?.max_discount || 'N/A'}%</div>
                      </div>
                      <div className="p-4 bg-black/40 border border-[#1a281e] rounded-2xl">
                        <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">Risk Mode</div>
                        <div className="text-lg font-bold text-white font-mono uppercase">{policy.rules?.risk_mode || 'STRICT'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[#1a281e] relative z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${policy.enabled ? 'bg-[#c5f82a]' : 'bg-red-500'}`} />
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{policy.enabled ? 'Active Enforcement' : 'Disabled'}</span>
                    </div>
                    <button className="text-[10px] font-bold text-[#c5f82a] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                      Edit Rules
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'trust' && (
        <div className="bg-[#0a110b] border border-[#1a281e] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-[#1a281e]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck size={18} className="text-[#c5f82a]" />
              Agent Behavioral Trust Levels
            </h3>
          </div>
          <div className="p-0">
            {trustLevels.map((trust, i) => (
              <div key={i} className="flex items-center justify-between p-8 border-b border-[#1a281e] last:border-0 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    trust.trust_level > 80 ? 'bg-[#c5f82a]/10 border-[#c5f82a]/20 text-[#c5f82a]' :
                    trust.trust_level > 50 ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                    'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    <Fingerprint size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{trust.agent_id}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Enforcement Status:</div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        trust.status === 'suspended' ? 'bg-red-500 text-white animate-pulse' : 'bg-[#c5f82a]/20 text-[#c5f82a]'
                      }`}>
                        {trust.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-center">
                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">Trust Score</div>
                    <div className={`text-2xl font-bold font-mono ${
                      trust.trust_level > 80 ? 'text-[#c5f82a]' :
                      trust.trust_level > 50 ? 'text-orange-400' :
                      'text-red-400'
                    }`}>{trust.trust_level}%</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onUpdateTrust(trust.agent_id, Math.max(0, trust.trust_level - 10))}
                      className="p-3 bg-red-500/5 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <ShieldX size={18} />
                    </button>
                    <button 
                      onClick={() => onUpdateTrust(trust.agent_id, Math.min(100, trust.trust_level + 10))}
                      className="p-3 bg-[#c5f82a]/5 text-[#c5f82a] border border-[#c5f82a]/10 rounded-xl hover:bg-[#c5f82a] hover:text-[#0a110b] transition-all"
                    >
                      <ShieldCheck size={18} />
                    </button>
                    <div className="h-10 w-px bg-[#1a281e] mx-2" />
                    <button 
                      onClick={() => onUpdateStatus(trust.agent_id, trust.is_active !== false)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        trust.is_active === false ? 'bg-[#c5f82a] text-[#0a110b] border-[#c5f82a]' : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      {trust.is_active === false ? 'Restore Agent' : 'Suspend Agent'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-Components ───

const ApprovalCard = ({ request, onAction }) => {
  const isHighRisk = request.metadata?.risk_level === 'high';
  
  return (
    <div className="bg-[#0a110b] border border-[#1a281e] p-8 rounded-3xl hover:border-[#c5f82a]/30 transition-all relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5f82a]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-[#c5f82a]/10 transition-colors" />
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${
            isHighRisk ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-[#c5f82a]/10 border-[#c5f82a]/20 text-[#c5f82a]'
          }`}>
            <Gavel size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-xl font-bold text-white font-display tracking-tight">{request.action_type}</h4>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                isHighRisk ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {request.metadata?.risk_level || 'standard'} risk
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono tracking-widest">TARGET: {request.user_id} • TRIGGERED BY {request.agent_id}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">SLA Deadline</div>
          <div className="text-sm font-bold text-white font-mono flex items-center justify-end gap-2">
            <Clock size={14} className="text-orange-400" />
            04:12
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
        <div className="space-y-4">
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Agent Reasoning</div>
          <div className="bg-black/40 border border-[#1a281e] p-5 rounded-2xl font-mono text-xs text-gray-400 leading-relaxed italic">
            "{request.reasoning}"
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Risk Analysis</div>
          <div className="grid grid-cols-2 gap-3">
             {request.metadata?.violations?.map((v, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-bold uppercase tracking-tighter">
                  <ShieldAlert size={12} />
                  {v}
                </div>
             ))}
             <div className="p-3 bg-[#c5f82a]/5 border border-[#c5f82a]/20 rounded-xl">
                <div className="text-[9px] text-gray-500 uppercase mb-1">ROI Est.</div>
                <div className="text-sm font-bold text-[#c5f82a] font-mono">+{request.metadata?.roi_estimate}%</div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <button 
          onClick={() => onAction(request.id, 'approved')}
          className="flex-1 py-4 bg-[#c5f82a] text-[#0a110b] font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(197,248,42,0.4)] transition-all flex items-center justify-center gap-2 group"
        >
          <ShieldCheck size={18} />
          Authorize Action
        </button>
        <button 
          onClick={() => onAction(request.id, 'rejected')}
          className="px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-2xl font-bold transition-all flex items-center gap-2"
        >
          <XCircle size={18} />
          Deny
        </button>
        <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-colors border border-white/5">
          <Eye size={20} />
        </button>
      </div>
    </div>
  );
};

const StatSmall = ({ label, value, icon: Icon, color }) => (
  <div className="bg-[#0a110b] border border-[#1a281e] p-5 rounded-2xl flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{label}</div>
      <div className="text-xl font-bold text-white font-mono">{value}</div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="py-20 flex flex-col items-center justify-center text-gray-600">
    <Activity size={40} className="animate-spin mb-4 opacity-20" />
    <p className="text-sm font-medium uppercase tracking-widest">Accessing Governance Substrate...</p>
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="bg-[#0a110b] border border-[#1a281e] rounded-3xl py-20 flex flex-col items-center justify-center border-dashed">
    <div className="w-16 h-16 bg-[#1a281e] rounded-2xl flex items-center justify-center mb-4">
      <Icon size={30} className="text-gray-700" />
    </div>
    <p className="text-white font-bold uppercase tracking-widest text-[10px]">{title}</p>
    <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
  </div>
);

export default GovernanceView;
