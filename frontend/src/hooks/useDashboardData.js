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

        if (data.type === 'CHURN_PREDICTION') {
          const newEvent = {
            id: Date.now(),
            type: 'PREDICTION',
            message: `High risk detected for user ${data.payload.user_id.slice(0, 8)}...`,
            timestamp: new Date().toLocaleTimeString(),
            status: data.payload.risk_level === 'HIGH' ? 'FAIL' : 'PASS'
          };
          debouncedUpdateEvents(newEvent);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kpiRes = await fetch(`${config.API_BASE_URL}/kpis`);
        const kpiData = await kpiRes.json();
        setKpis(kpiData);

        const logsRes = await fetch(`${config.API_BASE_URL}/audit-logs?limit=10`);
        const logsData = await logsRes.json();
        setAuditLogs(logsData.logs || []);
      } catch (err) {
        console.error('Failed to fetch live dashboard data:', err);
      }
    };

    const fetchClaimed = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/escalations/claimed?specialist_id=${config.DEFAULT_SPECIALIST_ID}`);
        const data = await res.json();
        setClaimedEscalations(data.claimed || []);
      } catch (err) {
        console.warn('Could not load claimed escalations:', err);
      }
    };

    fetchData();
    fetchClaimed();
    const interval = setInterval(fetchData, config.POLLING_INTERVAL);
    return () => clearInterval(interval);
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
              type: 'AGENT_NODE',
              message: `[${data.node}] ${data.data?.reasoning || 'Executed'}`,
              timestamp: new Date().toLocaleTimeString(),
              status: 'PASS'
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

  return {
    kpis,
    auditLogs,
    liveEvents,
    isPipelineRunning,
    terminalText,
    nodeData,
    escalations,
    setEscalations,
    claimedEscalations,
    isSearching,
    runPipeline,
    handleManualSearch,
    setTriggerAction
  };
};
