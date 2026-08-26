import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Lenis from 'lenis';
import SimpleLoader from './components/SimpleLoader';
import LazyLoadErrorBoundary from './components/LazyLoadErrorBoundary';
import CookieConsent from './components/CookieConsent';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Background from './components/Background';

import AuthInterceptor from './components/AuthInterceptor';
import { getToken, removeToken, getUserRole } from './utils/token';

// --- Lazy Load Pages (Actual Load) ---
const SignIn = lazy(() => import('./pages/landing/SignIn'));
import SignUp from './pages/landing/SignUp';
import ResetPass from './pages/landing/ResetPass';
const ResetPassword = lazy(() => import('./pages/landing/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/landing/VerifyEmail'));
const VisualBuilder = lazy(() => import('./pages/landing/visual-builder/VisualBuilder')); // [Hidden Slug]

const BotHub = lazy(() => import('./pages/dashboard/BotHub')); // [NEW]
const BotBuilder = lazy(() => import('./pages/dashboard/BotBuilder'));
const Portfolio = lazy(() => import('./pages/dashboard/Portfolio'));
const DeployBot = lazy(() => import('./pages/dashboard/DeployBot')); // [NEW]
const TemplateDeploy = lazy(() => import('./pages/dashboard/TemplateDeploy')); // [NEW]
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));

const ConfigureBot = lazy(() => import('./pages/dashboard/ConfigureBot'));
const BotDetails = lazy(() => import('./pages/dashboard/BotDetails'));
const LiveMarket = lazy(() => import('./pages/dashboard/LiveMarket'));

const MyExchanges = lazy(() => import('./pages/dashboard/MyExchanges'));
const PartnerDashboard = lazy(() => import('./pages/dashboard/partner/Dashboard'));
const PartnerClients = lazy(() => import('./pages/dashboard/partner/Clients'));
const PartnerWithdraw = lazy(() => import('./pages/dashboard/partner/Withdraw'));
const Notifications = lazy(() => import('./pages/dashboard/Notifications')); // [NEW]
const PartnerMarketing = lazy(() => import('./pages/dashboard/partner/Marketing'));
const PartnerSupport = lazy(() => import('./pages/dashboard/partner/Support'));
const PartnerProfile = lazy(() => import('./pages/dashboard/partner/Profile'));
const PartnerComingSoon = lazy(() => import('./pages/dashboard/partner/ComingSoon'));
const Subscription = lazy(() => import('./pages/dashboard/Subscription'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));

const BacktestExchange = lazy(() => import('./pages/dashboard/BacktestExchange')); // [NEW]
const FastBacktest = lazy(() => import('./pages/dashboard/FastBacktest')); // [NEW]
const EditBot = lazy(() => import('./pages/dashboard/EditBot')); // [NEW - Extracted]
const Feedback = lazy(() => import('./pages/dashboard/Feedback')); // [NEW]
const HelpCenter = lazy(() => import('./pages/dashboard/HelpCenter')); // [NEW]
import NotFound from './pages/landing/NotFound';

import API_BASE_URL from './config';

import { TradingProvider } from './context/TradingContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

