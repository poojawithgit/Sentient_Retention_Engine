import React, { useRef, useEffect } from 'react';
import { X, Cpu, Shield, Activity, Layers, Link2, CheckCircle, AlertCircle, Info, Clock, ChevronDown, Zap, ShieldCheck, User } from 'lucide-react';

export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`}></div>
);

export const KPICard = ({ title, value, badge, badgeColor = "text-cyber-primary bg-cyber-primary/10 border-cyber-primary/30", sparklineData }) => (
  <div className="premium-card p-6 flex flex-col relative overflow-hidden group">
    <div className="accent-line"></div>
    <div className="flex justify-between items-start mb-6 z-10">
      <div className="text-label text-zinc-400 font-medium">{title}</div>
      {badge && (
        <div className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold tracking-widest ${badgeColor}`}>
          {badge}
        </div>
      )}
    </div>
    <div className="text-5xl text-value text-white z-10 mb-4 font-display leading-none">{value}</div>
    {/* Sparkline */}
    <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-60">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`grad-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c5f82a" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#c5f82a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={sparklineData.path} fill={`url(#grad-${title.replace(/\s/g, '')})`} />
        <path d={sparklineData.line} fill="none" stroke="#c5f82a" strokeWidth="1" className="opacity-80" />
      </svg>
    </div>
  </div>
);

export const DonutChart = () => (
  <div className="premium-card p-6 flex flex-col h-full relative">
    <div className="text-label mb-6">Driver Distribution</div>
    <div className="flex-1 flex flex-col items-center justify-center relative">
      <svg viewBox="0 0 100 100" className="w-36 h-36">
        <circle cx="50" cy="50" r="35" fill="none" stroke="#1A1A1A" strokeWidth="12" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#c5f82a" strokeWidth="12" strokeDasharray="160 251" strokeDashoffset="-20" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-white text-value text-3xl font-display">{48.2}K</span>
        <span className="text-zinc-500 text-[11px] font-semibold uppercase tracking-[0.2em] mt-1">records</span>
      </div>
      <div className="flex gap-4 mt-8 text-[11px] font-semibold uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-zinc-400"><div className="w-1.5 h-1.5 rounded-full bg-cyber-primary"></div> Price</div>
        <div className="flex items-center gap-1.5 text-zinc-500"><div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div> Qual</div>
        <div className="flex items-center gap-1.5 text-zinc-500"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div> Cont</div>
      </div>
    </div>
  </div>
);

