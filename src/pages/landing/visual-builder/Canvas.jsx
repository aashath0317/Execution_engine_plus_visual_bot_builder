import React, { useRef, useCallback, useState, useEffect } from 'react';
import { NODE_REGISTRY } from './nodeTypes';

// ─── Port dimensions ───
const PORT_RADIUS = 6;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 64;
const PORT_Y_OFFSET = NODE_HEIGHT / 2;

// Get port positions for a node
const getOutputPortPos = (node, portIndex, totalPorts) => {
  const spacing = NODE_HEIGHT / (totalPorts + 1);
  return {
    x: node.x + NODE_WIDTH + 2,
    y: node.y + spacing * (portIndex + 1),
  };
};

const getInputPortPos = (node, portIndex, totalPorts) => {
  const spacing = NODE_HEIGHT / (totalPorts + 1);
  return {
    x: node.x - 2,
    y: node.y + spacing * (portIndex + 1),
  };
};

// ─── Bezier path between two points ───
const bezierPath = (x1, y1, x2, y2) => {
  const dx = Math.abs(x2 - x1) * 0.5;
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
};

// ─── Single Port circle ───
const Port = ({ x, y, color, type, onMouseDown, onMouseUp, isConnecting }) => (
  <g>
    {/* Hit area */}
    <circle
      cx={x}
      cy={y}
      r={PORT_RADIUS + 4}
      fill="transparent"
      className="cursor-crosshair"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    />
    {/* Visual */}
    <circle
      cx={x}
      cy={y}
      r={PORT_RADIUS}
      fill={isConnecting ? color : `${color}30`}
      stroke={color}
      strokeWidth={1.5}
      className="pointer-events-none transition-all duration-200"
    />
    {/* Glow when connecting */}
    {isConnecting && (
      <circle
        cx={x}
        cy={y}
        r={PORT_RADIUS + 3}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.3}
        className="pointer-events-none"
      >
        <animate attributeName="r" values={`${PORT_RADIUS + 3};${PORT_RADIUS + 8};${PORT_RADIUS + 3}`} dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
    )}
  </g>
);

// ─── Single Canvas Node ───
const CanvasNode = ({
  node, def, isSelected, isConnecting,
  onSelect, onDragStart, onPortMouseDown, onPortMouseUp,
}) => {
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(node.id, e.shiftKey);
    onDragStart(node.id, e);
  };

  return (
    <g>
      {/* Node body */}
      <foreignObject x={node.x} y={node.y} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div
          onMouseDown={handleMouseDown}
          className={`w-full h-full rounded-xl backdrop-blur-md cursor-move select-none transition-all duration-300 flex items-center gap-3 px-3 relative overflow-hidden ${isSelected
              ? 'shadow-2xl scale-[1.02]'
              : 'hover:shadow-xl hover:scale-[1.01]'
            }`}
          style={{
            backgroundColor: 'rgba(14, 20, 24, 0.85)', // Lighter glass matching dashboard cards
            boxShadow: isSelected ? `0 0 30px ${def.color}20` : 'none',
            border: isSelected ? `2px solid ${def.color}` : `1.5px solid ${def.color}aa`,
          }}
        >
          {/* Subtle colored glow inside the node */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: `linear-gradient(135deg, ${def.color}, transparent 60%)` }} 
          />
          
          {/* Left glowing edge */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ backgroundColor: def.color, boxShadow: `0 0 10px ${def.color}` }}
          />

          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-inner z-10"
            style={{ backgroundColor: `${def.color}15`, border: `1px solid ${def.color}30` }}
          >
            <def.icon size={14} style={{ color: def.color }} />
          </div>
          <div className="min-w-0 flex-1 z-10">
            <p className="text-gray-100 text-[11px] font-extrabold tracking-wide truncate drop-shadow-md">{def.label}</p>
            <p className="text-gray-400 text-[9px] font-medium truncate mt-0.5">
              {Object.values(node.config)[0]?.toString() || def.category}
            </p>
          </div>
        </div>
      </foreignObject>

      {/* Input ports */}
      {def.inputs.map((port, i) => {
        const pos = getInputPortPos(node, i, def.inputs.length);
        return (
          <Port
            key={`in-${port}`}
            x={pos.x}
            y={pos.y}
            color="#00A3FF"
            type="input"
            isConnecting={isConnecting}
            onMouseDown={(e) => { e.stopPropagation(); onPortMouseDown(node.id, port, 'input'); }}
            onMouseUp={(e) => { e.stopPropagation(); onPortMouseUp(node.id, port, 'input'); }}
          />
        );
      })}

      {/* Output ports */}
      {def.outputs.map((port, i) => {
        const pos = getOutputPortPos(node, i, def.outputs.length);
        return (
          <Port
            key={`out-${port}`}
            x={pos.x}
            y={pos.y}
            color="#00FF9D"
            type="output"
            isConnecting={isConnecting}
            onMouseDown={(e) => { e.stopPropagation(); onPortMouseDown(node.id, port, 'output'); }}
            onMouseUp={(e) => { e.stopPropagation(); onPortMouseUp(node.id, port, 'output'); }}
          />
        );
      })}
    </g>
  );
};

