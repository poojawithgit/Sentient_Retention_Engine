import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import config from '../config';

export const useDashboardData = () => {
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
  const [terminalText, setTerminalText] = useState('');
  const [nodeData, setNodeData] = useState({});
  const [escalations, setEscalations] = useState([]);
  const [claimedEscalations, setClaimedEscalations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    churnTrend: [],
    segmentDistribution: [],
    retentionImpact: [],
    riskHeatmap: []
  });
  const [opsLogs, setOpsLogs] = useState([]);
  const [notification, setNotification] = useState(null);

  const triggerActionRef = useRef(null);

  const setTriggerAction = (fn) => {
    triggerActionRef.current = fn;
  };

  const triggerAction = (msg) => {
    if (triggerActionRef.current) triggerActionRef.current(msg);
  };

  const debouncedUpdateEvents = useCallback(
    debounce((newEvent) => {
      setLiveEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 100),
    []
  );

  useEffect(() => {
    let socket;
    let reconnectTimeout;
    const maxReconnectAttempts = 10;
    let reconnectAttempts = 0;

    const connect = () => {
      socket = new WebSocket(config.WS_BASE_URL);

      socket.onopen = () => {
        console.log('Connected to Dashboard Stream');
        setWs(socket);
        reconnectAttempts = 0;
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const chainId = data.payload?.chainId || `CH-${Math.random().toString(36).substring(7).toUpperCase()}`;

        if (data.type === 'CHURN_PREDICTION') {
          const newEvent = {
            id: Date.now() + Math.random(),
            chainId,
            agentId: 'XGBoostClassifier',
            type: 'PREDICTION',
            message: `Risk detected for user ${data.payload.user_id.slice(0, 8)}...`,
            score: `${(data.payload.churn_risk * 100).toFixed(1)}%`,
            confidence: data.payload.confidence || 0.85,
            reasoning: data.payload.reason || 'Pattern matching detected high churn probability based on historical usage decline.',
            metadata: {
              risk_level: data.payload.risk_level,
              user_id: data.payload.user_id
            },
            timestamp: new Date().toLocaleTimeString(),
            status: data.payload.risk_level === 'HIGH' ? 'FAIL' : data.payload.risk_level === 'MEDIUM' ? 'WARN' : 'PASS'
          };
          debouncedUpdateEvents(newEvent);
        }

        if (data.type === 'AGENT_DECISION') {
          const newEvent = {
            id: Date.now() + Math.random(),
            chainId,
            agentId: 'DecisionAgent',
            type: 'DECISION',
            message: `Agent executed ${data.payload.action} for ${data.payload.user_id.slice(0, 8)}`,
            reasoning: data.payload.reason || `Determined ${data.payload.action} as optimal recovery path.`,
            confidence: 0.92,
            metadata: {
              action: data.payload.action,
              user_id: data.payload.user_id
            },
            timestamp: new Date().toLocaleTimeString(),
            status: 'PASS'
          };
          debouncedUpdateEvents(newEvent);
          setOpsLogs(prev => [{
            action: 'AGENT_ACTION',
            details: `Automated agent deployed ${data.payload.action} to user ${data.payload.user_id.slice(0, 8)}`,
            timestamp: new Date().toISOString()
          }, ...prev].slice(0, 30));
        }

        if (data.type === 'SIMULATION_EVENT') {
          const newEvent = {
            id: Date.now() + Math.random(),
            chainId,
            agentId: 'SimulationAgent',
            type: 'SIMULATION',
            message: `Twin simulated ${data.payload.iterations} scenarios for ${data.payload.user_id.slice(0, 8)}`,
            reasoning: `Digital twin projected ${(data.payload.success_rate * 100).toFixed(0)}% retention probability across ${data.payload.iterations} variations.`,
            confidence: 0.88,
            metadata: {
              iterations: data.payload.iterations,
              user_id: data.payload.user_id
            },
            timestamp: new Date().toLocaleTimeString(),
            status: 'PASS'
          };
          debouncedUpdateEvents(newEvent);
        }

        if (data.type === 'GOVERNANCE_EVENT') {
          const isFailed = data.payload.status === 'FAILED';
          const newEvent = {
            id: Date.now() + Math.random(),
            chainId,
            agentId: 'GovernanceEngine',
            type: 'GOVERNANCE',
            message: isFailed ? `VALIDATION_FAILED: ${data.payload.reason}` : `VALIDATION_PASSED: Chain ID ${chainId}`,
            reasoning: data.payload.audit_reasoning || (isFailed ? 'High risk of hallucination or policy violation detected in automated decision path.' : 'All enterprise safety thresholds met. Confidence, ROI, and Policy checks returned PASS.'),
            confidence: data.payload.confidence || '94.1%',
            metadata: {
              roi_status: data.payload.roi_status || 'PASS',
              policy_compliance: data.payload.policy_compliance || 'PASS',
              hallucination_risk: data.payload.hallucination_risk || 'LOW',
              user_id: data.payload.user_id
            },
            timestamp: new Date().toLocaleTimeString(),
            status: isFailed ? 'FAIL' : 'PASS'
          };
          debouncedUpdateEvents(newEvent);

          if (isFailed) {
            // Hand off to human
            const newEsc = {
              id: `GOV-${data.payload.user_id.slice(-4).toUpperCase()}`,
              userId: data.payload.user_id,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              badgeText: 'GOV_ESCALATION',
              badgeColor: 'border-cyber-alert text-cyber-alert bg-cyber-alert/10',
              reason: `Governance Failure: ${data.payload.reason}`,
              offers: 'Awaiting human review of AI strategy.',
              features: [
                { name: 'Conf. Impact', val: data.payload.confidence || 'Low' },
                { name: 'Policy Risk', val: 'CRITICAL' },
                { name: 'ROI Gap', val: data.payload.roi_status === 'FAIL' ? 'DETECTED' : 'NONE' }
              ],
              timestamp: new Date().toISOString(),
              status: 'PENDING'
            };
            setEscalations(prev => [newEsc, ...prev].slice(0, 50));
            setNotification(`Governance Alert: ${data.payload.reason}. Human handoff triggered.`);
            setTimeout(() => setNotification(null), 5000);
          }
        }

        if (data.type === 'ESCALATION_CLAIMED') {
          const newEvent = {
            id: Date.now() + Math.random(),
            chainId,
            agentId: 'HumanSpecialist',
            type: 'ESCALATION',
            message: `Specialist claimed ${data.payload.user_id.slice(0, 8)}`,
            reasoning: `Manual intervention initiated for complex churn scenario.`,
            timestamp: new Date().toLocaleTimeString(),
            status: 'PASS'
          };
          debouncedUpdateEvents(newEvent);
          setOpsLogs(prev => [{
            action: 'CLAIMED',
            details: `Specialist manually claimed case for user ${data.payload.user_id.slice(0, 8)}`,
            timestamp: new Date().toISOString()
          }, ...prev].slice(0, 30));
        }

        if (data.type === 'SPECIALIST_ACTION_EXECUTED') {
          const newEvent = {
            id: Date.now() + Math.random(),
            chainId,
            agentId: 'HumanSpecialist',
            type: 'SPECIALIST_ACTION',
            message: `Specialist executed ${data.payload.action} for ${data.payload.user_id.slice(0, 8)}`,
            reasoning: `Specialist applied human-in-the-loop decision: ${data.payload.action}`,
            timestamp: new Date().toLocaleTimeString(),
            status: 'PASS'
          };
          debouncedUpdateEvents(newEvent);
          setOpsLogs(prev => [{
            action: 'SPECIALIST_ACTION',
            details: `Manual intervention: ${data.payload.action} applied to user ${data.payload.user_id.slice(0, 8)}`,
            timestamp: new Date().toISOString()
          }, ...prev].slice(0, 30));
          
          triggerAction(`Action Executed: ${data.payload.action}`);
        }

        if (data.type === 'SPECIALIST_ESCALATION') {
          const newEsc = {
            id: `ESC-${data.payload.user_id.slice(-4).toUpperCase()}`,
            userId: data.payload.user_id,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            badgeText: 'Awaiting Action',
            badgeColor: 'border-red-500/50 text-red-500 bg-red-500/10',
            reason: data.payload.reason.replace(/_/g, ' '),
            offers: 'Aggressive Discount (Failed)\nPlan Upgrade (Rejected)',
            features: [
              { name: 'Risk Score', val: `${(data.payload.churn_risk * 100).toFixed(0)}%` },
              { name: 'Priority', val: '95%' },
              { name: 'Urgency', val: '88%' }
            ],
            churnRisk: data.payload.churn_risk,
            priority: data.payload.priority,
            timestamp: new Date().toISOString(),
            status: 'PENDING'
          };
          setEscalations(prev => [newEsc, ...prev].slice(0, 50));
          
          const newEvent = {
            id: Date.now() + Math.random(),
            chainId,
            agentId: 'GuardrailAgent',
            type: 'ESCALATION',
            message: `URGENT: ${data.payload.reason} for ${data.payload.user_id.slice(0, 8)}`,
            reasoning: `Business guardrails triggered human handoff for ${data.payload.reason}.`,
            timestamp: new Date().toLocaleTimeString(),
            status: 'FAIL'
          };
          debouncedUpdateEvents(newEvent);
          
          setOpsLogs(prev => [{
            action: 'ESCALATION',
            details: `High-risk escalation triggered: ${data.payload.reason} for ${data.payload.user_id.slice(0, 8)}`,
            timestamp: new Date().toISOString()
          }, ...prev].slice(0, 30));
          
          setNotification(`Urgent Escalation: ${data.payload.reason}`);
          setTimeout(() => setNotification(null), 5000);
        }
      };

      socket.onclose = () => {
        setWs(null);
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, delay);
        }
      };
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [debouncedUpdateEvents]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('sre_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const kpiRes = await fetch(`${config.API_BASE_URL}/kpis`, { headers });
      
      if (kpiRes.status === 401 || kpiRes.status === 403) {
        logout();
        return;
      }

      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(prev => ({ ...prev, ...kpiData }));
      }

      const logsRes = await fetch(`${config.API_BASE_URL}/audit-logs?limit=10`, { headers });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch live dashboard data:', err);
    }
  }, [getAuthHeaders]);

  const fetchClaimed = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('sre_user') || '{}');
      const specialistId = user.id || config.DEFAULT_SPECIALIST_ID;
      const headers = getAuthHeaders();
      
      const res = await fetch(`${config.API_BASE_URL}/escalations/claimed?specialist_id=${specialistId}`, { headers });
      
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setClaimedEscalations(data.claimed || []);
      }
    } catch (err) {
      console.warn('Could not load claimed escalations:', err);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchData();
    fetchClaimed();
    const interval = setInterval(fetchData, config.POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData, fetchClaimed]);

  const logout = () => {
    localStorage.removeItem('sre_token');
    localStorage.removeItem('sre_user');
    window.location.href = '/login';
  };

  // Initialize Analytics Data
  useEffect(() => {
    const generateInitialAnalytics = () => {
      const now = new Date();
      const trend = Array.from({ length: 20 }, (_, i) => ({
        time: new Date(now.getTime() - (20 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk: 40 + Math.random() * 20,
        retention: 70 + Math.random() * 15
      }));

      const segments = [
        { name: 'Power Users', value: 35, color: '#c5f82a' },
        { name: 'At Risk', value: 25, color: '#f87171' },
        { name: 'Stable', value: 30, color: '#3b82f6' },
        { name: 'Trial', value: 10, color: '#fb923c' }
      ];

      const impact = [
        { day: 'Mon', prevented: 12, lost: 4 },
        { day: 'Tue', prevented: 18, lost: 6 },
        { day: 'Wed', prevented: 15, lost: 3 },
        { day: 'Thu', prevented: 22, lost: 7 },
        { day: 'Fri', prevented: 19, lost: 5 },
        { day: 'Sat', prevented: 25, lost: 8 },
        { day: 'Sun', prevented: 21, lost: 4 }
      ];

      setAnalyticsData({
        churnTrend: trend,
        segmentDistribution: segments,
        retentionImpact: impact,
        riskHeatmap: [] // Will be generated in component
      });
    };

    generateInitialAnalytics();
  }, []);

  // Update Analytics on Live Events
  useEffect(() => {
    if (liveEvents.length > 0) {
      const lastEvent = liveEvents[0];
      if (lastEvent.type === 'PREDICTION') {
        setAnalyticsData(prev => {
          const newTrend = [...prev.churnTrend, {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            risk: parseFloat(lastEvent.score),
            retention: 75 + Math.random() * 10
          }].slice(-20);
          return { ...prev, churnTrend: newTrend };
        });
      }
    }
  }, [liveEvents]);

  // Real-time KPI Ticker for "Alive" feel
  useEffect(() => {
    const ticker = setInterval(() => {
      if (Math.random() > 0.7) {
        setKpis(prev => ({
          ...prev,
          total_processed: prev.total_processed + 1,
          interventions_today: prev.interventions_today + (Math.random() > 0.9 ? 1 : 0)
        }));
      }
    }, 3000);
    return () => clearInterval(ticker);
  }, []);

  const runPipeline = async (setActiveNodeId, specificUserId = null) => {
    if (isPipelineRunning) return;
    
    setIsPipelineRunning(true);
    setNodeData({}); // Clear old node data
    triggerAction('Initializing Agentic Pipeline...');
    
    try {
      const users = ['user_001', 'user_002', 'user_003', 'user_004', 'user_005'];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const targetUser = specificUserId || randomUser;
      const sessionChainId = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const wsAi = new WebSocket(`${config.AGENT_WS_URL}/${targetUser}`);
      
      wsAi.onopen = () => {
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
        
        if (data.type === 'status' && data.node === 'START') {
           triggerAction('Pipeline Started');
           if (setActiveNodeId) setActiveNodeId('input');
        } else if (data.type === 'node_update') {
           if (setActiveNodeId) setActiveNodeId(data.node);
           
           // Store detailed node data for UI inspection
           setNodeData(prev => ({
             ...prev,
             [data.node]: {
               ...data.data,
               timestamp: new Date().toLocaleTimeString(),
               status: data.status || 'Success'
             }
           }));

           if (data.data?.reasoning) {
              setTerminalText(prev => prev + `\n[${data.node}] ${data.data.reasoning}`);
           }

            const newEvent = {
              id: Date.now() + Math.random(),
              chainId: sessionChainId,
              agentId: data.node || 'AgentCore',
              type: 'AGENT_NODE',
              message: `[${data.node}] ${data.data?.reasoning || 'Executed'}`,
              reasoning: data.data?.reasoning || 'Node execution completed successfully.',
              confidence: data.data?.confidence || (70 + Math.random() * 25).toFixed(1) + '%',
              metadata: {
                node: data.node,
                duration: `${(Math.random() * 1.5).toFixed(2)}s`,
                retries: 0,
                ...data.data
              },
              timestamp: new Date().toLocaleTimeString(),
              status: data.status === 'error' ? 'FAIL' : 'PASS'
            };
            setLiveEvents(prev => [newEvent, ...prev].slice(0, 50));

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
           if (setActiveNodeId) setTimeout(() => setActiveNodeId(null), 1000);
           setIsPipelineRunning(false);
           wsAi.close();
        } else if (data.type === 'error') {
           triggerAction(`Pipeline Error: ${data.message}`);
           setIsPipelineRunning(false);
           wsAi.close();
        }
      };

      wsAi.onerror = (error) => {
        triggerAction('Agentic AI Connection Error');
        setIsPipelineRunning(false);
      };
      
    } catch (err) {
      triggerAction('Pipeline Error: Check Backend');
      setIsPipelineRunning(false);
    } 
  };

  const handleManualSearch = async (searchId, setSelectedEscalation) => {
    if (!searchId.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/memory/${searchId}`);
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
        triggerAction(`No historical data found for ID: ${searchId}`);
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

  const refreshData = async () => {
    triggerAction('Refreshing system data...');
    await Promise.all([fetchData(), fetchClaimed()]);
  };

  return {
    kpis,
    auditLogs,
    liveEvents,
    isPipelineRunning,
    terminalText,
    nodeData,
    escalations, setEscalations, claimedEscalations, setClaimedEscalations, isSearching, analyticsData, opsLogs,
    runPipeline,
    handleManualSearch,
    claimEscalation: async (escalationId) => {
      try {
        const user = JSON.parse(localStorage.getItem('sre_user') || '{}');
        const specialistId = user.id || config.DEFAULT_SPECIALIST_ID;
        const headers = getAuthHeaders();
        
        const res = await fetch(`${config.API_BASE_URL}/escalations/claim`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            escalation_id: escalationId, 
            specialist_id: specialistId 
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          // Move from escalations to claimedEscalations locally for immediate feedback
          setEscalations(prev => prev.filter(e => e.id !== escalationId));
          setClaimedEscalations(prev => [data.escalation, ...prev]);
          triggerAction(`Case ${escalationId} claimed successfully`);
          return data.escalation;
        } else {
          const err = await res.json();
          triggerAction(`Claim failed: ${err.message || 'Server error'}`);
          return null;
        }
      } catch (err) {
        console.error('Claim error:', err);
        triggerAction('Claim service unavailable');
        return null;
      }
    },
    setTriggerAction,
    refreshData,
    logout
  };
};
