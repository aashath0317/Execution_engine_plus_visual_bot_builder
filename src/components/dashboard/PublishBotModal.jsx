import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Globe, Lock, Tag, Eye, Upload, AlertCircle, CheckCircle, Zap, Image as ImageIcon
} from 'lucide-react';
import RichTextEditor from '../ui/RichTextEditor';

const PublishBotModal = ({ isOpen, onClose, bot, onPublish }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [visibility, setVisibility] = useState('private');
  const [tags, setTags] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (bot) {
      setName(bot.name || '');
      setDescription(bot.description || '');
      setScreenshots(bot.screenshots || []);
      setVisibility(bot.visibility || 'private');
      setTags((bot.tags || []).join(', '));
    }
  }, [bot]);

  if (!bot) return null;

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshots(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (indexToRemove) => {
    setScreenshots(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    // Simulate publish delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedBot = {
      ...bot,
      name: name.trim() || bot.name,
      description: description.trim(),
      screenshots,
      visibility,
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    onPublish(updatedBot);
    setIsPublishing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[111] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-3xl bg-[#0A0E11]/98 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">

              {/* ─── Header ─── */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00FF9D]/10 border border-[#00FF9D]/20 flex items-center justify-center">
                    <Upload size={18} className="text-[#00FF9D]" />
                  </div>
                  <div>
                    <h2 className="text-white text-sm font-bold">Publish Bot</h2>
                    <p className="text-gray-500 text-[10px] mt-0.5">Share your strategy with the community</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* ─── Body ─── */}
              <div className="p-6 space-y-5">

                {/* Name */}
                <div>
                  <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Bot Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#00FF9D]/30 transition-colors"
                    placeholder="Enter bot name..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Description</label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Describe your strategy..."
                  />
                </div>

                {/* Screenshots */}
                <div>
                  <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Screenshots</label>
                  <div className="grid grid-cols-4 gap-3">
                    {screenshots.map((src, idx) => (
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
                    <label className="aspect-video rounded-lg border-2 border-dashed border-white/10 hover:border-[#00FF9D]/30 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02] group">
                      <ImageIcon size={20} className="text-gray-500 group-hover:text-[#00FF9D] mb-1 transition-colors" />
                      <span className="text-[10px] text-gray-500 font-medium">Add Image</span>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={handleScreenshotUpload} />
                    </label>
                  </div>
                </div>

                {/* Privacy Toggle */}
                <div>
                  <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2">Visibility</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVisibility('public')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${visibility === 'public'
                        ? 'bg-[#00FF9D]/10 border-[#00FF9D]/30 text-[#00FF9D] shadow-[0_0_20px_rgba(0,255,157,0.08)]'
                        : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04]'
                        }`}
                    >
                      <Globe size={16} />
                      Public
                    </button>
                    <button
                      onClick={() => setVisibility('private')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${visibility === 'private'
                        ? 'bg-white/[0.08] border-white/[0.15] text-white shadow-[0_0_15px_rgba(255,255,255,0.03)]'
                        : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04]'
                        }`}
                    >
                      <Lock size={16} />
                      Private
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
                    <Tag size={11} className="inline mr-1" />
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#00FF9D]/30 transition-colors"
                    placeholder="grid, btc, spot (comma separated)"
                  />
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-2.5 p-3 bg-[#00FF9D]/5 border border-[#00FF9D]/10 rounded-xl">
                  <AlertCircle size={14} className="text-[#00FF9D] shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    {visibility === 'public'
                      ? 'Public bots can be viewed, cloned, and rated by all Fydblock users. Your strategy logic is encrypted in .fyd format and cannot be reverse-engineered.'
                      : 'Private bots are only visible to you. You can change visibility at any time.'}
                  </p>
                </div>

                {/* Preview Card */}
                <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-2">
                    <Eye size={9} className="inline mr-1" />
                    Marketplace Preview
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00FF9D]/10 border border-[#00FF9D]/20 flex items-center justify-center">
                      <Zap size={18} className="text-[#00FF9D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{name || 'Untitled Bot'}</p>
                      <p className="text-gray-500 text-[10px] truncate">{description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border" style={{
                      background: visibility === 'public' ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.05)',
                      borderColor: visibility === 'public' ? 'rgba(0,255,157,0.2)' : 'rgba(255,255,255,0.1)',
                      color: visibility === 'public' ? '#00FF9D' : '#9CA3AF',
                    }}>
                      {visibility === 'public' ? <Globe size={9} /> : <Lock size={9} />}
                      {visibility === 'public' ? 'PUBLIC' : 'PRIVATE'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Footer ─── */}
              <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3 bg-black/20">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-gray-400 text-xs font-medium hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00FF9D]/10 border border-[#00FF9D]/25 text-[#00FF9D] text-xs font-bold hover:bg-[#00FF9D]/20 transition-all shadow-[0_0_25px_rgba(0,255,157,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#00FF9D]/30 border-t-[#00FF9D] rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      {visibility === 'public' ? 'Publish to Marketplace' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PublishBotModal;
