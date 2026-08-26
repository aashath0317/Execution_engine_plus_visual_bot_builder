import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Play, Copy, Pencil, Trash2, Globe, Lock, Rocket,
  Activity, Grid, TrendingUp, Zap, Calendar, Users, BarChart3,
  TrendingDown, Target, Award, ArrowUpRight, ArrowDownRight,
  MessageSquare, Send, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import RatingStars from './RatingStars';

// ─── Strategy Colors ───
const STRATEGY_STYLES = {
  grid: { color: '#A26DFF', label: 'Grid', icon: Grid },
  dca: { color: '#3B82F6', label: 'DCA', icon: TrendingUp },
  visual: { color: '#00FF9D', label: 'Visual', icon: Zap },
  signal: { color: '#F59E0B', label: 'Signal', icon: Activity },
};

// ─── Mock Equity Curve ───
const generateEquityCurve = (seed = 0) => {
  const data = [];
  let value = 10000;
  for (let i = 0; i < 60; i++) {
    value += (Math.sin(i * 0.3 + seed) * 200) + (Math.random() - 0.42) * 300 + 50;
    const date = new Date(2026, 0, 1 + i * 3);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(value, 5000),
    });
  }
  return data;
};

// ─── Mock Reviews ───
const MOCK_REVIEWS = [
  {
    id: 'rev_1', userName: 'CryptoWhale', rating: 5,
    text: 'Incredibly consistent returns over the last 3 months. The grid placement logic adapts well to ranging markets. Highly recommended for conservative traders.',
    createdAt: '2026-07-10T14:30:00Z',
  },
  {
    id: 'rev_2', userName: 'AlgoTrader_Pro', rating: 4,
    text: 'Good strategy overall. Works best on BTC/USDT with 1h timeframe. Needs some tuning for volatile altcoins but the base logic is solid.',
    createdAt: '2026-07-05T09:15:00Z',
  },
  {
    id: 'rev_3', userName: 'GridMaster99', rating: 5,
    text: 'One of the best visual strategies I\'ve cloned. The RSI confirmation filter really helps avoid entries during extreme conditions.',
    createdAt: '2026-06-28T18:45:00Z',
  },
  {
    id: 'rev_4', userName: 'DeFiDegen', rating: 3,
    text: 'Decent but nothing extraordinary. Made about 8% in two weeks which is fine. Would like to see more risk management nodes.',
    createdAt: '2026-06-20T11:00:00Z',
  },
];

