import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { User, Shield, Briefcase, Bell, CheckCircle2, ChevronRight, PenSquare, Upload, Save, X, Monitor, Smartphone, Globe, LogOut, ChevronDown, Search } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken, removeToken, getSessionId } from '../../utils/token';
import { COUNTRIES } from '../../utils/countries';
import { getMediaUrl } from '../../utils/url';
import CropModal from '../../components/dashboard/CropModal';
import useAppNotifications from '../../hooks/useAppNotifications';

const PLAN_DATA = {
    'Free Plan': {
        name: 'Free Trial',
        price: '0',
        badge: 'Free Trial Active',
        color: '#00A3FF',
        features: ["7 days free grid bot", "Unlimited manual trading", "Unlimited Smart orders", "30 Days Backtest history"]
    },
    'Fyd Signature': {
        name: 'Pro Signature',
        price: '19',
        badge: 'Pro Plan Active',
        color: '#00FF9D',
        features: [
            "3 Fyd_Signature Bot Slots",
            "AI Assistant Enabled",
            "Crypto Sentiment Insights",
            "Unlimited Manual Trading",
            "Unlimited Smart Orders",
            "Future Bots Access",
            "Trailing Up & Down (Grid)",
            "TP for Grid & AI Bots",
            "180 Days Backtest History",
            "Priority Customer Support"
        ]
    },
    'Advance Plan': {
        name: 'Advance Institutional',
        price: '59',
        badge: 'Advance Plan Active',
        color: '#FFD700',
        features: [
            "Unlimited Bot Slots",
            "AI Assistant Pro",
            "Advanced Sentiment Analysis",
            "Unlimited Manual Trading",
            "Unlimited Smart Orders",
            "Institutional Future Bots",
            "Unlimited Active Grid Bots",
            "Unlimited DCA Bots",
            "365 Days Backtest History",
            "Priority Support (Manager)",
            "Estimated Returns"
        ]
    }
};

