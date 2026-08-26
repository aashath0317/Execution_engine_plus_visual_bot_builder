import {
  CandlestickChart, BookOpen, Wallet,
  Activity, TrendingUp, BarChart3, LineChart,
  GitBranch, Split, Gauge, Scale,
  ShoppingCart, Tag, Layers, ShieldOff
} from 'lucide-react';

export const NODE_CATEGORIES = [
  {
    title: 'Data Sources',
    nodes: [
      { type: 'price_feed', label: 'Price Feed', icon: CandlestickChart, color: '#FFD43B', inputs: [], outputs: ['price'], defaults: { pair: 'BTC/USDT', exchange: 'Binance' } },
      { type: 'order_book', label: 'Order Book', icon: BookOpen, color: '#FF9F43', inputs: [], outputs: ['bids', 'asks'], defaults: { pair: 'BTC/USDT', depth: 20 } },
      { type: 'wallet_balance', label: 'Wallet Balance', icon: Wallet, color: '#00A3FF', inputs: [], outputs: ['balance'], defaults: { currency: 'USDT' } },
    ],
  },
  {
    title: 'Indicators',
    nodes: [
      { type: 'rsi', label: 'RSI', icon: Activity, color: '#9333EA', inputs: ['price'], outputs: ['value'], defaults: { period: 14, overbought: 70, oversold: 30 } },
      { type: 'moving_avg', label: 'Moving Average', icon: TrendingUp, color: '#00FF9D', inputs: ['price'], outputs: ['value'], defaults: { period: 20, type: 'SMA' } },
      { type: 'macd', label: 'MACD', icon: BarChart3, color: '#00A3FF', inputs: ['price'], outputs: ['macd', 'signal', 'histogram'], defaults: { fast: 12, slow: 26, signal: 9 } },
      { type: 'bollinger', label: 'Bollinger Bands', icon: LineChart, color: '#FF6B6B', inputs: ['price'], outputs: ['upper', 'middle', 'lower'], defaults: { period: 20, stdDev: 2 } },
    ],
  },
  {
    title: 'Logic Controllers',
    nodes: [
      { type: 'if_then', label: 'IF / THEN', icon: GitBranch, color: '#FF6B6B', inputs: ['condition'], outputs: ['true', 'false'], defaults: { operator: '>', value: 70 } },
      { type: 'and_or', label: 'AND / OR', icon: Split, color: '#FFA94D', inputs: ['a', 'b'], outputs: ['result'], defaults: { gate: 'AND' } },
      { type: 'threshold', label: 'Threshold', icon: Gauge, color: '#FF8787', inputs: ['value'], outputs: ['above', 'below'], defaults: { threshold: 50 } },
      { type: 'compare', label: 'Compare', icon: Scale, color: '#E599F7', inputs: ['a', 'b'], outputs: ['result'], defaults: { operator: '>' } },
    ],
  },
  {
    title: 'Execution',
    nodes: [
      { type: 'market_buy', label: 'Market Buy', icon: ShoppingCart, color: '#00FF9D', inputs: ['trigger'], outputs: ['order'], defaults: { amount: 100, unit: 'USDT' } },
      { type: 'limit_sell', label: 'Limit Sell', icon: Tag, color: '#FF4757', inputs: ['trigger'], outputs: ['order'], defaults: { amount: 100, price: 0, unit: 'USDT' } },
      { type: 'dca_accumulate', label: 'DCA Accumulate', icon: Layers, color: '#00A3FF', inputs: ['trigger'], outputs: ['order'], defaults: { amount: 50, interval: '1h', scale: 1.5 } },
      { type: 'stop_loss', label: 'Stop Loss', icon: ShieldOff, color: '#FF6348', inputs: ['trigger'], outputs: ['order'], defaults: { percentage: 5 } },
    ],
  },
];

// Flat lookup map
export const NODE_REGISTRY = {};
NODE_CATEGORIES.forEach(cat => {
  cat.nodes.forEach(n => {
    NODE_REGISTRY[n.type] = { ...n, category: cat.title };
  });
});
