<div className="w-full lg:w-[400px] xl:w-[450px] bg-[#0A1014] border border-white/5 rounded-3xl p-6 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                        {
                            <>
                                
                            <h2 className="text-xl font-bold text-white mb-2">Strategy Tester</h2>
                            <p className="text-sm text-gray-400 mb-6">Configure parameters for backtesting</p>

                        )}

                        {/* BOT SELECTOR */}

                        <div className="space-y-4 mb-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Bot Strategy</label>
                                <div className="relative">
                                    <select value={selectedBotId} onChange={handleSelectBot} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#00FF9D] text-white text-sm appearance-none cursor-pointer">
                                        <option value="">Spot Grid</option>
                                        <option value="dca" disabled>Spot DCA (Coming Soon)</option>
                                        {userBots.length > 0 && <optgroup label="My Active Bots">{userBots.map(bot => <option key={bot.bot_id || bot.id} value={bot.bot_id || bot.id}>{bot.bot_name}</option>)}</optgroup>}
                                        {systemBots.length > 0 && <optgroup label="System Templates">{systemBots.map(bot => <option key={bot.bot_id || bot.id} value={bot.bot_id || bot.id}>{bot.bot_name}</option>)}</optgroup>}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* EXCHANGE & PAIR */}
                        {true && (
                            <div className="space-y-4 mb-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Exchange</label>
                                    <div className="relative" onClick={() => setIsExchangeOpen(!isExchangeOpen)}>
                                        <div className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex justify-between items-center cursor-pointer hover:border-white/20 transition-colors">
                                            <div className="flex items-center gap-2">
                                                {config.exchange && (
                                                    <img
                                                        src={`/exchanges_svg/${config.exchange.toLowerCase()}.svg`}
                                                        alt={config.exchange}
                                                        className="w-5 h-5 object-contain"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <span className="uppercase">{config.exchange || 'Select Exchange'}</span>
                                            </div>
                                            <ChevronDown size={14} className={`transition-transform ${isExchangeOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {isExchangeOpen && (
                                            <div className="absolute z-50 top-full left-0 w-full bg-[#1A2023] border border-white/10 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                                {validExchanges.length > 0 ? (
                                                    validExchanges.map(ex => {
                                                        const cleanName = ex.replace('_paper', '');
                                                        return (
                                                            <div
                                                                key={ex}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const isMock = cleanName === 'MOCK';
                                                                    let newPair = config.pair;
                                                                    if (isMock) {
                                                                        newPair = 'MOCK/USDT';
                                                                    } else if (config.pair === 'MOCK/USDT') {
                                                                        newPair = 'SOL/USDT'; // Reset to valid pair
                                                                    }
                                                                    setConfig({
                                                                        ...config,
                                                                        exchange: cleanName,
                                                                        pair: newPair
                                                                    });
                                                                    setIsExchangeOpen(false);
                                                                }}
                                                                className="px-4 py-3 hover:bg-white/5 text-sm text-gray-300 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                                                            >
                                                                <div className="w-6 h-6 flex items-center justify-center bg-white/5 rounded p-0.5">
                                                                    <img
                                                                        src={`/exchanges_svg/${cleanName.toLowerCase()}.svg`}
                                                                        alt={cleanName}
                                                                        className="w-full h-full object-contain"
                                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                                    />
                                                                </div>
                                                                <span className="uppercase font-bold">{cleanName}</span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-4 text-xs text-gray-500 text-center">
                                                        No {isPaperTrading ? 'Paper' : 'Live'} Exchanges
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1 relative">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pair</label>
                                    <div
                                        onClick={() => setIsPairOpen(!isPairOpen)}
                                        className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm flex justify-between items-center cursor-pointer hover:border-white/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={`/icons/${config.pair.split('/')[0].toLowerCase()}.png`}
                                                alt={config.pair}
                                                className="w-5 h-5 rounded-full"
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/icons/btc.png'; }}
                                            />
                                            <span>{config.pair}</span>
                                        </div>
                                        <ChevronDown size={14} className={`transition-transform ${isPairOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isPairOpen && (
                                        <div className="absolute z-50 top-full left-0 w-full bg-[#1A2023] border border-white/10 rounded-xl mt-1 h-60 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-2">
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                    <input
                                                        autoFocus
                                                        value={pairSearch}
                                                        onChange={e => setPairSearch(e.target.value)}
                                                        className="w-full bg-black/30 text-white text-xs py-2 pl-9 pr-2 rounded-lg border border-white/5 outline-none uppercase focus:border-[#00FF9D]/30 transition-colors"
                                                        placeholder="SEARCH PAIR"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                {filteredPairs.map(p => (
                                                    <div
                                                        key={p}
                                                        onClick={() => { setConfig({ ...config, pair: p }); setIsPairOpen(false); }}
                                                        className="px-4 py-2 hover:bg-white/5 text-xs text-gray-300 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                                                    >
                                                        <img
                                                            src={`/icons/${p.split('/')[0].toLowerCase()}.png`}
                                                            alt={p}
                                                            className="w-5 h-5 rounded-full"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = '/icons/btc.png'; }}
                                                        />
                                                        <span className="font-bold">{p}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        
                        {/* BACKTEST SPECIFICS */}
                        <div className="space-y-4 mb-6 pt-4 border-t border-white/5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Backtest Settings</label>
                            
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Timeframe</label>
                                    <div className="relative">
                                        <select value={config.timeframe} onChange={e => setConfig({ ...config, timeframe: e.target.value })} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#00FF9D] text-white text-sm appearance-none cursor-pointer">
                                            <option value="5m">5m (Slow)</option>
                                            <option value="15m">15m</option>
                                            <option value="1h">1 Hour</option>
                                            <option value="3h">3 Hour</option>
                                            <option value="4h">4 Hours</option>
                                            <option value="1d">1 Day</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Time Range</label>
                                    <div className="relative">
                                        <select value={config.timeRange} onChange={e => setConfig({ ...config, timeRange: e.target.value })} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#00FF9D] text-white text-sm appearance-none cursor-pointer">
                                            <option value="24h">Last 24 Hours</option>
                                            <option value="7d">Last 7 Days</option>
                                            <option value="30d">Last 30 Days</option>
                                            <option value="selective">Selective Range</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                                {config.timeRange === 'selective' && (
                                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Start Date</label>
                                            <input type="date" value={config.startDate} onChange={e => setConfig({ ...config, startDate: e.target.value })} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#00FF9D] text-sm text-gray-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">End Date</label>
                                            <input type="date" value={config.endDate} onChange={e => setConfig({ ...config, endDate: e.target.value })} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#00FF9D] text-sm text-gray-300" />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Simulation Speed</label>
                                    <div className="relative">
                                        <select value={config.simulationSpeed} onChange={e => setConfig({ ...config, simulationSpeed: e.target.value })} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#00FF9D] text-white text-sm appearance-none cursor-pointer">
                                            <option value="1s">1 Second (Normal)</option>
                                            <option value="tick">Every Tick (Real Ticks)</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* INVESTMENT SECTION */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">{'Investment'}</label>
                                {config.exchange !== 'MOCK' && (
                                    <span className="text-[10px] text-gray-500 flex items-center gap-2">
                                        Available:
                                        {balanceLoading ? (
                                            <Loader2 className="animate-spin text-[#00FF9D]" size={12} />
                                        ) : (
                                            <span className="text-white">${availableBalance.toFixed(2)}</span>
                                        )}
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <style>
                                    {`
                                        .no-spinner::-webkit-inner-spin-button, 
                                        .no-spinner::-webkit-outer-spin-button { 
                                            -webkit-appearance: none; 
                                            margin: 0; 
                                        }
                                        .no-spinner { 
                                            -moz-appearance: textfield; 
                                        }
                                    `}
                                </style>
                                <input
                                    type="number"
                                    value={config.investment}
                                    onChange={e => handleInvestmentInput(e.target.value)}
                                    disabled={balanceLoading}
                                    placeholder="Amount"
                                    className={`w-full bg-[#131B1F] border border-white/10 rounded-lg pl-3 pr-12 py-3 text-white font-mono text-lg outline-none focus:border-[#00FF9D] no-spinner transition-opacity duration-200 ${balanceLoading ? 'opacity-70' : ''}`}
                                />
                                {balanceLoading && (
                                    <div className="absolute right-24 top-1/2 -translate-y-1/2">
                                        <Loader2 className="animate-spin text-[#00FF9D]" size={16} />
                                    </div>
                                )}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                    <img src="/icons/usdt.png" alt="USDT" className="w-5 h-5" />
                                    <span className="text-[#00FF9D] font-bold text-sm">USDT</span>
                                    <span className="text-[#00FF9D] font-bold text-sm">
                                        {config.exchange === 'MOCK' ? 'MOCK USDT' : 'USDT'}
                                    </span>

                                </div>
                            </div>

                            {/* SLIDER and PRESETS */}
                            {config.exchange !== 'MOCK' && (
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={((config.investment) / (availableBalance || 1)) * 100}
                                        onChange={e => handleSliderChange(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00FF9D]"
                                    />
                                    <div className="flex justify-between gap-2">
                                        {[25, 50, 75, 100].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => handleSliderChange(p)}
                                                className="flex-1 py-1 bg-[#131B1F] border border-white/5 rounded text-[10px] text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                                            >
                                                {p}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* (Moved Price & Grid Settings to Advanced) */}

                        {/* ADVANCED SETTINGS */}
                        <div className="border-t border-white/5 pt-4 mb-6">

                            {/* Toggle for Deploy Mode */}
                            {true && (
                                <>
                                    {!isAdvancedOpen && (
                                        <div className="mb-6 space-y-3 px-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">High price {config.trailingUp && <span className="ml-2 text-[10px] bg-[#00FF9D]/10 text-[#00FF9D] px-1.5 py-0.5 rounded border border-[#00FF9D]/20">Trailing up</span>}</span>
                                                <span className="text-white font-mono">{parseFloat(config.upperPrice || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Low price {config.trailingDown && <span className="ml-2 text-[10px] bg-[#00FF9D]/10 text-[#00FF9D] px-1.5 py-0.5 rounded border border-[#00FF9D]/20">Trailing down</span>}</span>
                                                <span className="text-white font-mono">{parseFloat(config.lowerPrice || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Step <span className="text-[10px] text-gray-500 uppercase">({config.gridType})</span></span>
                                                <span className="text-white font-mono">
                                                    {config.lowerPrice > 0 ? (
                                                        config.gridType === 'Geometric'
                                                            ? ((Math.pow(config.upperPrice / config.lowerPrice, 1 / config.grids) - 1) * 100).toFixed(2)
                                                            : (((config.upperPrice - config.lowerPrice) / config.grids / config.lowerPrice) * 100).toFixed(2)
                                                    ) : '0.00'}%
                                                    <span className="text-gray-500 ml-1">({config.grids} Levels)</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-[#00FF9D] hover:text-[#00cc7d] transition-colors py-2"
                                    >
                                        <Settings size={16} /> {isAdvancedOpen ? 'Hide Settings' : 'Customize'}
                                    </button>
                                </>
                            )}

                            {/* Settings Content - Always shown if Edit Mode (false) OR if expanded */}
                            {(false || isAdvancedOpen) && (
                                <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Grid Type</label>
                                        <div className="flex bg-[#131B1F] p-1 rounded-lg">
                                            {['Arithmetic', 'Geometric'].map(t => (
                                                <button key={t} onClick={() => setConfig({ ...config, gridType: t })} className={`flex-1 py-1.5 rounded text-[10px] transition-colors ${config.gridType === t ? 'bg-[#00FF9D] text-black font-bold' : 'text-gray-400'}`}>{t.toUpperCase()}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* --- ORDER SIZE TYPE (Infinity Grid) --- */}
                                    <div className="space-y-2 pt-2 border-t border-white/5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Order Size Type (Advanced)</label>
                                        <div className="flex bg-[#131B1F] p-1 rounded-lg">
                                            <button
                                                onClick={() => setConfig({ ...config, orderSizeType: 'quote' })}
                                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${config.orderSizeType === 'quote' ? `bg-[#00FF9D] text-black` : 'text-gray-400 hover:text-white'}`}
                                            >
                                                FIXED USDT (Quote)
                                            </button>
                                            <button
                                                onClick={() => setConfig({ ...config, orderSizeType: 'base' })}
                                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${config.orderSizeType === 'base' ? `bg-[#00FF9D] text-black` : 'text-gray-400 hover:text-white'}`}
                                            >
                                                FIXED COIN (Base)
                                            </button>
                                        </div>
                                        {/* Validation Warning in UI */}
                                        {config.gridType === 'Arithmetic' && config.orderSizeType === 'base' && config.trailingUp && (
                                            <div className="text-[10px] text-red-500 font-bold bg-red-500/10 p-2 rounded border border-red-500/30 flex items-center gap-2">
                                                <AlertTriangle size={12} />
                                                Forbidden: Arithmetic + Base + Trailing Up
                                            </div>
                                        )}
                                    </div>

                                    {/* --- PROFIT STRATEGY SETTINGS --- */}
                                    <div className="space-y-4 pt-2 border-t border-white/5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Profit Mode</label>
                                            <div className="flex bg-[#131B1F] p-1 rounded-lg">
                                                {['USDT_ONLY', 'COIN_ONLY', 'HYBRID'].map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setConfig({ ...config, profitMode: m })}
                                                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${config.profitMode === m ? `bg-[#00FF9D] text-black` : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        {m.replace('_', ' ')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Fiat Profit Style (Only for USDT_ONLY or HYBRID) */}
                                        {(config.profitMode === 'USDT_ONLY' || config.profitMode === 'HYBRID') && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Fiat Profit Style</label>
                                                <div className="flex bg-[#131B1F] p-1 rounded-lg">
                                                    {['INSTANT', 'DELAYED', 'SPLIT'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setConfig({ ...config, fiatProfitStyle: s })}
                                                            className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${config.fiatProfitStyle === s ? `bg-[#00FF9D] text-black` : 'text-gray-400 hover:text-white'}`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Split Ratio (Only for SPLIT or HYBRID) */}
                                        {(config.profitMode === 'HYBRID' || (config.profitMode === 'USDT_ONLY' && config.fiatProfitStyle === 'SPLIT')) && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Profit Split Ratio (To Fiat)</label>
                                                    <span className="text-[10px] text-[#00FF9D] font-bold">{(config.profitSplitRatio * 100).toFixed(0)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="1" step="0.05"
                                                    value={config.profitSplitRatio}
                                                    onChange={e => setConfig({ ...config, profitSplitRatio: parseFloat(e.target.value) })}
                                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00FF9D]"
                                                />
                                                <div className="flex justify-between text-[10px] text-gray-500">
                                                    <span>0% (All Coin)</span>
                                                    <span>100% (All Fiat)</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* --- AMOUNT PER GRID OVERRIDE --- */}
                                    {config.orderSizeType === 'base' && (
                                        <div className="space-y-2 mt-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Fixed Amount Per Grid (Coin)</label>
                                            <input
                                                type="number"
                                                value={config.amountPerGrid}
                                                onChange={(e) => setConfig({ ...config, amountPerGrid: e.target.value })}
                                                placeholder="e.g. 0.1 SOL"
                                                className={`w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2.5 text-white outline-none focus:border-[#00FF9D] text-sm`}
                                            />
                                            <span className="text-[9px] text-gray-500">Overrides auto-calculation. Leave 0 for auto.</span>
                                        </div>
                                    )}

                                    {/* MOVED: PRICE RANGE */}
                                    <div className="space-y-3 pt-2 border-t border-white/5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Price Range</label>
                                            <button
                                                onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
                                                className="flex items-center gap-1 text-[10px] text-[#00FF9D] font-bold"
                                            >
                                                <div className={`w-8 h-4 rounded-full p-0.5 flex transition-colors ${mode === 'auto' ? 'bg-[#00FF9D] justify-end' : 'bg-gray-700 justify-start'}`}>
                                                    <div className="w-3 h-3 bg-black rounded-full shadow" />
                                                </div>
                                                Auto
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <span className="text-[10px] text-gray-500 block mb-1">High Price</span>
                                                <input
                                                    type="number"
                                                    value={config.upperPrice}
                                                    onChange={e => setConfig({ ...config, upperPrice: e.target.value })}
                                                    disabled={mode === 'auto'}
                                                    className={`w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00FF9D] ${mode === 'auto' ? 'opacity-50' : ''}`}
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-500 block mb-1">Low Price</span>
                                                <input
                                                    type="number"
                                                    value={config.lowerPrice}
                                                    onChange={e => setConfig({ ...config, lowerPrice: e.target.value })}
                                                    disabled={mode === 'auto'}
                                                    className={`w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00FF9D] ${mode === 'auto' ? 'opacity-50' : ''}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* MOVED: GRID SETTINGS */}
                                    <div className="space-y-3 pt-2 border-t border-white/5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Grid Settings</label>
                                            <button onClick={() => setConfig({ ...config, grids: 30 })} className="text-[10px] text-[#00FF9D]">Auto (30)</button>
                                        </div>
                                        <input
                                            type="number"
                                            value={config.grids}
                                            onChange={e => setConfig({ ...config, grids: e.target.value })}
                                            className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00FF9D]"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="flex items-center gap-2 text-[10px] text-gray-300 border border-white/5 bg-[#131B1F] p-2 rounded-lg cursor-pointer hover:border-[#00FF9D]/30 transition-all">
                                                <input type="checkbox" checked={config.trailingDown} onChange={e => setConfig({ ...config, trailingDown: e.target.checked })} className="accent-[#00FF9D] w-3 h-3" />
                                                <span className="font-bold uppercase">Trailing Down</span>
                                            </label>
                                            <label className="flex items-center gap-2 text-[10px] text-gray-300 border border-white/5 bg-[#131B1F] p-2 rounded-lg cursor-pointer hover:border-[#00FF9D]/30 transition-all">
                                                <input type="checkbox" checked={config.trailingUp} onChange={e => setConfig({ ...config, trailingUp: e.target.checked })} className="accent-[#00FF9D] w-3 h-3" />
                                                <span className="font-bold uppercase">Trailing Up</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Stop Loss</label>
                                                <input type="number" placeholder="Price (0 = Off)" value={config.stopLoss} onChange={e => setConfig({ ...config, stopLoss: e.target.value })} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-red-500 transition-colors" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Take Profit</label>
                                                <input type="number" placeholder="Price (0 = Off)" value={config.takeProfit} onChange={e => setConfig({ ...config, takeProfit: e.target.value })} className="w-full bg-[#131B1F] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-green-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PROJECTED HOLDINGS (REFACED) */}
                        <div className="bg-[#0A1014] border border-white/10 rounded-3xl p-6 mb-4">
                            <h3 className="text-white font-bold text-sm mb-4 border-b border-white/5 pb-2">Projected Holdings</h3>

                            <div className="flex flex-col items-center">
                                {/* Pie Chart (Centered on Top) */}
                                <div className="relative w-48 h-48 mb-8 mt-2">
                                    <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                                        {/* Background */}
                                        <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />

                                        {/* Segments - Order: USDT -> Coin */}
                                        <path className="text-[#8B5CF6]" strokeDasharray={`${projectedHoldings.usdtPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                        <path className="text-[#00FF9D]" strokeDasharray={`${projectedHoldings.coinPct}, 100`} strokeDashoffset={`-${projectedHoldings.usdtPct}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-xs text-gray-400">Total Value</p>
                                        <p className="text-white font-bold text-xl">${projectedHoldings.inv.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                    </div>
                                </div>

                                {/* Data List (Below Chart) */}
                                <div className="w-full space-y-4">
                                    {/* Base Asset Holdings */}
                                    <div>
                                        <div className="flex items-center justify-between gap-4 mb-1">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-2">
                                                <img
                                                    src={`/icons/${config.pair.split('/')[0].toLowerCase()}.png`}
                                                    alt={config.pair.split('/')[0]}
                                                    className="w-5 h-5 object-contain"
                                                    onError={(e) => { e.target.src = '/icons/btc.png'; }}
                                                />
                                                {config.pair.split('/')[0]} Holdings
                                            </p>
                                            <span className="text-[10px] text-[#00FF9D] bg-[#00FF9D]/10 px-1.5 py-0.5 rounded font-mono">
                                                {projectedHoldings.coinPct.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pl-4">
                                            <p className="text-white font-bold text-sm leading-none">{projectedHoldings.coinQty.toFixed(4)} <span className="text-xs text-gray-500">{config.pair.split('/')[0]}</span></p>
                                            <p className="text-xs text-gray-500 font-mono">${projectedHoldings.coinVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>

                                    {/* USDT Holdings */}
                                    <div>
                                        <div className="flex items-center justify-between gap-4 mb-1">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-2">
                                                <img
                                                    src={`/icons/usdt.png`}
                                                    alt="USDT"
                                                    className="w-5 h-5 object-contain"
                                                    onError={(e) => { e.target.src = '/icons/usdt.png'; }}
                                                />
                                                USDT Holdings
                                            </p>
                                            <span className="text-[10px] text-[#8B5CF6] bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded font-mono">
                                                {projectedHoldings.usdtPct.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pl-4">
                                            <p className="text-white font-bold text-sm leading-none">{projectedHoldings.usdtVal.toFixed(2)} <span className="text-xs text-gray-500">USDT</span></p>
                                            <p className="text-xs text-gray-500 font-mono">${projectedHoldings.usdtVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>




                        
                            {/* ACTIONS */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleRunBacktest}
                                    disabled={loading || (selectedBotId === null && selectedBotId !== "")}
                                    className={"w-full font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg " + (loading ? 'opacity-50 cursor-not-allowed' : 'bg-[#00FF9D] hover:bg-[#00cc7d] text-black shadow-[#00FF9D]/20')}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Run Strategy Test'}
                                </button>
                            </div>

</div>