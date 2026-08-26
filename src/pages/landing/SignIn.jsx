import React, { useState } from 'react';
import {
    ArrowLeft, Eye, EyeOff, Check, Wallet,
    Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google'; // Import Google Hook
import API_BASE_URL from '../../config'; // Ensure this points to your backend URL
import { setToken, setUserRole, setSessionId } from '../../utils/token';
import HeroVideoBackgroundMoving from '../../components/HeroVideoBackgroundMoving';
import useAppNotifications from '../../hooks/useAppNotifications';

const SignIn = () => {
    const navigate = useNavigate();
    const { notifySecurityEvent } = useAppNotifications();

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    // 2FA State
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === 'signup') {
            navigate('/signup');
        }
    };

    // --- 1. HANDLE MANUAL LOGIN ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // Login Request
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.requires2FA) {
                    setRequires2FA(true);
                    setTempToken(data.tempToken);
                    setSuccess('Please enter your 2FA code.');
                    return;
                }

                // Save Token IMMEDIATELY (needed for verify-email API call)
                setToken(data.token, rememberMe);
                if (data.sessionId) setSessionId(data.sessionId, rememberMe);

                // Check Profile Status to decide redirect
                if (data.requires_device_verification) {
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                    setSuccess('New device detected. Please check your email for a verification code.');
                    setTimeout(() => {
                        navigate('/verify-email');
                    }, 1500);
                    return;
                }

                if (data.user && data.user.role) {
                    setUserRole(data.user.role, rememberMe);
                }

                const userRes = await fetch(`${API_BASE_URL}/user/me`, {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setSuccess('Login successful! Checking profile...');
                    notifySecurityEvent("New login detected from your current IP");

                    // Conditional Redirect: Bot Builder vs Dashboard
                    setTimeout(() => {
                        if (!userData.profileComplete) {
                            navigate('/bot-builder');
                        } else {
                            navigate('/dashboard');
                        }
                    }, 1500);
                } else {
                    // Fallback redirect
                    setSuccess('Login successful!');
                    setTimeout(() => navigate('/bot-builder'), 1500);
                }
            } else {
                setError(data.message || 'Login failed. Invalid credentials.');
            }
        } catch (error) {
            console.error('Login Error:', error);
            setError('Server connection error. Please check your network.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- 1.5 HANDLE 2FA VERIFICATION ---
    const handle2FASubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken, code: twoFactorCode }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save Token IMMEDIATELY
                setToken(data.token, rememberMe);
                if (data.sessionId) setSessionId(data.sessionId, rememberMe);

                // Check Profile Status to decide redirect
                if (data.requires_device_verification) {
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                    setSuccess('New device detected. Please check your email for a verification code.');
                    setTimeout(() => {
                        navigate('/verify-email');
                    }, 1500);
                    return;
                }

                if (data.user && data.user.role) {
                    setUserRole(data.user.role, rememberMe);
                }

                const userRes = await fetch(`${API_BASE_URL}/user/me`, {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setSuccess('Login successful! Checking profile...');
                    notifySecurityEvent("New login detected across new session");

                    setTimeout(() => {
                        if (!userData.profileComplete) {
                            navigate('/bot-builder');
                        } else {
                            navigate('/dashboard');
                        }
                    }, 1500);
                } else {
                    setSuccess('Login successful!');
                    setTimeout(() => navigate('/bot-builder'), 1500);
                }
            } else {
                setError(data.message || 'Verification failed. Invalid code.');
            }
        } catch (error) {
            console.error('2FA Verification Error:', error);
            setError('Server connection error. Please check your network.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2. HANDLE GOOGLE LOGIN ---
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setError('');
            try {
                // Send access_token to backend
                const res = await fetch(`${API_BASE_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: tokenResponse.access_token }),
                });

                const data = await res.json();

                if (res.ok) {
                    if (data.requires2FA) {
                        setRequires2FA(true);
                        setTempToken(data.tempToken);
                        setSuccess('Please enter your 2FA code.');
                        return;
                    }

                    // Save Token IMMEDIATELY
                    setToken(data.token, true); // Google login defaults to remembering
                    if (data.sessionId) setSessionId(data.sessionId, true);

                    // Check if it's a new device right here to save user & redirect
                    if (data.requires_device_verification) {
                        if (data.user) {
                            localStorage.setItem('user', JSON.stringify(data.user));
                        }
                        setSuccess('New device detected. Please check your email for a verification code.');
                        setTimeout(() => {
                            navigate('/verify-email');
                        }, 1500);
                        return;
                    }

                    if (data.user && data.user.role) {
                        setUserRole(data.user.role, true);
                    }
                    setSuccess('Google Login successful!');
                    notifySecurityEvent("New login detected via Google OAuth");

                    // Check profile status for redirection
                    const userRes = await fetch(`${API_BASE_URL}/user/me`, {
                        headers: { 'Authorization': `Bearer ${data.token}` }
                    });

                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setTimeout(() => {
                            if (!userData.profileComplete) {
                                navigate('/bot-builder');
                            } else {
                                navigate('/dashboard');
                            }
                        }, 1500);
                    } else {
                        setTimeout(() => navigate('/dashboard'), 1500);
                    }
                } else {
                    setError(data.message || 'Google Login Failed');
                }
            } catch (err) {
                console.error("Google Login Error", err);
                setError('Server connection error during Google Login.');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError('Google Login Failed'),
    });

    return (
        <HeroVideoBackgroundMoving>
            <div className="flex flex-col w-full min-h-[100dvh] h-[100dvh] relative z-10 px-4 sm:px-8 md:px-12 overflow-hidden">
                {/* Top Navigation */}
                <div className="w-full py-4 sm:py-8 flex justify-between items-center z-20 shrink-0">
                    <div className="flex items-center gap-2">
                        {/* Brand Name / Logo */}
                        <img src="/logo.png" alt="FydBlock" className="h-[24px] sm:h-8" />
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors flex items-center gap-2"
                    >
                        Back to home
                    </button>
                </div>

                {/* Main Content - Centered Card */}
                <div className="flex-1 flex flex-col justify-center items-center w-full pb-4 sm:pb-12">
                    <div className="w-full max-w-[480px] bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-5 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-sm relative z-10">

                        {/* Header */}
                        <div className="text-center mb-5 sm:mb-8">
                            <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2">Welcome back</h1>
                            <p className="text-gray-400 text-xs sm:text-sm">Sign in to continue to your dashboard</p>
                        </div>

                        {/* --- STATUS MESSAGES --- */}
                        {error && (
                            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-red-200">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-3 rounded-lg bg-[#00FF9D]/10 border border-[#00FF9D]/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle className="text-[#00FF9D] shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-[#00FF9D]">{success}</p>
                            </div>
                        )}

                        {/* Conditionally Render 2FA OR Login Form */}
                        {requires2FA ? (
                            <form onSubmit={handle2FASubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-400">Authenticator Code</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={twoFactorCode}
                                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                        onFocus={() => { setError(''); setSuccess(''); }}
                                        disabled={isLoading}
                                        placeholder="Enter 6-digit code"
                                        className="w-full bg-[#111] border border-zinc-800 text-white rounded-xl px-4 py-3 text-center text-xl tracking-widest font-mono outline-none focus:border-[#00FF9D]/50 focus:bg-[#151515] transition-all disabled:opacity-50 placeholder:text-gray-700 placeholder:text-sm placeholder:font-sans placeholder:tracking-normal"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || twoFactorCode.length !== 6}
                                    className="w-full bg-[#00FF9D] text-black font-semibold py-3 rounded-xl transition-all hover:bg-[#00cc7d] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        "Verify & Continue"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRequires2FA(false);
                                        setTempToken('');
                                        setTwoFactorCode('');
                                        setError('');
                                        setSuccess('');
                                    }}
                                    disabled={isLoading}
                                    className="w-full bg-transparent text-gray-400 hover:text-white font-medium py-3 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <>
                                {/* Google Button */}
                                <button
                                    type="button"
                                    onClick={() => handleGoogleLogin()}
                                    disabled={isLoading}
                                    className="w-full bg-[#1A1A1A] hover:bg-[#252525] border border-zinc-800 text-white font-medium py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-3 transition-all mb-4 sm:mb-6 group"
                                >
                                    <GoogleIcon />
                                    <span className="text-xs sm:text-sm group-hover:text-white/90">Continue with Google</span>
                                </button>

                                {/* Divider */}
                                <div className="relative mb-4 sm:mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-zinc-800"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                                        <span className="bg-[#0A0A0A] px-2 text-gray-500">or</span>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-5">
                                    <div className="space-y-1 sm:space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-medium text-gray-400">Email or username</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => { setError(''); setSuccess(''); }}
                                            disabled={isLoading}
                                            placeholder="Enter your email"
                                            className="w-full bg-[#111] border border-zinc-800 text-white rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-[13px] sm:text-sm outline-none focus:border-[#00FF9D]/50 focus:bg-[#151515] transition-all disabled:opacity-50 placeholder:text-gray-700"
                                        />
                                    </div>

                                    <div className="space-y-1 sm:space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] sm:text-xs font-medium text-gray-400">Password</label>
                                            <button type="button" onClick={() => navigate('/resetpass')} className="text-[10px] sm:text-xs text-[#00FF9D] hover:underline" disabled={isLoading}>
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => { setError(''); setSuccess(''); }}
                                                disabled={isLoading}
                                                placeholder="Enter your password"
                                                className="w-full bg-[#111] border border-zinc-800 text-white rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-[13px] sm:text-sm outline-none focus:border-[#00FF9D]/50 focus:bg-[#151515] transition-all pr-12 disabled:opacity-50 placeholder:text-gray-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isLoading}
                                                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white disabled:opacity-50"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-white text-black font-semibold py-2.5 sm:py-3 rounded-xl transition-all hover:bg-gray-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-3 sm:mt-4 text-xs sm:text-sm"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={16} />
                                                <span>Logging In...</span>
                                            </>
                                        ) : (
                                            "Continue"
                                        )}
                                    </button>
                                </form>

                                <div className="mt-4 sm:mt-8 text-center text-[11px] sm:text-xs text-gray-500">
                                    Don't have an account? <button onClick={() => navigate('/signup')} className="text-[#00FF9D] hover:underline">Sign up</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </HeroVideoBackgroundMoving>
    );
};

// SVG Icon for Google
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default SignIn;
