import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronDown, Brain, TrendingDown, AlertTriangle, TicketX,
  Activity, GitBranch, Cpu, BarChart2, ShieldOff, Clock,
  Layers, Zap, Target, CheckCircle2, XCircle, Info,
  SlidersHorizontal, FlaskConical, Link2, ArrowRightLeft
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

const ConfidenceBar = ({ label, value, color = '#C5F82A', delay = 0 }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 300 + delay); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{label}</span>
        <span className="text-[11px] font-mono font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color, boxShadow: `0 0 8px ${color}40` }}
        />
      </div>
    </div>
  );
};

const ShapBar = ({ feature, value, impact, maxImpact = 1 }) => {
  const pct = Math.min(Math.abs(impact) / maxImpact * 100, 100);
  const isPositive = impact > 0;
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 400); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-32 text-right">
        <span className="text-[10px] font-mono text-zinc-400 truncate block">{feature}</span>
        <span className="text-[9px] font-mono text-zinc-600">{value}</span>
      </div>
      <div className="flex-1 flex items-center gap-1">
        {!isPositive && (
          <div className="flex-1 flex justify-end">
            <div className="h-4 rounded-l transition-all duration-1000 ease-out" style={{ width: `${w}%`, background: '#FF3E3E', opacity: 0.8 }} />
          </div>
        )}
        <div className="w-px h-4 bg-white/20" />
        {isPositive && (
          <div className="flex-1">
            <div className="h-4 rounded-r transition-all duration-1000 ease-out" style={{ width: `${w}%`, background: '#C5F82A', opacity: 0.8 }} />
          </div>
        )}
      </div>
      <span className={`text-[10px] font-mono font-bold w-14 text-right ${isPositive ? 'text-cyber-alert' : 'text-cyber-primary'}`}>
        {isPositive ? '+' : ''}{impact.toFixed(3)}
      </span>
    </div>
  );
};

const Section = ({ title, icon: Icon, iconColor = 'text-cyber-primary', borderColor = 'border-cyber-primary/20', children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`border ${borderColor} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-white/5 ${iconColor}`}>
            <Icon size={13} />
          </div>
          <span className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-widest">{title}</span>
        </div>
        <ChevronDown size={14} className={`text-zinc-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Tag = ({ label, color = 'text-zinc-400 border-zinc-700 bg-zinc-800/40' }) => (
  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${color}`}>{label}</span>
);

// ─── mock data generator ─────────────────────────────────────────────────────

const buildData = (entity) => {
  const score = entity?.score ?? entity?.churnRisk ?? 0.78;
  const pct = Math.round(score * 100);
  return {
    riskScore: pct,
    primaryDrivers: [
      { label: 'Usage Decline', icon: TrendingDown, severity: 'CRITICAL', detail: '63% drop in login frequency over 30 days', color: 'text-cyber-alert' },
      { label: 'Billing Anomaly', icon: AlertTriangle, severity: 'HIGH', detail: '2 failed payment attempts detected', color: 'text-cyber-warning' },
      { label: 'Unresolved Tickets', icon: TicketX, severity: 'HIGH', detail: '3 open P1 support cases — 14 days stale', color: 'text-cyber-warning' },
      { label: 'Engagement Decay', icon: Activity, severity: 'MEDIUM', detail: 'Feature adoption index down 41%', color: 'text-zinc-400' },
    ],
    behavioralMatch: {
      similarityScore: Math.round(72 + score * 20),
      cluster: 'HIGH_VELOCITY_CHURN_CLUSTER_v3',
      patterns: ['Multi-channel disengagement', 'Support escalation spiral', 'Contract-renewal avoidance'],
    },
    simulation: {
      scenariosEvaluated: 847,
      retentionProbability: Math.round(68 - score * 30),
      revenuePreserved: `$${Math.round(12 + score * 40)}K`,
      selectedStrategy: 'Executive Outreach + Discount Ladder',
    },
    confidence: {
      overall: Math.round(88 - score * 10),
      historicalSuccess: Math.round(82 - score * 8),
      customerSimilarity: Math.round(76 + score * 5),
      behavioralConsistency: Math.round(71 + score * 12),
      modelConfidence: Math.round(91 - score * 6),
    },
    decisionInputs: {
      mlClassifier: `XGBoost v2.1 — P(churn)=${score.toFixed(3)}`,
      shapFeatures: [
        { feature: 'login_frequency', value: '1.2/wk', impact: 0.312 },
        { feature: 'ticket_age_days', value: '14d', impact: 0.274 },
        { feature: 'payment_failures', value: '2', impact: 0.198 },
        { feature: 'feature_adoption', value: '23%', impact: 0.156 },
        { feature: 'contract_days_left', value: '47d', impact: -0.089 },
        { feature: 'nps_score', value: '4/10', impact: 0.071 },
      ],
      vectorMemory: '3 similar cases retrieved — avg. retention: 54%',
      historicalOutcomes: 'Discount-led interventions: 61% retention. Exec outreach: 72%.',
    },
    rejectedStrategies: [
      { name: 'Automated Email Drip', reason: 'Low ROI — predicted 12% lift vs 34% cost', tag: 'LOW_ROI' },
      { name: 'Price Lock Offer', reason: 'Retention probability 28% — below 40% threshold', tag: 'LOW_PROB' },
      { name: 'Self-serve Upgrade Prompt', reason: 'Policy constraint: customer flagged DND', tag: 'POLICY' },
    ],
  };
};

