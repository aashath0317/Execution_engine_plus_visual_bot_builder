import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE_URL from '../../config';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/signin');
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password. Link might be expired.');
            }
        } catch (err) {
            console.error(err);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050B0D] text-white font-sans relative overflow-hidden animate-in fade-in duration-500">

            {/* --- Global Ambient Background Effects --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-[#00FF9D]/10 rounded-full blur-[150px]" />
                <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[60vh] bg-[#00A3FF]/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[40vh] bg-[#00FF9D]/5 rounded-full blur-[180px]" />
            </div>

            <div className="container mx-auto px-6 py-8 relative z-10">

                {/* --- Header / Back Button --- */}
                <div className="mb-8">
                    <img src="/logo.png" alt="FydBlock" className="h-8 mb-8" />
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* --- Left Column: Content --- */}
                    <div className="max-w-md w-full">

                        <h1 className="text-4xl font-bold mb-4">Set New Password</h1>
                        <p className="text-gray-400 mb-8">
                            Please enter your new password below.
                        </p>

                        {/* --- STATUS MESSAGES --- */}
                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-[#00FF9D]/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle className="text-[#00FF9D] shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-green-200">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        placeholder="Enter new password..."
                                        className="w-full bg-white text-black rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#00FF9D] transition-all pr-12 disabled:opacity-70"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black disabled:opacity-50"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    placeholder="Confirm new password..."
                                    className="w-full bg-white text-black rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#00FF9D] transition-all disabled:opacity-70"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Reseting...</span>
                                    </>
                                ) : (
                                    "Set New Password"
                                )}
                            </button>
                        </form>

                    </div>

                    {/* --- Right Column: Illustration Card --- */}
                    <div className="hidden lg:block relative h-[600px] w-full bg-[#0B2323] rounded-3xl overflow-hidden border border-white/5">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-[80%] h-[80%]">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl"></div>
                                <img
                                    src="/Group.png"
                                    className="w-full h-full object-contain drop-shadow-2xl opacity-80 mix-blend-lighten"
                                    alt="Reset Password Illustration"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
