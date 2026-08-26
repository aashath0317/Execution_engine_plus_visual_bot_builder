const fs = require('fs');

const deployBotStr = fs.readFileSync('g:/Fydblock/fydblock/src/pages/dashboard/DeployBot.jsx', 'utf8');
const backtestStr = fs.readFileSync('g:/Fydblock/fydblock/src/pages/dashboard/Backtest.jsx', 'utf8');

// 1. Extract the RIGHT PANEL from DeployBot (from <div className="w-full lg:w-[400px]... up to the end of the return statement)
let rightPanelStart = deployBotStr.indexOf('<div className="w-full lg:w-[400px]');
let rightPanelEnd = deployBotStr.indexOf('</div>\n                </div>\n            </div>\n        </DashboardLayout >');

if (rightPanelStart === -1 || rightPanelEnd === -1) {
    console.log("Could not find right panel in DeployBot");
    process.exit(1);
}

let deployRightPanel = deployBotStr.substring(rightPanelStart, rightPanelEnd);

// Clean up the initialBot checks by replacing with false logic
deployRightPanel = deployRightPanel.replace(/initialBot \? \([\s\S]*?\) : \(/, '');
deployRightPanel = deployRightPanel.replace(/<h2 className="text-xl font-bold text-white mb-2">Create GRID Bot<\/h2>\s*<p className="text-sm text-gray-400 mb-6">Configure your automated trading strategy<\/p>\s*<\/>/, `
                            <h2 className="text-xl font-bold text-white mb-2">Strategy Tester</h2>
                            <p className="text-sm text-gray-400 mb-6">Configure parameters for backtesting</p>
`);

deployRightPanel = deployRightPanel.replace(/\{\s*\!initialBot && \(/g, '{true && (');
deployRightPanel = deployRightPanel.replace(/initialBot \? 'Add Investment' : 'Investment'/g, "'Investment'");
deployRightPanel = deployRightPanel.replace(/initialBot \? addedInvestment : config\.investment/g, 'config.investment');
deployRightPanel = deployRightPanel.replace(/initialBot \? addedInvestment : /g, '');
deployRightPanel = deployRightPanel.replace(/initialBot/g, 'false');

const botSelector = `
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
`;

deployRightPanel = deployRightPanel.replace('{/* EXCHANGE & PAIR - Hidden when Editing */}', '{/* BOT SELECTOR */}\n' + botSelector + '\n                        {/* EXCHANGE & PAIR */}');

const backtestSpecificFields = `
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
`;

deployRightPanel = deployRightPanel.replace('{/* INVESTMENT SECTION */}', backtestSpecificFields + '\n                        {/* INVESTMENT SECTION */}');

let actionsReplacement = `
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
`;

deployRightPanel = deployRightPanel.substring(0, deployRightPanel.indexOf('{/* ESTIMATED RETURNS */}')) + actionsReplacement + "\n</div>"; // Close the right panel div

fs.writeFileSync('g:/Fydblock/fydblock/gen.jsx', deployRightPanel);
console.log("Successfully extracted right panel!");