// ─── Main Panel ──────────────────────────────────────────────────────────────

export const AIReasoningPanel = ({ entity, onClose, triggerLabel = 'Decision' }) => {
  const data = buildData(entity);
  const riskColor = data.riskScore >= 75 ? '#FF3E3E' : data.riskScore >= 50 ? '#FFB800' : '#C5F82A';

  return (
    <AnimatePresence>
      {entity && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1050]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[580px] z-[1060] flex flex-col"
            style={{ background: 'rgba(5,8,5,0.98)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Top accent line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-primary" />

            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-white/5 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={14} className="text-cyber-primary" />
                  <span className="text-[10px] font-mono text-cyber-primary uppercase tracking-[0.3em] font-bold">AI_REASONING_ENGINE / EXPLAINABILITY_v2</span>
                </div>
                <div className="text-xl font-display text-white tracking-widest uppercase">
                  {entity?.id || entity?.customer_id || 'DECISION_CHAIN'}
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-0.5 uppercase tracking-widest">{triggerLabel} · {new Date().toLocaleTimeString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-0.5">Risk Score</div>
                  <div className="text-2xl font-display font-bold" style={{ color: riskColor }}>{data.riskScore}%</div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">

              {/* ① Primary Risk Drivers */}
              <Section title="Primary Risk Drivers" icon={TrendingDown} iconColor="text-cyber-alert" borderColor="border-cyber-alert/20" defaultOpen>
                <div className="space-y-2">
                  {data.primaryDrivers.map((d) => (
                    <div key={d.label} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-colors">
                      <d.icon size={14} className={`mt-0.5 shrink-0 ${d.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-mono font-bold text-zinc-200">{d.label}</span>
                          <Tag label={d.severity} color={d.severity === 'CRITICAL' ? 'text-cyber-alert border-cyber-alert/30 bg-cyber-alert/5' : d.severity === 'HIGH' ? 'text-cyber-warning border-cyber-warning/30 bg-cyber-warning/5' : 'text-zinc-400 border-zinc-700 bg-zinc-800/40'} />
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">{d.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ② Behavioral Pattern Match */}
              <Section title="Behavioral Pattern Match" icon={GitBranch} iconColor="text-cyber-secondary" borderColor="border-cyber-secondary/20">
                <div className="p-3 rounded-lg bg-cyber-secondary/5 border border-cyber-secondary/10 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cluster Similarity</span>
                    <span className="text-[13px] font-mono font-bold text-cyber-secondary">{data.behavioralMatch.similarityScore}%</span>
                  </div>
                  <ConfidenceBar label={data.behavioralMatch.cluster} value={data.behavioralMatch.similarityScore} color="#00E0FF" />
                </div>
                <div className="space-y-1.5">
                  <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Matched Behavior Patterns</div>
                  {data.behavioralMatch.patterns.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                      <div className="w-1 h-1 rounded-full bg-cyber-secondary/60 shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </Section>

              {/* ③ Simulation Summary */}
              <Section title="Simulation Summary" icon={FlaskConical} iconColor="text-cyber-warning" borderColor="border-cyber-warning/20">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Scenarios Run', value: data.simulation.scenariosEvaluated.toLocaleString(), color: 'text-white' },
                    { label: 'Retention Prob.', value: `${data.simulation.retentionProbability}%`, color: 'text-cyber-primary' },
                    { label: 'Revenue Preserved', value: data.simulation.revenuePreserved, color: 'text-cyber-secondary' },
                    { label: 'Selected Strategy', value: '1 of 847', color: 'text-cyber-warning' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1">{label}</div>
                      <div className={`text-[13px] font-mono font-bold ${color}`}>{value}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg border border-cyber-primary/20 bg-cyber-primary/5 flex items-center gap-3">
                  <Target size={14} className="text-cyber-primary shrink-0" />
                  <div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-0.5">Selected Intervention</div>
                    <div className="text-[11px] font-mono font-bold text-cyber-primary">{data.simulation.selectedStrategy}</div>
                  </div>
                </div>
              </Section>

              {/* ④ Confidence Breakdown */}
              <Section title="Confidence Breakdown" icon={SlidersHorizontal} iconColor="text-cyber-primary" borderColor="border-cyber-primary/20">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Overall Confidence</span>
                  <span className="text-xl font-display font-bold text-cyber-primary">{data.confidence.overall}%</span>
                </div>
                <div className="space-y-3">
                  <ConfidenceBar label="Historical Intervention Success" value={data.confidence.historicalSuccess} color="#C5F82A" delay={0} />
                  <ConfidenceBar label="Customer Similarity Score" value={data.confidence.customerSimilarity} color="#00E0FF" delay={80} />
                  <ConfidenceBar label="Behavioral Consistency" value={data.confidence.behavioralConsistency} color="#FFB800" delay={160} />
                  <ConfidenceBar label="Model Confidence (XGBoost)" value={data.confidence.modelConfidence} color="#C5F82A" delay={240} />
                </div>
              </Section>

              {/* ⑤ Decision Inputs */}
              <Section title="Decision Inputs" icon={Cpu} iconColor="text-cyber-secondary" borderColor="border-cyber-secondary/20">
                {/* ML Output */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 mb-3">
                  <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1">ML Classifier Output</div>
                  <div className="text-[11px] font-mono text-cyber-primary">{data.decisionInputs.mlClassifier}</div>
                </div>

                {/* SHAP visualization */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">SHAP Feature Attribution</div>
                    <div className="flex items-center gap-3 text-[9px] font-mono">
                      <span className="text-cyber-alert">◀ Churn Risk</span>
                      <span className="text-cyber-primary">Retention ▶</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {data.decisionInputs.shapFeatures.map((f) => (
                      <ShapBar key={f.feature} {...f} maxImpact={0.35} />
                    ))}
                  </div>
                </div>

                {/* Vector memory & outcomes */}
                {[
                  { label: 'Vector Memory Retrieval', icon: Link2, value: data.decisionInputs.vectorMemory },
                  { label: 'Historical Retention Outcomes', icon: BarChart2, value: data.decisionInputs.historicalOutcomes },
                ].map(({ label, icon: Icon, value }) => (
                  <div key={label} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-3 mb-2 last:mb-0">
                    <Icon size={13} className="text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-0.5">{label}</div>
                      <div className="text-[11px] font-mono text-zinc-300 leading-relaxed">{value}</div>
                    </div>
                  </div>
                ))}
              </Section>

              {/* ⑥ Rejected Strategies */}
              <Section title="Rejected Strategies" icon={XCircle} iconColor="text-zinc-500" borderColor="border-zinc-800">
                <div className="space-y-2">
                  {data.rejectedStrategies.map((s) => (
                    <div key={s.name} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity">
                      <ShieldOff size={13} className="text-zinc-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-mono text-zinc-400 line-through">{s.name}</span>
                          <Tag label={s.tag} color={
                            s.tag === 'LOW_ROI' ? 'text-cyber-alert border-cyber-alert/20 bg-cyber-alert/5' :
                            s.tag === 'LOW_PROB' ? 'text-cyber-warning border-cyber-warning/20 bg-cyber-warning/5' :
                            'text-zinc-500 border-zinc-700 bg-zinc-800/40'
                          } />
                        </div>
                        <p className="text-[10px] font-mono text-zinc-600 leading-relaxed">{s.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 shrink-0 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-primary animate-pulse shadow-[0_0_8px_#c5f82a]" />
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">REASONING_ENGINE_v2 · LIVE</span>
              </div>
              <button onClick={onClose} className="px-4 py-1.5 rounded-lg border border-white/10 text-zinc-500 text-[10px] font-mono font-bold uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">
                Close Panel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIReasoningPanel;

// aria-label

