import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, ChevronDown, Check, ChevronRight, Loader2, Search } from 'lucide-react';
import { COUNTRIES } from './constants';
import 'flag-icons/css/flag-icons.min.css';

export const Step1GeneralInfo = ({ wizardData, setWizardData, phoneError, setPhoneError, setShowTermsModal, onNext, loading }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCountryChange = (e) => {
        const countryName = typeof e === 'string' ? e : e.target.value;
        const country = COUNTRIES.find(c => c.name === countryName);
        setWizardData({
            ...wizardData,
            country: countryName,
            phoneCode: country ? country.code : ''
        });
        if (wizardData.phoneNumber) {
            setPhoneError(validatePhone(wizardData.phoneNumber, countryName));
        }
    };

    const handlePhoneCodeSelect = (country) => {
        handleCountryChange(country.name);
        setIsDropdownOpen(false);
        setSearchQuery('');
    };

    const filteredCountries = COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.code.includes(searchQuery)
    );

    const currentCountry = COUNTRIES.find(c => c.name === wizardData.country);

    const validatePhone = (number, countryName) => {
        if (!number) return "Phone number is required";
        const country = COUNTRIES.find(c => c.name === countryName);
        if (country) {
            const cleanNumber = number.replace(/\D/g, '');
            if (cleanNumber.length < country.min || cleanNumber.length > country.max) {
                return `Phone number must be between ${country.min} and ${country.max} digits`;
            }
        }
        return "";
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setWizardData({ ...wizardData, phoneNumber: val });
        setPhoneError(validatePhone(val, wizardData.country));
    };

    const isStep1Valid = wizardData.name && wizardData.country && wizardData.phoneNumber && wizardData.agreed && !phoneError;

    return (
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-10 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-pulse" />
                    Step 1 of 5
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">Tell us about <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF9D] to-[#00A3FF]">yourself</span></h1>
                <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">Provide some details so we can personalise your bot-building experience securely.</p>
            </div>

            {/* Form Card */}
            <div className="bg-[#0A1014]/80 backdrop-blur-md border border-white/8 rounded-3xl p-8 space-y-6">
                {/* Full Name */}
                <div>
                    <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                    <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3.5 outline-none focus:border-[#00FF9D]/60 focus:bg-white/10 transition-all placeholder:text-gray-600"
                        placeholder="e.g. Alex Johnson"
                        value={wizardData.name}
                        onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
                    <div className="flex gap-3">
                        <div className="w-[140px] relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full h-full flex items-center justify-between bg-white/5 border text-gray-300 font-medium text-sm rounded-xl px-3 py-3.5 outline-none transition-all hover:bg-white/10 ${isDropdownOpen ? 'border-[#00FF9D]/60 bg-white/10' : 'border-white/10'}`}
                            >
                                <span className="flex items-center gap-2.5 truncate">
                                    <span className="text-lg leading-none flex items-center">
                                        {currentCountry ? <span className={`fi fi-${currentCountry.iso.toLowerCase()} rounded-[2px] opacity-90`} /> : '🌐'}
                                    </span>
                                    <span className="text-white">{wizardData.phoneCode || "+_"}</span>
                                </span>
                                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Custom Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-[280px] bg-[#0A1014] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="p-3 border-b border-white/5">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Search country or code..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-[#00FF9D]/40 transition-colors placeholder:text-gray-600"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                                        {filteredCountries.length > 0 ? (
                                            filteredCountries.map((country, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handlePhoneCodeSelect(country)}
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${wizardData.country === country.name ? 'bg-white/5 text-[#00FF9D]' : 'text-gray-300'}`}
                                                >
                                                    <span className="flex items-center gap-3 truncate">
                                                        <span className="text-lg flex items-center">
                                                            <span className={`fi fi-${country.iso.toLowerCase()} rounded-[2px] opacity-90`} />
                                                        </span>
                                                        <span className="truncate">{country.name}</span>
                                                    </span>
                                                    <span className={`shrink-0 ${wizardData.country === country.name ? 'text-[#00FF9D]' : 'text-gray-500'}`}>
                                                        {country.code}
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No countries found</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="tel"
                                value={wizardData.phoneNumber}
                                onChange={handlePhoneChange}
                                className={`w-full bg-[#0D1117] border text-white text-sm rounded-lg px-4 py-3 outline-none transition-all placeholder:text-gray-600 shadow-inner ${phoneError ? 'border-red-500/40 focus:border-red-500/60' : 'border-white/5 focus:border-[#00FF9D]/40'}`}
                                placeholder="123 456 7890"
                            />
                        </div>
                    </div>
                    {phoneError && (
                        <div className="flex items-center gap-2 mt-2.5 text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={14} />
                            <span>{phoneError}</span>
                        </div>
                    )}
                </div>

                <div className="h-px bg-white/5 my-6" />

                {/* Terms */}
                <label className="flex items-start gap-4 cursor-pointer group select-none">
                    <div
                        onClick={() => setWizardData({ ...wizardData, agreed: !wizardData.agreed })}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${wizardData.agreed ? 'bg-[#00FF9D] border-[#00FF9D]' : 'bg-white/5 border-white/20 group-hover:border-[#00FF9D]/50 bg-transparent'}`}
                    >
                        {wizardData.agreed && <Check size={14} className="text-black" strokeWidth={3} />}
                    </div>
                    <span className="text-gray-400 text-sm leading-snug">
                        I agree to FydBlock's{' '}
                        <span
                            className="text-[#00FF9D] hover:text-[#00cc7d] hover:underline cursor-pointer transition-colors"
                            onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                        >
                            Terms of Service
                        </span>
                        {' '}and Privacy Policy
                    </span>
                </label>

                {/* CTA */}
                <button
                    onClick={onNext}
                    disabled={!isStep1Valid || loading}
                    className={`mt-4 w-full py-4 rounded-xl text-base transition-all duration-300 flex items-center justify-center gap-2
                        ${isStep1Valid && !loading
                            ? 'bg-[#00FF9D] text-black hover:bg-[#00cc7d] hover:-translate-y-0.5'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                        }`}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><span>Continue</span><ChevronRight size={18} /></>}
                </button>
            </div>
        </div>
    );
};
