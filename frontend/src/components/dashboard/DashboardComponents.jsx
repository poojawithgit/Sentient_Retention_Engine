import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const KPICard = ({ title, value, badge, badgeColor = "text-[#c5f82a] bg-[#c5f82a]/10 border-[#c5f82a]/30", sparklineData }) => (
  <div className="bg-[#0f1712]/80 backdrop-blur-md border border-[#1a281e] rounded-xl p-5 flex flex-col relative overflow-hidden group hover:border-[#2a4230] transition-colors">
    <div className="flex justify-between items-start mb-4 z-10">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{title}</div>
      {badge && (
        <div className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${badgeColor}`}>
          {badge}
        </div>
      )}
    </div>
    <div className="text-4xl font-bold text-[#c5f82a] z-10 mb-4">{value}</div>
    {/* Sparkline */}
    <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-80">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`grad-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c5f82a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c5f82a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={sparklineData.path} fill={`url(#grad-${title.replace(/\s/g, '')})`} />
        <path d={sparklineData.line} fill="none" stroke="#c5f82a" strokeWidth="1.5" className="drop-shadow-[0_0_3px_rgba(197,248,42,0.8)]" />
      </svg>
    </div>
  </div>
);

export const DonutChart = () => (
  <div className="bg-[#0f1712]/80 backdrop-blur-md border border-[#1a281e] rounded-xl p-5 flex flex-col h-full">
    <div className="text-sm font-semibold text-gray-200 mb-2">Driver Distribution</div>
    <div className="flex-1 flex flex-col items-center justify-center relative">
      <svg viewBox="0 0 100 100" className="w-36 h-36 drop-shadow-[0_0_15px_rgba(197,248,42,0.4)]">
        <circle cx="50" cy="50" r="35" fill="none" stroke="#1a281e" strokeWidth="10" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#c5f82a" strokeWidth="10" strokeDasharray="160 251" strokeDashoffset="-20" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
        <span className="text-white font-bold text-lg">48.2K</span>
        <span className="text-gray-500 text-[10px]">total</span>
      </div>
      <div className="flex gap-4 mt-4 text-[9px] text-gray-500 uppercase tracking-widest font-semibold">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#c5f82a]"></div> Price</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#8bc34a]"></div> Qual</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#4caf50]"></div> Cont</div>
      </div>
    </div>
  </div>
);

export const BarChart = () => (
  <div className="bg-[#0f1712]/80 backdrop-blur-md border border-[#1a281e] rounded-xl p-5 flex flex-col h-full">
    <div className="text-sm font-semibold text-gray-200 mb-4">Risk Interventions — 7 Days</div>
    <div className="flex-1 flex flex-col justify-end">
      <div className="flex items-end justify-center gap-6 h-32 mb-4">
        {[
          [60, 40], [80, 50], [40, 30], [90, 60], [100, 30]
        ].map((pair, i) => (
          <div key={i} className="flex items-end gap-1.5 h-full">
            <div className="w-3.5 bg-[#c5f82a] rounded-t-sm shadow-[0_0_8px_rgba(197,248,42,0.3)]" style={{height: `${pair[0]}%`}}></div>
            <div className="w-3.5 bg-[#4c6b35] rounded-t-sm" style={{height: `${pair[1]}%`}}></div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 text-[9px] text-gray-500 uppercase tracking-widest font-semibold">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#c5f82a]"></div> High Risk</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#4c6b35]"></div> Low Risk</div>
      </div>
    </div>
  </div>
);

export const Heatmap = () => {
  const colors = ['#1a281e', '#2a4230', '#4c6b35', '#8bc34a', '#c5f82a'];
  return (
    <div className="bg-[#0f1712]/80 backdrop-blur-md border border-[#1a281e] rounded-xl p-5 flex flex-col h-full">
      <div className="text-sm font-semibold text-gray-200 mb-4">Churn Score Heatmap</div>
      <div className="flex-1 grid grid-cols-6 gap-2 content-center">
        {Array.from({length: 24}).map((_, i) => {
          const colorIndex = i === 13 || i === 22 || i === 5 ? 4 : i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
          const color = colors[colorIndex];
          return (
            <div key={i} className="aspect-square rounded-sm transition-colors duration-500" 
                 style={{backgroundColor: color, boxShadow: color === '#c5f82a' ? '0 0 12px rgba(197,248,42,0.4)' : 'none'}}></div>
          );
        })}
      </div>
    </div>
  );
};

export const ModelCard = ({ name, latency, accuracy, accLabel = "Accuracy" }) => (
  <div className="bg-gradient-to-b from-[#16221a] to-[#0f1712] border border-[#1a281e] rounded-xl p-6 flex flex-col justify-between shadow-lg">
    <div className="flex justify-between items-center mb-6">
      <div className="text-gray-200 font-semibold text-lg">{name}</div>
      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Latency</div>
    </div>
    <div className="text-4xl font-bold text-[#c5f82a] mb-10 drop-shadow-[0_0_8px_rgba(197,248,42,0.3)]">
      {latency}
    </div>
    <div>
      <div className="flex justify-between text-[10px] text-gray-400 mb-3 uppercase tracking-widest font-semibold">
        <span>{accLabel}</span>
        <span className="text-[#c5f82a] font-bold">{accuracy}</span>
      </div>
      <div className="h-1.5 w-full bg-[#1a281e] rounded-full overflow-hidden">
        <div className="h-full bg-[#c5f82a] shadow-[0_0_8px_rgba(197,248,42,0.8)] rounded-full" style={{width: accuracy}}></div>
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
    <div className="bg-[#0f1712]/80 backdrop-blur-md border border-[#1a281e] rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <div className="text-gray-200 font-semibold text-lg">XGBoost (Local)</div>
        <div className="text-[9px] text-[#c5f82a] uppercase tracking-widest font-semibold">Shap Importance</div>
      </div>
      <div className="space-y-4">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-24 text-[11px] text-gray-400 font-mono text-right truncate">{f.name}</div>
            <div className="flex-1 h-2 bg-[#1a281e] rounded-full overflow-hidden relative flex items-center">
              <div className="h-full bg-[#c5f82a] rounded-full shadow-[0_0_8px_rgba(197,248,42,0.5)] transition-all duration-1000" style={{width: f.val}}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EscalationCard = ({ id, time, badgeText, badgeColor, reason, offers, features, onViewDetails, onTakeOwnership }) => (
  <div className="bg-[#0f1712]/80 backdrop-blur-md border border-[#1a281e] rounded-xl p-5 mb-4 shadow-lg group hover:border-[#2a4230] transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div className="text-gray-200 font-bold text-lg">{id}</div>
      <div className="text-gray-500 text-xs">{time}</div>
    </div>
    <div className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border ${badgeColor}`}>
      {badgeText}
    </div>
    <div className="mb-4">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Failure Reason</div>
      <div className="text-gray-400 text-xs leading-relaxed">{reason}</div>
    </div>
    <div className="mb-6">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Offers Attempted</div>
      <div className="text-gray-300 text-xs mb-3 whitespace-pre-line">{offers}</div>
      <div className="space-y-2.5">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-16 text-[10px] text-gray-400 font-mono truncate">{f.name}</div>
            <div className="flex-1 h-2 bg-[#1a281e] rounded-full overflow-hidden">
              <div className="h-full bg-[#c5f82a] rounded-full shadow-[0_0_5px_rgba(197,248,42,0.4)]" style={{width: f.val}}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="flex gap-3 mt-2">
      <button 
        onClick={() => onViewDetails && onViewDetails(id)}
        className="flex-1 py-2.5 rounded-full border border-[#c5f82a]/50 text-[#c5f82a] font-semibold text-xs hover:bg-[#c5f82a]/10 hover:border-[#c5f82a] transition-all"
      >
        View Details
      </button>
      <button 
        onClick={() => onTakeOwnership && onTakeOwnership(id)}
        className="flex-1 py-2.5 rounded-full bg-[#c5f82a] text-[#0a110b] font-bold text-xs shadow-[0_0_15px_rgba(197,248,42,0.2)] hover:shadow-[0_0_20px_rgba(197,248,42,0.4)] transition-shadow"
      >
        Take Ownership
      </button>
    </div>
  </div>
);

export const EscalationDetailsModal = ({ escalation, onClose, triggerAction }) => {
  if (!escalation) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-[#0f1712] border border-[#2a4230] rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col">
        <div className="p-8 border-b border-[#1a281e] flex justify-between items-start">
          <div>
            <div className="text-[10px] text-[#c5f82a] font-bold uppercase tracking-widest mb-1">Customer Escalation File</div>
            <h2 className="text-3xl font-bold text-white">{escalation.id}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Status Context</div>
              <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${escalation.badgeColor}`}>
                {escalation.badgeText}
              </div>
              <div className="mt-4 text-gray-400 text-sm">Detected {escalation.time}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Priority Level</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                <span className="text-white font-bold">URGENT</span>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Agent Reasoning & Failure Path</div>
            <div className="bg-[#050806] border border-[#1a281e] rounded-xl p-5 font-mono text-xs text-gray-300 leading-relaxed">
              {escalation.reason}
            </div>
          </div>

          <div className="mb-10">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Retention Offer History</div>
            <div className="text-gray-200 bg-[#16221a]/30 border border-[#1a281e] rounded-xl p-4">
               {escalation.offers}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Customer Journey History</div>
            <div className="space-y-3">
              {escalation.history && escalation.history.length > 0 ? (
                escalation.history.map((h, i) => (
                  <div key={i} className="bg-[#0a1a0f]/50 border border-[#1a281e] rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[#c5f82a] font-bold text-[10px] uppercase">{h.action}</span>
                      <span className="text-gray-500 text-[9px]">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-300">{h.reason}</div>
                    <div className="mt-2 flex gap-3 text-[9px]">
                      <span className="text-gray-500">Risk: <span className="text-orange-400 font-bold">{h.churn_risk}</span></span>
                      <span className="text-gray-500">Result: <span className="text-blue-400 font-bold">{h.result}</span></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-xs italic p-4 bg-[#050806] rounded-xl border border-[#1a281e] text-center">
                  No historical records found for this customer.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-8 bg-[#0a1a0f]/50 border-t border-[#1a281e] flex gap-4">
           <button 
             onClick={() => { triggerAction(`Escalation ${escalation.id} assigned to Retention Specialist`); onClose(); }}
             className="flex-1 py-4 rounded-xl bg-[#c5f82a] text-[#0a110b] font-bold text-sm shadow-[0_0_20px_rgba(197,248,42,0.2)] hover:shadow-[0_0_30px_rgba(197,248,42,0.4)] transition-all active:scale-95"
           >
             Assign to Specialist
           </button>
           <button 
             onClick={onClose}
             className="px-8 py-4 rounded-xl border border-[#2a4230] text-gray-400 font-bold text-sm hover:bg-white/5 transition-colors"
           >
             Close
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
      className="bg-[#040805] border border-[#1a281e] rounded-xl p-5 font-mono text-xs shadow-inner h-48 overflow-y-auto mb-6 relative custom-scrollbar"
    >
      <div className="text-[#8bc34a] mb-1">$ SRE_AGENT_CORE --verbose</div>
      <div className="text-[#8bc34a] mb-2">$ STREAMING_REASONING_LOGS...</div>
      <div className="text-[#c5f82a] whitespace-pre-wrap leading-relaxed">
        {logs || 'Waiting for pipeline execution...'}
        <span className="inline-block w-2 h-3 bg-[#c5f82a] animate-pulse ml-1 align-middle"></span>
      </div>
    </div>
  );
};

export const AuditLogTable = ({ logs: auditLogs = [] }) => {
  const defaultLogs = [
    { time: '2021-0-15 19:35:33', id: 'CUST-8924-Alpha', status: 'PASS', cid: '393', data: 'JetBrains Mono' },
    { time: '2021-0-15 18:35:33', id: 'CUST-2219-DELTA', status: 'WARN', cid: '422', data: 'JetBrains Mono' },
    { time: '2021-0-15 19:35:34', id: 'CUST-2219-DELTA', status: 'WARN', cid: '490', data: 'JetBrains Mono' },
    { time: '2021-0-15 18:35:33', id: 'CUST-2219-DELTA', status: 'PASS', cid: '493', data: 'JetBrains Mono' },
    { time: '2021-0-15 16:35:33', id: 'CUST-2219-DELTA', status: 'WARN', cid: '388', data: 'JetBrains Mono' },
    { time: '2021-0-15 16:35:33', id: 'CUST-2219-DELTA', status: 'FAIL', cid: '458', data: 'JetBrains Mono' },
  ];

  return (
    <div className="bg-[#0f1712]/80 backdrop-blur-md border border-[#1a281e] rounded-xl p-5 flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold text-gray-200">AUDIT LOG</div>
        <div className="relative">
          <input type="text" placeholder="Search" className="bg-[#040805] border border-[#2a4230] rounded-full pl-8 pr-4 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#c5f82a] transition-colors w-48" />
          <div className="absolute left-3 top-2 text-gray-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-[10px] text-gray-400">
          <thead className="text-gray-500 uppercase tracking-widest font-semibold sticky top-0 bg-[#0f1712] z-10">
            <tr>
              <th className="pb-3 font-medium">TIMESTAMP</th>
              <th className="pb-3 font-medium">CUSTOMER ID</th>
              <th className="pb-3 font-medium">STATUS</th>
              <th className="pb-3 font-medium">CUSTOMER ID</th>
              <th className="pb-3 font-medium">DATA</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {(auditLogs.length > 0 ? auditLogs : defaultLogs).map((log, i) => (
              <tr key={i} className="border-t border-[#1a281e] hover:bg-[#16221a] transition-colors">
                <td className="py-3">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : log.time}</td>
                <td className="py-3">{log.user_id || log.id}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[#0a110b] text-[9px] uppercase tracking-wider ${
                    (log.risk_level === 'LOW' || log.status === 'PASS') ? 'bg-[#c5f82a]' : 
                    (log.risk_level === 'MEDIUM' || log.status === 'WARN') ? 'bg-orange-400' : 'bg-red-500 text-white'
                  }`}>
                    {log.risk_level || log.status}
                  </span>
                </td>
                <td className="py-3">{log.action || log.cid}</td>
                <td className="py-3">{log.churn_risk ? (log.churn_risk * 100).toFixed(1) + '%' : log.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ActivityKPICard = ({ title, value, hasTrend = true }) => (
  <div className="bg-[#0f1712]/80 backdrop-blur-md border border-[#1a281e] rounded-xl p-5 flex flex-col justify-between shadow-lg">
    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">{title}</div>
    <div className="flex items-end gap-2 mb-4">
      <div className="text-3xl font-bold text-[#c5f82a]">{value}</div>
      {hasTrend && (
        <div className="text-[#c5f82a] flex items-center mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
        </div>
      )}
      {!hasTrend && <div className="w-2 h-2 rounded-full bg-[#c5f82a] mb-2 shadow-[0_0_8px_#c5f82a]"></div>}
    </div>
    <div className="h-2 w-full bg-[#1a281e] rounded-full overflow-hidden">
      <div className="h-full bg-[#c5f82a] shadow-[0_0_8px_rgba(197,248,42,0.8)] rounded-full" style={{width: '75%'}}></div>
    </div>
  </div>
);

export const LiveEventCard = (props) => {
  const { 
    id, tag, tagColor = 'bg-[#c5f82a]', subTag, desc, score, status,
    type, message, timestamp // From real-time stream
  } = props;

  const displayTag = type || tag || 'EVENT';
  const displayDesc = message || desc || 'No description provided';
  const displayTime = timestamp || 'LIVE';
  const displayStatus = status || 'PASS';
  
  const statusColor = displayStatus === 'PASS' ? 'bg-[#c5f82a]' : displayStatus === 'WARN' ? 'bg-orange-400' : 'bg-red-500';

  return (
    <div className="bg-[#0f1712]/80 backdrop-blur-md border border-[#1a281e] rounded-xl p-4 flex justify-between items-center group hover:border-[#2a4230] transition-colors relative overflow-hidden shrink-0">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor} shadow-[0_0_10px_rgba(197,248,42,0.3)]`}></div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-[#0a110b] ${statusColor}`}>
            {displayTag}
          </span>
          <span className="text-[10px] text-gray-500 font-mono truncate">{id?.toString().slice(0, 12)}</span>
        </div>
        <div className="text-xs text-gray-300 font-medium truncate">{displayDesc}</div>
      </div>
      <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
        <div className="text-[10px] font-bold text-gray-400">{displayTime}</div>
        {score && <div className="text-[10px] font-mono text-[#c5f82a]">{score}</div>}
      </div>
    </div>
  );
};
