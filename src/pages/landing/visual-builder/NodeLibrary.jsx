import React, { useState } from 'react';
import { Search, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { NODE_CATEGORIES } from './nodeTypes';

const NodeLibrary = ({ onDragStart }) => {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState({});

  const toggleCategory = (title) => {
    setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredCategories = NODE_CATEGORIES.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(n =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.type.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.nodes.length > 0);

  return (
    <div className="w-56 xl:w-64 flex flex-col bg-[#0E1418]/90 backdrop-blur-xl border-r border-white/[0.04] shadow-2xl h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3">Node Library</h3>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[#00FF9D]/30 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-1"
        data-lenis-prevent="true" 
        onWheel={(e) => e.stopPropagation()}
      >
        {filteredCategories.map((cat) => (
          <div key={cat.title}>
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat.title)}
              className="flex items-center gap-2 w-full px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-400 transition-colors"
            >
              {collapsed[cat.title]
                ? <ChevronRight size={12} />
                : <ChevronDown size={12} />
              }
              {cat.title}
            </button>

            {/* Nodes */}
            {!collapsed[cat.title] && (
              <div className="space-y-1 mb-2">
                {cat.nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('nodeType', node.type);
                      onDragStart?.(node.type);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing border border-transparent transition-all duration-300 group select-none relative overflow-hidden"
                  >
                    {/* Hover Gradient Background */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" 
                      style={{ backgroundImage: `linear-gradient(90deg, ${node.color}, transparent)` }} 
                    />
                    {/* Hover Glow Border */}
                    <div 
                      className="absolute inset-0 rounded-xl border opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" 
                      style={{ borderColor: node.color }} 
                    />

                    <GripVertical size={10} className="text-gray-700 group-hover:text-gray-400 shrink-0 transition-colors z-10" />
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 z-10"
                      style={{ backgroundColor: `${node.color}15`, boxShadow: `0 0 10px ${node.color}20` }}
                    >
                      <node.icon size={13} style={{ color: node.color }} />
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                      <span className="text-gray-300 text-[11px] font-medium group-hover:text-white transition-colors block truncate">
                        {node.label}
                      </span>
                      <span className="text-gray-700 text-[9px] block">
                        {node.outputs.length} out{node.inputs.length > 0 ? ` · ${node.inputs.length} in` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-gray-600 text-[9px] leading-relaxed">
          Drag nodes onto the canvas to build your trading strategy.
        </p>
      </div>
    </div>
  );
};

export default NodeLibrary;
