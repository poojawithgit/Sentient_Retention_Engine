import React, { useState, useEffect } from 'react';
import { X, AlertOctagon, User, Phone, Mail, MessageSquare, CheckCircle, Clock, TrendingDown, Send, FileText, ArrowLeft, Zap, Shield, Activity, ShieldAlert, Scale, FileSearch, Gavel } from 'lucide-react';
import apiClient from '../../services/apiClient';

// ─── Timeline Event ───────────────────────────────────────────────────────────
const TimelineEvent = ({ icon: Icon, color, title, time, detail }) => (
  <div className="flex gap-4 group">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={14} />
      </div>
      <div className="w-px flex-1 bg-[#1a281e] mt-2" />
    </div>
    <div className="pb-6 flex-1">
      <div className="text-xs font-bold text-gray-200 font-sans tracking-wide">{title}</div>
      <div className="text-[10px] text-gray-500 mt-1 font-mono uppercase">{time}</div>
      {detail && (
        <div className="text-[11px] text-gray-400 mt-2 bg-[#0a1a0f]/50 border border-[#1a281e] rounded-lg p-3 font-mono leading-relaxed tracking-tight">
          {detail}
        </div>
      )}
    </div>
  </div>
);

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionButton = ({ icon: Icon, label, sublabel, color, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={`${label}: ${sublabel}`}
    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all active:scale-95 group ${
      disabled ? 'opacity-40 cursor-not-allowed border-[#1a281e] bg-[#0a1a0f]/30' :
      color === 'green' ? 'border-[#c5f82a]/30 bg-[#c5f82a]/5 hover:bg-[#c5f82a]/15 hover:border-[#c5f82a]/60 hover:shadow-[0_0_20px_rgba(197,248,42,0.15)]' :
      color === 'blue'  ? 'border-blue-400/30 bg-blue-400/5 hover:bg-blue-400/10 hover:border-blue-400/50' :
      color === 'orange'? 'border-orange-400/30 bg-orange-400/5 hover:bg-orange-400/10 hover:border-orange-400/50' :
                          'border-red-400/30 bg-red-400/5 hover:bg-red-400/10 hover:border-red-400/50'
    }`}
  >
    <Icon size={22} className={
      color === 'green' ? 'text-[#c5f82a]' :
      color === 'blue'  ? 'text-blue-400' :
      color === 'orange'? 'text-orange-400' : 'text-red-400'
    } />
    <div className="text-center" aria-hidden="true">
      <div className="text-xs font-bold text-gray-200 font-sans tracking-tight">{label}</div>
      {sublabel && <div className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-widest">{sublabel}</div>}
    </div>
  </button>
);

// ─── Risk Bar ─────────────────────────────────────────────────────────────────
const RiskBar = ({ label, value, pct }) => (
  <div>
    <div className="flex justify-between text-[11px] mb-2 font-sans">
      <span className="text-gray-500 uppercase tracking-widest font-bold">{label}</span>
      <span className="text-[#c5f82a] font-mono font-bold tracking-tighter">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-[#1a281e] rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-[#8bc34a] to-[#c5f82a] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const SpecialistDashboard = ({ escalation, onClose, onResolved }) => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [actionTaken, setActionTaken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedMsg, setResolvedMsg] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Customer data derived from escalation ─────────────────────────────────
  const customerId = escalation?.userId || escalation?.id || 'CUST-UNKNOWN';
  const escalationId = escalation?.id || 'ESC-000';
  const churnRisk = escalation?.churnRisk || 0.85;
  const claimedAt = escalation?.claimed_at ? new Date(escalation.claimed_at) : new Date();
  
  const isGovernanceCase = !!escalation?.metadata?.governance_data;
  const govData = escalation?.metadata?.governance_data;

  const timeline = [
    { icon: Zap,          color: 'bg-gray-700 text-gray-300',                title: 'Customer flagged by ML classifier', time: '5 min ago',  detail: `Churn score: ${(churnRisk * 100).toFixed(0)}% — driver: QUALITY` },
    { icon: Activity,     color: 'bg-blue-900 text-blue-300',                title: 'LangGraph agent triggered',         time: '4 min ago',  detail: 'Digital twin simulation ran 2 iterations. Both rejected retention offers.' },
    { icon: Shield,       color: isGovernanceCase ? 'bg-red-900/50 text-red-400' : 'bg-orange-900 text-orange-300', title: isGovernanceCase ? 'Governance Validation Failed' : 'Business rules check failed', time: '3 min ago',  detail: isGovernanceCase ? `ROI: ${govData.roi_status} | Policy: ${govData.policy_compliance} | Risk: ${govData.hallucination_risk}` : (escalation?.reason || 'Confidence below threshold. Escalating to human.') },
    { icon: isGovernanceCase ? ShieldAlert : AlertOctagon, color: 'bg-red-900 text-red-300',                  title: isGovernanceCase ? 'CRITICAL: GOVERNANCE ESCALATION' : 'Escalated to Human Handoff queue',  time: '2 min ago',  detail: isGovernanceCase ? govData.reason : null },
    { icon: User,         color: 'bg-[#c5f82a]/20 text-[#c5f82a]',          title: 'You claimed this case',             time: new Date(claimedAt).toLocaleTimeString(), detail: null },
  ];

  const user = JSON.parse(localStorage.getItem('sre_user') || '{}');
  const specialistName = user.username || 'specialist_001';

  // ─── Actions ───────────────────────────────────────────────────────────────
  const executeAction = async (actionType, label) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/action', { 
        user_id: customerId, 
        action: actionType,
        escalation_id: escalationId // Allow backend to link if it wants to, but service handles optionality
      });
      setActionTaken(actionType);
      showToast(`✓ ${label} sent to ${customerId}`);
    } catch (e) {
      showToast('Action saved locally (backend offline)', 'warn');
      setActionTaken(actionType);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    
    try {
      await apiClient.post('/escalations/note', {
        escalation_id: escalationId,
        user_id: customerId, // Added missing user_id
        note: note.trim(),
        specialist_id: user.id,
        specialist_name: specialistName
      });
      
      setNotes(prev => [{ text: note.trim(), time: new Date().toLocaleTimeString(), user: specialistName }, ...prev]);
      setNote('');
      showToast('Note added to case file');
    } catch (err) {
      console.error('Failed to save note:', err);
      // Fallback for demo
      setNotes(prev => [{ text: note.trim(), time: new Date().toLocaleTimeString(), user: specialistName }, ...prev]);
      setNote('');
      showToast('Note saved locally', 'warn');
    }
  };

  const resolveCase = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/action', { 
        user_id: customerId, 
        action: actionTaken || 'RESOLVED',
        escalation_id: escalationId
      });
      
      setResolvedMsg('Case resolved and logged to audit trail.');
      showToast('✓ Case resolved successfully');
      setTimeout(() => { onResolved?.(escalationId); onClose?.(); }, 1800);
    } catch (err) {
      console.error('Resolve failed:', err);
      showToast('Failed to resolve case', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!escalation) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex bg-[#030704]">
      {/* ── Background glow ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a0f]/90 to-[#020504]/95 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex w-full h-full overflow-hidden">

        {/* ──────────────── LEFT PANEL: Customer Context ──────────────── */}
        <div className="w-72 shrink-0 border-r-2 border-cyber-primary/10 flex flex-col bg-[#050a06] backdrop-blur-2xl">
          {/* Header */}
          <div className="p-5 border-b border-[#1a281e]">
            <button 
              onClick={onClose} 
              aria-label="Back to escalation queue"
              className="flex items-center gap-2 text-gray-500 hover:text-[#c5f82a] transition-colors text-xs font-bold uppercase tracking-widest mb-6 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Queue
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
              <span className="text-[11px] text-red-400 font-bold uppercase tracking-[0.2em] font-sans">Active Case</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-display tracking-tight">{escalationId}</h1>
            <div className="text-xs text-gray-500 mt-2 font-sans">
              Customer: <span className="text-gray-300 font-mono tracking-wider">{customerId}</span>
            </div>
          </div>

          {/* Customer Profile */}
          <div className="p-6 border-b border-[#1a281e]">
            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-5 font-sans">Customer Profile</div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a4a25] to-[#0d2615] border border-[#2a4230] flex items-center justify-center">
                <User size={20} className="text-[#c5f82a]" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-200 capitalize font-sans tracking-tight">{customerId.replace('_', ' ')}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 font-sans">Enterprise Plan · 24mo tenure</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Mail size={12} className="text-gray-600" />
                {customerId}@telco.com
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Phone size={12} className="text-gray-600" />
                +1 (555) 0{Math.floor(Math.random() * 900 + 100)}-0000
              </div>
            </div>
          </div>

          {/* Risk Features */}
          <div className="p-6 border-b border-[#1a281e] flex-1">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Risk Profile</div>
            <div className="space-y-4">
              <RiskBar label="Churn Risk"       value={`${(churnRisk * 100).toFixed(0)}%`}  pct={churnRisk * 100} />
              <RiskBar label="Payment Stress"   value="72%"   pct={72} />
              <RiskBar label="Network Drops"    value="68%"   pct={68} />
              <RiskBar label="Support Tickets"  value="85%"   pct={85} />
              <RiskBar label="Usage Decline"    value="61%"   pct={61} />
            </div>

            <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div className="text-[11px] text-red-400 font-bold uppercase tracking-widest mb-2 font-sans">AI Failure Reason</div>
              <div className="text-[12px] text-gray-300 leading-relaxed font-mono tracking-tight">
                {escalation.reason || 'Business rule confidence threshold not met. Digital twin rejected all automated offers.'}
              </div>
            </div>
          </div>

          {/* Offers Tried */}
          <div className="p-5">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Offers Attempted by AI</div>
            <div className="text-[11px] text-gray-400 bg-[#0a1a0f]/50 border border-[#1a281e] rounded-lg p-3 font-mono">
              {escalation.offers || 'No automated offers succeeded'}
            </div>
          </div>
        </div>

        {/* ──────────────── CENTER PANEL: Main Workspace ──────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top Bar */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#1a281e] shrink-0 bg-[#040805]">
            <div>
              <div className="text-[11px] text-[#c5f82a] font-bold uppercase tracking-[0.2em] mb-1 font-sans">Specialist Command Center</div>
              <h2 className="text-3xl font-bold text-white font-display tracking-tight">Retention Intervention</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-[#0f1712] border border-[#1a281e] px-4 py-2 rounded-xl font-mono">
                <Clock size={12} className="text-[#c5f82a]" />
                Claimed {claimedAt.toLocaleTimeString()}
              </div>
              {actionTaken && (
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#c5f82a] bg-[#c5f82a]/10 border border-[#c5f82a]/20 px-4 py-2 rounded-xl font-mono">
                  <CheckCircle size={12} />
                  {actionTaken} SENT
                </div>
              )}
              <button 
                onClick={onClose} 
                aria-label="Close workspace"
                className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content: Actions + Notes */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">

            {/* Action Grid */}
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Retention Actions</div>
              <div className="grid grid-cols-4 gap-4">
                <ActionButton icon={Zap}         color="green"  label="Send Discount"   sublabel="20% off 3mo"    disabled={!!actionTaken || isSubmitting} onClick={() => executeAction('DISCOUNT', '20% Discount')} />
                <ActionButton icon={Mail}         color="blue"   label="Send Email"      sublabel="Retention msg"  disabled={!!actionTaken || isSubmitting} onClick={() => executeAction('EMAIL', 'Retention Email')} />
                <ActionButton icon={Phone}        color="orange" label="Schedule Call"   sublabel="Priority queue" disabled={!!actionTaken || isSubmitting} onClick={() => executeAction('CALL', 'Call Scheduled')} />
                {isGovernanceCase ? (
                  <ActionButton icon={Gavel} color="red" label="Manual Override" sublabel="Bypass Policy" disabled={!!actionTaken || isSubmitting} onClick={() => executeAction('OVERRIDE', 'Governance Override')} />
                ) : (
                  <ActionButton icon={TrendingDown} color="red"    label="Escalate Up"     sublabel="Senior mgr"     disabled={!!actionTaken || isSubmitting} onClick={() => executeAction('ESCALATE', 'Senior Escalation')} />
                )}
              </div>
              {actionTaken && (
                <div className="mt-4 p-4 bg-[#c5f82a]/5 border border-[#c5f82a]/20 rounded-xl flex items-center gap-3">
                  <CheckCircle size={16} className="text-[#c5f82a] shrink-0" />
                  <div className="text-sm text-[#c5f82a] font-semibold">Action <span className="font-mono">{actionTaken}</span> logged to audit trail for {customerId}.</div>
                </div>
              )}
            </div>

            {/* AI Context Panel */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">AI Reasoning Context</div>
                <div className="bg-[#060c08] border border-[#1a281e] rounded-2xl p-5 h-full">
                  <div className="font-mono text-[11px] text-gray-300 leading-loose space-y-1">
                    <div className="text-gray-600"># LangGraph Agent Trace</div>
                    <div><span className="text-blue-400">[intent_summary]</span> High frustration signal. Network reliability driver detected.</div>
                    <div><span className="text-orange-400">[classifier]</span> XGBoost score: <span className="text-[#c5f82a]">{(churnRisk * 100).toFixed(0)}%</span> · Driver: QUALITY</div>
                    <div><span className="text-cyan-400">[rag]</span> Retrieved: "Priority support + network diagnostics playbook"</div>
                    <div><span className="text-[#c5f82a]">[digital_twin_sim]</span> Iteration 1: rejected · Iteration 2: rejected</div>
                    <div><span className="text-red-400">[business_rules]</span> FAIL · Confidence {`<`} 0.5 · Iterations ≥ 3</div>
                    <div><span className="text-red-400">[human_handoff]</span> Escalated. Awaiting specialist intervention.</div>
                  </div>
                </div>
              </div>

              {isGovernanceCase && (
                <div>
                  <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldAlert size={12} />
                    Governance Validation Audit
                  </div>
                  <div className="bg-[#0f0a0a] border border-red-900/30 rounded-2xl p-5 h-full relative overflow-hidden group hover:border-red-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Scale size={80} className="text-red-500" />
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                          <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">ROI Analysis</div>
                          <div className={`text-xs font-mono font-bold ${govData.roi_status === 'PASS' ? 'text-[#c5f82a]' : 'text-red-400'}`}>
                            {govData.roi_status}
                          </div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                          <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Policy Compliance</div>
                          <div className={`text-xs font-mono font-bold ${govData.policy_compliance === 'PASS' ? 'text-[#c5f82a]' : 'text-red-400'}`}>
                            {govData.policy_compliance}
                          </div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                          <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Hallucination Risk</div>
                          <div className={`text-xs font-mono font-bold ${govData.hallucination_risk === 'LOW' ? 'text-[#c5f82a]' : 'text-red-400'}`}>
                            {govData.hallucination_risk}
                          </div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                          <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Audit Reasoning</div>
                          <div className="text-[10px] text-gray-400 font-mono italic leading-tight">
                            {govData.audit_reasoning || 'Validation triggered due to outlier ROI projection.'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase mb-1">
                          <AlertOctagon size={12} />
                          Specialist Action Required
                        </div>
                        <div className="text-[11px] text-gray-300 leading-relaxed font-sans">
                          This request violates standard autonomous execution bounds. Manual review of <b>{govData.reason}</b> is mandatory before overriding.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Specialist Notes */}
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Case Notes</div>
              <div className="flex gap-3">
                <textarea
                  id="case-note"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && e.ctrlKey && addNote()}
                  placeholder="Add a case note... (Ctrl+Enter to submit)"
                  aria-label="Add case note"
                  className="flex-1 bg-[#060c08] border border-[#1a281e] focus:border-[#c5f82a]/50 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 resize-none outline-none transition-colors min-h-[80px]"
                />
                <button
                  onClick={addNote}
                  disabled={!note.trim()}
                  className="px-4 py-3 bg-[#1a281e] hover:bg-[#2a4230] disabled:opacity-40 disabled:cursor-not-allowed border border-[#2a4230] rounded-xl text-[#c5f82a] transition-colors self-start"
                >
                  <Send size={16} />
                </button>
              </div>

              {notes.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {notes.map((n, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-[#0a1a0f]/60 border border-[#1a281e] rounded-xl">
                      <FileText size={12} className="text-[#c5f82a] mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-[11px] text-gray-300">{n.text}</div>
                        <div className="text-[9px] text-gray-600 mt-1 font-mono">{n.time} · {n.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Resolve Bar */}
          <div className="p-6 border-t border-[#1a281e] bg-[#060c08]/80 shrink-0">
            {resolvedMsg ? (
              <div className="flex items-center gap-3 justify-center text-[#c5f82a] font-bold">
                <CheckCircle size={20} className="animate-pulse" />
                {resolvedMsg}
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={resolveCase}
                  disabled={!actionTaken || isSubmitting}
                  className="flex-1 py-4 rounded-2xl bg-[#c5f82a] text-[#0a110b] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(197,248,42,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Resolve Case & Close
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-4 rounded-2xl border border-[#2a4230] text-gray-400 font-bold text-sm hover:bg-white/5 transition-colors"
                >
                  Save & Exit
                </button>
              </div>
            )}
            {!actionTaken && (
              <div className="text-center text-[10px] text-gray-600 mt-3">Select a retention action above before resolving</div>
            )}
          </div>
        </div>

        {/* ──────────────── RIGHT PANEL: Timeline ──────────────── */}
        <div className="w-64 shrink-0 border-l-2 border-cyber-primary/10 bg-[#050a06] backdrop-blur-2xl flex flex-col">
          <div className="p-5 border-b border-[#1a281e]">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Case Timeline</div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            <div>
              {timeline.map((ev, i) => (
                <TimelineEvent key={i} {...ev} />
              ))}
            </div>
          </div>

          {/* SLA Timer */}
          <div className="p-6 border-t border-[#1a281e]">
            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-4 font-sans">SLA Status</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.4)]" />
              <span className="text-orange-400 text-[13px] font-bold font-mono tracking-tighter">14:32 remaining</span>
            </div>
            <div className="h-2 w-full bg-[#1a281e] rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.2)] transition-all duration-1000" style={{ width: '38%' }} />
            </div>
            <div className="text-[10px] text-gray-600 mt-3 font-mono uppercase tracking-widest">P1 · 15min SLA · Starts at claim</div>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1300] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-3 ${
            toast.type === 'warn' ? 'bg-orange-400 text-[#1a0a00]' : 'bg-[#c5f82a] text-[#0a110b]'
          }`}>
            <Activity size={16} className="animate-pulse" />
            {toast.msg}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a281e; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SpecialistDashboard;
