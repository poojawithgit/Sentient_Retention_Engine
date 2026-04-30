import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { FixedSizeList } from 'react-window';
import {
  Globe, Activity, Share2, BarChart2, AlertOctagon,
  Bell, Settings, X, ArrowRight, Menu, Wifi, User, Search
} from 'lucide-react';

import SpecialistDashboard from './SpecialistDashboard';
import { useDashboardData } from '../hooks/useDashboardData';
import {
  KPICard, DonutChart, BarChart, Heatmap, ModelCard, FeatureImportance,
  EscalationCard, EscalationDetailsModal, ChainOfThoughtTerminal, AuditLogTable,
  ActivityKPICard, LiveEventCard
} from '../components/dashboard/DashboardComponents';

const Dashboard = () => {
  const {
    kpis, auditLogs, liveEvents, isPipelineRunning, terminalText, nodeData,
    escalations, setEscalations, claimedEscalations, isSearching,
    runPipeline, handleManualSearch, setTriggerAction
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState('Activity');
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [isFullView, setIsFullView] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [activeSpecialistCase, setActiveSpecialistCase] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activityDimensions, setActivityDimensions] = useState({ width: 0, height: 0 });
  const [pipelineGraphData, setPipelineGraphData] = useState({ nodes: [], links: [] });
  const [activitySearchId, setActivitySearchId] = useState('');

  const containerRef = useRef();
  const graphRef = useRef();
  const activityContainerRef = useRef();
  const eventsContainerRef = useRef();
  const [eventsDimensions, setEventsDimensions] = useState({ width: 0, height: 0 });

  const triggerAction = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    setTriggerAction(triggerAction);
  }, [setTriggerAction]);

  useEffect(() => {
    fetch('/pipeline_graph.json')
      .then(res => res.json())
      .then(data => {
        if (data.nodes && data.links) {
          setPipelineGraphData(data);
        }
      })
      .catch(err => console.error("Error loading pipeline graph data:", err));
  }, []);

  useEffect(() => {
    if (activeTab === 'Pipeline') {
      setIsFullView(true);
    } else {
      setIsFullView(false);
    }
  }, [activeTab]);

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

  useEffect(() => {
    if (!eventsContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setEventsDimensions({ width, height });
      }
    });
    observer.observe(eventsContainerRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  const activityNodeCanvasObject = useMemo(() => (node, ctx, globalScale) => {
    const size = (node.val || 5) * 3;
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

    const safeScale = Math.max(globalScale, 0.1);
    const fontSize = 8 / safeScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = isActive ? '#ffffff' : '#4c6b35';
    ctx.fillText(node.name || node.id, node.x, node.y + size + fontSize + 2);
  }, [activeNodeId]);

  const pipelineNodeCanvasObject = useMemo(() => (node, ctx, globalScale) => {
    const label = node.name || node.id;
    const isHovered = node === hoverNode;
    const isSelected = node.id === selectedNode?.id;
    const isActive = node.id === activeNodeId;
    const size = (node.val || 5) * 4;

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

    const safeScale = Math.max(globalScale, 0.1);
    ctx.strokeStyle = isActive ? '#ffffff' : (isSelected || isHovered ? '#c5f82a' : '#2a4230');
    ctx.lineWidth = (isActive || isSelected) ? 3 / safeScale : 1.5 / safeScale;
    ctx.stroke();

    const fontSize = (isActive ? 14 : 11) / safeScale;
    ctx.font = `${isActive ? 'bold' : 'normal'} ${fontSize}px Inter, Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isActive ? '#000000' : (isSelected || isHovered ? '#c5f82a' : '#4c6b35');
    ctx.fillText(label, node.x, node.y);
  }, [hoverNode, selectedNode, activeNodeId]);

  const navItems = [
    { name: 'Activity', icon: Activity, id: 'Activity' },
    { name: 'Pipeline', icon: Share2, id: 'Pipeline' },
    { name: 'Analytics', icon: BarChart2, id: 'Analytics' },
    { name: 'Escalations', icon: AlertOctagon, id: 'Escalations' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#050806] text-[#e1e8e2] font-sans selection:bg-[#c5f82a]/30 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none" 
        style={{backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2000')"}}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a0f]/80 to-[#040a06]/95 pointer-events-none" />
      
      <div className={`flex w-full h-full relative z-10 transition-all duration-500 ${isFullView ? 'p-0' : 'p-4 md:p-6 lg:p-8'}`}>
        <div className="w-24 flex flex-col items-center pt-2 shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link to="/" className="text-[#c5f82a] font-bold text-xl tracking-widest mb-8 hover:opacity-80 transition-opacity">SRE</Link>
          <Link to="/" className="w-12 h-12 bg-[#122216] border border-[#2a4230] rounded-2xl flex items-center justify-center text-[#c5f82a] mb-8 shadow-lg cursor-pointer hover:bg-[#1a2f20] transition-colors">
            <Globe size={22} />
          </Link>
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
        
        <div className={`flex-1 flex flex-col min-w-0 ${isFullView ? 'pl-0' : 'pl-2'}`}>
          {activeTab === 'Activity' && (
            <div className="flex flex-col h-full bg-[#070c08]/80 backdrop-blur-2xl rounded-3xl border border-[#1a281e] p-6 shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-4 gap-6 shrink-0 mb-6">
                <ActivityKPICard title="INTERVENTIONS TODAY" value={kpis.interventions_today.toLocaleString()} />
                <ActivityKPICard title="CHURN PREVENTED" value={kpis.churn_prevented} />
                <ActivityKPICard title="TOTAL PROCESSED" value={kpis.total_processed.toLocaleString()} />
                <ActivityKPICard title="ACTIVE CUSTOMERS" value={kpis.active_users.toLocaleString()} hasTrend={false} />
              </div>

              <div className="flex gap-6 flex-1 min-h-0">
                <div className="w-7/12 flex flex-col h-full bg-[#0f1712]/50 backdrop-blur-md rounded-2xl border border-[#1a281e] p-5 relative">
                  <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                      <h2 className="text-xl font-bold text-gray-200">Live Customer Events</h2>
                      <div className="flex items-center gap-2 text-[#c5f82a] text-[10px] uppercase font-bold tracking-wider mt-1">
                        <ArrowRight size={12} className="-rotate-90" /> updating in real-time
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <input 
                          type="text" 
                          value={activitySearchId} 
                          onChange={e => setActivitySearchId(e.target.value)}
                          placeholder="Specific Customer ID..." 
                          className="w-48 bg-[#121c16] border border-[#233529] rounded-xl py-2 pl-9 pr-3 text-[10px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#c5f82a]/40 transition-all shadow-inner"
                        />
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#c5f82a] transition-colors" />
                      </div>
                      <button 
                        onClick={() => runPipeline(setActiveNodeId, activitySearchId)}
                        disabled={isPipelineRunning}
                        className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                          isPipelineRunning ? 'bg-[#1a281e] text-gray-500 cursor-not-allowed' : 'bg-[#c5f82a] text-[#0a110b] hover:shadow-[0_0_15px_rgba(197,248,42,0.3)] active:scale-95'
                        }`}
                      >
                        {isPipelineRunning ? 'Running...' : (activitySearchId ? 'Run Targeted' : 'Run Pipeline')}
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsPaused(!isPaused)}
                      className={`border border-[#233529] px-4 py-1.5 rounded-lg text-xs transition-colors ${
                        isPaused ? 'bg-[#c5f82a] text-[#0a110b]' : 'bg-[#121c16] text-gray-300 hover:text-white hover:border-[#32503a]'
                      }`}
                    >
                      {isPaused ? 'Resume Feed' : 'Pause Feed'}
                    </button>
                  </div>
                  
                  <div className="flex-1 min-h-0" ref={eventsContainerRef}>
                    {liveEvents.length > 0 ? (
                      <FixedSizeList
                        height={eventsDimensions.height || 400}
                        itemCount={liveEvents.length}
                        itemSize={80}
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

                <div className="w-5/12 flex flex-col h-full bg-[#0f1712]/50 backdrop-blur-md rounded-2xl border border-[#1a281e] p-5">
                  <h2 className="text-xl font-bold text-gray-200 mb-6 shrink-0">Pipeline Live View</h2>
                  <div className="flex-1 relative rounded-xl overflow-hidden bg-[#070c08] border border-[#1a281e] shadow-inner flex items-center justify-center">
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
              <div className={`flex-1 transition-all duration-700 ease-in-out relative overflow-hidden flex shadow-2xl ${isFullView ? 'bg-black h-full w-full' : 'bg-[#09110c]/80 backdrop-blur-xl rounded-[2rem] border border-[#1a2d21]'}`}>
                <div className="absolute top-8 left-8 z-50 flex gap-3">
                  <div className="px-4 py-2 rounded-xl bg-[#c5f82a] text-[#0a110b] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(197,248,42,0.4)] animate-in zoom-in-50 duration-300">
                    <div className="w-2 h-2 bg-[#0a110b] rounded-full animate-pulse"></div>
                    Live Pipeline Environment
                  </div>
                </div>

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
                      onNodeClick={node => setSelectedNode(node)}
                      nodeCanvasObject={pipelineNodeCanvasObject}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#2a4230]">
                      <Share2 className="animate-pulse" size={48} />
                    </div>
                  )}
                  {!isFullView && <div className="absolute inset-0 pointer-events-none rounded-[2rem] shadow-[inset_0_0_100px_rgba(4,10,6,0.9)]" />}
                </div>
                
                {selectedNode && (
                  <div className="absolute top-6 right-6 w-80 bg-[#121c16]/95 backdrop-blur-2xl border border-[#233529] rounded-2xl flex flex-col text-gray-300 shadow-2xl overflow-hidden z-10 animate-in slide-in-from-right-8 duration-300 max-h-[80%]">
                    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-white">Node Details</h2>
                        <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#c5f82a]/10 text-[#c5f82a] text-[10px] px-2 py-0.5 rounded border border-[#c5f82a]/20 font-mono uppercase tracking-wider">
                          {nodeData[selectedNode.id]?.status || 'Idle'}
                        </span>
                        <h3 className="text-xl font-bold text-white truncate" title={selectedNode.name || selectedNode.id}>{selectedNode.name || selectedNode.id}</h3>
                      </div>
                      
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4">
                        Last Active: <span className="text-gray-400">{nodeData[selectedNode.id]?.timestamp || 'Never'}</span>
                      </div>

                      {nodeData[selectedNode.id] ? (
                        <div className="space-y-6">
                          {nodeData[selectedNode.id].reasoning && (
                            <div>
                              <div className="text-[10px] text-[#c5f82a] uppercase tracking-widest font-bold mb-2">Agent Reasoning</div>
                              <div className="bg-[#050806] border border-[#1a281e] rounded-xl p-3 text-xs leading-relaxed text-gray-300 italic">
                                "{nodeData[selectedNode.id].reasoning}"
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            {nodeData[selectedNode.id].risk_score !== undefined && (
                              <div className="bg-[#17241c] border border-[#233529] p-3 rounded-xl">
                                <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Risk Score</div>
                                <div className="text-[#c5f82a] font-bold">{(nodeData[selectedNode.id].risk_score * 100).toFixed(1)}%</div>
                              </div>
                            )}
                            {nodeData[selectedNode.id].driver && (
                              <div className="bg-[#17241c] border border-[#233529] p-3 rounded-xl">
                                <div className="text-[9px] text-gray-500 uppercase font-bold mb-1">Risk Driver</div>
                                <div className="text-white font-bold">{nodeData[selectedNode.id].driver}</div>
                              </div>
                            )}
                          </div>

                          {nodeData[selectedNode.id].offer && (
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Generated Offer</div>
                              <div className="bg-[#c5f82a]/5 border border-[#c5f82a]/20 rounded-xl p-3 text-xs text-[#c5f82a] font-semibold">
                                {nodeData[selectedNode.id].offer}
                              </div>
                            </div>
                          )}

                          {nodeData[selectedNode.id].action && (
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Final Action</div>
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400 font-bold">
                                {nodeData[selectedNode.id].action}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-10 text-center flex flex-col items-center gap-3 opacity-40">
                          <Activity size={32} />
                          <div className="text-[10px] uppercase tracking-widest font-bold">Waiting for execution data...</div>
                        </div>
                      )}

                      <div className="mt-8 pt-6 border-t border-[#1a281e]">
                        <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-4">Node Metadata</div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500">Node ID</span>
                            <span className="text-gray-300 font-mono">{selectedNode.id}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500">Latency</span>
                            <span className="text-gray-300 font-mono">1.2s</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500">Compute Cost</span>
                            <span className="text-gray-300 font-mono">$0.002</span>
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
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => triggerAction('Opening Command Menu...')} className="w-9 h-9 rounded-full bg-[#121c16] border border-[#233529] flex items-center justify-center text-gray-400 hover:text-white transition-colors shadow-inner"><Menu size={16} /></button>
                  <div className="text-gray-200 font-bold tracking-widest flex items-center gap-3 text-sm"><div className="w-2 h-2 bg-[#c5f82a] rounded-full shadow-[0_0_8px_#c5f82a]"></div>SRE <span className="text-gray-600 font-normal mx-1">/</span> ANALYTICS</div>
                </div>
                <div className="flex items-center gap-5">
                  <Wifi size={18} className="text-gray-400 cursor-pointer hover:text-[#c5f82a] transition-colors" onClick={() => triggerAction('Network Status: Optimal')} />
                  <User size={18} className="text-gray-400 cursor-pointer hover:text-[#c5f82a] transition-colors" onClick={() => triggerAction('User Profile Settings')} />
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-6 min-h-0">
                <div className="grid grid-cols-4 gap-6 shrink-0">
                  <KPICard title="Total Processed" value={kpis.total_processed.toLocaleString()} sparklineData={{ path: "M0,30 L0,20 Q10,10 20,20 T40,25 T60,15 T80,25 T100,5 L100,30 Z", line: "M0,20 Q10,10 20,20 T40,25 T60,15 T80,25 T100,5" }} />
                  <KPICard title="Churn Prevented" value={kpis.churn_prevented} badge="+2.2%" sparklineData={{ path: "M0,30 L0,25 Q20,25 40,20 T80,15 T100,10 L100,30 Z", line: "M0,25 Q20,25 40,20 T80,15 T100,10" }} />
                  <KPICard title="Avg Improvement" value={(parseFloat(kpis.churn_prevented) / 10).toFixed(2) + "x"} badge="LIVE" sparklineData={{ path: "M0,30 L0,20 Q30,22 50,20 T100,22 L100,30 Z", line: "M0,20 Q30,22 50,20 T100,22" }} />
                  <KPICard title="Active Customers" value={kpis.active_users.toLocaleString()} badge="REAL" sparklineData={{ path: "M0,30 L0,25 Q20,28 40,25 T80,22 T100,15 L100,30 Z", line: "M0,25 Q20,28 40,25 T80,22 T100,15" }} />
                </div>
                <div className="grid grid-cols-3 gap-6 h-64 shrink-0"><DonutChart /><BarChart /><Heatmap /></div>
                <div className="grid grid-cols-3 gap-6 flex-1 min-h-0 pb-6"><ModelCard name="GPT-4o" latency="142ms" accuracy="94.2%" accLabel="Accuracy" /><ModelCard name="Llama-3-8B" latency="48ms" accuracy="89.7%" /><FeatureImportance /></div>
              </div>
            </div>
          )}

          {activeTab === 'Escalations' && (
            <div className="flex flex-col h-full bg-[#070c08]/80 backdrop-blur-2xl rounded-3xl border border-[#1a281e] p-6 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="text-gray-200 font-bold tracking-widest flex items-center text-sm">SENTIENT RETENTION ENGINE <span className="text-gray-600 font-normal mx-3">|</span> <span className="text-gray-400 font-normal">Human Handoff Queue</span></div>
                  <div className="bg-[#c5f82a] text-[#0a110b] px-3 py-1 rounded-full font-bold text-[10px] tracking-wider shadow-[0_0_10px_rgba(197,248,42,0.2)]">{escalations.length} Active</div>
                </div>
                <div className="flex items-center gap-5">
                  <button onClick={() => triggerAction('Opening Calendar...')} className="text-gray-500 hover:text-white transition-colors"><Settings size={18} /></button>
                  <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-gray-500 hover:text-white transition-colors"><Bell size={18} /><span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-2 border-[#070c08] bg-red-500 rounded-full"></span></button>
                </div>
              </div>

              <div className="flex gap-8 flex-1 min-h-0">
                <div className="w-5/12 flex flex-col h-full">
                  <div className="mb-6 shrink-0">
                    <form onSubmit={e => { e.preventDefault(); handleManualSearch(searchId, setSelectedEscalation); }} className="relative group">
                      <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="Manual Search (Customer ID)..." className="w-full bg-[#0f1712]/50 border border-[#1a281e] rounded-xl py-3 pl-11 pr-4 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#c5f82a]/40 focus:bg-[#0f1712]/80 transition-all shadow-inner" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#c5f82a] transition-colors">{isSearching ? <div className="w-4 h-4 border-2 border-[#c5f82a]/30 border-t-[#c5f82a] rounded-full animate-spin" /> : <Search size={16} />}</div>
                      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#c5f82a]/10 hover:bg-[#c5f82a]/20 text-[#c5f82a] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-[#c5f82a]/20 transition-all hover:scale-105 active:scale-95">Search</button>
                    </form>
                  </div>

                  <div className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-widest">Active Escalations</div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {escalations.length > 0 ? escalations.map(esc => (
                      <EscalationCard key={esc.id} {...esc} onViewDetails={() => setSelectedEscalation(esc)} onTakeOwnership={async id => {
                        const esc = escalations.find(e => e.id === id);
                        if (!esc) return;
                        const userId = esc.userId || `user_${id.slice(-3).toLowerCase()}`;
                        let claimedEsc = { ...esc, claimed_at: new Date().toISOString(), specialist_name: 'On-Call Specialist' };
                        try {
                          const res = await fetch('http://localhost:8000/api/v1/escalations/claim', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ escalation_id: id, user_id: userId, specialist_id: 'specialist_001', specialist_name: 'On-Call Specialist', churn_risk: esc.churnRisk || 0.85 })
                          });
                          const data = await res.json();
                          if (res.ok) claimedEsc = { ...claimedEsc, claimed_at: data.claimed_at || claimedEsc.claimed_at, action_id: data.action_id };
                        } catch (err) { console.warn('Claim offline:', err); }
                        setEscalations(prev => prev.filter(e => e.id !== id));
                        setClaimedEscalations(prev => [claimedEsc, ...prev]);
                        setActiveSpecialistCase(claimedEsc);
                      }} />
                    )) : <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 opacity-50"><Activity size={48} /><div className="text-xs font-semibold tracking-widest uppercase">No Active Escalations</div></div>}
                  </div>

                  {claimedEscalations.length > 0 && (
                    <div className="mt-4 shrink-0">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#c5f82a] shadow-[0_0_6px_#c5f82a]"></div>My Tasks — Claimed ({claimedEscalations.length})</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {claimedEscalations.map((item, i) => (
                          <div key={item.id || i} className="bg-[#0f1712]/60 border border-[#c5f82a]/20 rounded-xl p-3 flex items-center justify-between group hover:border-[#c5f82a]/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-[#c5f82a]/60"></div>
                              <div>
                                <div className="text-gray-200 font-mono text-[11px] font-bold">{item.id || item.user_id}</div>
                                <div className="text-gray-500 text-[10px] mt-0.5">Claimed {item.claimed_at ? new Date(item.claimed_at).toLocaleTimeString() : 'just now'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#c5f82a]/10 text-[#c5f82a] border border-[#c5f82a]/20 uppercase tracking-wider">In Progress</span>
                              <button onClick={() => { /* Handle resolve */ }} className="text-gray-600 hover:text-green-400 transition-colors text-[10px] font-bold uppercase tracking-wider hover:bg-green-400/10 px-2 py-1 rounded-lg">Resolve</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-7/12 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 uppercase tracking-widest"><span className="text-sm font-bold text-gray-200">Chain of Thought Stream</span><span className="text-gray-600">//</span><span className="text-xs font-bold text-[#c5f82a] drop-shadow-[0_0_5px_rgba(197,248,42,0.5)]">LIVE</span></div>
                  <ChainOfThoughtTerminal logs={terminalText} />
                  <AuditLogTable logs={auditLogs} />
                </div>
              </div>
            </div>
          )}
        </div>

        {notification && (
          <div className="fixed bottom-10 right-10 z-[1000] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-[#c5f82a] text-[#0a110b] px-6 py-3 rounded-2xl font-bold text-sm shadow-[0_0_30px_rgba(197,248,42,0.4)] flex items-center gap-3"><Activity size={18} className="animate-pulse" />{notification}</div>
          </div>
        )}

        <EscalationDetailsModal escalation={selectedEscalation} onClose={() => setSelectedEscalation(null)} triggerAction={triggerAction} />
        {activeSpecialistCase && <SpecialistDashboard escalation={activeSpecialistCase} onClose={() => setActiveSpecialistCase(null)} onResolved={id => triggerAction(`Case ${id} resolved`)} />}
      </div>
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a281e; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a4230; }`}} />
    </div>
  );
};

export default Dashboard;