import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Lock, LogOut } from 'lucide-react';
import API_BASE_URL from '../../config';
import { getToken, clearAuth } from '../../utils/token';

// OTP Input Component
const VerifyEmail = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState(''); // '' | 'sending' | 'sent' | 'error'
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = getToken();
                if (!token) return navigate('/signin');

                // We're skipping /users/me here because the AuthInterceptor might catch 403s and 
                // redirect us into a loop on this page. Instead, let's look for user details 
                // stored safely in localStorage, or decode the token payload.

                const storedUserStr = localStorage.getItem('user');
                if (storedUserStr) {
                    try {
                        const storedUser = JSON.parse(storedUserStr);
                        setUserEmail(storedUser.email || '');
                    } catch (e) {
                        // parse error
                    }
                }
            } catch (err) {
                console.error("Failed to fetch user data for verify email");
            }
        };
        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        clearAuth();
        localStorage.removeItem('user');
        navigate('/signin');
    };

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
        setOtp(newOtp);

        // Focus next input
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }

        // Auto trigger submit if all filled
        if (newOtp.every(val => val !== "")) {
            handleVerify(newOtp.join(""));
        }
    };

    const handleVerify = async (optionalCode) => {
        const code = typeof optionalCode === 'string' ? optionalCode : otp.join("");
        if (code.length !== 6) {
            setError("Please enter the full 6-digit code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });
            const data = await res.json();

            if (res.ok) {
                // Success
                navigate('/dashboard');
                window.location.reload(); // Reload to update App state (isAuthenticated/isVerified)
            } else {
                setError(data.message || "Verification failed");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendStatus('sending');
        setError('');

        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/auth/verify-email/resend`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (res.ok) {
                setResendStatus('sent');
                setTimeout(() => setResendStatus(''), 5000);
            } else if (res.status === 401) {
                // Token Expired
                setResendStatus('error');
                setError("Session expired. Redirecting to login...");
                setTimeout(() => {
                    clearAuth();
                    localStorage.removeItem('user');
                    navigate('/signin');
                }, 2000);
            } else {
                setResendStatus('error');
                setError(data.message || "Failed to resend code");
            }
        } catch (err) {
            setResendStatus('error');
            setError("Network error. Could not resend code.");
        }
    };

    return (
        <div className="min-h-screen bg-[#050B0D] text-white flex items-center justify-center font-sans relative overflow-hidden">
            {/* --- Global Ambient Background Effects --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-[#00FF9D]/10 rounded-full blur-[150px]" />
                <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[60vh] bg-[#00A3FF]/5 rounded-full blur-[150px]" />
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center relative z-10 backdrop-blur-md shadow-2xl">

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-[#00FF9D]/10 rounded-full flex items-center justify-center border border-[#00FF9D]/30">
                        <Lock className="text-[#00FF9D]" size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
                <p className="text-gray-400 mb-8 text-sm">
                    We sent a verification code to {userEmail ? <span className="text-white font-medium">{userEmail}</span> : "your email"}.<br />
                    Enter the code below to continue.
                </p>

                <div className="flex justify-center gap-2 mb-6">
                    {otp.map((data, index) => (
                        <input
                            className="w-10 h-12 bg-black/40 border border-white/10 rounded text-center text-xl font-bold focus:border-[#00FF9D] focus:outline-none transition-colors"
                            type="text"
                            name="otp"
                            maxLength="1"
                            key={index}
                            value={data}
                            onChange={e => handleChange(e.target, index)}
                            onKeyDown={e => {
                                if (e.key === 'Backspace' && !data && e.target.previousSibling) {
                                    e.target.previousSibling.focus();
                                } else if (e.key === 'ArrowLeft' && e.target.previousSibling) {
                                    e.preventDefault();
                                    e.target.previousSibling.focus();
                                } else if (e.key === 'ArrowRight' && e.target.nextSibling) {
                                    e.preventDefault();
                                    e.target.nextSibling.focus();
                                }
                            }}
                            onPaste={e => {
                                e.preventDefault();
                                const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
                                if (/^\d+$/.test(pastedData)) {
                                    const pastedArray = pastedData.split('');
                                    const newOtp = [...otp];
                                    pastedArray.forEach((char, i) => {
                                        if (i < 6) newOtp[i] = char;
                                    });
                                    setOtp(newOtp);

                                    const nextIndex = Math.min(pastedArray.length, 5);
                                    const inputs = Array.from(e.target.parentElement.querySelectorAll('input'));
                                    if (inputs[nextIndex]) {
                                        inputs[nextIndex].focus();
                                    }

                                    if (newOtp.every(val => val !== "")) {
                                        handleVerify(newOtp.join(""));
                                    }
                                }
                            }}
                            onFocus={e => e.target.select()}
                        />
                    ))}
                </div>

                {/* Error Message Display - Enhanced Visibility */}
                {error && (
                    <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full bg-[#00FF9D] text-black font-bold py-3 rounded-lg hover:bg-[#00cc7d] transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center"
                >
                    {loading ? <Loader className="animate-spin" size={20} /> : "Verify Account"}
                </button>

                <div className="text-xs mt-6 text-gray-500">
                    Didn't receive code?{' '}
                    <button
                        onClick={handleResend}
                        disabled={resendStatus === 'sending'}
                        className={`text-gray-300 hover:text-white transition-colors underline ${resendStatus === 'sending' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {resendStatus === 'sending' ? 'Sending...' : 'Resend'}
                    </button>

                    {resendStatus === 'sent' && (
                        <div className="mt-3 p-2 bg-green-500/20 border border-[#00FF9D]/30 rounded">
                            <p className="text-[#00FF9D] text-xs font-bold">New code sent! Check your inbox.</p>
                        </div>
                    )}
                </div>

                {/* Logout Option */}
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
