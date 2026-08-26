import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Grid, TrendingUp, Zap, Eye, Download, Play, Copy, Rocket,
  Star, MoreHorizontal, Lock, Globe, Pause, CircleDot, Pencil, Trash2, Bot as BotIcon
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import RatingStars from './RatingStars';

// ─── Strategy Type Config ───
const STRATEGY_STYLES = {
  grid: { color: '#A26DFF', bg: 'rgba(162,109,255,0.25)', border: 'rgba(162,109,255,0.5)', label: 'Grid', icon: Grid },
  dca: { color: '#3B82F6', bg: 'rgba(59,130,246,0.25)', border: 'rgba(59,130,246,0.5)', label: 'DCA', icon: TrendingUp },
  visual: { color: '#00FF9D', bg: 'rgba(0,255,157,0.25)', border: 'rgba(0,255,157,0.5)', label: 'Visual', icon: Zap },
  signal: { color: '#F59E0B', bg: 'rgba(245,158,11,0.25)', border: 'rgba(245,158,11,0.5)', label: 'Signal', icon: Activity },
};

const STATUS_STYLES = {
  active: { color: '#00FF9D', bg: 'rgba(0,255,157,0.2)', label: 'Active' },
  running: { color: '#00FF9D', bg: 'rgba(0,255,157,0.2)', label: 'Running' },
  ready: { color: '#00FF9D', bg: 'rgba(0,255,157,0.2)', label: 'Ready' },
  paused: { color: '#F59E0B', bg: 'rgba(245,158,11,0.2)', label: 'Paused' },
  stopped: { color: '#EF4444', bg: 'rgba(239,68,68,0.2)', label: 'Stopped' },
  draft: { color: '#6B7280', bg: 'rgba(107,114,128,0.2)', label: 'Draft' },
};

// ─── Generate Mock Sparkline ───
const generateSparkline = (seed = 0) => {
  const data = [];
  let value = 100 + (seed * 7) % 50;
  for (let i = 0; i < 20; i++) {
    value += (Math.sin(i * 0.5 + seed) * 5) + (Math.random() - 0.45) * 8;
    data.push({ v: Math.max(value, 20) });
  }
  return data;
};