// ─── Main Canvas ───
const Canvas = ({
  nodes, connections, selectedNodeIds, connecting,
  pan, zoom, setPan, setZoom,
  addNode, moveNode, updateNodesPosition, selectNode, setSelection,
  startConnect, finishConnect, cancelConnect,
  deleteConnection, deleteNodes,
}) => {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null); // { startX, startY, initialPositions: { id: {x,y} } }
  const [panning, setPanning] = useState(null); // { startX, startY, panStartX, panStartY }
  const [marquee, setMarquee] = useState(null); // { startX, startY, currentX, currentY }
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Convert screen coords to canvas coords
  const screenToCanvas = useCallback((screenX, screenY) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // ─── Drop from library ───
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    if (!nodeType) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    addNode(nodeType, pos.x - NODE_WIDTH / 2, pos.y - NODE_HEIGHT / 2);
  }, [addNode, screenToCanvas]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // ─── Node dragging ───
  const handleNodeDragStart = useCallback((nodeId, e) => {
    const draggedNodes = selectedNodeIds.includes(nodeId) ? selectedNodeIds : [nodeId];
    const initialPositions = {};
    draggedNodes.forEach(id => {
      const n = nodes.find(n => n.id === id);
      if (n) initialPositions[id] = { x: n.x, y: n.y };
    });

    setDragging({
      startX: e.clientX,
      startY: e.clientY,
      initialPositions,
    });
  }, [nodes, selectedNodeIds]);

  // ─── Canvas pan or Marquee ───
  const handleCanvasMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    if (e.target === svgRef.current || e.target.tagName === 'rect') {
      if (e.shiftKey) {
        const pos = screenToCanvas(e.clientX, e.clientY);
        setMarquee({ startX: pos.x, startY: pos.y, currentX: pos.x, currentY: pos.y });
        setSelection([]);
      } else {
        setSelection([]);
        cancelConnect();
        setPanning({
          startX: e.clientX,
          startY: e.clientY,
          panStartX: pan.x,
          panStartY: pan.y,
        });
      }
    }
  }, [pan, setSelection, cancelConnect, screenToCanvas]);

  // ─── Mouse move ───
  const handleMouseMove = useCallback((e) => {
    // Track mouse for connecting line
    if (connecting) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setMousePos(pos);
    }

    // Dragging node(s)
    if (dragging) {
      const dx = (e.clientX - dragging.startX) / zoom;
      const dy = (e.clientY - dragging.startY) / zoom;
      const updates = {};
      Object.entries(dragging.initialPositions).forEach(([id, pos]) => {
        updates[id] = { x: pos.x + dx, y: pos.y + dy };
      });
      updateNodesPosition(updates);
    }

    // Panning canvas
    if (panning) {
      const dx = e.clientX - panning.startX;
      const dy = e.clientY - panning.startY;
      setPan({
        x: panning.panStartX + dx,
        y: panning.panStartY + dy,
      });
    }

    // Marquee selection
    if (marquee) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setMarquee(prev => ({ ...prev, currentX: pos.x, currentY: pos.y }));

      const minX = Math.min(marquee.startX, pos.x);
      const maxX = Math.max(marquee.startX, pos.x);
      const minY = Math.min(marquee.startY, pos.y);
      const maxY = Math.max(marquee.startY, pos.y);

      const newlySelected = nodes.filter(n => {
        const cx = n.x + NODE_WIDTH / 2;
        const cy = n.y + NODE_HEIGHT / 2;
        return cx >= minX && cx <= maxX && cy >= minY && cy <= maxY;
      }).map(n => n.id);

      setSelection(newlySelected);
    }
  }, [connecting, dragging, panning, marquee, pan, zoom, screenToCanvas, updateNodesPosition, setPan, setSelection, nodes]);

  // ─── Mouse up ───
  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setPanning(null);
    setMarquee(null);
    finishConnect();
  }, [finishConnect]);

  // ─── Zoom with scroll ───
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(z => Math.min(Math.max(z + delta, 0.3), 2));
  }, [setZoom]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (selectedNodeIds.length > 0) {
          deleteNodes(selectedNodeIds);
        }
      }
      if (e.key === 'Escape') {
        cancelConnect();
        setSelection([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelConnect, setSelection, selectedNodeIds, deleteNodes]);

  // Attach global mouse events for dragging
  useEffect(() => {
    if (dragging || panning || connecting || marquee) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, panning, connecting, marquee, handleMouseMove, handleMouseUp]);

  // ─── Render connections ───
  const renderConnections = () => {
    return connections.map((conn) => {
      const fromNode = nodes.find(n => n.id === conn.fromNode);
      const toNode = nodes.find(n => n.id === conn.toNode);
      if (!fromNode || !toNode) return null;

      const fromDef = NODE_REGISTRY[fromNode.type];
      const toDef = NODE_REGISTRY[toNode.type];
      if (!fromDef || !toDef) return null;

      const fromIdx = fromDef.outputs.indexOf(conn.fromPort);
      const toIdx = toDef.inputs.indexOf(conn.toPort);
      if (fromIdx === -1 || toIdx === -1) return null;

      const from = getOutputPortPos(fromNode, fromIdx, fromDef.outputs.length);
      const to = getInputPortPos(toNode, toIdx, toDef.inputs.length);

      return (
        <g key={conn.id} className="group cursor-pointer" onClick={() => deleteConnection(conn.id)}>
          {/* Fat invisible hit area */}
          <path
            d={bezierPath(from.x, from.y, to.x, to.y)}
            fill="none"
            stroke="transparent"
            strokeWidth={12}
          />
          {/* Visible line */}
          <path
            d={bezierPath(from.x, from.y, to.x, to.y)}
            fill="none"
            stroke="#00FF9D"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            opacity={0.5}
            className="group-hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]"
          />
          {/* Animated flow dot */}
          <circle r={4} fill="#00FF9D" style={{ filter: 'drop-shadow(0 0 6px #00FF9D)' }}>
            <animateMotion dur="2s" repeatCount="indefinite" path={bezierPath(from.x, from.y, to.x, to.y)} />
          </circle>
        </g>
      );
    });
  };

  // ─── Render connecting line (in progress) ───
  const renderConnectingLine = () => {
    if (!connecting) return null;
    const node = nodes.find(n => n.id === connecting.nodeId);
    if (!node) return null;
    const def = NODE_REGISTRY[node.type];
    if (!def) return null;

    let startPos;
    if (connecting.portType === 'output') {
      const idx = def.outputs.indexOf(connecting.port);
      startPos = getOutputPortPos(node, idx, def.outputs.length);
    } else {
      const idx = def.inputs.indexOf(connecting.port);
      startPos = getInputPortPos(node, idx, def.inputs.length);
    }

    return (
      <path
        d={bezierPath(startPos.x, startPos.y, mousePos.x, mousePos.y)}
        fill="none"
        stroke="#00FF9D"
        strokeWidth={2}
        strokeDasharray="4 4"
        opacity={0.6}
      />
    );
  };

  // Memoize the grid dot spacing
  const GRID_SPACING = 24;

  return (
    <div
      className="flex-1 relative overflow-hidden bg-transparent"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* SVG Canvas — grid dots live inside the same transform group for perfect sync */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        style={{ cursor: panning ? 'grabbing' : connecting ? 'crosshair' : 'default' }}
      >
        {/* SVG Pattern for dot grid — defined once, referenced in the transform group */}
        <defs>
          <pattern
            id="canvas-dots"
            x="0"
            y="0"
            width={GRID_SPACING}
            height={GRID_SPACING}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={GRID_SPACING / 2} cy={GRID_SPACING / 2} r="1.5" fill="#00FF9D" opacity="0.25" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Dot grid — inside transform group so it moves & zooms with nodes */}
          <rect
            x={-10000}
            y={-10000}
            width={20000}
            height={20000}
            fill="url(#canvas-dots)"
            className="pointer-events-none"
          />

          {/* Connections */}
          {renderConnections()}

          {/* Connecting line in progress */}
          {renderConnectingLine()}

          {/* Nodes */}
          {nodes.map((node) => {
            const def = NODE_REGISTRY[node.type];
            if (!def) return null;
            return (
              <CanvasNode
              key={node.id}
              node={node}
              def={def}
              isSelected={selectedNodeIds.includes(node.id)}
              isConnecting={connecting?.nodeId === node.id ? connecting : null}
              onSelect={selectNode}
              onDragStart={handleNodeDragStart}
              onPortMouseDown={startConnect}
              onPortMouseUp={finishConnect}
            />
          );
        })}

        {/* Marquee Selection Box */}
        {marquee && (
          <rect
            x={Math.min(marquee.startX, marquee.currentX)}
            y={Math.min(marquee.startY, marquee.currentY)}
            width={Math.abs(marquee.currentX - marquee.startX)}
            height={Math.abs(marquee.currentY - marquee.startY)}
            fill="#00FF9D"
            fillOpacity={0.1}
            stroke="#00FF9D"
            strokeWidth={1 / zoom}
            strokeDasharray="4"
          />
        )}
        </g>
      </svg>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Empty Canvas</p>
            <p className="text-gray-700 text-xs">Drag nodes from the library on the left</p>
          </div>
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/[0.06] text-gray-500 text-[10px] font-mono">
        {Math.round(zoom * 100)}%
      </div>

      {/* Connecting mode indicator */}
      {connecting && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-[10px] font-bold animate-pulse">
          Click an input port to connect · Press ESC to cancel
        </div>
      )}
    </div>
  );
};

export default Canvas;