const Settings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { notifySecurityEvent } = useAppNotifications();

    // Admin Broadcast State
    const [isAdmin, setIsAdmin] = useState(false);
    const [broadcastData, setBroadcastData] = useState({ title: '', message: '', type: 'info' });
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        country: '',
        language: '',
        timezone: '',
        avatar_url: '',
        plan: 'Free Plan', // Default
        preferences: {}
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [phoneError, setPhoneError] = useState('');
    const [sessions, setSessions] = useState([]);
    const [showAllSessions, setShowAllSessions] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const fileInputRef = useRef(null);
    
    // Country Dropdown State
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

    const handlePhoneCodeSelect = (country) => {
        const oldCountry = COUNTRIES.find(c => c.name === userData.country);
        let newPhone = userData.phone || '';
        // Smart replace old prefix with new prefix if it exists
        if (oldCountry && newPhone.replace(/[\s\-\(\)]/g, '').startsWith(oldCountry.code)) {
            newPhone = country.code + ' ' + newPhone.replace(/[\s\-\(\)]/g, '').substring(oldCountry.code.length);
        } else if (!newPhone.startsWith(country.code)) {
            newPhone = country.code + ' ' + newPhone;
        }

        setUserData(prev => ({
            ...prev,
            country: country.name,
            phone: newPhone
        }));
        setIsDropdownOpen(false);
        setSearchQuery('');
    };

    const filteredCountries = COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.code.includes(searchQuery)
    );

    const currentCountry = COUNTRIES.find(c => c.name === userData.country);

    // 2FA State
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [twoFactorData, setTwoFactorData] = useState({ qrCode: '', secret: '', code: '' });
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    // Scroll to section based on hash
    useEffect(() => {
        if (!loading && location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location, loading]);

    useEffect(() => {
        fetchUserData();
        fetchSessions();
    }, []);

    // Phone Validation Effect
    useEffect(() => {
        if (!userData.country || !userData.phone) {
            setPhoneError('');
            return;
        }

        const countryObj = COUNTRIES.find(c => c.name === userData.country);
        if (!countryObj) return;

        // Clean phone: remove spaces, dashes, parens
        const cleanPhone = userData.phone.replace(/[\s\-\(\)]/g, '');

        // 1. Check Code Prefix
        if (!cleanPhone.startsWith(countryObj.code)) {
            setPhoneError(`Number must start with ${countryObj.code}`);
            return;
        }

        // 2. Check Length (excluding code)
        const numberPart = cleanPhone.slice(countryObj.code.length);
        if (numberPart.length < countryObj.min) {
            setPhoneError(`Number is too short (min ${countryObj.min} digits)`);
        } else if (numberPart.length > countryObj.max) {
            setPhoneError(`Number is too long (max ${countryObj.max} digits)`);
        } else {
            setPhoneError('');
        }

    }, [userData.phone, userData.country]);

    const fetchUserData = async () => {
        try {
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = res.data; // Assuming res.data contains user and other info
            if (!data || !data.user || !data.user.email) throw new Error("Invalid user data received");

            const fullName = data.user.full_name || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            setUserData({
                first_name: firstName,
                last_name: lastName,
                email: data.user.email || '',
                phone: data.user.phone_number || '',
                country: data.user.country || 'United States',
                language: data.language || 'English',
                timezone: data.timezone || 'UTC',
                avatar_url: data.user.avatar_url ? getMediaUrl(data.user.avatar_url) : '/default-user.svg',
                plan: data.user.plan || 'Free Plan', // Expected from backend
                preferences: data.preferences || {}
            });
            setIs2FAEnabled(data.user.is_two_factor_enabled || false);
        } catch (error) {
            console.error("Failed to fetch user data", error);
            if (error.response && error.response.status === 401) {
                // Token expired or invalid
                removeToken();
                navigate('/signin');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(res.data);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            const token = getToken();
            await axios.delete(`${import.meta.env.VITE_API_URL}/user/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (error) {
            console.error("Failed to revoke session", error);
        }
    };

    const handleInputChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handlePreferenceChange = (key) => {
        setUserData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: !prev.preferences[key]
            }
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setSelectedImage(reader.result);
            setShowCropModal(true);
        });
        reader.readAsDataURL(file);

        // Reset input value so same file can be selected again
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob) => {
        setShowCropModal(false);
        const formData = new FormData();
        // Use a generic name, backend will handle extension
        formData.append('avatar', croppedBlob, 'profile_picture.jpg');

        try {
            setMessage({ type: '', text: 'Uploading avatar...' });
            const token = getToken();
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/user/profile/avatar`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
            );

            const normalizedAvatarUrl = getMediaUrl(res.data.avatar_url);
            setUserData(prev => ({ ...prev, avatar_url: normalizedAvatarUrl }));
            setMessage({ type: 'success', text: 'Avatar updated successfully!' });
        } catch (error) {
            console.error("Upload failed", error);
            setMessage({ type: 'error', text: 'Failed to update avatar' });
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const token = getToken();
            const full_name = `${userData.first_name} ${userData.last_name}`.trim();

            await axios.put(
                `${import.meta.env.VITE_API_URL}/user/profile`,
                {
                    full_name,
                    country: userData.country,
                    phone: userData.phone, // <--- NEW
                    language: userData.language,
                    timezone: userData.timezone,
                    preferences: userData.preferences
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match" });
            return;
        }
        try {
            const token = getToken();
            await axios.post(
                `${import.meta.env.VITE_API_URL}/user/change-password`,
                {
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: "Password changed successfully!" });
            notifySecurityEvent("Account password has been changed.");
            setShowPasswordModal(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || "Failed to change password" });
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastData.title || !broadcastData.message) {
            setMessage({ type: 'error', text: 'Title and message are required for broadcast.' });
            return;
        }
        setSendingBroadcast(true);
        try {
            const token = getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/notifications/broadcast`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(broadcastData)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Broadcast sent to all users!' });
                setBroadcastData({ title: '', message: '', type: 'info' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to send broadcast' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error sending broadcast' });
        } finally {
            setSendingBroadcast(false);
        }
    };

    const handleEnable2FA = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/user/2fa/generate`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setTwoFactorData({ ...twoFactorData, qrCode: data.qr_code, secret: data.secret, code: '' });
                setShow2FAModal(true);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to generate 2FA' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error generating 2FA' });
        }
    };

    const confirmEnable2FA = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/user/2fa/enable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: twoFactorData.code })
            });
            const data = await res.json();
            if (res.ok) {
                setIs2FAEnabled(true);
                setShow2FAModal(false);
                setMessage({ type: 'success', text: 'Two-Factor Authentication enabled!' });
                notifySecurityEvent("Two-Factor Authentication was enabled.");
            } else {
                setMessage({ type: 'error', text: data.message || 'Invalid 2FA code' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error enabling 2FA' });
        }
    };

    const handleDisable2FA = async () => {
        const code = prompt("Enter your 6-digit 2FA code to disable:");
        if (!code) return;

        try {
            const token = getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/user/2fa/disable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: code })
            });
            const data = await res.json();
            if (res.ok) {
                setIs2FAEnabled(false);
                setMessage({ type: 'success', text: 'Two-Factor Authentication disabled!' });
                notifySecurityEvent("Urgent: Two-Factor Authentication was disabled.");
            } else {
                setMessage({ type: 'error', text: data.message || 'Invalid 2FA code' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error disabling 2FA' });
        }
    };

    if (loading) return <DashboardLayout><div className="text-white p-6">Loading...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <Header title="Profile Settings" />

            {/* Message Toast */}
            {message.text && (
                <div className={`fixed top-24 right-4 p-4 rounded-lg text-white ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'} z-50`}>
                    {message.text}
                </div>
            )}

            {/* Profile Overview Card */}
            <div className="bg-[#0e4d2d] rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center gap-6 border border-white/5 relative overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-white/10 shrink-0 overflow-hidden">
                    <img
                        src={userData.avatar_url || "/default-user.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            if (e.target.src !== window.location.origin + "/default-user.svg") {
                                e.target.src = "/default-user.svg";
                            }
                        }}
                    />
                </div>

                <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">{userData.first_name} {userData.last_name}</h2>
                    <p className="text-gray-300 text-sm mb-4">{userData.email}</p>

                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <span className="bg-[#2d5f47] text-white/80 text-xs px-3 py-1.5 rounded-md font-medium">
                            {PLAN_DATA[userData.plan]?.badge || userData.plan}
                        </span>
                        <span className="bg-[#00FF9D] text-black text-xs px-3 py-1.5 rounded-md font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} fill="black" className="text-[#00FF9D]" /> Verified
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                    <Upload size={14} /> Edit Avatar
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Personal Information */}
                <div id="account" className="lg:col-span-2 bg-[#131B1F] border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <User size={20} className="text-white" />
                            <h3 className="font-bold text-white">Personal Information</h3>
                        </div>
                        <button
                            onClick={saveProfile}
                            disabled={saving}
                            className="bg-[#1A2328] hover:bg-[#253036] text-gray-300 text-xs px-3 py-1.5 rounded-lg border border-white/5 transition-colors flex items-center gap-2"
                        >
                            {saving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 pl-1">First Name</label>
                            <div className="bg-white rounded-lg p-2.5 flex items-center justify-between">
                                <input
                                    name="first_name"
                                    type="text"
                                    value={userData.first_name}
                                    onChange={handleInputChange}
                                    className="bg-transparent text-black text-sm font-medium outline-none w-full"
                                />
                                <PenSquare size={14} className="text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 pl-1">Last Name</label>
                            <div className="bg-white rounded-lg p-2.5 flex items-center justify-between">
                                <input
                                    name="last_name"
                                    type="text"
                                    value={userData.last_name}
                                    onChange={handleInputChange}
                                    className="bg-transparent text-black text-sm font-medium outline-none w-full"
                                />
                                <PenSquare size={14} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-gray-400 text-xs mb-2 pl-1">Email Address</label>
                            <div className="bg-white rounded-lg p-2.5 flex items-center justify-between">
                                <input
                                    name="email"
                                    type="email"
                                    disabled
                                    value={userData.email}
                                    className="bg-transparent text-black text-sm font-medium outline-none w-full opacity-70 cursor-not-allowed"
                                />
                            </div>
                        </div>
                            {/* Phone */}
                        <div className="md:col-span-1">
                            <label className="block text-gray-400 text-xs mb-2 pl-1">Phone Number</label>
                            <div className="flex gap-3">
                                {/* Dropdown Picker */}
                                <div className="w-[140px] relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={`w-full h-full flex items-center justify-between bg-white text-black font-medium text-sm rounded-lg px-3 py-2.5 outline-none transition-all hover:bg-gray-50 border ${isDropdownOpen ? 'border-gray-400' : 'border-transparent'}`}
                                    >
                                        <span className="flex items-center gap-2.5 truncate">
                                            <span className="text-lg leading-none flex items-center">
                                                {currentCountry ? <span className={`fi fi-${currentCountry.iso.toLowerCase()} rounded-[2px] opacity-90`} /> : '🌐'}
                                            </span>
                                            <span className="text-black">{currentCountry ? currentCountry.code : "+_"}</span>
                                        </span>
                                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown List */}
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
                                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${userData.country === country.name ? 'bg-white/5 text-[#00FF9D]' : 'text-gray-300'}`}
                                                        >
                                                            <span className="flex items-center gap-3 truncate">
                                                                <span className="text-lg flex items-center">
                                                                    <span className={`fi fi-${country.iso.toLowerCase()} rounded-[2px] opacity-90`} />
                                                                </span>
                                                                <span className="truncate">{country.name}</span>
                                                            </span>
                                                            <span className={`shrink-0 ${userData.country === country.name ? 'text-[#00FF9D]' : 'text-gray-500'}`}>
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

                                {/* Text Input */}
                                <div className="flex-1 bg-white rounded-lg p-2.5 flex items-center justify-between border border-transparent focus-within:border-gray-300 transition-colors">
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={userData.phone || ''}
                                        onChange={handleInputChange}
                                        placeholder="+1 555 000 0000"
                                        className="bg-transparent text-black text-sm font-medium outline-none w-full"
                                    />
                                    <PenSquare size={14} className="text-gray-400" />
                                </div>
                            </div>
                            {phoneError && <p className="text-red-400 text-[10px] mt-1 pl-1">{phoneError}</p>}
                        </div>
                    </div>
                </div>

                {/* 2. Security */}
                <div id="security" className="bg-[#131B1F] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield size={20} className="text-white" />
                        <h3 className="font-bold text-white">Security</h3>
                    </div>

                    <div className="space-y-4">
                        <div
                            onClick={() => setShowPasswordModal(true)}
                            className="bg-[#1A2328] rounded-xl p-4 flex items-center justify-between group cursor-pointer border border-white/5 hover:border-white/10"
                        >
                            <div>
                                <p className="text-white text-sm font-medium">Change Password</p>
                                <p className="text-gray-500 text-[10px]">Secure your account</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-500" />
                        </div>

                        {/* 2FA Section Option */}
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <p className="text-white text-sm font-medium">2FA Authentication</p>
                                <p className="text-gray-500 text-[10px]">Extra security layer</p>
                            </div>
                            {is2FAEnabled ? (
                                <button
                                    onClick={handleDisable2FA}
                                    className="bg-red-500/10 text-red-400 text-sm font-bold px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                >
                                    Disable 2FA
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnable2FA}
                                    className="bg-[#1A2328] text-[#00FF9D] text-sm font-bold px-4 py-2 rounded-lg border border-[#00FF9D]/20 hover:bg-[#00FF9D]/10 transition-colors"
                                >
                                    Enable 2FA
                                </button>
                            )}
                        </div>

                        {/* Active Sessions */}
                        <div className="mt-8">
                            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 opacity-50">Active Sessions</h4>
                            <div className="space-y-3">
                                {sessions.length > 0 ? sessions.slice(0, showAllSessions ? sessions.length : 3).map(session => (
                                    <div key={session.id} className="bg-[#1A2328] rounded-xl p-4 flex items-center justify-between border border-white/5 transition-all hover:bg-white/[0.02]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                                {session.device_type === 'Mobile' ? <Smartphone size={20} className="text-[#00FF9D]" /> : <Monitor size={20} className="text-[#00FF9D]" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white text-sm font-bold">{session.browser || 'Browser'} on {session.os || 'OS'}</p>
                                                    {String(session.id) === String(getSessionId()) ? (
                                                        <span className="bg-[#00FF9D]/10 text-[#00FF9D] text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Current</span>
                                                    ) : null}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                                                        <Globe size={10} />
                                                        <span>{session.ip_address}</span>
                                                    </div>
                                                    <p className="text-gray-500 text-[10px]">Active {new Date(session.last_active).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {String(session.id) !== String(getSessionId()) && (
                                            <button
                                                onClick={() => handleRevokeSession(session.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                                title="Revoke Session"
                                            >
                                                <LogOut size={16} />
                                            </button>
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-xs text-center py-4">No active sessions found.</p>
                                )}
                                {sessions.length > 3 && (
                                    <button
                                        onClick={() => setShowAllSessions(!showAllSessions)}
                                        className="w-full py-2.5 mt-2 bg-transparent text-[#00FF9D] text-xs font-bold rounded-lg border border-white/5 hover:border-[#00FF9D]/30 hover:bg-[#00FF9D]/5 transition-all text-center flex justify-center items-center gap-2"
                                    >
                                        {showAllSessions ? 'Show Less' : `Show all devices (${sessions.length})`}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Billing */}
                <div id="billing" className="lg:col-span-2 bg-[#131B1F] border border-white/5 rounded-2xl p-6 relative">
                    <div className="absolute top-6 right-6 text-2xl font-bold text-white">
                        ${PLAN_DATA[userData.plan]?.price || '0'}
                        <span className="text-[10px] text-gray-500 font-normal ml-1">/mo</span>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <Briefcase size={20} className="text-white" />
                        <h3 className="font-bold text-white">Billing & Subscription</h3>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        <div>
                            <p className="text-white text-xs font-bold uppercase tracking-widest opacity-50 mb-3">Active Plan</p>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse"></div>
                                <span className="text-white text-sm font-bold">
                                    FydBlock {PLAN_DATA[userData.plan]?.name || userData.plan}
                                </span>
                                <span className="bg-[#00FF9D]/10 text-[#00FF9D] text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">Active Now</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 mt-5 mb-6">
                                {(PLAN_DATA[userData.plan]?.features || []).map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 group/feat">
                                        <CheckCircle2 size={12} className="text-[#00FF9D] group-hover/feat:scale-110 transition-transform" />
                                        <span className="text-gray-300 text-[10px] font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="bg-[#23332d] text-[#00FF9D] text-[10px] px-4 py-2 rounded-lg border border-[#00FF9D]/20 hover:bg-[#00FF9D]/10 transition-colors font-bold">
                                    Manage Subscription
                                </button>
                                {userData.plan !== 'Advance Plan' && (
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="bg-white/5 text-white text-[10px] px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors font-bold"
                                    >
                                        Upgrade Plan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. My Setting */}
                <div id="settings" className="bg-[#131B1F] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell size={20} className="text-white" />
                        <h3 className="font-bold text-white">My Settings</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 pl-1">Language</label>
                            <div className="bg-white rounded-lg p-2.5 flex items-center justify-between">
                                <select
                                    name="language"
                                    value={userData.language}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        // Auto save when changed
                                        setTimeout(saveProfile, 100);
                                    }}
                                    className="bg-transparent text-black text-sm font-medium outline-none w-full appearance-none"
                                >
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                    <option>German</option>
                                </select>
                                <ChevronRight size={14} className="text-gray-400 rotate-90" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-2 pl-1">Timezone</label>
                            <div className="bg-white rounded-lg p-2.5 flex items-center justify-between">
                                <select
                                    name="timezone"
                                    value={userData.timezone}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        setTimeout(saveProfile, 100);
                                    }}
                                    className="bg-transparent text-black text-sm font-medium outline-none w-full appearance-none"
                                >
                                    <option>UTC</option>
                                    <option>EST</option>
                                    <option>PST</option>
                                    <option>IST</option>
                                </select>
                                <ChevronRight size={14} className="text-gray-400 rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Notification */}
                <div id="notifications" className="lg:col-span-3 bg-[#131B1F] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell size={20} className="text-white" />
                        <h3 className="font-bold text-white">Notifications</h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                        {[
                            { key: 'btc_volatility', label: "Bitcoin volatility alert" },
                            { key: 'api_expiry', label: "API Key Expiration" },
                            { key: 'marketing', label: "Marketing notification" },
                            { key: 'trade_exec', label: "Trade Execution" },
                            { key: 'security_alert', label: "Security Alerts" }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                                <span className="text-white text-sm font-medium">{item.label}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userData.preferences[item.key] !== false}
                                        onChange={() => {
                                            handlePreferenceChange(item.key);
                                            // Trigger save after state update - tricky with closures, easiest is to let user manually save or use useEffect debouncer
                                        }}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00FF9D]"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={saveProfile}
                            className="bg-[#00FF9D] text-black font-bold text-sm px-6 py-2 rounded-lg hover:bg-[#00cc7d] transition-colors"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>

            </div>

            {/* Admin Controls (Only visible to admins) */}
            {isAdmin && (
                <div className="mt-6 bg-[#131B1F] border border-[#00FF9D]/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF9D]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <Shield size={20} className="text-[#00FF9D]" />
                        <h3 className="font-bold text-[#00FF9D]">Admin Controls (Global Notifications)</h3>
                    </div>

                    <div className="space-y-4 max-w-2xl relative z-10">
                        <p className="text-xs text-gray-400 mb-4">Send a broadcast message to all users. This will appear in their notification bell.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-xs mb-2">Notification Title</label>
                                <input
                                    type="text"
                                    value={broadcastData.title}
                                    placeholder="e.g. New Feature Released!"
                                    onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                                    className="w-full bg-[#0A1014] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-[#00FF9D]"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs mb-2">Notification Type</label>
                                <select
                                    value={broadcastData.type}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, type: e.target.value })}
                                    className="w-full bg-[#0A1014] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-[#00FF9D] appearance-none"
                                >
                                    <option value="info">Info (Default bell)</option>
                                    <option value="feature">Feature (Rocket icon)</option>
                                    <option value="success">Success (Checkmark)</option>
                                    <option value="warning">Warning/Maintenance (Alert icon)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs mb-2">Message Content</label>
                            <textarea
                                value={broadcastData.message}
                                placeholder="Describe the update or maintenance window..."
                                rows={3}
                                onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                                className="w-full bg-[#0A1014] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-[#00FF9D] resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSendBroadcast}
                                disabled={sendingBroadcast || !broadcastData.title || !broadcastData.message}
                                className={`bg-[#00FF9D] text-black font-bold text-sm px-6 py-3 rounded-lg hover:bg-[#00cc7d] transition-colors flex items-center gap-2 ${sendingBroadcast ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {sendingBroadcast ? 'Sending...' : 'Broadcast to All Users'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A2328] rounded-2xl p-6 w-full max-w-md border border-white/10 relative">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">Change Password</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-xs mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    className="w-full bg-[#131B1F] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-[#00FF9D]"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full bg-[#131B1F] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-[#00FF9D]"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full bg-[#131B1F] border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-[#00FF9D]"
                                />
                            </div>

                            <button
                                onClick={changePassword}
                                className="w-full bg-[#00FF9D] text-black font-bold py-3 rounded-lg mt-4 hover:bg-[#00cc7d] transition-colors"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enable 2FA Modal */}
            {show2FAModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A2328] rounded-2xl p-6 w-full max-w-md border border-white/10 relative text-center">
                        <button
                            onClick={() => setShow2FAModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-2">Enable 2FA</h3>
                        <p className="text-gray-400 text-xs mb-6 px-4">
                            Scan this QR code with your authenticator app (like Google Authenticator or Authy), then enter the 6-digit code below to verify.
                        </p>

                        {twoFactorData.qrCode && (
                            <div className="bg-white p-4 rounded-xl inline-block mb-4">
                                <img src={twoFactorData.qrCode} alt="2FA QR Code" />
                            </div>
                        )}
                        <p className="text-gray-500 text-[10px] mb-6 tracking-widest uppercase">Secret: {twoFactorData.secret}</p>

                        <div className="space-y-4 text-left">
                            <div>
                                <label className="block text-gray-400 text-xs mb-2">Authenticator Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    value={twoFactorData.code}
                                    onChange={(e) => setTwoFactorData({ ...twoFactorData, code: e.target.value.replace(/\D/g, '') })}
                                    className="w-full bg-[#131B1F] border border-white/10 rounded-lg p-3 text-center text-white text-lg tracking-widest font-mono outline-none focus:border-[#00FF9D]"
                                />
                            </div>

                            <button
                                onClick={confirmEnable2FA}
                                className="w-full bg-[#00FF9D] text-black font-bold py-3 rounded-lg mt-2 hover:bg-[#00cc7d] transition-colors"
                            >
                                Verify & Enable
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Crop Modal */}
            {showCropModal && (
                <CropModal
                    image={selectedImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setShowCropModal(false)}
                />
            )}
        </DashboardLayout>
    );
};

export default Settings;
