// src/utils/tvDatafeed.js
import API_BASE_URL from '../config';
import { getToken } from './token';

export const createDatafeed = () => ({
    onReady: (cb) => {
        setTimeout(() => cb({ supported_resolutions: ["60", "1D"] }));
    },
    searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
        onResultReadyCallback([{ symbol: 'SOL/USDT', full_name: 'SOL/USDT', description: 'Solana', exchange: 'Binance', type: 'crypto' }]);
    },
    resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
        setTimeout(() => {
            onSymbolResolvedCallback({
                name: symbolName,
                full_name: symbolName,
                description: symbolName,
                type: 'crypto',
                session: '24x7',
                timezone: 'Etc/UTC',
                exchange: 'binance',
                minmov: 1,
                pricescale: 100,
                has_intraday: true,
                supported_resolutions: ["60", "1D"],
                data_status: 'streaming',
            });
        }, 0);
    },
    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const { from, to, firstDataRequest } = periodParams;
        try {
            // Fetch MORE data than needed so we can filter
            // Ideally, your backend should accept ?from=X&to=Y params.
            // If it doesn't, we fetch 1000 candles and filter in JS.
            const token = getToken();

            // Sanitize symbol: "SOL/USDT" -> "SOLUSDT"
            const cleanSymbol = symbolInfo.name.replace('/', '');

            // Map Resolution: 60 -> 1h, 1D -> 1d, etc.
            let interval = resolution;
            if (resolution === '60') interval = '1h';
            else if (resolution === '1D') interval = '1d';
            else if (['1', '3', '5', '15', '30'].includes(resolution)) interval = `${resolution}m`;

            const exchange = symbolInfo.exchange || 'BINANCE';
            const url = `${API_BASE_URL}/user/market-candles?symbol=${cleanSymbol}&interval=${interval}&limit=1500&from=${from}&to=${to}&exchange=${exchange}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    console.error("Unauthorized access to market data");
                }
                throw new Error(`Failed to fetch candles: ${res.status}`);
            }

            const data = await res.json();

            if (!data || data.length === 0) {
                onHistoryCallback([], { noData: true });
                return;
            }

            const bars = data.map(bar => ({
                time: bar.time * 1000,
                open: Number(bar.open),
                high: Number(bar.high),
                low: Number(bar.low),
                close: Number(bar.close),
                volume: Number(bar.volume)
            })).sort((a, b) => a.time - b.time);

            // --- CRITICAL FIX FOR THE LOOP ---
            // If the backend returned data, we should pass it to TradingView.
            // Strict filtering locally might cause "noData" loops if the backend
            // returns candles slightly outside the exact millisecond range TV requested.
            // We TRUST the backend's 'since' parameter and just pass what we got,
            // or at least be more lenient.

            if (bars.length > 0) {
                // Return ALL bars. TradingView's library handles extra data gracefully.
                // Returning 'noData: false' with data stops the recursive "digging".
                onHistoryCallback(bars, { noData: false });
            } else {
                // Genuine no data from backend
                onHistoryCallback([], { noData: true });
            }
        } catch (err) {
            console.error(err);
            onErrorCallback(err);
        }
    },
    subscribeBars: () => { },
    unsubscribeBars: () => { },
});