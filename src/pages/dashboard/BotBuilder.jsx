import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, FastForward } from 'lucide-react';

import API_BASE_URL from '../../config';
import { getToken } from '../../utils/token';

import { TermsModal } from './bot-builder/TermsModal';
import { Step1GeneralInfo } from './bot-builder/Step1GeneralInfo';
import { Step2SelectPlan } from './bot-builder/Step2SelectPlan';
import { Step3ConnectExchange } from './bot-builder/Step3ConnectExchange';
import { Step4SelectCurrency } from './bot-builder/Step4SelectCurrency';
import { Step5LetsTrade } from './bot-builder/Step5LetsTrade';

// --- Sidebar Navigation Component ---
const BotBuilderSidebar = ({ currentStep, steps }) => {
    return (
        <div className="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/10 bg-[#0A1014]/50 backdrop-blur-3xl p-10 min-h-screen relative z-30">
            <div className="mb-14">
                <img src="/logo.png" alt="FydBlock" className="h-8" />
            </div>

            <div className="flex-1 mt-4">
                <div className="relative flex flex-col gap-10">
                    {/* Vertical Progress Line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-white/5" />
                    <div
                        className="absolute left-[15px] top-4 w-[2px] bg-gradient-to-b from-[#00FF9D] to-[#00A3FF] transition-all duration-700 ease-in-out z-0"
                        style={{ height: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${((currentStep - 1) / (steps.length - 1)) * 32}px)` }}
                    />

                    {steps.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isActive = step.id === currentStep;
                        const isUpcoming = step.id > currentStep;

                        return (
                            <div key={step.id} className="relative z-10 flex items-center gap-5 group">
                                {/* Step Indicator Node */}
                                <div className="relative z-20 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 bg-[#0A1014]">
                                    {isCompleted ? (
                                        <div className="w-8 h-8 rounded-full bg-[#00FF9D] flex items-center justify-center">
                                            <Check size={16} className="text-black" strokeWidth={3} />
                                        </div>
                                    ) : isActive ? (
                                        <div className="w-8 h-8 rounded-full bg-[#00FF9D]/10 border-2 border-[#00FF9D] flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#00FF9D] animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-gray-500 text-xs font-mono transition-colors group-hover:border-white/40">
                                            0{step.id}
                                        </div>
                                    )}
                                </div>

                                {/* Step Label & Subtext */}
                                <div className="flex flex-col justify-center">
                                    <span className={`text-[15px] transition-all duration-300 ${isActive ? 'text-white tracking-wide' : isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                        {step.label}
                                    </span>
                                    <span className={`text-[11px] font-medium transition-all duration-300 overflow-hidden ${isActive ? 'text-[#00FF9D] opacity-100 mt-1 h-auto' : 'opacity-0 h-0 m-0'}`}>
                                        In Progress
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Help / Support widget */}
            <div className="mt-auto pt-10 border-t border-white/10">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <h4 className="text-sm text-white mb-1">Need help?</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Reach out to our support team for setup guidance.</p>
                </div>
            </div>
        </div>
    );
};

const BotBuilder = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Setup initial step state
    const initialStep = parseInt(searchParams.get('step')) || 1;
    const [currentStep, setCurrentStep] = useState(initialStep);

    // Global UI state
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showExchangesModal, setShowExchangesModal] = useState(false);

    // Form Validation state
    const [connectError, setConnectError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [connectMethod, setConnectMethod] = useState('manual');

    // Central Data Store
    const [wizardData, setWizardData] = useState({
        name: '',
        country: '',
        phoneCode: '',
        phoneNumber: '',
        exchange: '',
        apiKey: '',
        apiSecret: '',
        passphrase: '', // For OKX
        currency: 'USDT',
        plan: 'signature',
        billingCycle: 'annual',
        agreed: false
    });

    const steps = [
        { id: 1, label: 'General Info' },
        { id: 2, label: 'Plan & Pricing' },
        { id: 3, label: "Ready to Trade" },
    ];

    useEffect(() => {
        if (!getToken()) {
            navigate('/auth/signin');
        }
    }, [navigate]);

    const submitStep1 = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    full_name: wizardData.name,
                    country: wizardData.country,
                    phone: wizardData.phoneNumber
                })
            });

            if (res.ok) {
                setCurrentStep(2);
            } else {
                const data = await res.json();
                if (res.status === 404) {
                    setCurrentStep(2); // Fallback locally if endpoint has issues
                } else {
                    alert(data.message || "Failed to update details. Please try again.");
                }
            }
        } catch (e) {
            console.error(e);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const submitFinalBot = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ profileComplete: true })
            });

            if (res.ok) {
                window.location.href = '/dashboard';
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#020B0F] text-white font-sans flex relative overflow-hidden selection:bg-[#00FF9D]/30">
            {/* Global Background Dims */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vh] bg-[#00FF9D]/[0.02] rounded-full" />
                <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[60vh] bg-[#00A3FF]/[0.02] rounded-full" />
                <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[50vh] bg-[#00FF9D]/[0.01] rounded-full" />
            </div>

            {/* Desktop Sidebar Planner */}
            <BotBuilderSidebar currentStep={currentStep} steps={steps} />

            {/* Main Scrollable Content Area */}
            <div className="flex-1 flex flex-col relative z-20 h-screen overflow-y-auto custom-scrollbar scroll-smooth">

                {/* Mobile Top Nav */}
                <div className="lg:hidden flex items-center justify-between p-6 bg-[#020B0F]/90 backdrop-blur-md sticky top-0 z-40 border-b border-white/5 shrink-0">
                    <img src="/logo.png" alt="FydBlock" className="h-6" />
                    <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full">
                            Step <span className="text-white">{currentStep}</span> / 3
                        </div>
                    </div>
                </div>

                {/* Header Actions (Back & Skip) */}
                <div className="p-6 md:p-10 pb-0 shrink-0 relative z-10 w-full max-w-7xl mx-auto flex items-center gap-4 justify-between">
                    <div>
                        {currentStep > 1 && (
                            <button
                                onClick={currentStep === 1 ? () => navigate('/') : () => setCurrentStep(c => c - 1)}
                                className="flex items-center gap-2.5 text-gray-500 hover:text-white transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all shadow-sm">
                                    <ArrowLeft size={16} />
                                </div>
                                <span className="text-sm tracking-wide">Back to previous</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Step Rendering Viewport */}
                <div className="flex-1 flex flex-col p-6 md:p-10 lg:p-16 w-full mx-auto">
                    <div className="my-auto w-full flex justify-center py-10">
                        {currentStep === 1 && (
                            <Step1GeneralInfo
                                wizardData={wizardData}
                                setWizardData={setWizardData}
                                phoneError={phoneError}
                                setPhoneError={setPhoneError}
                                setShowTermsModal={setShowTermsModal}
                                onNext={submitStep1}
                                loading={loading}
                            />
                        )}
                        {currentStep === 2 && (
                            <Step2SelectPlan
                                wizardData={wizardData}
                                setWizardData={setWizardData}
                                onNext={() => setCurrentStep(3)}
                            />
                        )}
                        {currentStep === 3 && (
                            <Step5LetsTrade
                                submitFinalBot={submitFinalBot}
                                loading={loading}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Global Modals */}
            <TermsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAccept={() => {
                    setWizardData({ ...wizardData, agreed: true });
                    setShowTermsModal(false);
                }}
            />
        </div>
    );
};

export default BotBuilder;
