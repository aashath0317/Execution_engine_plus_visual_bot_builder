import { useState, useCallback, useRef } from 'react';
import { NODE_REGISTRY } from './nodeTypes';

let nodeIdCounter = 1;

const createNode = (type, x, y) => {
  const def = NODE_REGISTRY[type];
  if (!def) return null;
  return {
    id: `node-${nodeIdCounter++}`,
    type,
    x,
    y,
    config: { ...def.defaults },
  };
};

export const useCanvasState = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [connecting, setConnecting] = useState(null); // { nodeId, port, portType: 'output' }
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [strategyName, setStrategyName] = useState('Untitled Strategy');

  // Add node
  const addNode = useCallback((type, x, y) => {
    const node = createNode(type, x, y);
    if (node) setNodes(prev => [...prev, node]);
    return node;
  }, []);

  // Move single node
  const moveNode = useCallback((id, x, y) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  }, []);

  // Update multiple nodes at once
  const updateNodesPosition = useCallback((updates) => {
    setNodes(prev => prev.map(n => updates[n.id] ? { ...n, x: updates[n.id].x, y: updates[n.id].y } : n));
  }, []);

  // Delete multiple nodes
  const deleteNodes = useCallback((ids) => {
    setNodes(prev => prev.filter(n => !ids.includes(n.id)));
    setConnections(prev => prev.filter(c => !ids.includes(c.fromNode) && !ids.includes(c.toNode)));
    setSelectedNodeIds(prev => prev.filter(id => !ids.includes(id)));
  }, []);

  // Delete single node (legacy support)
  const deleteNode = useCallback((id) => {
    deleteNodes([id]);
  }, [deleteNodes]);

  // Select node logic
  const selectNode = useCallback((id, multi = false) => {
    setSelectedNodeIds(prev => {
      if (multi) {
        return prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id];
      }
      return [id];
    });
  }, []);

  const setSelection = useCallback((ids) => {
    setSelectedNodeIds(ids);
  }, []);

  // Update node config
  const updateNodeConfig = useCallback((id, key, value) => {
    setNodes(prev => prev.map(n =>
      n.id === id ? { ...n, config: { ...n.config, [key]: value } } : n
    ));
  }, []);

  // Start connecting
  const startConnect = useCallback((nodeId, port, portType) => {
    setConnecting({ nodeId, port, portType });
  }, []);

  // Finish connecting
  const finishConnect = useCallback((nodeId, port, portType) => {
    if (!connecting) return;

    // Must connect output → input
    const from = connecting.portType === 'output' ? connecting : { nodeId, port, portType };
    const to = connecting.portType === 'output' ? { nodeId, port, portType } : connecting;

    if (from.portType !== 'output' || to.portType !== 'input') {
      setConnecting(null);
      return;
    }

    // No self-connections
    if (from.nodeId === to.nodeId) {
      setConnecting(null);
      return;
    }

    // No duplicate connections
    const exists = connections.some(
      c => c.fromNode === from.nodeId && c.fromPort === from.port &&
        c.toNode === to.nodeId && c.toPort === to.port
    );

    if (!exists) {
      setConnections(prev => [...prev, {
        id: `conn-${Date.now()}`,
        fromNode: from.nodeId,
        fromPort: from.port,
        toNode: to.nodeId,
        toPort: to.port,
      }]);
    }
    setConnecting(null);
  }, [connecting, connections]);

  // Cancel connecting
  const cancelConnect = useCallback(() => {
    setConnecting(null);
  }, []);

  // Delete connection
  const deleteConnection = useCallback((connId) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeIds([]);
    setConnecting(null);
  }, []);

  // Save to localStorage
  const saveStrategy = useCallback(() => {
    const data = { name: strategyName, nodes, connections };
    localStorage.setItem('fydblock_strategy', JSON.stringify(data));
  }, [strategyName, nodes, connections]);

  // Load from localStorage
  const loadStrategy = useCallback(() => {
    try {
      const raw = localStorage.getItem('fydblock_strategy');
      if (!raw) return false;
      const data = JSON.parse(raw);
      setStrategyName(data.name || 'Untitled Strategy');
      setNodes(data.nodes || []);
      setConnections(data.connections || []);
      // Update counter to avoid ID collisions
      const maxId = (data.nodes || []).reduce((max, n) => {
        const num = parseInt(n.id.replace('node-', ''));
        return num > max ? num : max;
      }, 0);
      nodeIdCounter = maxId + 1;
      return true;
    } catch {
      return false;
    }
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 0.1, 2)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 0.1, 0.3)), []);
  const resetZoom = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const selectedNode = selectedNodeIds.length === 1 ? nodes.find(n => n.id === selectedNodeIds[0]) : null;

  return {
    nodes, connections, selectedNode, selectedNodeIds, connecting,
    pan, zoom, strategyName,
    setPan, setZoom, setStrategyName, setNodes, setConnections,
    selectNode, setSelection, setSelectedNodeIds,
    addNode, moveNode, updateNodesPosition, deleteNode, deleteNodes, updateNodeConfig,
    startConnect, finishConnect, cancelConnect, deleteConnection,
    clearCanvas, saveStrategy, loadStrategy,
    zoomIn, zoomOut, resetZoom,
  };
};