const BotCard = ({
  bot,
  variant = 'creation', // 'creation' | 'deployed' | 'marketplace'
  onEdit,
  onBacktest,
  onDownload,
  onPublish,
  onDeploy,
  onDelete,
  onClick,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const strategyType = String(bot.strategyType || bot.bot_type || 'visual').toLowerCase();
  const matchedType = strategyType.includes('grid') ? 'grid'
    : strategyType.includes('dca') ? 'dca'
      : strategyType.includes('signal') ? 'signal'
        : 'visual';

  const style = STRATEGY_STYLES[matchedType] || STRATEGY_STYLES.visual;
  const StatusIcon = style.icon;

  const sparkline = useMemo(() => generateSparkline(bot.id ? (typeof bot.id === 'string' ? bot.id.charCodeAt(3) || 0 : bot.id) : index), [bot.id, index]);
  const isPositive = sparkline.length > 1 && sparkline[sparkline.length - 1].v > sparkline[0].v;

  const status = bot.status ? (STATUS_STYLES[String(bot.status).toLowerCase()] || STATUS_STYLES.draft) : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(bot)}
      className="group relative rounded-2xl border cursor-pointer transition-all duration-500 overflow-hidden bg-[#0A0E11]/90 backdrop-blur-xl flex flex-col h-[360px]"
      style={{
        borderColor: isHovered ? style.border : style.bg,
        boxShadow: isHovered ? `0 0 30px ${style.bg}, 0 20px 40px rgba(0,0,0,0.3)` : `0 0 15px ${style.bg}`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Dynamic Background Glow on Hover */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'} z-0`}
        style={{
          background: `radial-gradient(circle at top right, ${style.bg}, transparent 70%)`
        }}
      />

      {/* Top Banner Image & Tags */}
      <div className="relative h-[160px] w-full shrink-0 bg-black/40 border-b border-white/5 overflow-hidden">
        {bot.image ? (
          <img 
            src={bot.image} 
            alt={bot.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center">
            <BotIcon size={40} className="text-white/20" />
          </div>
        )}

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 to-transparent" />

        {/* Top Badges (Tags & Price) */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <div className="flex flex-col items-start gap-2">
            {/* Strategy Type Badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg"
              style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
            >
              <StatusIcon size={11} />
              {style.label}
            </div>

            {/* Visibility / Status Badge */}
            {variant === 'creation' && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold backdrop-blur-md shadow-lg ${bot.visibility === 'public'
                ? 'bg-[#00FF9D]/20 text-[#00FF9D] border border-[#00FF9D]/40'
                : 'bg-black/50 text-gray-300 border border-white/20'
                }`}>
                {bot.visibility === 'public' ? <Globe size={10} /> : <Lock size={10} />}
                {bot.visibility === 'public' ? 'Public' : 'Private'}
              </div>
            )}

            {variant === 'deployed' && status && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border backdrop-blur-md shadow-lg"
                style={{ background: status.bg, color: status.color, borderColor: `${status.color}66` }}
              >
                <CircleDot size={10} />
                {status.label}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* ─── Bot Info Below Banner ─── */}
      <div className="flex-1 flex flex-col relative z-10 p-5 pb-0">
        <div className="flex items-start justify-between">
          <h3 className="text-white text-base font-bold line-clamp-2 leading-tight group-hover:text-[#00FF9D] transition-colors pr-2">
            {bot.name || bot.bot_name || 'Untitled Bot'}
          </h3>
          <div className="flex items-center shrink-0">
            {variant === 'marketplace' && (
              <RatingStars rating={bot.rating || 0} size={10} showValue count={bot.usageCount} />
            )}
            <button
              className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-[#0A0E11]/90 backdrop-blur rounded-lg hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 shadow-xl"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {variant === 'marketplace' && bot.author && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#00FF9D]/40 to-[#A26DFF]/40 flex items-center justify-center text-[8px] font-bold text-white">
              {String(bot.author).charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-500 text-[11px] font-medium">{String(bot.author)}</span>
          </div>
        )}

        {bot.description && (
          <p className="text-gray-500 text-[11px] mt-2 line-clamp-2 leading-relaxed">
            {String(bot.description).replace(/<[^>]*>/g, '').trim() || ''}
          </p>
        )}

        {variant === 'deployed' && (
          <p className="text-gray-500 text-[11px] mt-1 uppercase font-medium">{bot.bot_type || 'Custom Bot'}</p>
        )}
      </div>

      {/* ─── Bottom Section ─── */}
      <div className="px-5 py-3 border-t border-white/[0.04] flex flex-col items-center justify-center gap-1.5 mt-auto bg-[#0A0E11]/40">
        {variant === 'marketplace' ? (
          <div className="text-[13px] font-bold mt-0.5">
            {bot.price === 'Free' ? (
              <span className="text-[#00FF9D]">Free</span>
            ) : (
              <span className="text-white">${bot.price} <span className="text-gray-400 font-medium text-[10px]">/mo</span></span>
            )}
          </div>
        ) : variant === 'creation' ? (
          <div className="w-full flex items-center justify-between">
            <span className="text-gray-600 text-[10px]">
              {formatDate(bot.createdAt)}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-[10px]">
              <Activity size={10} />
              {bot.graph?.nodes?.length || 0} nodes
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between">
            <span className="text-gray-600 text-[10px]">
              {formatDate(bot.created_at || bot.createdAt)}
            </span>
            {bot.exchange && (
              <span className="text-gray-500 text-[10px] uppercase font-medium">{bot.exchange}</span>
            )}
          </div>
        )}
      </div>

      {/* ─── Hover Action Overlay ─── */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col justify-end transition-all duration-300 ${isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className={`p-4 transition-transform duration-300 transform ${isHovered ? 'translate-y-0' : 'translate-y-4'}`}>
          <div className="grid grid-cols-2 gap-2">
            {variant === 'creation' && (
              <>
                {onEdit && <ActionBtn icon={Pencil} label="Edit" onClick={(e) => { e.stopPropagation(); onEdit(bot); }} />}
                {onBacktest && <ActionBtn icon={Play} label="Backtest" color="#00FF9D" onClick={(e) => { e.stopPropagation(); onBacktest(bot); }} />}
                {onPublish && <ActionBtn icon={bot.visibility === 'public' ? Lock : Globe} label={bot.visibility === 'public' ? 'Unpublish' : 'Publish'} onClick={(e) => { e.stopPropagation(); onPublish(bot); }} />}
                {onDownload && <ActionBtn icon={Download} label=".fyd" onClick={(e) => { e.stopPropagation(); onDownload(bot); }} />}
                {onDelete && <ActionBtn icon={Trash2} label="Delete" color="#EF4444" className="col-span-2" onClick={(e) => { e.stopPropagation(); onDelete(bot); }} />}
              </>
            )}

            {variant === 'deployed' && (
              <>
                {onEdit && <ActionBtn icon={Eye} label="View Details" className="col-span-2" onClick={(e) => { e.stopPropagation(); onEdit(bot); }} />}
              </>
            )}

            {variant === 'marketplace' && (
              <>
                {onDeploy && <ActionBtn icon={Rocket} label="Deploy Bot" className="col-span-2" color="#00FF9D" onClick={(e) => { e.stopPropagation(); onDeploy(bot); }} />}
                {onBacktest && <ActionBtn icon={Play} label="Backtest" onClick={(e) => { e.stopPropagation(); onBacktest(bot); }} />}
                {onDownload && <ActionBtn icon={Download} label=".fyd" onClick={(e) => { e.stopPropagation(); onDownload(bot); }} />}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Mini Action Button ───
const ActionBtn = ({ icon: Icon, label, color, className = '', onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] border ${className}`}
    style={{
      background: color ? `${color}15` : 'rgba(255,255,255,0.05)',
      borderColor: color ? `${color}30` : 'rgba(255,255,255,0.1)',
      color: color || '#ffffff',
    }}
  >
    <Icon size={12} />
    {label}
  </button>
);

export default BotCard;
