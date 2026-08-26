import React, { useState, useRef, useEffect } from 'react';
import { Settings, Trash2, X, ChevronDown, Search } from 'lucide-react';
import { NODE_REGISTRY } from './nodeTypes';
import { getSortedPairs } from '../../../data/pairs';

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white outline-none hover:border-white/10 focus:border-[#00FF9D]/30 transition-colors flex items-center justify-between text-left"
      >
        <span className="truncate pr-2">{value}</span>
        <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#0E1418]/95 border border-white/[0.08] rounded-lg shadow-2xl overflow-hidden backdrop-blur-2xl">
          {options.length > 10 && (
            <div className="p-2 border-b border-white/[0.06]">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/20 border border-white/[0.04] rounded pl-7 pr-2 py-1.5 text-[10px] text-white outline-none focus:border-[#00FF9D]/30"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="max-h-[220px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-[10px] text-gray-500 text-center">No results found</div>
            ) : (
              filtered.map(o => (
                <button
                  key={o}
                  onClick={() => {
                    onChange(o);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/[0.04] ${value === o ? 'text-[#00FF9D] bg-[#00FF9D]/5' : 'text-gray-300'}`}
                >
                  {o}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Dynamic field renderer based on key/value type
const ConfigField = ({ label, value, onChange, options }) => {
  if (options) {
    return (
      <div>
        <label className="text-gray-500 text-[9px] uppercase tracking-wider font-bold block mb-1.5">{label}</label>
        <CustomSelect value={value} onChange={onChange} options={options} />
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div>
        <label className="text-gray-500 text-[9px] uppercase tracking-wider font-bold block mb-1.5">{label}</label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#00FF9D]/30 transition-colors"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="text-gray-500 text-[9px] uppercase tracking-wider font-bold block mb-1.5">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#00FF9D]/30 transition-colors"
      />
    </div>
  );
};

// Known dropdown options for specific fields
const FIELD_OPTIONS = {
  pair: getSortedPairs(),
  exchange: ['Binance', 'Bybit', 'OKX', 'KuCoin'],
  currency: ['USDT', 'USDC', 'BTC', 'ETH'],
  type: ['SMA', 'EMA', 'WMA'],
  operator: ['>', '<', '>=', '<=', '==', '!='],
  gate: ['AND', 'OR', 'XOR', 'NAND'],
  unit: ['USDT', '%', 'BTC'],
  interval: ['1m', '5m', '15m', '1h', '4h', '1d'],
};

const PropertiesPanel = ({ selectedNode, selectedNodeIds = [], onUpdateConfig, onDeleteNode, onDeselect }) => {
  if (selectedNodeIds.length > 1) {
    return (
      <div className="w-56 xl:w-64 flex flex-col bg-[#0E1418]/90 backdrop-blur-xl border-l border-white/[0.04] shadow-2xl h-full">
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest">Properties</h3>
          <button onClick={onDeselect} className="p-1 hover:bg-white/5 rounded-md transition-colors text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-12 h-12 bg-[#00FF9D]/10 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,157,0.2)] border border-[#00FF9D]/20">
            <span className="text-[#00FF9D] font-bold text-lg">{selectedNodeIds.length}</span>
          </div>
          <h4 className="text-white font-bold text-sm mb-1">Nodes Selected</h4>
          <p className="text-gray-500 text-xs text-center mb-6 leading-relaxed">
            Multiple nodes are selected. You can move or delete them together.
          </p>
          <button
            onClick={onDeleteNode}
            className="flex items-center gap-2 w-full justify-center py-2.5 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all border border-red-500/20 text-xs font-bold"
          >
            <Trash2 size={14} />
            Delete {selectedNodeIds.length} Nodes
          </button>
        </div>
      </div>
    );
  }

  if (!selectedNode) {
    return (
      <div className="w-56 xl:w-64 flex flex-col bg-[#0E1418]/90 backdrop-blur-xl border-l border-white/[0.04] shadow-2xl h-full">
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <Settings size={28} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 text-xs leading-relaxed">
              Select a node on the canvas to view and edit its properties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const def = NODE_REGISTRY[selectedNode.type];
  if (!def) return null;

  return (
    <div className="w-56 xl:w-64 flex flex-col bg-[#0E1418]/90 backdrop-blur-xl border-l border-white/[0.04] shadow-2xl h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest">Properties</h3>
          <button onClick={onDeselect} className="text-gray-600 hover:text-gray-400 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-5"
        data-lenis-prevent="true" 
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Node identity */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${def.color}15` }}
          >
            <def.icon size={16} style={{ color: def.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">{def.label}</p>
            <p className="text-gray-600 text-[9px]">{def.category}</p>
          </div>
        </div>

        {/* Ports info */}
        <div className="space-y-2">
          <p className="text-gray-500 text-[9px] uppercase tracking-wider font-bold">Ports</p>
          <div className="flex flex-wrap gap-1.5">
            {def.inputs.map(p => (
              <span key={`in-${p}`} className="px-2 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ← {p}
              </span>
            ))}
            {def.outputs.map(p => (
              <span key={`out-${p}`} className="px-2 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {p} →
              </span>
            ))}
          </div>
        </div>

        {/* Config fields */}
        <div className="space-y-3">
          <p className="text-gray-500 text-[9px] uppercase tracking-wider font-bold">Configuration</p>
          {Object.entries(selectedNode.config).map(([key, value]) => (
            <ConfigField
              key={key}
              label={key.replace(/_/g, ' ')}
              value={value}
              options={FIELD_OPTIONS[key]}
              onChange={(val) => onUpdateConfig(selectedNode.id, key, val)}
            />
          ))}
        </div>

        {/* Node ID */}
        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-gray-700 text-[9px] font-mono">ID: {selectedNode.id}</p>
        </div>
      </div>

      {/* Delete button */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/10 hover:border-red-500/20 transition-all"
        >
          <Trash2 size={12} />
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