const BotDetailModal = ({
  isOpen,
  onClose,
  bot,
  variant = 'creation', // 'creation' | 'deployed' | 'marketplace'
  onEdit,
  onBacktest,
  onDownload,
  onPublish,
  onDeploy,
  onDelete,
}) => {
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!bot) return null;

  const strategyType = (bot.strategyType || bot.bot_type || 'visual').toLowerCase();
  const matchedType = strategyType.includes('grid') ? 'grid'
    : strategyType.includes('dca') ? 'dca'
      : strategyType.includes('signal') ? 'signal'
        : 'visual';

  const style = STRATEGY_STYLES[matchedType] || STRATEGY_STYLES.visual;
  const TypeIcon = style.icon;

  const equityData = useMemo(() => generateEquityCurve(
    typeof bot.id === 'string' ? bot.id.charCodeAt(3) || 0 : bot.id || 0
  ), [bot.id]);

  const isPositive = equityData.length > 1 && equityData[equityData.length - 1].value > equityData[0].value;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return '—'; }
  };

  // Mock stats
  const stats = bot.stats || {
    totalReturn: isPositive ? +(((equityData[equityData.length - 1].value - 10000) / 100).toFixed(1)) : -3.2,
    winRate: 72 + Math.floor(Math.random() * 15),
    maxDrawdown: -(2 + Math.random() * 6).toFixed(1),
    sharpeRatio: (1.2 + Math.random() * 1.5).toFixed(1),
    totalTrades: 120 + Math.floor(Math.random() * 300),
    profitFactor: (1.5 + Math.random() * 2.5).toFixed(1),
  };

  const displayedReviews = showAllReviews ? MOCK_REVIEWS : MOCK_REVIEWS.slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-[101] flex items-center justify-center"
          >
            <div className="w-full h-full max-w-[1100px] max-h-[850px] bg-[#0A0E11]/98 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

              {/* ─── Header ─── */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-4">
                  {/* Bot Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border"
                    style={{ background: `${style.color}15`, borderColor: `${style.color}30` }}
                  >
                    <TypeIcon size={22} style={{ color: style.color }} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-white text-lg font-bold">
                        {bot.name || bot.bot_name || 'Untitled Bot'}
                      </h2>
                      <div
                        className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: `${style.color}15`, color: style.color, border: `1px solid ${style.color}30` }}
                      >
                        {style.label}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      {variant === 'marketplace' && bot.author && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#00FF9D]/40 to-[#A26DFF]/40 flex items-center justify-center text-[7px] font-bold text-white">
                            {bot.author.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-400 text-xs">{bot.author}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                        <Calendar size={11} />
                        {formatDate(bot.createdAt || bot.created_at)}
                      </div>
                      {variant === 'marketplace' && bot.usageCount && (
                        <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                          <Users size={11} />
                          {bot.usageCount.toLocaleString()} users
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* ─── Body ─── */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6">

                  {/* ─── Stats Grid ─── */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <StatCard
                      icon={ArrowUpRight}
                      label="Total Return"
                      value={`${stats.totalReturn >= 0 ? '+' : ''}${stats.totalReturn}%`}
                      color={stats.totalReturn >= 0 ? '#00FF9D' : '#EF4444'}
                    />
                    <StatCard
                      icon={Target}
                      label="Win Rate"
                      value={`${stats.winRate}%`}
                      color="#00FF9D"
                    />
                    <StatCard
                      icon={TrendingDown}
                      label="Max Drawdown"
                      value={`${stats.maxDrawdown}%`}
                      color="#EF4444"
                    />
                    <StatCard
                      icon={BarChart3}
                      label="Sharpe Ratio"
                      value={stats.sharpeRatio}
                      color="#A26DFF"
                    />
                    <StatCard
                      icon={Activity}
                      label="Total Trades"
                      value={stats.totalTrades}
                      color="#3B82F6"
                    />
                    <StatCard
                      icon={Award}
                      label="Profit Factor"
                      value={`${stats.profitFactor}x`}
                      color="#F59E0B"
                    />
                  </div>

                  {/* ─── Equity Curve ─── */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-sm font-semibold">Equity Curve</h3>
                      <span className={`text-xs font-bold ${isPositive ? 'text-[#00FF9D]' : 'text-red-400'}`}>
                        {isPositive ? <ArrowUpRight size={14} className="inline" /> : <ArrowDownRight size={14} className="inline" />}
                        {' '}{isPositive ? '+' : ''}{((equityData[equityData.length - 1].value - 10000) / 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityData}>
                          <defs>
                            <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={isPositive ? '#00FF9D' : '#EF4444'} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={isPositive ? '#00FF9D' : '#EF4444'} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#4B5563', fontSize: 10 }}
                            interval={Math.floor(equityData.length / 6)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0E1418',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              fontSize: '11px',
                            }}
                            labelStyle={{ color: '#9CA3AF' }}
                            itemStyle={{ color: isPositive ? '#00FF9D' : '#EF4444' }}
                            formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? '#00FF9D' : '#EF4444'}
                            strokeWidth={2}
                            fill="url(#eqGrad)"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ─── Strategy Details ─── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Description */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                      <h3 className="text-white text-sm font-semibold mb-3">Strategy Details</h3>
                      <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">
                        {bot.description || 'No description provided. Edit this bot to add a description that will appear in the marketplace.'}
                      </p>
                      {bot.tags && bot.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {bot.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400 font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {bot.graph && (
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.06]">
                          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                            <Zap size={12} className="text-[#00FF9D]" />
                            {bot.graph.nodes?.length || 0} Nodes
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                            <Activity size={12} className="text-[#A26DFF]" />
                            {bot.graph.connections?.length || 0} Connections
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Reviews (marketplace) or Info (own) */}
                    {variant === 'marketplace' ? (
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                            <MessageSquare size={14} className="text-gray-400" />
                            Reviews
                          </h3>
                          <RatingStars rating={bot.rating || 4.5} size={14} showValue count={MOCK_REVIEWS.length} />
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                          {displayedReviews.map((review) => (
                            <div key={review.id} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#A26DFF]/40 to-[#00FF9D]/40 flex items-center justify-center text-[8px] font-bold text-white">
                                    {review.userName.charAt(0)}
                                  </div>
                                  <span className="text-white text-[11px] font-semibold">{review.userName}</span>
                                </div>
                                <RatingStars rating={review.rating} size={10} />
                              </div>
                              <p className="text-gray-400 text-[11px] leading-relaxed">{review.text}</p>
                              <span className="text-gray-600 text-[9px] mt-1.5 block">{formatDate(review.createdAt)}</span>
                            </div>
                          ))}
                        </div>

                        {MOCK_REVIEWS.length > 2 && (
                          <button
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="w-full mt-2 text-center text-[11px] text-[#00FF9D] hover:text-[#00FF9D]/80 font-medium flex items-center justify-center gap-1 transition-colors"
                          >
                            {showAllReviews ? 'Show Less' : `Show All ${MOCK_REVIEWS.length} Reviews`}
                            <ChevronDown size={12} className={`transition-transform ${showAllReviews ? 'rotate-180' : ''}`} />
                          </button>
                        )}

                        {/* Write Review */}
                        <div className="mt-4 pt-3 border-t border-white/[0.06]">
                          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Write a Review</p>
                          <RatingStars rating={reviewRating} onRate={setReviewRating} size={18} />
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder="Share your experience..."
                              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-600 outline-none focus:border-[#00FF9D]/30 transition-colors"
                            />
                            <button className="px-3 py-2 bg-[#00FF9D]/10 border border-[#00FF9D]/25 rounded-lg text-[#00FF9D] hover:bg-[#00FF9D]/20 transition-colors">
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                        <h3 className="text-white text-sm font-semibold mb-3">Bot Information</h3>
                        <div className="space-y-3">
                          <InfoRow label="Type" value={style.label + ' Strategy'} />
                          <InfoRow label="Visibility" value={bot.visibility === 'public' ? 'Public' : 'Private'} />
                          <InfoRow label="Created" value={formatDate(bot.createdAt || bot.created_at)} />
                          <InfoRow label="Last Updated" value={formatDate(bot.updatedAt || bot.updated_at)} />
                          {bot.graph && <InfoRow label="Complexity" value={`${bot.graph.nodes?.length || 0} nodes, ${bot.graph.connections?.length || 0} edges`} />}
                          <InfoRow label="Backtests Run" value={bot.stats?.backtestCount || 0} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Action Bar ─── */}
              <div className="px-6 py-4 border-t border-white/[0.06] bg-black/40 flex items-center justify-between shrink-0">
                <span className="text-gray-600 text-[10px] font-medium uppercase tracking-wider">
                  {variant === 'marketplace' ? 'Community Bot' : variant === 'deployed' ? 'Deployed Bot' : 'Your Creation'}
                </span>

                <div className="flex items-center gap-2">
                  {/* Download .fyd */}
                  {onDownload && (
                    <button
                      onClick={() => onDownload(bot)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[11px] font-medium hover:bg-white/[0.08] transition-all"
                    >
                      <Download size={14} className="text-gray-400" />
                      Download .fyd
                    </button>
                  )}

                  {/* Backtest */}
                  {onBacktest && (
                    <button
                      onClick={() => onBacktest(bot)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A26DFF]/10 border border-[#A26DFF]/25 text-[#A26DFF] text-[11px] font-bold hover:bg-[#A26DFF]/20 transition-all"
                    >
                      <Play size={14} />
                      Run Backtest
                    </button>
                  )}

                  {/* Clone (marketplace) */}
                  {variant === 'marketplace' && onDeploy && (
                    <button
                      onClick={() => onDeploy(bot)}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00FF9D]/10 border border-[#00FF9D]/25 text-[#00FF9D] text-[11px] font-bold hover:bg-[#00FF9D]/20 transition-all shadow-[0_0_20px_rgba(0,255,157,0.1)]"
                    >
                      <Rocket size={14} />
                      Deploy Bot
                    </button>
                  )}

                  {/* Edit (own bots) */}
                  {variant === 'creation' && onEdit && (
                    <button
                      onClick={() => onEdit(bot)}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00FF9D]/10 border border-[#00FF9D]/25 text-[#00FF9D] text-[11px] font-bold hover:bg-[#00FF9D]/20 transition-all shadow-[0_0_20px_rgba(0,255,157,0.1)]"
                    >
                      <Pencil size={14} />
                      Edit in Builder
                    </button>
                  )}

                  {/* Delete (own bots) */}
                  {variant === 'creation' && onDelete && (
                    <button
                      onClick={() => onDelete(bot)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-bold hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Stat Card ───
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center group hover:border-white/[0.12] transition-colors">
    <Icon size={14} className="mx-auto mb-1.5 text-gray-500 group-hover:text-gray-400 transition-colors" style={{ color: `${color}60` }} />
    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
    <div className="text-sm font-bold" style={{ color }}>{value}</div>
  </div>
);

// ─── Info Row ───
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-500 text-xs">{label}</span>
    <span className="text-white text-xs font-medium">{String(value)}</span>
  </div>
);

export default BotDetailModal;
