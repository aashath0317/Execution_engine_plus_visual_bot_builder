import React, { useEffect, useRef } from 'react';

const TradingViewWidget = ({ exchange, pair }) => {
    const container = useRef();

    useEffect(() => {
        const uniqueId = `tv_widget_${Math.random().toString(36).substr(2, 9)}`;
        if (container.current) {
            container.current.innerHTML = "";
            const widgetDiv = document.createElement("div");
            widgetDiv.id = uniqueId;
            widgetDiv.style.width = "100%";
            widgetDiv.style.height = "100%";
            container.current.appendChild(widgetDiv);

            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/tv.js";
            script.async = true;
            script.onload = () => {
                if (window.TradingView) {
                    const tvExchangeMap = {
                        'binance': 'BINANCE',
                        'bybit': 'BYBIT',
                        'okx': 'OKX'
                    };
                    const tvExchange = tvExchangeMap[exchange?.toLowerCase()] || 'BINANCE';
                    const tvSymbol = pair ? pair.replace('/', '') : 'BTCUSDT';

                    new window.TradingView.widget({
                        "autosize": true,
                        "symbol": `${tvExchange}:${tvSymbol}`,
                        "interval": "1H",
                        "timezone": "Etc/UTC",
                        "theme": "dark",
                        "style": "1",
                        "locale": "en",
                        "toolbar_bg": "#0A1014",
                        "enable_publishing": false,
                        "allow_symbol_change": true,
                        "fontsize": "10",
                        "container_id": uniqueId,
                        "hide_side_toolbar": false,
                        "studies": []
                    });
                }
            };
            container.current.appendChild(script);
        }
    }, [exchange, pair]);


    return (
        <div className="w-full h-full bg-[#0A1014] border border-white/10 overflow-hidden relative" ref={container}>
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">Loading Chart...</div>
        </div>
    );
};

export default TradingViewWidget;
