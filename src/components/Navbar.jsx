import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  ChevronDown,
  BarChart2,
  GraduationCap,
  Lock,
  Grid,
  RefreshCw,
  Activity
} from 'lucide-react';
import { getToken, removeToken } from '../utils/token';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const [mobileBotsOpen, setMobileBotsOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [tradingBotsOpen, setTradingBotsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  // Check auth status on mount and on route change
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname === path ? 'text-[#00FF9D]' : 'text-gray-300';

  // Dropdown Data
  const featureItems = [
    {
      title: "Backtesting",
      desc: "Validate your bot performance",
      icon: BarChart2,
      path: "/backtest",
      highlight: false
    },
    {
      title: "FydAcademy",
      desc: "Become a trading expert",
      icon: GraduationCap,
      path: "/academy",
      highlight: false
    },
    {
      title: "Exchanges",
      desc: "16 Major exchanges",
      icon: Lock,
      path: "/exchanges",
      highlight: false
    }
  ];

  const tradingBotItems = [
    {
      title: "Grid Bot",
      desc: "Automate buy low & sell high",
      icon: Grid,
      path: "/spot-grid",
      highlight: false
    },
    {
      title: "DCA Bot",
      desc: "Accumulate assets over time",
      icon: RefreshCw,
      path: "/dca-bot",
      highlight: false
    },
    {
      title: "Signal Bot",
      desc: "Trade based on custom signals",
      icon: Activity,
      path: "/signal-bot",
      highlight: false
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050B0D]/10 backdrop-blur-xl border-b border-white/10 py-4 shadow-lg transition-all duration-300">
      <div className="container mx-auto px-6 flex items-center justify-between">

        {/* Logo (Home Access) */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <img src="/logo.png" alt="FydBlock Logo" className="h-8 md:h-10 object-contain" />
        </Link>

        {/* Desktop Links - Centered Layout */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">

          {/* Home */}
          <Link to="/" className={`hover:text-[#00FF9D] transition-colors ${isActive('/')} `}>
            Home
          </Link>

          {/* Company */}
          <Link to="/company" className={`hover:text-[#00FF9D] transition-colors ${isActive('/company')}`}>
            Company
          </Link>

          {/* Pricing */}
          <Link to="/pricing" className={`hover:text-[#00FF9D] transition-colors ${isActive('/pricing')}`}>
            Pricing
          </Link>

          {/* Partner */}
          <Link to="/partner" className={`hover:text-[#00FF9D] transition-colors ${isActive('/partner')}`}>
            Partner
          </Link>

          {/* TRADING BOTS DROPDOWN - Temporarily hidden
          <div
            className="relative group h-full flex items-center"
            onMouseEnter={() => setTradingBotsOpen(true)}
            onMouseLeave={() => setTradingBotsOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-[#00FF9D] transition-colors focus:outline-none py-2">
              Trading Bots <ChevronDown size={16} className={`transition-transform duration-200 ${tradingBotsOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`absolute top-full -left-12 w-72 pt-4 transition-all duration-200 origin-top ${tradingBotsOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
            >
              <div className="bg-[#050B0D] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-2 flex flex-col gap-1">
                  {tradingBotItems.map((item, index) => {
                    const isItemActive = location.pathname === item.path;
                    return (
                      <Link
                        key={index}
                        to={item.path}
                        onClick={() => setTradingBotsOpen(false)}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isItemActive
                          ? 'bg-[#00FF9D] text-black hover:bg-[#00cc7d]'
                          : 'hover:bg-white/5 text-gray-300 hover:text-[#00FF9D]'
                          }`}
                      >
                        <item.icon size={20} className="mt-0.5" />
                        <div>
                          <div className="font-bold text-sm leading-tight">{item.title}</div>
                          <div className={`text-xs mt-0.5 ${isItemActive ? 'text-black/80' : 'text-gray-500'}`}>
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          */}


          {/* FEATURES DROPDOWN */}
          <div
            className="relative group h-full flex items-center"
            onMouseEnter={() => setFeaturesOpen(true)}
            onMouseLeave={() => setFeaturesOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-[#00FF9D] transition-colors focus:outline-none py-2">
              Features <ChevronDown size={16} className={`transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`absolute top-full -left-12 w-72 pt-4 transition-all duration-200 origin-top ${featuresOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
            >
              {/* This inner div contains the actual visual box */}
              <div className="bg-[#050B0D] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-2 flex flex-col gap-1">
                  {featureItems.map((item, index) => {
                    const isItemActive = location.pathname === item.path;
                    return (
                      <Link
                        key={index}
                        to={item.path}
                        onClick={() => setFeaturesOpen(false)}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isItemActive
                          ? 'bg-[#00FF9D] text-black hover:bg-[#00cc7d]'
                          : 'hover:bg-white/5 text-gray-300 hover:text-[#00FF9D]'
                          }`}
                      >
                        <item.icon size={20} className="mt-0.5" />
                        <div>
                          <div className="font-bold text-sm leading-tight">{item.title}</div>
                          <div className={`text-xs mt-0.5 ${isItemActive ? 'text-black/80' : 'text-gray-500'}`}>
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <Link to="/contact" className={`hover:text-[#00FF9D] transition-colors ${isActive('/contact')}`}>
            Contact Us
          </Link>


        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-[#00FF9D] font-medium transition-colors flex items-center gap-2">
                <LayoutDashboard size={18} /> Overview
              </Link>
              <button onClick={handleLogout} className="bg-[#EA4335] text-white px-6 py-2 rounded-full font-bold hover:bg-[#c2362a] transition-all hover:scale-105 shadow-md">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-white hover:text-[#00FF9D] font-medium transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="bg-[#00FF9D] text-black px-6 py-2 rounded-full font-bold hover:bg-[#00cc7d] transition-all hover:scale-105 shadow-[0_0_15px_rgba(0,255,157,0.3)]">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#050B0D]/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl h-[calc(100vh-80px)] overflow-y-auto pb-10">

          <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`text-lg text-left hover:text-[#00FF9D] ${isActive('/')}`}>Home</Link>
          <Link to="/company" onClick={() => setMobileMenuOpen(false)} className={`text-lg text-left hover:text-[#00FF9D] ${isActive('/company')}`}>Company</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className={`text-lg text-left hover:text-[#00FF9D] ${isActive('/pricing')}`}>Pricing</Link>
          <Link to="/partner" onClick={() => setMobileMenuOpen(false)} className={`text-lg text-left hover:text-[#00FF9D] ${isActive('/partner')}`}>Partner</Link>

          {/* Temporarily hidden Trading Bots Mobile Menu
          <div className="py-2">
            <button
              onClick={() => setMobileBotsOpen(!mobileBotsOpen)}
              className="flex items-center justify-between w-full text-lg text-left text-gray-300 hover:text-[#00FF9D] focus:outline-none"
            >
              <span>Trading Bots</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${mobileBotsOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileBotsOpen && (
              <div className="flex flex-col gap-2 pl-4 mt-2 border-l border-white/10">
                {tradingBotItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-2 ${location.pathname === item.path ? 'text-[#00FF9D]' : 'text-gray-300'}`}
                  >
                    <item.icon size={18} />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          */}


          <div className="py-2">
            <button
              onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
              className="flex items-center justify-between w-full text-lg text-left text-gray-300 hover:text-[#00FF9D] focus:outline-none"
            >
              <span>Features</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${mobileFeaturesOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileFeaturesOpen && (
              <div className="flex flex-col gap-2 pl-4 mt-2 border-l border-white/10">
                {featureItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-2 ${location.pathname === item.path ? 'text-[#00FF9D]' : 'text-gray-300'}`}
                  >
                    <item.icon size={18} />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className={`text-lg text-left hover:text-[#00FF9D] ${isActive('/contact')}`}>Contact Us</Link>



          <div className="h-px bg-white/10 my-2"></div>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`text-left text-white font-medium py-2 ${isActive('/dashboard')}`}>
                <LayoutDashboard size={20} className="inline mr-2" /> Overview
              </Link>
              <button onClick={handleLogout} className="bg-[#EA4335] text-white py-3 rounded-lg font-bold text-center">Log Out</button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-lg font-bold text-center text-white border border-white/20 hover:bg-white/5 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-[#00FF9D] text-black py-3 rounded-lg font-bold text-center hover:bg-[#00cc7d] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;