const PrivateRoute = ({ element, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const checkUserStatus = async () => {
      const token = getToken();

      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok && isMounted) {
          const data = await response.json();
          setIsAuthenticated(true);
          setIsProfileComplete(data.profileComplete);
          setIsVerified(data.is_verified);
          setUserRole(data.user?.role || getUserRole());
        } else if (isMounted) {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkUserStatus();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return <SimpleLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (!isVerified && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace state={{ from: location.pathname }} />;
  }

  if (!isProfileComplete && location.pathname !== '/bot-builder') {
    return <Navigate to="/bot-builder" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

const PublicRoute = ({ element }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      const token = getToken();

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          removeToken();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  if (isLoading) {
    return <SimpleLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

const App = () => {
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const hideNavAndFooterPaths = [
    '/signin',
    '/signup',
    '/resetpass',
    '/reset-password',
    '/verify-email',
    '/dashboard',
    '/bot-builder',
    '/live-market',
    '/configure-bot',
    '/my-exchanges',
    '/invite',
    '/subscription',
    '/dashboard/portfolio',
    '/dashboard/deploy',
    '/dashboard/deploy-template',
    '/dashboard/live-market',
    '/dashboard/settings',
    '/support',
    '/backtest-engine',
    '/fast-backtest',
    '/notifications',
    '/visual-builder',
    '/bot-hub'
  ];

  const showNavAndFooter = !hideNavAndFooterPaths.includes(location.pathname) &&
    !location.pathname.startsWith('/r/') &&
    !location.pathname.startsWith('/partner/') &&
    !location.pathname.startsWith('/invite/') &&
    !location.pathname.startsWith('/dashboard/bot/') &&
    !location.pathname.startsWith('/dashboard/edit/');

  const isFullPage = [
    '/dashboard',
    '/bot-builder',
    '/portfolio',
    '/live-market',
    '/configure-bot',
    '/my-exchanges',
    '/invite',
    '/subscription',
    '/settings',
    '/dashboard/deploy',
    '/dashboard/deploy-template',
    '/feedback',
    '/help-center',
    '/fast-backtest',
    '/notifications',
    '/bot-hub'
  ].includes(location.pathname) ||
    location.pathname.startsWith('/dashboard/bot/') ||
    location.pathname.startsWith('/invite/') ||
    location.pathname.startsWith('/dashboard/edit/');

  const mainClass = isFullPage ? "relative z-10 p-0" : "relative z-10";

  return (

    <TradingProvider>
      <ToastProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-[#050B0D] text-white font-sans overflow-x-hidden selection:bg-[#00FF9D] selection:text-black relative">
            {/* Global Auth Interceptor */}
            <AuthInterceptor />

            {!isFullPage && <Background />}

            <LazyLoadErrorBoundary>
              <Suspense fallback={<SimpleLoader />}>
                {showNavAndFooter && <Navbar />}

                <CookieConsent />

                <main className={mainClass}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/signin" replace />} />
                    <Route path="/visual-builder" element={<PrivateRoute element={<VisualBuilder />} />} />
                    <Route path="/bot-hub" element={<PrivateRoute element={<BotHub />} />} />
                    <Route path="/signin" element={<PublicRoute element={<SignIn />} />} />
                    <Route path="/login" element={<Navigate to="/signin" replace />} /> {/* Compatibility */}
                    <Route path="/signup" element={<PublicRoute element={<SignUp />} />} />
                    <Route path="/resetpass" element={<PublicRoute element={<ResetPass />} />} />
                    <Route path="/reset-password/:token" element={<PublicRoute element={<ResetPassword />} />} />
                    <Route path="/verify-email" element={
                      getToken() ? <VerifyEmail /> : <Navigate to="/signin" replace />
                    } />


                    {/* Bot Builder - Protected Logic: Must be Auth + Verified */}
                    {/* If verified but no profile, they stay here. If verified + profile, they can go to dashboard or here. */}
                    <Route path="/bot-builder" element={<PrivateRoute element={<BotBuilder />} />} />

                    {/* Dashboard Routes */}
                    <Route path="/dashboard/portfolio" element={<PrivateRoute element={<Portfolio />} />} />
                    <Route path="/dashboard/deploy" element={<PrivateRoute element={<DeployBot />} />} /> {/* [NEW] */}
                    <Route path="/dashboard/deploy-template" element={<PrivateRoute element={<TemplateDeploy />} />} /> {/* [NEW] */}
                    <Route path="/dashboard/live-market" element={<PrivateRoute element={<LiveMarket />} />} />
                    <Route path="/dashboard/settings" element={<PrivateRoute element={<Settings />} />} />
                    <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                    <Route path="/configure-bot" element={<PrivateRoute element={<ConfigureBot />} />} />
                    <Route path="/dashboard/bot/:id" element={<PrivateRoute element={<BotDetails />} />} />
                    <Route path="/backtest-engine" element={<PrivateRoute element={<BacktestExchange />} />} />
                    <Route path="/fast-backtest" element={<PrivateRoute element={<FastBacktest />} />} />

                    <Route path="/dashboard/edit/:id" element={<PrivateRoute element={<EditBot />} />} /> {/* [NEW] */}
                    <Route path="/live-market" element={<PrivateRoute element={<LiveMarket />} />} />
                    <Route path="/my-exchanges" element={<PrivateRoute element={<MyExchanges />} />} />

                    {/* New Routes */}
                    <Route path="/invite" element={<Navigate to="/invite/dashboard" replace />} />
                    <Route path="/invite/dashboard" element={<PrivateRoute element={<PartnerDashboard />} />} />
                    <Route path="/invite/clients" element={<PrivateRoute element={<PartnerClients />} />} />
                    <Route path="/invite/payouts" element={<PrivateRoute element={<PartnerWithdraw />} />} />
                    <Route path="/invite/marketing" element={<PrivateRoute element={<PartnerMarketing />} />} />
                    <Route path="/invite/support" element={<PrivateRoute element={<PartnerSupport />} />} />
                    <Route path="/invite/profile" element={<PrivateRoute element={<PartnerProfile />} />} />
                    <Route path="/invite/coming-soon" element={<PrivateRoute element={<PartnerComingSoon />} />} />

                    <Route path="/subscription" element={<PrivateRoute element={<Subscription />} />} />
                    <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
                    <Route path="/notifications" element={<PrivateRoute element={<Notifications />} />} />
                    <Route path="/feedback" element={<PrivateRoute element={<Feedback />} />} /> {/* [NEW] */}
                    <Route path="/help-center" element={<PrivateRoute element={<HelpCenter />} />} /> {/* [NEW] */}



                    {/* Referral Route */}
                    <Route path="/partner/:slug" element={<SignUp />} />
                    <Route path="/r/:slug" element={<SignUp />} />

                    {/* Catch-all for 404/Coming Soon */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>

                {showNavAndFooter && <Footer />}
              </Suspense>
            </LazyLoadErrorBoundary>
          </div>
        </NotificationProvider>
      </ToastProvider>
    </TradingProvider>
  );
};
export default App;