export const BarChart = () => (
  <div className="premium-card p-6 flex flex-col h-full">
    <div className="text-label mb-6">Risk Interventions — 7 Days</div>
    <div className="flex-1 flex flex-col justify-end">
      <div className="flex items-end justify-center gap-4 h-32 mb-6">
        {[
          [60, 40], [80, 50], [40, 30], [90, 60], [100, 30]
        ].map((pair, i) => (
          <div key={i} className="flex items-end gap-1 h-full">
            <div className="w-4 bg-cyber-primary" style={{height: `${pair[0]}%`}}></div>
            <div className="w-4 bg-zinc-800" style={{height: `${pair[1]}%`}}></div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 text-[11px] font-semibold uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-zinc-400"><div className="w-1.5 h-1.5 rounded-full bg-cyber-primary"></div> High Risk</div>
        <div className="flex items-center gap-1.5 text-zinc-500"><div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div> Low Risk</div>
      </div>
    </div>
  </div>
);

export const Heatmap = () => {
  const colors = ['#0D0D0D', '#1A1A1A', '#2A2A2A', '#3A3A3A', '#c5f82a'];
  return (
    <div className="premium-card p-6 flex flex-col h-full">
      <div className="text-label mb-6">Churn Score Heatmap</div>
      <div className="flex-1 grid grid-cols-6 gap-1.5 content-center">
        {Array.from({length: 24}).map((_, i) => {
          const colorIndex = i === 13 || i === 22 || i === 5 ? 4 : i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
          const color = colors[colorIndex];
          return (
            <div key={i} className="aspect-square rounded-md transition-transform hover:scale-110" 
                 style={{backgroundColor: color}}></div>
          );
        })}
      </div>
    </div>
  );
};

export const ModelCard = ({ name, latency, accuracy, accLabel = "Accuracy" }) => (
  <div className="premium-card p-6 flex flex-col justify-between group">
    <div className="flex justify-between items-center mb-6">
      <div className="text-value text-xl text-white font-display uppercase tracking-wider">{name}</div>
      <div className="text-label">Latency</div>
    </div>
    <div className="text-4xl text-value text-cyber-primary mb-10 font-display">
      {latency}
    </div>
    <div>
      <div className="flex justify-between text-[11px] text-zinc-500 mb-3 font-semibold uppercase tracking-widest font-mono">
        <span>{accLabel}</span>
        <span className="text-cyber-primary">{accuracy}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-cyber-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(197,248,42,0.4)]" style={{width: accuracy}}></div>
      </div>
    </div>
  </div>
);

export const FeatureImportance = () => {
  const features = [
    { name: 'Login_Fr...', val: '95%' },
    { name: 'Cart_Aband', val: '80%' },
    { name: 'Session_L...', val: '65%' },
    { name: 'Err_Rate', val: '40%' },
    { name: 'Days_Since', val: '25%' },
  ];
  return (
    <div className="premium-card p-6 shadow-2xl relative">
      <div className="flex justify-between items-center mb-8">
        <div className="text-value text-xl text-white font-display uppercase tracking-wider">XGBoost Importance</div>
        <div className="text-label text-cyber-primary/80">SHAP VECTOR</div>
      </div>
      <div className="space-y-4">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-24 text-[11px] text-zinc-400 font-semibold uppercase tracking-wide text-right truncate font-display">{f.name}</div>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative flex items-center">
              <div className="h-full bg-cyber-primary rounded-full transition-all duration-1000" style={{width: f.val}}></div>
            </div>
            <div className="w-8 text-[11px] text-zinc-500 font-mono text-right">{f.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EscalationCard = ({ id, time, badgeText, badgeColor, reason, offers, features, onViewDetails, onTakeOwnership }) => (
  <div className="premium-card p-6 mb-4 group hover:scale-[1.01]">
    <div className="accent-line !bg-cyber-alert/60"></div>
    <div className="flex justify-between items-start mb-4">
      <div className="text-value text-2xl text-white font-display uppercase tracking-wider">{id}</div>
      <div className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest font-mono">{time}</div>
    </div>
    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] mb-6 border font-display ${badgeColor}`}>
      {badgeText}
    </div>
    <div className="mb-6">
      <div className="text-label mb-2">Failure Reason</div>
      <div className="text-zinc-400 text-sm leading-relaxed font-sans">{reason}</div>
    </div>
    <div className="mb-8">
      <div className="text-label mb-3">Intervention Status</div>
      <div className="space-y-4">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-20 text-[11px] text-zinc-500 font-semibold uppercase tracking-wide truncate font-display">{f.name}</div>
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyber-primary rounded-full transition-all duration-700" style={{width: f.val}}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="flex gap-4 mt-2">
      <button 
        onClick={() => onViewDetails && onViewDetails(id)}
        className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-300 font-display text-[14px] uppercase tracking-widest hover:bg-white/5 hover:border-white/20 transition-all"
      >
        Analyze Details
      </button>
      <button 
        onClick={() => onTakeOwnership && onTakeOwnership(id)}
        className="flex-1 py-3 rounded-xl bg-cyber-primary text-cyber-black font-display text-[14px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(197,248,42,0.2)]"
      >
        Claim Case
      </button>
    </div>
  </div>
);

export const EscalationDetailsModal = ({ escalation, onClose, triggerAction, onClaim }) => {
  if (!escalation) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col rounded-2xl">
        <div className="accent-line !h-2 !w-full !bg-gradient-to-r from-cyber-primary via-cyber-alert to-cyber-primary"></div>
        
        <div className="p-8 border-b border-white/5 flex justify-between items-start bg-white/2">
           <div>
            <div className="text-label text-cyber-primary/80 mb-2">Detailed Intel Report</div>
            <h2 className="text-4xl text-value text-white font-display uppercase tracking-wider">{escalation.id}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border border-white/5 bg-white/2">
              <div className="text-label mb-4">Threat Vector</div>
              <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] border font-display ${escalation.badgeColor}`}>
                {escalation.badgeText}
              </div>
              <div className="mt-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-widest font-mono">Detected: {escalation.time}</div>
            </div>
            <div className="p-6 rounded-xl border border-white/5 bg-white/2">
              <div className="text-label mb-4">Risk Matrix</div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-cyber-alert animate-pulse shadow-[0_0_15px_#FF3E3E]"></div>
                <span className="text-white text-value text-2xl font-display uppercase tracking-widest">CRITICAL_ESC</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-label">Agent Reasoning Log</div>
            <div className="bg-black/40 rounded-xl border border-white/5 p-6 text-[15px] text-zinc-400 leading-relaxed relative overflow-hidden font-sans">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-value text-8xl pointer-events-none font-display">AI</div>
              {escalation.reason}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-label">Offer Sequence</div>
            <div className="text-cyber-primary bg-black/40 rounded-xl border border-white/5 p-5 font-mono text-[13px] leading-relaxed tracking-tight shadow-inner system-log">
               {escalation.offers}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">HISTORICAL_TIMELINE</div>
            <div className="space-y-4">
              {escalation.history && escalation.history.length > 0 ? (
                escalation.history.map((h, i) => (
                  <div key={i} className="bg-cyber-black/40 border border-cyber-border rounded-xl p-4 relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-primary/20 group-hover:bg-cyber-primary/60 transition-all"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-cyber-primary font-semibold text-[12px] uppercase font-display tracking-wider">{h.action}</span>
                      <span className="text-zinc-600 text-[10px] font-mono font-semibold uppercase">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-[12px] text-zinc-400 font-mono leading-tight mb-3">{h.reason}</div>
                    <div className="flex gap-4 text-[10px] font-mono font-semibold uppercase">
                      <span className="text-zinc-500">RISK_SIG: <span className="text-cyber-warning font-display text-[12px]">{h.churn_risk}</span></span>
                      <span className="text-zinc-500">OUTCOME: <span className="text-cyber-secondary font-display text-[12px]">{h.result}</span></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-zinc-600 text-[11px] font-mono font-bold uppercase p-6 bg-cyber-black/40 rounded-xl border border-cyber-border text-center">
                  NO_RECORDS_FOUND
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/5 border-t border-white/5 flex gap-4">
          <button 
            onClick={() => { onClaim ? onClaim(escalation.id) : triggerAction(`Escalation ${escalation.id} assigned to Retention Specialist`); if(!onClaim) onClose(); }}
            className="flex-1 py-4 rounded-xl bg-cyber-primary text-cyber-black font-display text-lg uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all"
          >
            Assign Specialist
          </button>
          <button 
            onClick={onClose}
            className="px-10 py-4 rounded-xl border border-white/10 text-zinc-400 font-display text-lg uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChainOfThoughtTerminal = ({ logs = '' }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={scrollRef}
      className="bg-cyber-black border border-cyber-border rounded-xl p-5 font-mono text-[12px] h-52 overflow-y-auto mb-6 relative custom-scrollbar border-l-2 border-l-cyber-primary shadow-inner"
    >
      <div className="sticky top-0 bg-cyber-black/80 backdrop-blur-sm pb-2 border-b border-cyber-border/20 mb-3">
        <div className="text-label text-cyber-primary/70">/ AGENT_REASONING_ENGINE / VERBOSE_MODE /</div>
      </div>
      <div className="text-zinc-600 mb-1 font-mono uppercase text-[10px] tracking-tight">$ SRE_AGENT_CORE --init --stream</div>
      <div className="text-zinc-600 mb-4 font-mono uppercase text-[10px] tracking-tight">$ CONNECTING_TO_ORCHESTRATOR... [OK]</div>
      <div className="text-cyber-primary whitespace-pre-wrap leading-relaxed opacity-90 system-log text-[13px]">
        {logs || 'Waiting for pipeline execution...'}
        <span className="inline-block w-2 h-3 bg-[#c5f82a] animate-pulse ml-1 align-middle"></span>
      </div>
    </div>
  );
};

export const AuditLogTable = ({ logs: auditLogs = [], searchTerm = '', onSearch = () => {} }) => {
  const defaultLogs = [
    { time: '2021-0-15 19:35:33', id: 'CUST-8924-Alpha', status: 'PASS', cid: '393', data: 'JetBrains Mono' },
    { time: '2021-0-15 18:35:33', id: 'CUST-2219-DELTA', status: 'WARN', cid: '422', data: 'JetBrains Mono' },
    { time: '2021-0-15 19:35:34', id: 'CUST-2219-DELTA', status: 'WARN', cid: '490', data: 'JetBrains Mono' },
    { time: '2021-0-15 18:35:33', id: 'CUST-2219-DELTA', status: 'PASS', cid: '493', data: 'JetBrains Mono' },
    { time: '2021-0-15 16:35:33', id: 'CUST-2219-DELTA', status: 'WARN', cid: '388', data: 'JetBrains Mono' },
    { time: '2021-0-15 16:35:33', id: 'CUST-2219-DELTA', status: 'FAIL', cid: '458', data: 'JetBrains Mono' },
  ];

  return (
    <div className="bg-cyber-surface border border-cyber-border rounded-xl p-5 flex-1 flex flex-col min-h-[400px] relative shadow-lg">
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyber-primary/30 pointer-events-none"></div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-label text-zinc-400 font-mono">/ GLOBAL_AUDIT_LOG / ACCESS_RECORDS</div>
        <div className="relative">
          <input 
            id="audit-log-search"
            type="text" 
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="FILTER_RECORDS..." 
            aria-label="Search audit logs"
            className="bg-cyber-black border border-cyber-border rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-400 focus:outline-none focus:border-cyber-primary transition-colors w-64 system-log font-bold" 
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
            <label htmlFor="audit-log-search" className="sr-only">Search audit logs</label>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-zinc-500 border-collapse">
          <thead className="text-zinc-500 uppercase tracking-widest font-display sticky top-0 bg-cyber-surface z-10 border-b border-cyber-border">
            <tr>
              <th className="pb-4 text-[12px]">TIMESTAMP</th>
              <th className="pb-4 text-[12px]">ENTITY_ID</th>
              <th className="pb-4 text-[12px]">VECTOR</th>
              <th className="pb-4 text-[12px]">OP_CODE</th>
              <th className="pb-4 text-[12px]">INTEL_DATA</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {(auditLogs.length > 0 ? auditLogs : defaultLogs).map((log, i) => (
              <tr key={i} className="border-t border-cyber-border hover:bg-cyber-black transition-colors group">
                <td className="py-3 text-zinc-400">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : log.time}</td>
                <td className="py-3 text-zinc-200 font-bold">{log.user_id || log.id}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-cyber-black text-[10px] uppercase tracking-wider ${
                    (log.risk_level === 'LOW' || log.status === 'PASS') ? 'bg-cyber-primary' : 
                    (log.risk_level === 'MEDIUM' || log.status === 'WARN') ? 'bg-cyber-warning' : 'bg-cyber-alert text-white'
                  }`}>
                    {log.risk_level || log.status}
                  </span>
                </td>
                <td className="py-3 text-zinc-400 group-hover:text-cyber-primary transition-colors">{log.action || log.cid}</td>
                <td className="py-3 text-zinc-500">{log.churn_risk ? (log.churn_risk * 100).toFixed(1) + '%' : log.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ActivityKPICard = ({ title, value, hasTrend = true }) => (
  <div className="bg-cyber-surface border border-cyber-border rounded-xl p-5 flex flex-col justify-between shadow-lg relative border-l-2 border-l-cyber-primary">
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/5"></div>
    <div className="text-label mb-2">{title}</div>
    <div className="flex items-end gap-2 mb-4">
      <div className="text-4xl text-cyber-primary font-display uppercase tracking-wider">{value}</div>
      {hasTrend && (
        <div className="text-cyber-primary flex items-center mb-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
        </div>
      )}
      {!hasTrend && <div className="w-2 h-2 bg-cyber-primary mb-3 shadow-[0_0_8px_rgba(197,248,42,0.6)]"></div>}
    </div>
    <div className="h-1.5 w-full bg-cyber-border rounded-full overflow-hidden">
      <div className="h-full bg-cyber-primary opacity-80" style={{width: '75%'}}></div>
    </div>
  </div>
);

const AGENT_CONFIG = {
  'XGBoostClassifier': { label: 'ML_MODEL', icon: <Shield size={10} />, color: 'text-cyber-primary border-cyber-primary/30 bg-cyber-primary/5' },
  'RiskAnalysisAgent': { label: 'RISK_ANALYSIS', icon: <Shield size={10} />, color: 'text-cyber-alert border-cyber-alert/30 bg-cyber-alert/5' },
  'DecisionAgent': { label: 'DECISION_ENGINE', icon: <Cpu size={10} />, color: 'text-cyber-secondary border-cyber-secondary/30 bg-cyber-secondary/5' },
  'StrategyPlanningAgent': { label: 'STRATEGY_PLANNER', icon: <Layers size={10} />, color: 'text-cyber-warning border-cyber-warning/30 bg-cyber-warning/5' },
  'SimulationAgent': { label: 'SIMULATION_TWIN', icon: <Activity size={10} />, color: 'text-cyber-warning border-cyber-warning/30 bg-cyber-warning/5' },
  'GovernanceEngine': { label: 'GOVERNANCE_GUARD', icon: <ShieldCheck size={10} />, color: 'text-cyber-secondary border-cyber-secondary/30 bg-cyber-secondary/5' },
  'ActionAgent': { label: 'EXECUTION_AGENT', icon: <Zap size={10} />, color: 'text-cyber-primary border-cyber-primary/30 bg-cyber-primary/5' },
  'OutcomeTracker': { label: 'OUTCOME_TRACKER', icon: <Activity size={10} />, color: 'text-zinc-400 border-zinc-400/30 bg-zinc-400/5' },
  'HumanSpecialist': { label: 'HUMAN_EXPERT', icon: <User size={10} />, color: 'text-cyber-primary border-cyber-primary/30 bg-cyber-primary/5' },
  'SystemAgent': { label: 'CORE_KERNEL', icon: <Info size={10} />, color: 'text-zinc-500 border-zinc-500/30 bg-zinc-500/5' }
};

export const LiveEventCard = (props) => {
  const { 
    id, agentId, type, reasoning, confidence, chainId, timestamp, status, score, metadata, onChainClick 
  } = props;

  const agent = AGENT_CONFIG[agentId] || AGENT_CONFIG['SystemAgent'];
  const statusColor = status === 'FAIL' ? 'border-cyber-alert/50' : status === 'WARN' ? 'border-cyber-warning/50' : 'border-cyber-primary/20';
  
  const displayTime = timestamp || '00:00:00';
  const displayId = id ? (id.toString().includes('.') ? `CUST-${id.toString().split('.')[0].slice(-4)}` : id.toString().slice(0, 10)) : 'SYS_KERNEL';

  return (
    <div 
      className={`bg-cyber-surface border ${statusColor} rounded-xl p-4 mb-3 flex flex-col gap-3 group hover:bg-cyber-black transition-all relative overflow-hidden animate-event-in shadow-lg cursor-pointer border-l-4 ${status === 'FAIL' ? 'border-l-cyber-alert' : 'border-l-cyber-primary'}`}
      onClick={() => onChainClick && onChainClick(chainId)}
    >
      {/* HUD Scanner Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-primary/5 to-transparent h-1/2 animate-scan"></div>
      </div>

      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-mono text-[10px] font-bold tracking-widest uppercase ${agent.color}`}>
            {agent.icon}
            {agent.label}
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">/ {type || 'OP'}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-600">
          <Clock size={10} />
          <span className="text-[10px] font-mono font-bold tracking-tight">{displayTime}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex justify-between items-start">
          <div className="text-[13px] text-zinc-200 font-medium leading-relaxed line-clamp-2 flex-1 system-log">
            {reasoning || props.message || props.desc}
          </div>
          {score && (
            <div className="ml-4 flex flex-col items-end p-2 bg-cyber-black border border-cyber-border">
              <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-[0.2em] mb-0.5">RISK_SIG</span>
              <span className="text-xs font-mono font-bold text-cyber-primary">{score}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6 mt-1 border-t border-cyber-border pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-600 uppercase font-bold font-mono">TARGET_ID:</span>
            <span className="text-[11px] text-zinc-300 font-mono font-bold tracking-tighter uppercase">{displayId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link2 size={10} className="text-zinc-600" />
            <span className="text-[9px] text-zinc-600 uppercase font-bold font-mono">CHAIN_LINK:</span>
            <span className="text-[11px] text-cyber-primary font-mono font-bold tracking-tighter">{chainId || 'RET-0000'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 relative z-10">
        <div className="flex gap-2">
          {metadata && Object.entries(metadata).slice(0, 2).map(([key, val]) => (
            <div key={key} className="bg-cyber-black px-1.5 py-0.5 rounded-full border border-cyber-border text-[8px] text-zinc-500 font-mono font-bold uppercase">
              {key.slice(0, 4)}: {val.toString().slice(0, 8)}
            </div>
          ))}
        </div>
        <div className="flex flex-col items-end min-w-[80px]">
          <div className="flex justify-between w-full mb-1">
            <span className="text-[8px] text-zinc-600 uppercase font-bold">CONFIDENCE</span>
            <span className={`text-[10px] font-mono font-bold ${parseFloat(confidence) > 80 ? 'text-cyber-primary' : 'text-cyber-warning'}`}>
              {confidence || '92.4%'}
            </span>
          </div>
          <div className="w-full h-1 bg-cyber-black rounded-full overflow-hidden">
            <div 
              className={`h-full ${parseFloat(confidence) > 80 ? 'bg-cyber-primary' : 'bg-cyber-warning'}`} 
              style={{ width: confidence || '92.4%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DecisionTimeline = ({ events, onClose }) => {
  if (!events || events.length === 0) return null;

  const chainId = events[0].chainId;
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime() || 0;
    const timeB = new Date(b.timestamp).getTime() || 0;
    return timeA - timeB;
  });

  // Calculate stats for the header
  const avgConfidence = (sortedEvents.reduce((acc, curr) => acc + parseFloat(curr.confidence || 0), 0) / sortedEvents.length).toFixed(1);
  const totalDuration = sortedEvents.reduce((acc, curr) => acc + parseFloat(curr.metadata?.duration || 0), 0).toFixed(2);
  const isComplete = sortedEvents.some(e => e.metadata?.node === 'END' || e.agentId === 'OutcomeTracker');

  return (
    <div className="flex flex-col gap-0 h-full overflow-hidden bg-[#070c08] relative border-0">
      {/* Dynamic Header with Trace Stats */}
      <div className="flex justify-between items-center p-6 border-b border-cyber-primary/20 bg-cyber-black/80 backdrop-blur-xl z-20">
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 ${isComplete ? 'bg-cyber-primary' : 'bg-cyber-warning animate-pulse'} shadow-[0_0_15px_currentColor] rounded-full`}></div>
            <h3 className="text-xl text-value text-white uppercase">
              WORKFLOW_TRACE <span className="text-cyber-primary">[{chainId}]</span>
            </h3>
          </div>
          <div className="flex gap-4 mt-2 pl-7">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyber-primary/5 border border-cyber-primary/20">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">AVG_CONFIDENCE</span>
              <span className="text-[11px] text-cyber-primary font-mono font-bold">{avgConfidence}%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyber-secondary/5 border border-cyber-secondary/20">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">TOTAL_LATENCY</span>
              <span className="text-[11px] text-cyber-secondary font-mono font-bold">{totalDuration}s</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 border border-cyber-border hover:border-cyber-primary hover:bg-cyber-primary hover:text-cyber-black transition-all text-zinc-600 flex items-center justify-center group"
          aria-label="Close trace"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-10 custom-scrollbar relative">
        {/* The Timeline Track - Animated Filling */}
        <div className="absolute left-[39px] top-0 bottom-0 w-px bg-cyber-border/20"></div>
        <div 
          className="absolute left-[39px] top-0 w-px bg-cyber-primary shadow-[0_0_10px_#c5f82a] transition-all duration-1000 ease-out"
          style={{ height: `${(sortedEvents.length / 7) * 100}%` }}
        ></div>
        
        <div className="flex flex-col gap-10 relative">
          {sortedEvents.map((event, idx) => {
            const agent = AGENT_CONFIG[event.agentId] || AGENT_CONFIG['SystemAgent'];
            const isFailed = event.status === 'FAIL';
            const isLatest = idx === sortedEvents.length - 1;
            
            return (
              <div 
                key={event.id} 
                className={`relative flex gap-10 group animate-in slide-in-from-left-4 duration-500`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Timeline Node Point */}
                <div className="relative z-10 shrink-0">
                  <div className={`w-8 h-8 flex items-center justify-center border-2 transition-all duration-500 ${
                    isFailed ? 'bg-cyber-alert/20 border-cyber-alert shadow-[0_0_15px_rgba(255,62,62,0.4)]' : 
                    isLatest ? 'bg-cyber-primary border-cyber-primary shadow-[0_0_20px_rgba(197,248,42,0.5)]' : 
                    'bg-cyber-black border-cyber-primary/40'
                  }`}>
                    {isFailed ? <AlertCircle size={14} className="text-cyber-alert" /> : 
                     isLatest ? <Zap size={14} className="text-cyber-black animate-pulse" /> : 
                     <CheckCircle size={14} className="text-cyber-primary/60" />}
                  </div>
                  {idx < sortedEvents.length - 1 && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[1px] h-10 bg-gradient-to-b from-cyber-primary/40 to-transparent"></div>
                  )}
                </div>

                {/* Event Card */}
                <div className={`flex-1 bg-cyber-surface border rounded-xl p-0 transition-all duration-300 hover:translate-x-1 ${
                  isFailed ? 'border-cyber-alert/40' : 'border-cyber-border group-hover:border-cyber-primary/40'
                } shadow-xl relative overflow-hidden`}>
                  
                  {/* Agent Header */}
                  <div className={`px-4 py-2 border-b flex justify-between items-center ${
                    isFailed ? 'bg-cyber-alert/5 border-cyber-alert/20' : 'bg-white/5 border-cyber-border'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 border ${agent.color}`}>
                        {agent.icon}
                      </div>
                      <span className="text-label !text-white !font-bold">
                        {agent.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-tighter">EXEC_TIME</span>
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">{event.timestamp}</span>
                      </div>
                      <div className={`h-6 w-px ${isFailed ? 'bg-cyber-alert/20' : 'bg-cyber-border'}`}></div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-tight">STATUS_VECTOR</span>
                        <span className={`text-[11px] font-bold font-mono ${isFailed ? 'text-cyber-alert' : 'text-cyber-primary'}`}>
                          {isFailed ? 'ERR_INTERRUPT' : 'SIGNAL_STABLE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reasoning Body */}
                  <div className="p-5">
                    <div className="text-[12px] text-zinc-200 font-bold leading-relaxed mb-6 font-mono uppercase tracking-tight relative">
                      <div className="absolute -left-5 top-0 bottom-0 w-1 bg-cyber-primary/20"></div>
                      {event.reasoning || event.message}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-cyber-border/40">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Confidence</span>
                        <div className="flex items-center gap-2">
                           <span className={`text-[11px] font-mono font-bold ${parseFloat(event.confidence) > 80 ? 'text-cyber-primary' : 'text-cyber-warning'}`}>
                            {event.confidence}
                          </span>
                          <div className="flex-1 h-1 bg-cyber-black max-w-[40px] rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${parseFloat(event.confidence) > 80 ? 'bg-cyber-primary' : 'bg-cyber-warning'}`} 
                              style={{ width: event.confidence }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Latency</span>
                        <span className="text-[11px] text-zinc-300 font-mono font-bold">
                          {event.metadata?.duration || '0.12s'}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Retries</span>
                        <span className="text-[11px] text-zinc-300 font-mono font-bold">
                          {event.metadata?.retries?.toString().padStart(2, '0') || '00'}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Workflow_ID</span>
                        <span className="text-[11px] text-cyber-primary/70 font-mono font-bold truncate tracking-tighter">
                          {chainId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Scanline */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-cyber-primary/0 via-cyber-primary/2 to-cyber-primary/0 h-[200%] animate-scan opacity-20"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="p-4 bg-cyber-black border-t border-cyber-border flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-700">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-cyber-primary rounded-full"></div>
            <span>NODE_INTEGRITY: VERIFIED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-cyber-primary rounded-full"></div>
            <span>ENCRYPTION: AES-256</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cyber-primary/30 font-mono">SENTIENT_RETENTION_ENGINE // AI_OBSERVABILITY_v4.2</span>
          <div className="w-2 h-2 bg-cyber-primary/20 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const WorkflowChainOverlay = ({ events, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Content Container */}
      <div className="relative w-full max-w-2xl bg-[#0a120d] border border-[#c5f82a]/30 shadow-[0_0_100px_rgba(197,248,42,0.15)] rounded-2xl overflow-hidden animate-scale-up">
        {/* Frame Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#c5f82a] z-50 rounded-tl-2xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#c5f82a] z-50 rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#c5f82a] z-50 rounded-bl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#c5f82a] z-50 rounded-br-2xl"></div>
        
        <DecisionTimeline events={events} onClose={onClose} />
      </div>
    </div>
  );
};
