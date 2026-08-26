import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Rocket, Activity, Grid, TrendingUp, Zap, 
  Star, Users, ShieldCheck, AlertTriangle, ArrowUpRight, BarChart3, TrendingDown,
  Info, MessageSquare, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getSortedPairs } from '../../data/pairs';
import { useTrading } from '../../context/TradingContext';

const ALL_PAIRS = getSortedPairs();

const STRATEGY_STYLES = {
  grid: { color: '#A26DFF', label: 'Grid', icon: Grid },
  dca: { color: '#3B82F6', label: 'DCA', icon: TrendingUp },
  visual: { color: '#00FF9D', label: 'Visual', icon: Zap },
  signal: { color: '#F59E0B', label: 'Signal', icon: Activity },
};

const TemplateDeploy = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const bot = state?.templateBot;
  const { connectedExchanges, isPaperTrading } = useTrading();

  const [activeTab, setActiveTab] = useState('overview');
  const [exchange, setExchange] = useState('');
  const [pair, setPair] = useState('SOL/USDT');
  const [investment, setInvestment] = useState(1000);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (!bot) {
      navigate('/bot-hub');
    }
  }, [bot, navigate]);

  if (!bot) return null;

  const strategyType = (bot.strategyType || bot.bot_type || 'visual').toLowerCase();
  const style = STRATEGY_STYLES[strategyType] || STRATEGY_STYLES.visual;
  const TypeIcon = style.icon;

  const handleDeploy = async () => {
    if (!exchange && !isPaperTrading) {
      alert("Please select an exchange");
      return;
    }

    setIsDeploying(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const existingRaw = localStorage.getItem('fydblock_active_bots') || '[]';
      const existing = JSON.parse(existingRaw);

      const newBot = {
        id: `db_${Date.now()}`,
        bot_name: bot.name || bot.bot_name,
        bot_type: strategyType.toUpperCase(),
        exchange: exchange || 'PAPER',
        pair,
        status: 'RUNNING',
        created_at: new Date().toISOString(),
        investment,
        unrealized_profit: 0,
        unrealized_profit_pct: 0,
        graph: bot.graph || null,
        templateId: bot.id
      };

      existing.unshift(newBot);
      localStorage.setItem('fydblock_active_bots', JSON.stringify(existing));
      
      navigate('/dashboard/portfolio', { state: { deploySuccess: true } });
    } catch (err) {
      console.error(err);
      alert("Failed to deploy. Please try again.");
      setIsDeploying(false);
    }
  };

  const MOCK_REVIEWS = [
    { userName: 'CryptoWhale', rating: 5, text: 'Consistently hits the targets. Excellent strategy for current market conditions.' },
    { userName: 'AlgoPro', rating: 4, text: 'Great for compounding gains. Slightly higher drawdown than expected but manageable.' },
    { userName: 'GridMaster', rating: 5, text: 'Best template I have found here. Set it and forget it!' }
  ];

  const MOCK_COMMENTS = [
    { userName: 'AlphaTrader', time: '2 hours ago', text: 'Does anyone have the optimal settings for this when running on high volatility pairs?' },
    { userName: 'CryptoWhale', time: '5 hours ago', text: 'I usually stick to the default settings, it handles volatility quite well inherently.' },
    { userName: 'NewbieBotter', time: '1 day ago', text: 'Where can I find a tutorial on how this specific logic works?' }
  ];

  const rating = bot.rating || 4.5;
  const usageCount = Number(bot.usageCount) || Math.floor(Math.random() * 500) + 100;
  
  const stats = bot.stats || {
    totalReturn: 12.5,
    winRate: 68,
    maxDrawdown: 4.2
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'reviews', label: `Reviews (${MOCK_REVIEWS.length})`, icon: Star },
    { id: 'comments', label: `Comments (${MOCK_COMMENTS.length})`, icon: MessageSquare },
  ];

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col p-6 max-w-[1400px] mx-auto space-y-6">
        
        {/* Top Header Navigation */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/bot-hub')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Marketplace
              <span className="text-gray-500 font-normal">/</span>
              <span className="text-[#00FF9D]">{bot.name || bot.bot_name || 'Template'}</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: Bot Profile & Deployment Config */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Bot Profile Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0A0E11] border border-white/5 rounded-2xl p-6 relative overflow-hidden"
            >
              {/* Background Glow */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-20 pointer-events-none"
                style={{ background: style.color }}
              />

              {/* Avatar */}
              <div 
                className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center mb-4 relative z-10 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${style.color}30, ${style.color}10)`, border: `1px solid ${style.color}30` }}
              >
                {bot.image ? (
                  <img src={bot.image} alt={bot.name || 'Bot Profile'} className="w-full h-full object-cover" />
                ) : (
                  <TypeIcon size={40} style={{ color: style.color }} />
                )}
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-1">{bot.name || bot.bot_name || 'Untitled Bot'}</h2>
                {bot.author && (
                  <div className="flex justify-center items-center gap-1.5 mb-2">
                    <span className="text-gray-400 text-sm">by</span>
                    <span className="text-white text-sm font-bold">{bot.author}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-1.5 text-[#F59E0B] text-sm font-bold">
                  <Star size={14} className="fill-current" />
                  {rating.toFixed(1)}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="bg-black/40 rounded-xl p-3 text-center border border-white/5">
                  <div className="text-xs text-gray-500 font-medium mb-1 flex justify-center items-center gap-1">
                    <Download size={12} /> Installs
                  </div>
                  <div className="text-sm font-bold text-white">{usageCount.toLocaleString()}</div>
                </div>
                <div className="bg-black/40 rounded-xl p-3 text-center border border-white/5">
                  <div className="text-xs text-gray-500 font-medium mb-1">Version</div>
                  <div className="text-sm font-bold text-white">1.0.0</div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="text-center text-xl font-bold text-white mb-4">FREE</div>
              </div>
            </motion.div>

            {/* Deployment Config Panel (Acts like Buy/Demo Panel) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0A0E11] border border-[#00FF9D]/20 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#00FF9D]/5 pointer-events-none" />
              
              <h3 className="text-sm font-bold mb-5 flex items-center gap-2 text-white relative z-10">
                <Rocket size={16} className="text-[#00FF9D]" />
                Deploy Configuration
              </h3>

              <div className="space-y-4 relative z-10">
                {/* Exchange */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Exchange</label>
                  <select
                    value={exchange}
                    onChange={(e) => setExchange(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00FF9D] transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                  >
                    <option value="">Select Exchange</option>
                    {isPaperTrading && <option value="PAPER">Fydblock Paper Trading</option>}
                    {(connectedExchanges || []).map(ex => {
                      const name = ex.exchange_name || ex.exchange || 'Unknown';
                      return (
                        <option key={ex.id || name} value={name}>{name.toUpperCase()}</option>
                      );
                    })}
                  </select>
                </div>

                {/* Pair */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Trading Pair</label>
                  <select
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00FF9D] transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                  >
                    {ALL_PAIRS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Investment */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Total Investment (USDT)</label>
                  <input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00FF9D] transition-colors"
                  />
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="w-full py-3.5 rounded-xl bg-[#00FF9D] text-black font-extrabold text-sm hover:shadow-[0_0_30px_rgba(0,255,157,0.4)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                >
                  {isDeploying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket size={18} />
                      DEPLOY BOT
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* MAIN CONTENT AREA (Right Side) */}
          <div className="lg:col-span-9 flex flex-col space-y-6">
            
            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 border-b border-white/10 pb-px">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-5 py-3 text-sm font-bold flex items-center gap-2 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <TabIcon size={16} className={isActive ? 'text-[#00FF9D]' : ''} />
                    {tab.label}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00FF9D]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content Container */}
            <div className="bg-[#0A0E11] border border-white/5 rounded-2xl p-6 min-h-[400px]">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">About this Bot</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {bot.description || 'No description provided.'}
                    </p>
                    {bot.description?.length < 50 && (
                      <p className="text-gray-300 leading-relaxed text-sm mt-4">
                        This advanced algorithm is built upon the proven success of our core engine, introducing powerful dynamic adaptations that allow traders to excel across different market conditions. Each sub-strategy has been individually reviewed, refined, and optimized to deliver better performance.
                      </p>
                    )}
                  </div>

                  {/* Performance Highlight */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs font-bold uppercase tracking-wider">
                        <ArrowUpRight size={14} className="text-[#00FF9D]" />
                        Total Return
                      </div>
                      <div className="text-2xl font-bold text-[#00FF9D]">+{stats.totalReturn}%</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs font-bold uppercase tracking-wider">
                        <BarChart3 size={14} className="text-[#3B82F6]" />
                        Win Rate
                      </div>
                      <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs font-bold uppercase tracking-wider">
                        <TrendingDown size={14} className="text-red-400" />
                        Max Drawdown
                      </div>
                      <div className="text-2xl font-bold text-white">{stats.maxDrawdown}%</div>
                    </div>
                  </div>

                  {/* Tags */}
                  {bot.tags && bot.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 mb-3">Tags & Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {bot.tags.map(tag => (
                          <div key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-xs font-medium text-gray-300 border border-white/10">
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-orange-500 mb-1">Risk Warning</h4>
                      <p className="text-xs text-orange-400/90 leading-relaxed">
                        IMPORTANT: After deploying, ensure your exchange API keys have the appropriate trading permissions enabled. Automated trading carries significant risks, and historical performance is not indicative of future results.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Community Reviews</h3>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10">
                      Write a Review
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_REVIEWS.map((review, i) => (
                      <div key={i} className="bg-black/30 rounded-xl p-5 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FF9D]/20 to-[#A26DFF]/20 flex items-center justify-center text-xs font-bold border border-white/5">
                              {review.userName.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-white">{review.userName}</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-[#F59E0B]">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} size={14} className={j < review.rating ? 'fill-current' : 'text-gray-700'} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">"{review.text}"</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* Add Comment Input */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF9D]/40 to-[#A26DFF]/40 flex items-center justify-center text-sm font-bold shrink-0 mt-1 border border-white/20 shadow-lg">
                      ME
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea 
                        placeholder="Join the conversation... ask questions or share thoughts."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#3B82F6] transition-colors resize-none min-h-[100px]"
                      />
                      <div className="flex justify-end">
                        <button className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold rounded-lg transition-colors">
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 w-full" />

                  {/* Comments List */}
                  <div className="space-y-6">
                    {MOCK_COMMENTS.map((comment, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0 border border-white/5">
                          {comment.userName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1.5">
                            <span className="text-sm font-bold text-white">{comment.userName}</span>
                            <span className="text-xs text-gray-500 font-medium">{comment.time}</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed bg-black/20 p-4 rounded-xl rounded-tl-none border border-white/5">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', zIndex: 9999, position: 'relative', backgroundColor: 'black', height: '100vh' }}>
          <h1>TemplateDeploy Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Component Stack</summary>
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const SafeTemplateDeploy = (props) => (
  <ErrorBoundary>
    <TemplateDeploy {...props} />
  </ErrorBoundary>
);

export default SafeTemplateDeploy;
