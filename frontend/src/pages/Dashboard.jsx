import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import SpecialistDashboard from './SpecialistDashboard';
import { FixedSizeList } from 'react-window';
import { debounce } from 'lodash';
import {
  Globe, Activity, Share2, BarChart2, AlertOctagon,
  Bell, Settings, X, ArrowRight, Box, Menu, Wifi, User,
  Maximize2, Minimize2, Search
} from 'lucide-react';

// --- Analytics View Components ---

const KPICard = ({ title, value, badge, badgeColor = "text-[#c5f82a] bg-[#c5f82a]/10 border-[#c5f82a]/30", sparklineData }) => (
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

const DonutChart = () => (
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

const BarChart = () => (
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

const Heatmap = () => {
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

const ModelCard = ({ name, latency, accuracy, accLabel = "Accuracy" }) => (
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

const FeatureImportance = () => {
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

// --- Escalations View Components ---

const EscalationCard = ({ id, time, badgeText, badgeColor, reason, offers, features, onViewDetails, onTakeOwnership }) => (
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

const EscalationDetailsModal = ({ escalation, onClose, triggerAction }) => {
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

const ChainOfThoughtTerminal = ({ logs = '' }) => {
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

const AuditLogTable = ({ logs: auditLogs = [] }) => {
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

// --- Activity View Components ---

const ActivityKPICard = ({ title, value, hasTrend = true }) => (
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

const LiveEventCard = (props) => {
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

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const containerRef = useRef();
  const graphRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const activityContainerRef = useRef();
  const [activityDimensions, setActivityDimensions] = useState({ width: 0, height: 0 });

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [activeTab, setActiveTab] = useState('Activity');
  const [isFullView, setIsFullView] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [kpis, setKpis] = useState({
    interventions_today: 0,
    total_processed: 0,
    churn_prevented: '0%',
    active_users: 0,
    distribution: []
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [ws, setWs] = useState(null);
  const [pipelineGraphData, setPipelineGraphData] = useState({
    nodes: [
      { id: 'ingest', name: 'Data Ingestion', type: 'INPUT', val: 5 },
      { id: 'ml', name: 'Churn Model', type: 'ML', val: 8 },
      { id: 'reason', name: 'LangGraph Agent', type: 'AGENT', val: 10 },
      { id: 'action', name: 'Action Engine', type: 'OUTPUT', val: 6 }
    ],
    links: [
      { source: 'ingest', target: 'ml' },
      { source: 'ml', target: 'reason' },
      { source: 'reason', target: 'action' }
    ]
  });

  // Debounced function to update live events
  const debouncedUpdateEvents = useCallback(
    debounce((newEvent) => {
      setLiveEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 100), // 100ms debounce
    []
  );
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [claimedEscalations, setClaimedEscalations] = useState([]);
  const [activeSpecialistCase, setActiveSpecialistCase] = useState(null);
  const [terminalText, setTerminalText] = useState('');
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Manual Customer Search Handler
  const handleManualSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    try {
      // Try to fetch memory for this user to get historical context
      const res = await fetch(`http://127.0.0.1:8000/api/v1/memory/${searchId}`);
      const data = await res.json();
      
      if (data.count > 0 || data.memory?.length > 0) {
        const lastMemory = data.memory[0];
        const mockEscalation = {
          id: `MNL-${searchId.toUpperCase()}`,
          userId: searchId,
          churnRisk: lastMemory.churn_risk || 0.5,
          time: 'Historical Record',
          badgeText: 'MANUAL LOOKUP',
          badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          reason: lastMemory.reason || 'Manual lookup of customer retention history and risk profile.',
          offers: lastMemory.action || 'No recent automated offers',
          features: [
            { name: 'CHURN RISK', val: `${((lastMemory.churn_risk || 0.5) * 100).toFixed(0)}%` },
            { name: 'TENURE', val: '24mo' }
          ],
          history: data.memory || []
        };
        setSelectedEscalation(mockEscalation);
        triggerAction(`Customer ${searchId} record retrieved`);
      } else {
        // Fallback: If no memory, just show a blank profile or notify
        triggerAction(`No historical data found for ID: ${searchId}`);
        
        // Optionally create a "blank" search result if they want to view anyway
        const blankEscalation = {
          id: `MNL-${searchId.toUpperCase()}`,
          userId: searchId,
          churnRisk: 0.1,
          time: 'New Query',
          badgeText: 'NO RISK HISTORY',
          badgeColor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          reason: 'This customer has no recorded agentic interactions or churn predictions in the audit trail.',
          offers: 'N/A',
          features: [
            { name: 'RISK', val: '0%' }
          ],
          history: []
        };
        setSelectedEscalation(blankEscalation);
      }
    } catch (err) {
      console.error('Search error:', err);
      triggerAction('Search service unavailable');
    } finally {
      setIsSearching(false);
    }
  };

  // WebSocket Integration with reconnection
  useEffect(() => {
    let socket;
    let reconnectTimeout;
    const maxReconnectAttempts = 10;
    let reconnectAttempts = 0;

    const connect = () => {
      socket = new WebSocket('ws://127.0.0.1:8000/api/v1/ws');

      socket.onopen = () => {
        console.log('Connected to Dashboard Stream');
        setWs(socket);
        reconnectAttempts = 0; // Reset on successful connection
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'CHURN_PREDICTION') {
          const newEvent = {
            id: Date.now(),
            type: 'PREDICTION',
            message: `High risk detected for user ${data.payload.user_id.slice(0, 8)}...`,
            timestamp: new Date().toLocaleTimeString(),
            status: data.payload.risk_level === 'HIGH' ? 'FAIL' : 'PASS'
          };
          debouncedUpdateEvents(newEvent);
          setActiveNodeId('ml');
          setTimeout(() => setActiveNodeId('reason'), 500);
        }

        if (data.type === 'AGENT_DECISION') {
          const newEvent = {
            id: Date.now(),
            type: 'DECISION',
            message: `Agent executed ${data.payload.action} for ${data.payload.user_id.slice(0, 8)}`,
            timestamp: new Date().toLocaleTimeString(),
            status: 'PASS'
          };
          debouncedUpdateEvents(newEvent);
          setActiveNodeId('action');
          setTimeout(() => setActiveNodeId(null), 1000);
        }
      };

      socket.onclose = () => {
        console.log('Disconnected from Dashboard Stream');
        setWs(null);

        // Attempt reconnection if under max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++;
            console.log(`Attempting reconnection ${reconnectAttempts}/${maxReconnectAttempts}`);
            connect();
          }, delay);
        } else {
          console.log('Max reconnection attempts reached');
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Fetch Initial/Global Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const kpiRes = await fetch('http://127.0.0.1:8000/api/v1/kpis');
        const kpiData = await kpiRes.json();
        setKpis(kpiData);

        const logsRes = await fetch('http://127.0.0.1:8000/api/v1/audit-logs?limit=10');
        const logsData = await logsRes.json();
        setAuditLogs(logsData.logs || []);
      } catch (err) {
        console.error('Failed to fetch live dashboard data:', err);
      }
    };

    // Load previously claimed escalations (persisted across refreshes)
    const fetchClaimed = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/escalations/claimed?specialist_id=specialist_001');
        const data = await res.json();
        setClaimedEscalations(data.claimed || []);
      } catch (err) {
        console.warn('Could not load claimed escalations:', err);
      }
    };

    fetchData();
    fetchClaimed();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerAction = (name) => {
    setNotification(name);
    setTimeout(() => setNotification(null), 3000);
  };

  const runPipeline = async () => {
    if (isPipelineRunning) return;
    
    setIsPipelineRunning(true);
    triggerAction('Initializing Agentic Pipeline...');
    
    try {
      // Pick a random user from existing samples
      const users = ['user_001', 'user_002', 'user_003', 'user_004', 'user_005'];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const wsAi = new WebSocket(`ws://127.0.0.1:8002/ws/agent/${randomUser}`);
      
      wsAi.onopen = () => {
        console.log('Connected to Agentic AI Stream');
        wsAi.send(JSON.stringify({ 
          action: 'start_pipeline', 
          usage_score: 15, 
          complaints_count: 2, 
          payment_delay_count: 1,
          context_notes: "Live session trigger"
        }));
      };

      wsAi.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("AI Agent Event:", data);
        
        if (data.type === 'status' && data.node === 'START') {
           triggerAction('Pipeline Started');
           setActiveNodeId('input');
        } else if (data.type === 'node_update') {
           setActiveNodeId(data.node);
           
           // Live Reasoning update
           if (data.data?.reasoning) {
              setTerminalText(prev => prev + `\n[${data.node}] ${data.data.reasoning}`);
           }

           const newEvent = {
              id: Date.now() + Math.random(),
              type: 'AGENT_NODE',
              message: `[${data.node}] ${data.data?.reasoning || 'Executed'}`,
              timestamp: new Date().toLocaleTimeString(),
              status: 'PASS'
           };
           setLiveEvents(prev => [newEvent, ...prev].slice(0, 50));

           // Detect Escalation
           if (data.node === 'human_handoff') {
              const newEscalation = {
                 id: `CUST-${(Math.random() * 10000).toFixed(0)}-${Math.random().toString(36).substring(7).toUpperCase()}`,
                 userId: randomUser,
                 churnRisk: 0.85,
                 time: 'Just now',
                 badgeText: 'HUMAN HANDOFF REQUIRED',
                 badgeColor: 'bg-red-500/20 text-red-500 border-red-500/30',
                 reason: data.data?.reasoning || 'Manual intervention required due to business rule violation.',
                 offers: data.data?.offer || 'N/A',
                 features: [
                   { name: 'RISK', val: '85%' },
                   { name: 'STRATEGY', val: data.data?.strategy || 'N/A' }
                 ]
              };
              setEscalations(prev => [newEscalation, ...prev]);
           }
        } else if (data.type === 'status' && data.node === 'END') {
           triggerAction('Pipeline Completed');
           setTimeout(() => setActiveNodeId(null), 1000);
           setIsPipelineRunning(false);
           wsAi.close();
        } else if (data.type === 'error') {
           triggerAction(`Pipeline Error: ${data.message}`);
           setIsPipelineRunning(false);
           wsAi.close();
        }
      };

      wsAi.onerror = (error) => {
        console.error('Agentic AI WS error:', error);
        triggerAction('Agentic AI Connection Error');
        setIsPipelineRunning(false);
      };
      
    } catch (err) {
      console.error('Pipeline error:', err);
      triggerAction('Pipeline Error: Check Backend');
      setIsPipelineRunning(false);
    } 
  };

  const nodeConfigs = [
    'input',
    'intent_summary',
    'classifier',
    'rag',
    'digital_twin_sim',
    'retention_offer_tool',
    'impact_eval_high',
    'memory_high',
    'nurture_sim',
    'engagement_api',
    'impact_eval_low',
    'memory_low',
    'strategist',
    'business_rules',
    'output_formatter',
    'human_handoff',
    'evaluator',
    'retry_fallback',
    'override_code',
    'audit_log',
    'final_output',
    'feedback_capture',
  ];


  // Resize observer for main graph container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [activeTab, isFullView]);

  // Automate Full View for Pipeline tab
  useEffect(() => {
    if (activeTab === 'Pipeline') {
      setIsFullView(true);
    } else {
      setIsFullView(false);
    }
  }, [activeTab]);

  // Resize observer for Activity graph container
  useEffect(() => {
    if (!activityContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setActivityDimensions({ width, height });
      }
    });
    observer.observe(activityContainerRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  // Memoized node canvas object for Activity graph
  const activityNodeCanvasObject = useMemo(() => (node, ctx, globalScale) => {
    const size = node.val * 3;
    const isActive = node.id === activeNodeId;

    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);

    if (isActive) {
      ctx.fillStyle = '#c5f82a';
      ctx.shadowColor = '#c5f82a';
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = '#2a4230';
      ctx.shadowBlur = 0;
    }

    ctx.fill();

    if (isActive) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Draw tiny label for context
    const safeScale = Math.max(globalScale, 0.1);
    const fontSize = 8 / safeScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = isActive ? '#ffffff' : '#4c6b35';
    ctx.fillText(node.name, node.x, node.y + size + fontSize + 2);
  }, [activeNodeId]);

  // Memoized node canvas object for Pipeline graph
  const pipelineNodeCanvasObject = useMemo(() => (node, ctx, globalScale) => {
    const label = node.name;
    const isHovered = node === hoverNode;
    const isSelected = node.id === selectedNode?.id;
    const isActive = node.id === activeNodeId;
    const size = (node.val || 5) * 4;

    // Active node glow
    if (isActive) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI, false);
      const gradient = ctx.createRadialGradient(node.x, node.y, size * 0.5, node.x, node.y, size * 1.5);
      gradient.addColorStop(0, 'rgba(197, 248, 42, 0.4)');
      gradient.addColorStop(1, 'rgba(197, 248, 42, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);

    if (isActive) {
      ctx.fillStyle = '#c5f82a';
      ctx.shadowColor = '#c5f82a';
      ctx.shadowBlur = 25;
    } else if (isSelected) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = '#1a2d21';
      ctx.shadowBlur = 0;
    }

    ctx.fill();

    // Border
    const safeScale = Math.max(globalScale, 0.1);
    ctx.strokeStyle = isActive ? '#ffffff' : (isSelected || isHovered ? '#c5f82a' : '#2a4230');
    ctx.lineWidth = (isActive || isSelected) ? 3 / safeScale : 1.5 / safeScale;
    ctx.stroke();

    // Labels
    const fontSize = (isActive ? 14 : 11) / safeScale;
    ctx.font = `${isActive ? 'bold' : 'normal'} ${fontSize}px Inter, Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isActive ? '#000000' : (isSelected || isHovered ? '#c5f82a' : '#4c6b35');
    ctx.fillText(label, node.x, node.y);
  }, [hoverNode, selectedNode, activeNodeId]);

  // Load graph data
  useEffect(() => {
    fetch('/graph.json')
      .then(res => res.json())
      .then(data => {
        if (data.nodes && data.links) {
          setGraphData(data);
          setSelectedNode(data.nodes[0]);
        }
      })
      .catch(err => console.error("Error loading graph data:", err));

    fetch('/pipeline_graph.json')
      .then(res => res.json())
      .then(data => {
        if (data.nodes && data.links) {
          setPipelineGraphData(data);
        }
      })
      .catch(err => console.error("Error loading pipeline graph data:", err));
  }, []);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const navItems = [
    { name: 'Activity', icon: Activity, id: 'Activity' },
    { name: 'Pipeline', icon: Share2, id: 'Pipeline' },
    { name: 'Analytics', icon: BarChart2, id: 'Analytics' },
    { name: 'Escalations', icon: AlertOctagon, id: 'Escalations' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#050806] text-[#e1e8e2] font-sans selection:bg-[#c5f82a]/30 relative overflow-hidden">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none" 
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2000')"}}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a0f]/80 to-[#040a06]/95 pointer-events-none" />
      
      <div className={`flex w-full h-full relative z-10 transition-all duration-500 ${isFullView ? 'p-0' : 'p-4 md:p-6 lg:p-8'}`}>
        
        {/* Left Sidebar */}
        {(true) && (
          <div className="w-24 flex flex-col items-center pt-2 shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="text-[#c5f82a] font-bold text-xl tracking-widest mb-8">SRE</div>
            
            <div className="w-12 h-12 bg-[#122216] border border-[#2a4230] rounded-2xl flex items-center justify-center text-[#c5f82a] mb-8 shadow-lg cursor-pointer hover:bg-[#1a2f20] transition-colors">
              <Globe size={22} />
            </div>

            <div className="flex flex-col gap-6 items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1.5 transition-all group ${isActive ? 'text-[#c5f82a]' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-[#c5f82a] text-[#0a110b] shadow-[0_0_15px_rgba(197,248,42,0.4)]' : 'bg-[#0a1a0f] border border-[#1a2d21] group-hover:border-[#2a4230]'}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-widest">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${isFullView ? 'pl-0' : 'pl-2'}`}>
          
          {/* Dynamic Content Based on Tab */}
          {activeTab === 'Activity' && (
            <div className="flex flex-col h-full bg-[#070c08]/80 backdrop-blur-2xl rounded-3xl border border-[#1a281e] p-6 shadow-2xl relative overflow-hidden">
              
              {/* Top Row: KPIs */}
              <div className="grid grid-cols-4 gap-6 shrink-0 mb-6">
                <ActivityKPICard title="INTERVENTIONS TODAY" value={kpis.interventions_today.toLocaleString()} />
                <ActivityKPICard title="CHURN PREVENTED" value={kpis.churn_prevented} />
                <ActivityKPICard title="TOTAL PROCESSED" value={kpis.total_processed.toLocaleString()} />
                <ActivityKPICard title="ACTIVE CUSTOMERS" value={kpis.active_users.toLocaleString()} hasTrend={false} />
              </div>

              {/* Main Two-Column Layout */}
              <div className="flex gap-6 flex-1 min-h-0">
                
                {/* Left Column: Live Customer Events */}
                <div className="w-7/12 flex flex-col h-full bg-[#0f1712]/50 backdrop-blur-md rounded-2xl border border-[#1a281e] p-5 relative">
                  <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                      <h2 className="text-xl font-bold text-gray-200">Live Customer Events</h2>
                      <div className="flex items-center gap-2 text-[#c5f82a] text-[10px] uppercase font-bold tracking-wider mt-1">
                        <ArrowRight size={12} className="-rotate-90" /> updating in real-time
                      </div>
                    </div>
                    <button 
                      onClick={runPipeline}
                      disabled={isPipelineRunning}
                      className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                        isPipelineRunning 
                          ? 'bg-[#1a281e] text-gray-500 cursor-not-allowed' 
                          : 'bg-[#c5f82a] text-[#0a110b] hover:shadow-[0_0_15px_rgba(197,248,42,0.3)] active:scale-95'
                      }`}
                    >
                      {isPipelineRunning ? 'Running...' : 'Run Agentic Pipeline'}
                    </button>
                    <button 
                      onClick={() => setIsPaused(!isPaused)}
                      className={`border border-[#233529] px-4 py-1.5 rounded-lg text-xs transition-colors ${
                        isPaused ? 'bg-[#c5f82a] text-[#0a110b]' : 'bg-[#121c16] text-gray-300 hover:text-white hover:border-[#32503a]'
                      }`}
                    >
                      {isPaused ? 'Resume Feed' : 'Pause Feed'}
                    </button>
                  </div>
                  
                    <div className="flex-1 min-h-0">
                      {liveEvents.length > 0 ? (
                        <FixedSizeList
                          height={400} // Adjust height
                          itemCount={liveEvents.length}
                          itemSize={80} // Approximate height of each event card
                          itemData={liveEvents}
                        >
                          {({ index, style, data }) => (
                            <div style={style}>
                              <LiveEventCard {...data[index]} />
                            </div>
                          )}
                        </FixedSizeList>
                      ) : (
                        <div className="text-center text-gray-500 py-8">No live events</div>
                      )}
                    </div>
                </div>

                {/* Right Column: Pipeline Live View */}
                <div className="w-5/12 flex flex-col h-full bg-[#0f1712]/50 backdrop-blur-md rounded-2xl border border-[#1a281e] p-5">
                  <h2 className="text-xl font-bold text-gray-200 mb-6 shrink-0">Pipeline Live View</h2>
                  <div className="flex-1 relative rounded-xl overflow-hidden bg-[#070c08] border border-[#1a281e] shadow-inner flex items-center justify-center">
                    {/* Graph Container */}
                    <div className="absolute inset-0" ref={activityContainerRef}>
                      {pipelineGraphData.nodes.length > 0 && activityDimensions.width > 0 ? (
                        <ForceGraph2D
                          width={activityDimensions.width}
                          height={activityDimensions.height}
                          graphData={pipelineGraphData}
                          nodeRelSize={5}
                          backgroundColor="rgba(0,0,0,0)"
                          linkColor={() => '#1f3826'}
                          linkOpacity={0.6}
                          linkWidth={1}
                          nodeCanvasObject={activityNodeCanvasObject}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30">
                          <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#c5f82a] animate-spin-slow mb-4" />
                          <span className="text-xs uppercase tracking-widest font-medium">Initializing Neural Path...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Pipeline' && (
            <div className={`flex flex-col flex-1 h-full min-h-0 relative`}>
              {/* Top Header - Pipeline */}
              {!isFullView && (
                <div className="flex justify-end items-center mb-4 gap-4 pr-2 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="text-[#c5f82a] font-mono text-xs opacity-90 tracking-widest uppercase">
                    {new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </div>
                  
                  <div className="bg-[#c5f82a] text-[#0a110b] px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-[0_0_10px_rgba(197,248,42,0.2)]">
                    <div className="w-1.5 h-1.5 bg-[#0a110b] rounded-full animate-pulse"></div>
                    SYSTEM OPTIMAL
                  </div>
                  
                  <button className="w-8 h-8 rounded-full bg-[#122216] border border-[#2a4230] flex items-center justify-center text-[#c5f82a] hover:bg-[#1a2f20] transition-colors">
                    <Bell size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-[#122216] border border-[#2a4230] flex items-center justify-center text-[#c5f82a] hover:bg-[#1a2f20] transition-colors">
                    <Settings size={14} />
                  </button>
                  
                  <div className="w-8 h-8 rounded-full border-2 border-[#2a4230] overflow-hidden cursor-pointer">
                    <img src="https://i.pravatar.cc/100?img=11" className="w-full h-full object-cover" alt="user" />
                  </div>
                </div>
              )}

              {/* Central Panel - The Graph Window */}
              <div className={`flex-1 transition-all duration-700 ease-in-out relative overflow-hidden flex shadow-2xl ${isFullView ? 'bg-black h-full w-full' : 'bg-[#09110c]/80 backdrop-blur-xl rounded-[2rem] border border-[#1a2d21]'}`}>
                
                {/* Floating HUD */}
                <div className="absolute top-8 left-8 z-50 flex gap-3">
                  <div className="px-4 py-2 rounded-xl bg-[#c5f82a] text-[#0a110b] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(197,248,42,0.4)] animate-in zoom-in-50 duration-300">
                    <div className="w-2 h-2 bg-[#0a110b] rounded-full animate-pulse"></div>
                    Live Pipeline Environment
                  </div>
                </div>

                {/* Graph Container */}
                <div className="flex-1 relative h-full w-full" ref={containerRef}>
                  {pipelineGraphData.nodes.length > 0 && dimensions.width > 0 ? (
                    <ForceGraph2D
                      ref={graphRef}
                      graphData={pipelineGraphData}
                      width={dimensions.width}
                      height={dimensions.height}
                      nodeRelSize={8}
                      backgroundColor="rgba(0,0,0,0)"
                      linkColor={() => '#1f3826'}
                      linkOpacity={0.6}
                      linkWidth={2}
                      linkDirectionalParticles={4}
                      linkDirectionalParticleSpeed={0.005}
                      onNodeHover={setHoverNode}
                      onNodeClick={handleNodeClick}
                       nodeCanvasObject={pipelineNodeCanvasObject}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#2a4230]">
                      <Share2 className="animate-pulse" size={48} />
                    </div>
                  )}
                  
                  {/* Inner Shadow / Vignette */}
                  {!isFullView && <div className="absolute inset-0 pointer-events-none rounded-[2rem] shadow-[inset_0_0_100px_rgba(4,10,6,0.9)]" />}
                </div>
                
                {/* Node Details Overlay */}
                {selectedNode && (
                  <div className="absolute top-6 right-6 w-80 bg-[#121c16]/95 backdrop-blur-2xl border border-[#233529] rounded-2xl flex flex-col text-gray-300 shadow-2xl overflow-hidden z-10 animate-in slide-in-from-right-8 duration-300">
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-white">Node Details</h2>
                        <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#233529] text-gray-300 text-xs px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                          {selectedNode.type || 'NODE'}
                        </span>
                        <h3 className="text-xl font-bold text-white truncate" title={selectedNode.name}>
                          {selectedNode.name}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-400 mb-5 flex items-center gap-2">
                        Community: <span className="text-gray-200">{selectedNode.community || 'N/A'}</span>
                      </div>
                      
                      <div className="flex gap-3 mb-8">
                        <span className="border border-[#233529] bg-[#17241c] px-3 py-1.5 rounded-lg text-xs font-mono">
                          Latency: 1.2s
                        </span>
                        <span className="border border-[#233529] bg-[#17241c] px-3 py-1.5 rounded-lg text-xs font-mono">
                          Cost: $0.0k/req
                        </span>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-semibold">Inputs / Outputs Schema</div>
                        <div className="space-y-2">
                          <div className="bg-[#17261c] border border-[#233829] rounded-xl p-3 flex justify-between items-center group hover:border-[#32503a] transition-colors cursor-default">
                            <div>
                              <div className="text-[#c5f82a] font-mono text-xs mb-1">payload.risk_score</div>
                              <div className="text-gray-500 text-[10px]">Float (0.0 - 10)</div>
                            </div>
                            <ArrowRight size={14} className="text-gray-600 group-hover:text-[#c5f82a] transition-colors" />
                          </div>
                          <div className="bg-[#17261c] border border-[#233829] rounded-xl p-3 flex justify-between items-center group hover:border-[#32503a] transition-colors cursor-default">
                            <div>
                              <div className="text-[#c5f82a] font-mono text-xs mb-1">payload.raw_text</div>
                              <div className="text-gray-500 text-[10px]">String (Max 4k tokens)</div>
                            </div>
                            <ArrowRight size={14} className="text-gray-600 group-hover:text-[#c5f82a] transition-colors" />
                          </div>
                          <div className="bg-[#0f1712] border border-[#233829] rounded-xl p-3 flex items-center justify-between">
                            <Box size={14} className="text-gray-500" />
                            <div className="text-right">
                              <div className="text-[#c5f82a] font-mono text-xs mb-1">response.decision</div>
                              <div className="text-gray-500 text-[10px]">Enum [PASS, FAIL, ESCALATE]</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Last 5 Executions</div>
                          <button 
                            onClick={() => triggerAction('Displaying all executions...')}
                            className="text-[#c5f82a] text-[9px] uppercase tracking-widest font-bold hover:underline"
                          >
                            View All
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-[#17241c] border border-[#233529] hover:border-[#32503a] cursor-pointer transition-colors rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#c5f82a] shadow-[0_0_5px_#c5f82a]"></div>
                              <span className="text-gray-300 font-mono text-[11px]">req_9S204...</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 font-mono text-[10px]">14:31:02</span>
                              <span className="bg-[#c5f82a] text-[#0a110b] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Pass</span>
                            </div>
                          </div>
                          
                          <div className="bg-[#17241c] border border-[#233529] hover:border-[#32503a] cursor-pointer transition-colors rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_5px_#facc15]"></div>
                              <span className="text-gray-300 font-mono text-[11px]">req_772C1...</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 font-mono text-[10px]">14:30:45</span>
                              <span className="bg-yellow-400 text-[#0a110b] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Escalated</span>
                            </div>
                          </div>
                          
                          <div className="bg-[#17241c] border border-[#233529] hover:border-[#32503a] cursor-pointer transition-colors rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></div>
                              <span className="text-gray-300 font-mono text-[11px]">req_18AF9...</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 font-mono text-[10px]">14:28:11</span>
                              <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Fail</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Analytics' && (
            <div className="flex flex-col h-full bg-[#070c08]/80 backdrop-blur-2xl rounded-3xl border border-[#1a281e] p-6 shadow-2xl relative overflow-y-auto custom-scrollbar">
              
              {/* Analytics Header */}
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => triggerAction('Opening Command Menu...')}
                    className="w-9 h-9 rounded-full bg-[#121c16] border border-[#233529] flex items-center justify-center text-gray-400 hover:text-white transition-colors shadow-inner"
                  >
                    <Menu size={16} />
                  </button>
                  <div className="text-gray-200 font-bold tracking-widest flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-[#c5f82a] rounded-full shadow-[0_0_8px_#c5f82a]"></div>
                    SRE <span className="text-gray-600 font-normal mx-1">/</span> ANALYTICS
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <Wifi size={18} className="text-gray-400 cursor-pointer hover:text-[#c5f82a] transition-colors" onClick={() => triggerAction('Network Status: Optimal')} />
                  <User size={18} className="text-gray-400 cursor-pointer hover:text-[#c5f82a] transition-colors" onClick={() => triggerAction('User Profile Settings')} />
                </div>
              </div>

              {/* Analytics Grid */}
              <div className="flex-1 flex flex-col gap-6 min-h-0">
                
                {/* Top Row: KPIs */}
                <div className="grid grid-cols-4 gap-6 shrink-0">
                  <KPICard 
                    title="Total Processed" 
                    value={kpis.total_processed.toLocaleString()} 
                    sparklineData={{
                      path: "M0,30 L0,20 Q10,10 20,20 T40,25 T60,15 T80,25 T100,5 L100,30 Z",
                      line: "M0,20 Q10,10 20,20 T40,25 T60,15 T80,25 T100,5"
                    }} 
                  />
                  <KPICard 
                    title="Churn Prevented" 
                    value={kpis.churn_prevented} 
                    badge="+2.2%" 
                    sparklineData={{
                      path: "M0,30 L0,25 Q20,25 40,20 T80,15 T100,10 L100,30 Z",
                      line: "M0,25 Q20,25 40,20 T80,15 T100,10"
                    }} 
                  />
                  <KPICard 
                    title="Avg Improvement" 
                    value={(parseFloat(kpis.churn_prevented) / 10).toFixed(2) + "x"} 
                    badge="LIVE" 
                    badgeColor="text-[#c5f82a] bg-[#c5f82a]/10 border-[#c5f82a]/30"
                    sparklineData={{
                      path: "M0,30 L0,20 Q30,22 50,20 T100,22 L100,30 Z",
                      line: "M0,20 Q30,22 50,20 T100,22"
                    }} 
                  />
                  <KPICard 
                    title="Active Customers" 
                    value={kpis.active_users.toLocaleString()} 
                    badge="REAL" 
                    sparklineData={{
                      path: "M0,30 L0,25 Q20,28 40,25 T80,22 T100,15 L100,30 Z",
                      line: "M0,25 Q20,28 40,25 T80,22 T100,15"
                    }} 
                  />
                </div>

                {/* Middle Row: Charts */}
                <div className="grid grid-cols-3 gap-6 h-64 shrink-0">
                  <DonutChart />
                  <BarChart />
                  <Heatmap />
                </div>

                {/* Bottom Row: Models & Features */}
                <div className="grid grid-cols-3 gap-6 shrink-0 pb-6">
                  <ModelCard name="GPT-4o" latency="142ms" accuracy="94.2%" accLabel="Accurecy" />
                  <ModelCard name="Llama-3-8B" latency="48ms" accuracy="89.7%" />
                  <FeatureImportance />
                </div>

              </div>
            </div>
          )}

          {activeTab === 'Escalations' && (
            <div className="flex flex-col h-full bg-[#070c08]/80 backdrop-blur-2xl rounded-3xl border border-[#1a281e] p-6 shadow-2xl relative overflow-hidden">
              
              {/* Escalations Header */}
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="text-gray-200 font-bold tracking-widest flex items-center text-sm">
                    SENTIENT RETENTION ENGINE <span className="text-gray-600 font-normal mx-3">|</span> <span className="text-gray-400 font-normal">Human Handoff Queue</span>
                  </div>
                  <div className="bg-[#c5f82a] text-[#0a110b] px-3 py-1 rounded-full font-bold text-[10px] tracking-wider shadow-[0_0_10px_rgba(197,248,42,0.2)]">
                    {escalations.length} Active
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => triggerAction('Opening Calendar...')}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </button>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-gray-500 hover:text-white transition-colors"
                  >
                    <Bell size={18} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-2 border-[#070c08] bg-red-500 rounded-full"></span>
                  </button>
                  
                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute top-20 right-6 w-80 bg-[#0f1712]/95 backdrop-blur-2xl border border-[#1a281e] rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="p-4 border-b border-[#1a281e] flex justify-between items-center">
                        <h3 className="font-bold text-sm text-gray-200">Notifications</h3>
                        <span className="text-[10px] text-[#c5f82a] bg-[#c5f82a]/10 px-2 py-0.5 rounded-full border border-[#c5f82a]/20">
                          {auditLogs.filter(log => log && log.risk_level === 'HIGH').length} Active
                        </span>
                        <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-white ml-2"><X size={14} /></button>
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {(() => {
                          const notifications = auditLogs
                            .filter(log => log && (log.risk_level === 'HIGH' || log.status === 'FAIL'))
                            .slice(0, 5)
                            .map((log, idx) => ({
                              id: log.timestamp || idx,
                              title: `Critical Risk: ${(log.user_id || log.id || 'Unknown').slice(0, 8)}`,
                              time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent',
                              type: 'error'
                            }));

                          const displayNotifications = notifications.length > 0 ? notifications : [
                            { id: 1, title: 'System Online: Stream Active', time: 'Just now', type: 'success' }
                          ];

                          return displayNotifications.map((notif) => (
                            <div key={notif.id} className="p-4 border-b border-[#1a281e]/50 hover:bg-[#16221a] transition-colors cursor-pointer group">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                                  notif.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 
                                  notif.type === 'warning' ? 'bg-orange-400' : 'bg-[#c5f82a]'
                                }`}></div>
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-gray-200 group-hover:text-[#c5f82a] transition-colors">{notif.title}</div>
                                  <div className="text-[10px] text-gray-500 mt-1">{notif.time}</div>
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      <div className="p-3 text-center border-t border-[#1a281e]">
                        <button className="text-[10px] font-bold text-[#c5f82a] uppercase tracking-widest hover:underline">Clear All</button>
                      </div>
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-full border border-[#2a4230] overflow-hidden cursor-pointer hover:border-[#c5f82a] transition-colors">
                    <img src="https://i.pravatar.cc/100?img=11" className="w-full h-full object-cover" alt="user" />
                  </div>
                </div>
              </div>

              {/* Main Two-Column Layout */}
              <div className="flex gap-8 flex-1 min-h-0">
                
                {/* Left Column: Active Escalations */}
                <div className="w-5/12 flex flex-col h-full">
                  {/* Manual Search Bar */}
                  <div className="mb-6 shrink-0">
                    <form onSubmit={handleManualSearch} className="relative group">
                      <input 
                        type="text" 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="Manual Search (Customer ID)..."
                        className="w-full bg-[#0f1712]/50 border border-[#1a281e] rounded-xl py-3 pl-11 pr-4 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#c5f82a]/40 focus:bg-[#0f1712]/80 transition-all shadow-inner"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#c5f82a] transition-colors">
                        {isSearching ? <div className="w-4 h-4 border-2 border-[#c5f82a]/30 border-t-[#c5f82a] rounded-full animate-spin" /> : <Search size={16} />}
                      </div>
                      <button 
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#c5f82a]/10 hover:bg-[#c5f82a]/20 text-[#c5f82a] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-[#c5f82a]/20 transition-all hover:scale-105 active:scale-95"
                      >
                        Search
                      </button>
                    </form>
                  </div>

                  <div className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-widest">Active Escalations</div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {escalations.length > 0 ? (
                      escalations.map((esc) => (
                        <EscalationCard 
                          key={esc.id} 
                          {...esc} 
                          onViewDetails={() => setSelectedEscalation(esc)}
                          onTakeOwnership={async (id) => {
                            const esc = escalations.find(e => e.id === id);
                            if (!esc) return;

                            const userId = esc.userId || `user_${id.slice(-3).toLowerCase()}`;

                            let claimedEsc = { ...esc, claimed_at: new Date().toISOString(), specialist_name: 'On-Call Specialist' };

                            try {
                              const res = await fetch('http://localhost:8000/api/v1/escalations/claim', {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                  escalation_id: id,
                                  user_id: userId,
                                  specialist_id: 'specialist_001',
                                  specialist_name: 'On-Call Specialist',
                                  churn_risk: esc.churnRisk || 0.85
                                })
                              });
                              const data = await res.json();
                              if (res.ok) {
                                claimedEsc = { ...claimedEsc, claimed_at: data.claimed_at || claimedEsc.claimed_at, action_id: data.action_id };
                              }
                            } catch (err) {
                              console.warn('Claim offline, opening dashboard anyway:', err);
                            }

                            // Move from queue, open Specialist Dashboard
                            setEscalations(prev => prev.filter(e => e.id !== id));
                            setClaimedEscalations(prev => [claimedEsc, ...prev]);
                            setActiveSpecialistCase(claimedEsc);
                          }}
                        />
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 opacity-50">
                        <Activity size={48} />
                        <div className="text-xs font-semibold tracking-widest uppercase">No Active Escalations</div>
                      </div>
                    )}
                  </div>

                  {/* My Tasks — Claimed Escalations */}
                  {claimedEscalations.length > 0 && (
                    <div className="mt-4 shrink-0">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#c5f82a] shadow-[0_0_6px_#c5f82a]"></div>
                        My Tasks — Claimed ({claimedEscalations.length})
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {claimedEscalations.map((item, i) => (
                          <div key={item.id || i} className="bg-[#0f1712]/60 border border-[#c5f82a]/20 rounded-xl p-3 flex items-center justify-between group hover:border-[#c5f82a]/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-[#c5f82a]/60"></div>
                              <div>
                                <div className="text-gray-200 font-mono text-[11px] font-bold">{item.id || item.user_id}</div>
                                <div className="text-gray-500 text-[10px] mt-0.5">
                                  Claimed {item.claimed_at ? new Date(item.claimed_at).toLocaleTimeString() : 'just now'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#c5f82a]/10 text-[#c5f82a] border border-[#c5f82a]/20 uppercase tracking-wider">In Progress</span>
                              <button
                                onClick={() => {
                                  setClaimedEscalations(prev => prev.filter((_, idx) => idx !== i));
                                  triggerAction(`Escalation ${item.id || item.user_id} resolved`);
                                }}
                                className="text-gray-600 hover:text-green-400 transition-colors text-[10px] font-bold uppercase tracking-wider hover:bg-green-400/10 px-2 py-1 rounded-lg"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Chain of Thought & Audit Log */}
                <div className="w-7/12 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 uppercase tracking-widest">
                    <span className="text-sm font-bold text-gray-200">Chain of Thought Stream</span>
                    <span className="text-gray-600">//</span>
                    <span className="text-xs font-bold text-[#c5f82a] drop-shadow-[0_0_5px_rgba(197,248,42,0.5)]">LIVE</span>
                  </div>
                  <ChainOfThoughtTerminal logs={terminalText} />
                  <AuditLogTable logs={auditLogs} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Notification Toast */}
        {notification && (
          <div className="fixed bottom-10 right-10 z-[1000] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-[#c5f82a] text-[#0a110b] px-6 py-3 rounded-2xl font-bold text-sm shadow-[0_0_30px_rgba(197,248,42,0.4)] flex items-center gap-3">
              <Activity size={18} className="animate-pulse" />
              {notification}
            </div>
          </div>
        )}

        {/* Modal Overlay */}
        <EscalationDetailsModal 
          escalation={selectedEscalation} 
          onClose={() => setSelectedEscalation(null)} 
          triggerAction={triggerAction}
        />

        {/* Specialist Admin Dashboard — full-screen takeover on claim */}
        {activeSpecialistCase && (
          <SpecialistDashboard
            escalation={activeSpecialistCase}
            onClose={() => setActiveSpecialistCase(null)}
            onResolved={(id) => {
              setClaimedEscalations(prev => prev.filter(e => e.id !== id));
              triggerAction(`Case ${id} resolved and archived`);
            }}
          />
        )}
      </div>
      
      {/* Scrollbar overrides if necessary */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a281e;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2a4230;
        }
      `}} />
    </div>
  );
};

export default Dashboard;