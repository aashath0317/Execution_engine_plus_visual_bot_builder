import React, { useEffect, useRef } from 'react';
import { createDatafeed } from '../utils/tvDatafeed';

const GridChart = ({ exchange, pair, gridLines = [], currentPrice, isLoading }) => {
    const containerRef = useRef(null);
    const widgetRef = useRef(null);
    const shapeIdsRef = useRef([]); // Track created shapes
    const isChartReadyRef = useRef(false); // Track readiness
    const latestGridLinesRef = useRef(gridLines); // Track latest props

    useEffect(() => {
        latestGridLinesRef.current = gridLines;
    }, [gridLines]);

    useEffect(() => {
        // Prevent double-init in Strict Mode
        if (widgetRef.current) return;

        // Wait for price if provided - REMOVED strict check to allow init
        // if (currentPrice !== undefined && (currentPrice === 0 || currentPrice === null)) return;

        const initChart = () => {
            // Check if script is loaded
            if (!window.TradingView) {
                console.log("Waiting for TradingView library...");
                setTimeout(initChart, 500);
                return;
            }

            console.log("Library found! Initializing widget...");


            const themeColors = {
                "paneProperties.background": "#050B0D",
                "paneProperties.vertGridProperties.color": "#1f2937",
                "paneProperties.horzGridProperties.color": "#1f2937",
                "scalesProperties.textColor": "#9ca3af",
                "mainSeriesProperties.candleStyle.upColor": "#00FF9D",
                "mainSeriesProperties.candleStyle.downColor": "#EA4335",
                "mainSeriesProperties.candleStyle.drawWick": true,
                "mainSeriesProperties.candleStyle.drawBorder": true,
                "mainSeriesProperties.candleStyle.borderColor": "#374151",
                "mainSeriesProperties.candleStyle.borderUpColor": "#00FF9D",
                "mainSeriesProperties.candleStyle.borderDownColor": "#EA4335",
                "mainSeriesProperties.candleStyle.wickUpColor": "#00FF9D",
                "mainSeriesProperties.candleStyle.wickDownColor": "#EA4335",
            };

            const widgetOptions = {
                symbol: pair || 'SOL/USDT',
                interval: '60',
                container: containerRef.current,
                library_path: '/charting_library/',
                locale: 'en',
                disabled_features: ["header_symbol_search", "header_compare", "header_saveload", "popup_hints"],
                enabled_features: [],
                fullscreen: false,
                autosize: true,
                theme: 'Dark',
                debug: false,
                datafeed: createDatafeed(exchange), // Use Real Datafeed with correct exchange
                overrides: themeColors,
            };

            const widget = new window.TradingView.widget(widgetOptions);
            widgetRef.current = widget;

            widget.onChartReady(() => {
                try {
                    console.log("Chart is READY!");
                    isChartReadyRef.current = true;
                    // Force apply overrides to ensure they take effect
                    widget.applyOverrides(themeColors);
                    // Initial draw (use Ref to get latest data)
                    if (latestGridLinesRef.current && latestGridLinesRef.current.length > 0) {
                        updateGridLines(latestGridLinesRef.current);
                    }
                } catch (e) {
                    console.error("Error in onChartReady:", e);
                }
            });
        };

        initChart();

        return () => {
            if (widgetRef.current) {
                console.log("Removing chart widget...");
                try {
                    widgetRef.current.remove();
                } catch (e) {
                    console.warn("Failed to remove widget properly", e);
                }
                widgetRef.current = null;
                isChartReadyRef.current = false;
            }
        };
    }, [pair, exchange]);

    // Listen for changes in gridLines and update chart
    useEffect(() => {
        if (widgetRef.current && isChartReadyRef.current && gridLines.length > 0) {
            updateGridLines(gridLines);
        }
    }, [gridLines]);

    const updateGridLines = (lines) => {
        if (!isChartReadyRef.current) return;
        const widget = widgetRef.current;
        if (!widget) return;

        try {
            // Check if widget still valid and has chart method
            if (typeof widget.chart !== 'function') {
                console.warn("Widget exists but chart() method is not available yet.");
                return;
            }

            const chart = widget.chart();
            if (!chart) {
                console.warn("Chart object is null.");
                return;
            }

            // Explicitly remove previous shapes
            if (shapeIdsRef.current.length > 0) {
                shapeIdsRef.current.forEach(id => {
                    if (id) {
                        try { chart.removeEntity(id); } catch (e) { }
                    }
                });
                shapeIdsRef.current = [];
            }

            // Fallback clear - wrap in try/catch as it might fail if chart is not ready
            try {
                chart.removeAllShapes();
            } catch (e) {
                console.warn("removeAllShapes failed", e);
            }

            if (!lines || lines.length === 0) return;

            lines.forEach((line) => {
                if (!line || typeof line.price === 'undefined') return;

                const isBuy = line.side === 'buy';
                const color = isBuy ? '#00FF9D' : '#EA4335';

                // If qty is 0 (preview mode), show Price instead of Qty
                const labelValue = (line.qty === 0 || line.qty === undefined)
                    ? parseFloat(line.price).toFixed(4)
                    : parseFloat(line.qty).toFixed(4);

                try {
                    const id = chart.createShape(
                        { price: parseFloat(line.price) },
                        {
                            shape: 'horizontal_line',
                            lock: false,
                            disableSelection: false,
                            disableSave: true,
                            text: isBuy ? `BUY ${labelValue}` : `SELL ${labelValue}`,
                            overrides: {
                                linecolor: color,
                                linestyle: 2, // Dashed
                                linewidth: 1,
                                showLabel: true,
                                showPrice: true, // Show Price Label on Axis
                                textcolor: color,
                                horzLabelsAlign: 'right',
                            }
                        }
                    );
                    if (id) shapeIdsRef.current.push(id);
                } catch (err) {
                    console.error("Failed to create shape for price:", line.price, err);
                }
            });
        } catch (e) {
            console.error("Error drawing lines:", e);
        }
    };

    return (
        <div className="w-full h-full relative overflow-hidden" style={{ minHeight: '450px' }}>
            {isLoading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050B0D]/80 backdrop-blur-sm">
                    {/* Spinner */}
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF9D] mb-4"></div>
                    <span className="text-[#00FF9D] font-bold tracking-wider animate-pulse">SYNCING MARKET DATA...</span>
                </div>
            )}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
};

export default GridChart;
