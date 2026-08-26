import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Activity, Grid, TrendingUp, Zap, Filter,
  ArrowUpDown, Store, Bot as BotIcon, HardDrive, Inbox
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import BotCard from '../../components/dashboard/BotCard';
import BotDetailModal from '../../components/dashboard/BotDetailModal';
import PublishBotModal from '../../components/dashboard/PublishBotModal';
import API_BASE_URL from '../../config';
import { getToken } from '../../utils/token';

// ─── Mock Marketplace Data ───
const MOCK_MARKETPLACE_BOTS = [
  {
    id: 'pub_1', name: 'Quantum Grid Alpha', author: 'TradeMaster',
    rating: 4.8, usageCount: 1247, type: 'grid', strategyType: 'grid',
    description: 'The Quantum Grid Alpha is an advanced, institutional-grade grid trading strategy that leverages AI-driven algorithms to dynamically adjust grid levels based on real-time market volatility. \n\nIt is highly optimized for sideways markets and range-bound assets, generating consistent micro-profits by continuously buying low and selling high within established, AI-calculated channels. The bot automatically widens grid spacing during high-volatility events to avoid getting trapped, and tightens them during consolidation to maximize execution frequency.\n\nRecommended configuration: BTC/USDT or ETH/USDT on a 1H timeframe with a minimum capital allocation of $500 for optimal grid distribution.',
    visibility: 'public', createdAt: '2026-06-15T10:00:00Z',
    tags: ['grid', 'btc', 'advanced'],
    image: '/bot_profiles/bot_quantum.png',
    price: 49
  },
  {
    id: 'pub_2', name: 'ETH DCA Scalper', author: 'CryptoWhale',
    rating: 4.5, usageCount: 890, type: 'dca', strategyType: 'dca',
    description: 'Designed specifically for highly volatile assets like Ethereum and trending altcoins, this Dollar Cost Averaging (DCA) bot aggressively buys into dips using a Martingale-style volume multiplier. \n\nIt automatically scales out of positions during brief market bounces, ensuring extremely quick profit taking. Risk management rules are strictly enforced at the core level to prevent severe drawdowns during black swan events, including a hard stop-loss trigger if the asset drops beyond 15% in a single 4H candle.\n\nHistorically, this bot thrives in bull market corrections, turning temporary red days into highly profitable accumulation zones.',
    visibility: 'public', createdAt: '2026-06-20T11:00:00Z',
    tags: ['dca', 'eth', 'scalp'],
    image: '/bot_profiles/bot_eth.png',
    price: 'Free'
  },
  {
    id: 'pub_3', name: 'RSI Visual Flow', author: 'VisualBuilderX',
    rating: 4.9, usageCount: 2305, type: 'visual', strategyType: 'visual',
    description: 'A beautifully simple yet highly effective strategy built entirely inside the Fydblock Visual Bot Builder. \n\nIt triggers market buy orders when the 14-period RSI crosses below 30 (indicating an oversold condition) and executes market sell orders when the RSI crosses above 70 (indicating an overbought condition). \n\nBecause it was built visually, you can easily open this strategy in the Visual Builder yourself and modify the node connections—for example, adding an SMA (Simple Moving Average) filter node to only take RSI signals that align with the broader market trend. It serves as an excellent starting template for beginners.',
    visibility: 'public', createdAt: '2026-05-10T14:30:00Z',
    tags: ['visual', 'rsi', 'beginner'],
    image: '/bot_profiles/bot_rsi.png',
    price: 'Free'
  },
  {
    id: 'pub_4', name: 'MACD Signal Tracer', author: 'AlgoPro',
    rating: 4.2, usageCount: 450, type: 'signal', strategyType: 'signal',
    description: 'Connect your proprietary TradingView PineScript indicators directly to Fydblock. The MACD Signal Tracer listens for incoming JSON webhook payloads and executes trades instantly based on MACD line crossovers.\n\nIt features built-in latency reduction, processing webhook signals in under 50ms, and dynamically calculates position sizing based on your total account equity and predefined risk percentage (default 2% per trade).\n\nIdeal for algorithmic traders who prefer doing their analysis on TradingView but need a highly reliable execution engine on the exchange side.',
    visibility: 'public', createdAt: '2026-07-01T09:15:00Z',
    tags: ['signal', 'macd'],
    image: '/bot_profiles/bot_macd.png',
    price: 49
  },
];

const TABS = [
  { id: 'creations', label: 'My Creations', icon: HardDrive },
  { id: 'deployed', label: 'Deployed Bots', icon: BotIcon },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
];

const BotHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('creations');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, grid, dca, visual, signal
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [selectedBot, setSelectedBot] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [publishBot, setPublishBot] = useState(null);

  // Data
  const [createdBots, setCreatedBots] = useState([]);
  const [deployedBots, setDeployedBots] = useState([]);
  const [loadingDeployed, setLoadingDeployed] = useState(false);

  // 1. Load Created Bots (localStorage)
  useEffect(() => {
    const loadCreated = () => {
      try {
        const raw = localStorage.getItem('fydblock_created_bots');
        if (raw) {
          setCreatedBots(JSON.parse(raw));
        } else {
          // If no array exists, check for the legacy single strategy for migration
          const legacy = localStorage.getItem('fydblock_strategy');
          if (legacy) {
            const parsed = JSON.parse(legacy);
            const migrated = [{
              id: `cb_${Date.now()}`,
              name: parsed.name || 'Migrated Strategy',
              description: 'Migrated from older visual builder',
              visibility: 'private',
              strategyType: 'visual',
              createdAt: new Date().toISOString(),
              graph: { nodes: parsed.nodes || [], connections: parsed.connections || [] },
              tags: ['migrated']
            }];
            setCreatedBots(migrated);
            localStorage.setItem('fydblock_created_bots', JSON.stringify(migrated));
          }
        }
      } catch (e) {
        console.error("Failed to load created bots", e);
      }
    };
    loadCreated();
  }, []);

  // 2. Load Deployed Bots (API)
  useEffect(() => {
    if (activeTab === 'deployed') {
      const fetchDeployed = async () => {
        setLoadingDeployed(true);
        try {
          const token = getToken();
          if (!token) return;
          const res = await fetch(`${API_BASE_URL}/user/bots`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setDeployedBots(data.data || []);
          }
        } catch (e) {
          console.error("Failed to fetch deployed bots", e);
        } finally {
          setLoadingDeployed(false);
        }
      };
      fetchDeployed();
    }
  }, [activeTab]);

  // ─── Actions ───
  const handleEdit = (bot) => {
    if (activeTab === 'creations') {
      // Migrate it to the current active strategy slot
      localStorage.setItem('fydblock_strategy', JSON.stringify({
        name: bot.name,
        nodes: bot.graph?.nodes || [],
        connections: bot.graph?.connections || []
      }));
      navigate('/visual-builder');
    } else if (activeTab === 'deployed') {
      if (bot.bot_type?.toLowerCase().includes('grid')) {
        navigate('/dashboard/deploy');
      } else {
        navigate(`/configure-bot?type=${encodeURIComponent(bot.bot_type || 'Custom')}`);
      }
    }
  };

  const handleBacktest = (bot) => {
    navigate('/backtest-engine');
  };

  const handleDownload = (bot) => {
    const payload = bot.graph || { name: bot.name };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(bot.name || 'bot').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.fyd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeploy = (bot) => {
    navigate('/dashboard/deploy-template', { state: { templateBot: bot } });
  };

  const handleDelete = (bot) => {
    if (window.confirm(`Are you sure you want to delete ${bot.name}?`)) {
      const updated = createdBots.filter(b => b.id !== bot.id);
      setCreatedBots(updated);
      localStorage.setItem('fydblock_created_bots', JSON.stringify(updated));
      setIsDetailModalOpen(false);
    }
  };

  const handlePublishUpdate = (updatedBot) => {
    const updatedList = createdBots.map(b => b.id === updatedBot.id ? updatedBot : b);
    setCreatedBots(updatedList);
    localStorage.setItem('fydblock_created_bots', JSON.stringify(updatedList));
  };

  const openDetail = (bot) => {
    setSelectedBot(bot);
    setIsDetailModalOpen(true);
  };

  // ─── Filtering & Sorting ───
  const getFilteredBots = (bots) => {
    return bots
      .filter(b => {
        const matchesSearch = (b.name || b.bot_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const bType = (b.strategyType || b.bot_type || 'visual').toLowerCase();
        const matchesType = filterType === 'all' || bType.includes(filterType);
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'popular') return (b.usageCount || 0) - (a.usageCount || 0);
        if (sortBy === 'name') return (a.name || a.bot_name || '').localeCompare(b.name || b.bot_name || '');
        return 0;
      });
  };

  const displayedBots = useMemo(() => {
    if (activeTab === 'creations') return getFilteredBots(createdBots);
    if (activeTab === 'deployed') return getFilteredBots(deployedBots);
    return getFilteredBots(MOCK_MARKETPLACE_BOTS);
  }, [activeTab, createdBots, deployedBots, searchQuery, filterType, sortBy]);

  return (
    <DashboardLayout headerSlot={
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight ml-14 md:ml-0">
          Bot Marketplace
        </h1>
      </div>
    }>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">

        {/* ─── Controls Header ─── */}
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-[#0A0E11]/80 border border-white/[0.05] rounded-2xl p-4 md:p-5 backdrop-blur-xl shadow-lg">
          
          {/* Tabs */}
          <div className="flex bg-[#000000]/60 p-1.5 rounded-xl border border-white/[0.04] w-full xl:w-auto overflow-x-auto custom-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center xl:flex-none ${
                  activeTab === tab.id
                    ? 'bg-[#00FF9D]/10 text-[#00FF9D] shadow-[0_0_15px_rgba(0,255,157,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? 'text-[#00FF9D]' : ''} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-64 min-w-[200px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bots..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#00FF9D]/30 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#00FF9D]/30 transition-colors flex-1 sm:w-auto appearance-none"
              >
                <option value="all">All Types</option>
                <option value="grid">Grid Bots</option>
                <option value="dca">DCA Bots</option>
                <option value="visual">Visual Bots</option>
                <option value="signal">Signal Bots</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#00FF9D]/30 transition-colors flex-1 sm:w-auto appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Used</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Grid ─── */}
        <div className="min-h-[400px]">
          {activeTab === 'deployed' && loadingDeployed ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <div className="w-8 h-8 border-2 border-[#00FF9D]/30 border-t-[#00FF9D] rounded-full animate-spin mb-4" />
              Loading deployed bots...
            </div>
          ) : displayedBots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] bg-white/[0.01] border border-white/[0.04] rounded-3xl text-center p-8">
              <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mb-6">
                <Inbox size={32} className="text-gray-600" />
              </div>
              <h3 className="text-white text-lg font-bold mb-2">No bots found</h3>
              <p className="text-gray-500 text-sm max-w-sm mb-6">
                {searchQuery || filterType !== 'all' 
                  ? "We couldn't find any bots matching your current filters."
                  : activeTab === 'creations'
                    ? "You haven't created any custom strategies yet."
                    : "You don't have any actively deployed bots."}
              </p>
              {(searchQuery || filterType !== 'all') ? (
                <button
                  onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                  className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm font-medium hover:bg-white/[0.08] transition-colors"
                >
                  Clear Filters
                </button>
              ) : activeTab === 'creations' ? (
                <button
                  onClick={() => navigate('/visual-builder')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00FF9D]/10 border border-[#00FF9D]/25 text-[#00FF9D] text-sm font-bold hover:bg-[#00FF9D]/20 transition-all shadow-[0_0_20px_rgba(0,255,157,0.1)]"
                >
                  <Plus size={16} />
                  Build New Strategy
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {displayedBots.map((bot, i) => (
                  <BotCard
                    key={bot.id || i}
                    bot={bot}
                    index={i}
                    variant={activeTab === 'creations' ? 'creation' : activeTab === 'deployed' ? 'deployed' : 'marketplace'}
                    onClick={activeTab !== 'deployed' ? handleDeploy : openDetail}
                    onEdit={activeTab === 'marketplace' ? undefined : handleEdit}
                    onBacktest={handleBacktest}
                    onDownload={handleDownload}
                    onPublish={activeTab === 'creations' ? (b) => setPublishBot(b) : undefined}
                    onDeploy={activeTab === 'marketplace' ? handleDeploy : undefined}
                    onDelete={activeTab === 'creations' ? handleDelete : undefined}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modals ─── */}
      <BotDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        bot={selectedBot}
        variant={activeTab === 'creations' ? 'creation' : activeTab === 'deployed' ? 'deployed' : 'marketplace'}
        onEdit={(b) => { setIsDetailModalOpen(false); handleEdit(b); }}
        onBacktest={(b) => { setIsDetailModalOpen(false); handleBacktest(b); }}
        onDownload={handleDownload}
        onDeploy={(b) => { setIsDetailModalOpen(false); handleDeploy(b); }}
        onDelete={activeTab === 'creations' ? handleDelete : undefined}
      />

      <PublishBotModal
        isOpen={!!publishBot}
        onClose={() => setPublishBot(null)}
        bot={publishBot}
        onPublish={handlePublishUpdate}
      />

    </DashboardLayout>
  );
};

export default BotHub;
