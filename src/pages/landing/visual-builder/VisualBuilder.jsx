import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Save, FolderOpen, Trash2, ZoomIn, ZoomOut, Maximize2,
  Undo2, Download, ChevronLeft, Globe, X, Image as ImageIcon, Rocket
} from 'lucide-react';
import NodeLibrary from './NodeLibrary';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import { useCanvasState } from './useCanvasState';
import RichTextEditor from '../../../components/ui/RichTextEditor';

const VisualBuilder = () => {
  const state = useCanvasState();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    name: '',
    description: '',
    image: '',
    screenshots: [],
    tags: '',
    price: 'Free',
    category: 'grid'
  });

  // Try to load saved strategy on mount
  useEffect(() => {
    state.loadStrategy();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPublishForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPublishForm(prev => ({ ...prev, screenshots: [...prev.screenshots, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (indexToRemove) => {
    setPublishForm(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handlePublishClick = () => {
    setPublishForm(prev => ({ ...prev, name: state.strategyName }));
    setIsPublishModalOpen(true);
  };

  const confirmPublish = () => {
    state.saveStrategy();
    
    const raw = localStorage.getItem('fydblock_created_bots');
    const createdBots = raw ? JSON.parse(raw) : [];
    
    const existingIndex = createdBots.findIndex(b => b.name === publishForm.name);
    
    const botData = {
      id: `cb_${Date.now()}`,
      name: publishForm.name || 'Untitled Strategy',
      description: publishForm.description || 'Custom strategy created via Visual Builder',
      image: publishForm.image || '',
      screenshots: publishForm.screenshots || [],
      tags: publishForm.tags ? publishForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      type: 'visual',
      strategyType: 'visual',
      createdAt: new Date().toISOString(),
      visibility: 'public',
      graph: {
        nodes: state.nodes,
        connections: state.connections
      }
    };

    if (existingIndex >= 0) {
      createdBots[existingIndex] = { ...createdBots[existingIndex], ...botData, id: createdBots[existingIndex].id };
    } else {
      createdBots.unshift(botData);
    }
    
    localStorage.setItem('fydblock_created_bots', JSON.stringify(createdBots));
    setIsPublishModalOpen(false);
    
    // Redirect to Bot Hub where user can see their creations
    navigate('/bot-hub', { state: { activeTab: 'myBots' } });
  };

  const handleSaveFile = () => {
    state.saveStrategy(); // keep auto-save backup
    const data = {
      name: state.strategyName,
      nodes: state.nodes,
      connections: state.connections
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.strategyName || 'strategy'}.fyd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.fyd';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Support both flat format and nested format (old files)
          const nodes = data.nodes || data.graph?.nodes;
          const connections = data.connections || data.graph?.connections;
          const name = data.name || data.metadata?.name || file.name.replace(/\.[^/.]+$/, "");

          if (nodes && connections) {
            state.setStrategyName(name);
            state.setNodes(nodes);
            state.setConnections(connections);
          } else {
            alert("Invalid strategy file format: Missing nodes or connections.");
          }
        } catch (error) {
          console.error("Parse error:", error);
          alert("Error parsing file: Make sure the file is valid JSON.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      <Helmet>
        <title>Visual Bot Builder — Fydblock</title>
        <meta name="description" content="Drag-and-drop visual bot builder for algorithmic trading strategies." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="h-screen w-screen bg-[#0A0F12] text-white font-sans flex flex-col overflow-hidden selection:bg-[#00FF9D] selection:text-black relative z-0">
        
        {/* Background Depth Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00FF9D] opacity-[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* ─── Top Toolbar ─── */}
        <div className="h-16 flex items-center justify-between px-6 bg-[#0E1418]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-sm shrink-0 z-50">

          {/* Left: Logo + Strategy name */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white shrink-0"
              title="Back to Dashboard"
            >
              <ChevronLeft size={20} />
            </button>
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <img src="/logo.png" alt="Fydblock" className="h-6 object-contain" />
            </div>

            <div className="h-5 w-px bg-white/[0.08]" />

            <input
              type="text"
              value={state.strategyName}
              onChange={(e) => state.setStrategyName(e.target.value)}
              className="bg-transparent text-white text-sm font-semibold outline-none border-b border-transparent hover:border-white/10 focus:border-[#00FF9D]/40 transition-colors px-1 py-0.5 max-w-[200px]"
              placeholder="Strategy Name"
            />
          </div>

          {/* Center: Action buttons */}
          <div className="flex items-center gap-1">
            <ToolbarButton icon={Save} label="Save" onClick={handleSaveFile} />
            <ToolbarButton icon={Globe} label="Publish" onClick={handlePublishClick} accent />
            <ToolbarButton icon={FolderOpen} label="Load" onClick={handleLoadFile} />
            <ToolbarButton icon={Trash2} label="Clear" onClick={() => {
              if (window.confirm('Clear the entire canvas?')) state.clearCanvas();
            }} danger />

            <div className="h-5 w-px bg-white/[0.06] mx-1" />

            <ToolbarButton icon={ZoomOut} onClick={state.zoomOut} />
            <span className="text-gray-500 text-[10px] font-mono w-8 text-center">
              {Math.round(state.zoom * 100)}%
            </span>
            <ToolbarButton icon={ZoomIn} onClick={state.zoomIn} />
            <ToolbarButton icon={Maximize2} onClick={state.resetZoom} />
          </div>

          {/* Right: Run button */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-[11px] font-bold hover:bg-[#00FF9D]/15 transition-all">
              <Download size={12} />
              Download Backtest Engine
            </button>
          </div>
        </div>

        {/* ─── 3-Panel Layout ─── */}
        <div className="flex-1 flex min-h-0 relative z-10">
          {/* Left: Node Library */}
          <NodeLibrary />

          {/* Center: Canvas */}
          <Canvas
            nodes={state.nodes}
            connections={state.connections}
            selectedNodeIds={state.selectedNodeIds}
            connecting={state.connecting}
            pan={state.pan}
            zoom={state.zoom}
            setPan={state.setPan}
            setZoom={state.setZoom}
            addNode={state.addNode}
            moveNode={state.moveNode}
            updateNodesPosition={state.updateNodesPosition}
            selectNode={state.selectNode}
            setSelection={state.setSelection}
            startConnect={state.startConnect}
            finishConnect={state.finishConnect}
            cancelConnect={state.cancelConnect}
            deleteConnection={state.deleteConnection}
            deleteNodes={state.deleteNodes}
          />

          {/* Right: Properties */}
          <PropertiesPanel
            selectedNode={state.selectedNode}
            selectedNodeIds={state.selectedNodeIds}
            onUpdateConfig={state.updateNodeConfig}
            onDeleteNode={() => state.deleteNodes(state.selectedNodeIds)}
            onDeselect={() => state.setSelection([])}
          />
        </div>
      </div>

      {/* ─── Publish Modal ─── */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0A0E11] border border-[#00FF9D]/20 rounded-3xl w-full max-w-2xl relative shadow-[0_0_50px_rgba(0,255,157,0.1)] overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe size={24} className="text-[#00FF9D]" />
                Publish to Marketplace
              </h2>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-8">
              
              {/* Left: Avatar Upload */}
              <div className="md:col-span-2 flex flex-col items-center">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 self-start w-full text-center">Cover Image</label>
                <div 
                  className="w-48 h-48 rounded-3xl border-2 border-dashed border-white/10 hover:border-[#00FF9D]/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-colors bg-black/40"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {publishForm.image ? (
                    <>
                      <img src={publishForm.image} alt="Preview" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon size={28} className="text-white drop-shadow-md" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-[#00FF9D]/10 flex items-center justify-center mb-3">
                        <ImageIcon size={24} className="text-[#00FF9D]" />
                      </div>
                      <span className="text-xs text-gray-400 font-bold mb-1">Upload Graphic</span>
                      <span className="text-[10px] text-gray-600 text-center px-4 leading-relaxed">
                        Recommended: 800x800px.<br/>PNG or JPG.
                      </span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              {/* Right: Form Details */}
              <div className="md:col-span-3 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Strategy Name</label>
                  <input
                    type="text"
                    value={publishForm.name}
                    onChange={(e) => setPublishForm({ ...publishForm, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FF9D] transition-colors text-white font-medium shadow-inner"
                    placeholder="e.g., Adaptive RSI Scalper"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                  <RichTextEditor
                    content={publishForm.description}
                    onChange={(html) => setPublishForm({ ...publishForm, description: html })}
                    placeholder="Describe your strategy logic and best use cases..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Screenshots</label>
                  <div className="grid grid-cols-4 gap-3">
                    {publishForm.screenshots.map((src, idx) => (
                      <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-white/10">
                        <img src={src} alt="screenshot" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeScreenshot(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 hover:text-red-300"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-video rounded-lg border-2 border-dashed border-white/10 hover:border-[#00FF9D]/30 flex flex-col items-center justify-center cursor-pointer transition-colors bg-black/20 group">
                      <ImageIcon size={20} className="text-gray-500 group-hover:text-[#00FF9D] mb-1 transition-colors" />
                      <span className="text-[10px] text-gray-500 font-medium">Add Image</span>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={handleScreenshotUpload} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={publishForm.category}
                      onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FF9D] transition-colors text-white font-medium shadow-inner appearance-none"
                    >
                      <option value="grid" className="bg-[#0A0E11] text-white">Grid</option>
                      <option value="dca" className="bg-[#0A0E11] text-white">DCA</option>
                      <option value="trend" className="bg-[#0A0E11] text-white">Trend</option>
                      <option value="sideways" className="bg-[#0A0E11] text-white">Sideways</option>
                      <option value="visual" className="bg-[#0A0E11] text-white">Visual</option>
                      <option value="signal" className="bg-[#0A0E11] text-white">Signal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Price ($/mo)</label>
                    <input
                      type="text"
                      value={publishForm.price}
                      onChange={(e) => setPublishForm({ ...publishForm, price: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FF9D] transition-colors text-white font-medium shadow-inner"
                      placeholder="e.g., Free or 49"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={publishForm.tags}
                    onChange={(e) => setPublishForm({ ...publishForm, tags: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FF9D] transition-colors text-white font-medium shadow-inner"
                    placeholder="e.g., crypto, scalping, high-risk"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-4">
              <button 
                onClick={() => setIsPublishModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublish}
                disabled={!publishForm.name}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00FF9D] to-[#00E5FF] text-black font-extrabold text-sm hover:shadow-[0_0_30px_rgba(0,255,157,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                PUBLISH BOT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Toolbar Button Component ───
const ToolbarButton = ({ icon: Icon, label, onClick, accent, danger }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all
      ${accent
        ? 'bg-[#00FF9D]/10 border border-[#00FF9D]/15 text-[#00FF9D] hover:bg-[#00FF9D]/15'
        : danger
          ? 'bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10'
          : 'bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]'
      }`}
    title={label}
  >
    <Icon size={16} />
    {label && <span className="hidden md:inline">{label}</span>}
  </button>
);

export default VisualBuilder;
