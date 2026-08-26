import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import {
    MessageSquarePlus, Bug, Lightbulb, HelpCircle,
    Star, UploadCloud, Send, CheckCircle2, Clock, AlertCircle, RefreshCw, X, Paperclip
} from 'lucide-react';

import API_BASE_URL from '../../config';

const Feedback = () => {
    const [selectedType, setSelectedType] = useState('feature');
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [tickets, setTickets] = useState([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchReplies = async (ticketId) => {
        setLoadingReplies(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/user/feedback/${ticketId}/replies`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReplies(res.data);
        } catch (error) {
            console.error('Failed to fetch replies', error);
            toast.error('Failed to load thread');
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleOpenThread = (ticket) => {
        setSelectedTicket(ticket);
        fetchReplies(ticket.id);
    };

    const handleCloseThread = () => {
        setSelectedTicket(null);
        setReplies([]);
        setNewMessage('');
        setAttachment(null);
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) return;

        setIsReplying(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            if (newMessage.trim()) formData.append('message', newMessage);
            if (attachment) formData.append('attachment', attachment);

            const res = await axios.post(`${API_BASE_URL}/user/feedback/${selectedTicket.id}/replies`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setReplies([...replies, res.data]);
            setNewMessage('');
            setAttachment(null);
            toast.success('Reply submitted');
        } catch (error) {
            console.error('Failed to send reply:', error);
            toast.error('Failed to send reply');
        } finally {
            setIsReplying(false);
        }
    };

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/user/feedback`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (error) {
            console.error('Failed to fetch feedback tickets', error);
            toast.error('Failed to load recent tickets');
        } finally {
            setIsLoadingTickets(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            toast.error('Please provide a title and description');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/user/feedback`, {
                type: selectedType,
                rating,
                title,
                description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Feedback submitted successfully!');

            // Reset form
            setTitle('');
            setDescription('');
            setRating(0);

            // Refresh list
            fetchTickets();
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            toast.error(error?.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSupportClick = () => {
        setSelectedType('support');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'text-[#00FF9D] bg-[#00FF9D]/10';
            case 'In Progress': return 'text-blue-400 bg-blue-400/10';
            default: return 'text-yellow-400 bg-yellow-400/10';
        }
    };

    return (
        <DashboardLayout>
            <Header title="Feedback Portal" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Feedback Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Intro Section */}
                    <div className="bg-[#0e4d2d] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF9D]/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Help us improve FydBlock</h2>
                        <p className="text-gray-300 text-sm max-w-lg relative z-10">
                            Your feedback directly shapes the future of our platform. Let us know about bugs you find, features you'd love to see, or how we can make your experience better.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-[#131B1F] border border-white/5 rounded-2xl p-6 space-y-6">

                        {/* Type Selection */}
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                                What kind of feedback is this?
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { id: 'bug', label: 'Bug Report', icon: Bug },
                                    { id: 'feature', label: 'Feature Request', icon: Lightbulb },
                                    { id: 'general', label: 'General', icon: MessageSquarePlus },
                                    { id: 'support', label: 'Support', icon: HelpCircle },
                                ].map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 flex flex-col items-center gap-2 ${selectedType === type.id
                                            ? 'bg-[#00FF9D]/10 border-[#00FF9D] text-[#00FF9D]'
                                            : 'bg-[#1A2328] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        <type.icon size={24} />
                                        <span className="text-xs font-bold">{type.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                                How would you rate your experience?
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={28}
                                            fill={rating >= star ? "#00FF9D" : "none"}
                                            className={rating >= star ? "text-[#00FF9D]" : "text-gray-600"}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                ))}
                                <span className="ml-3 text-sm text-gray-400">
                                    {rating === 5 ? "Excellent!" : rating === 4 ? "Good" : rating === 3 ? "Okay" : rating > 0 ? "Could be better" : ""}
                                </span>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-xs mb-2">Title</label>
                                <input
                                    type="text"
                                    placeholder="Short summary of your feedback"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-[#1A2328] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#00FF9D] outline-none transition-colors placeholder:text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs mb-2">Description</label>
                                <textarea
                                    rows="6"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-[#1A2328] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#00FF9D] outline-none resize-none transition-colors placeholder:text-gray-600"
                                    placeholder="Please include as much detail as possible..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Attachments (Mock) */}
                        <div>
                            <label className="block text-gray-400 text-xs mb-2">Attachments (Optional)</label>
                            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-[#00FF9D]/30 hover:bg-[#00FF9D]/5 transition-colors cursor-pointer group">
                                <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <UploadCloud size={24} className="text-gray-400 group-hover:text-[#00FF9D]" />
                                </div>
                                <p className="text-xs font-medium">Click to upload or drag and drop</p>
                                <p className="text-[10px] mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-[#00FF9D] hover:bg-[#00cc7d] text-black font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,157,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Send size={18} strokeWidth={2.5} />
                                        Submit Feedback
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Right Column: History & Info */}
                <div className="space-y-6">

                    {/* Recent Ticket Status */}
                    <div className="bg-[#131B1F] border border-white/5 rounded-2xl p-6">
                        <h3 className="font-bold text-white text-lg mb-4">Your Recent Tickets</h3>
                        <div className="space-y-4">
                            {isLoadingTickets ? (
                                <p className="text-gray-500 text-sm">Loading tickets...</p>
                            ) : tickets.length === 0 ? (
                                <p className="text-gray-500 text-sm">No recent feedback submitted.</p>
                            ) : tickets.slice(0, 5).map((ticket, i) => (
                                <div key={i} onClick={() => handleOpenThread(ticket)} className="p-3 bg-[#1A2328] rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                                        <span className="text-[10px] text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-white text-sm font-medium line-clamp-1">{ticket.title}</p>
                                </div>
                            ))}
                        </div>
                        {tickets.length > 5 && (
                            <button className="w-full mt-4 text-xs text-gray-400 hover:text-white transition-colors underline decoration-dotted">
                                View all tickets
                            </button>
                        )}
                    </div>

                    {/* Roadmap / Proactive Help */}
                    <div className="bg-gradient-to-br from-[#1A2328] to-[#131B1F] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Lightbulb size={80} className="text-white" />
                        </div>
                        <h3 className="font-bold text-white text-lg mb-2 relative z-10">What's Next?</h3>
                        <p className="text-gray-400 text-xs mb-4 relative z-10">
                            We are currently working on the following features based on community feedback:
                        </p>
                        <ul className="space-y-2 relative z-10">
                            {[
                                "Advanced Portfolio Analytics",
                                "Mobile App Beta Release",
                                "Custom Strategy Builder"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Contact */}
                    <div className="bg-[#131B1F] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-[#00FF9D]">
                            <MessageSquarePlus size={24} />
                        </div>
                        <h3 className="font-bold text-white mb-1">Need Urgent Help?</h3>
                        <p className="text-gray-400 text-xs mb-4">For account validation or critical issues, please contact support directly.</p>
                        <button
                            onClick={handleSupportClick}
                            className="w-full bg-[#1A2328] hover:bg-[#253036] border border-white/10 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                        >
                            Chat with Support
                        </button>
                    </div>

                </div>
            </div>
            {/* Chat Modal */}
            {
                selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#131B1F] border border-white/10 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl relative">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold text-white">Thread: {selectedTicket.title}</h2>
                                        <div className={`px-2 py-0.5 rounded-lg text-xs font-bold ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">Feedback Portal</p>
                                </div>
                                <button onClick={handleCloseThread} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="text-gray-400 hover:text-white" size={24} />
                                </button>
                            </div>

                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* OP Post */}
                                <div className="flex flex-col items-end w-full">
                                    <div className="mb-6 flex justify-between items-center w-full">
                                        <button
                                            onClick={() => fetchReplies(selectedTicket.id)}
                                            disabled={loadingReplies}
                                            className="text-gray-400 hover:text-[#00FF9D] p-1 rounded-lg transition-colors bg-white/5 border border-white/10"
                                            title="Refresh Thread"
                                        >
                                            <RefreshCw size={14} className={loadingReplies ? 'animate-spin text-[#00FF9D]' : ''} />
                                        </button>
                                        <span className="text-xs text-gray-400 mb-1 mr-1 font-bold">Original Submission</span>
                                    </div>
                                    <div className="bg-[#00FF9D]/10 border border-[#00FF9D]/20 rounded-2xl rounded-tr-sm p-4 text-[#00FF9D] max-w-[85%] shadow-lg">
                                        <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                                        <span className="text-[10px] text-[#00FF9D]/60 block mt-2 font-mono">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Replies */}
                                {loadingReplies ? (
                                    <div className="text-center py-10">
                                        <RefreshCw className="animate-spin text-[#00FF9D] mx-auto mb-2" size={24} />
                                        <span className="text-sm text-gray-500">Loading thread...</span>
                                    </div>
                                ) : (
                                    replies.map((reply) => {
                                        const isUserReply = reply.sender_role === 'user';
                                        return (
                                            <div key={reply.id} className={`flex flex-col w-full ${isUserReply ? 'items-end' : 'items-start'}`}>
                                                <span className={`text-xs text-gray-400 mb-1 font-bold ${isUserReply ? 'mr-1' : 'ml-1'}`}>
                                                    {isUserReply ? 'You' : 'Support Team'}
                                                </span>
                                                <div className={`p-4 max-w-[85%] border shadow-lg ${isUserReply
                                                    ? 'bg-[#00FF9D]/10 border-[#00FF9D]/20 rounded-2xl rounded-tr-sm text-[#00FF9D]'
                                                    : 'bg-white/5 border-white/10 rounded-2xl rounded-tl-sm text-gray-300'
                                                    }`}>
                                                    {reply.message && (
                                                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                                                    )}
                                                    {reply.attachment_url && (
                                                        <div className="mt-3">
                                                            <a href={`${API_BASE_URL.replace('/api', '')}${reply.attachment_url}`} target="_blank" rel="noopener noreferrer">
                                                                <img
                                                                    src={`${API_BASE_URL.replace('/api', '')}${reply.attachment_url}`}
                                                                    alt="Attachment"
                                                                    className="max-w-full h-auto rounded-lg max-h-60 border border-white/10 hover:opacity-80 transition-opacity"
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            </a>
                                                        </div>
                                                    )}
                                                    <span className={`text-[10px] block mt-2 font-mono ${isUserReply ? 'text-[#00FF9D]/60' : 'text-gray-500'}`}>
                                                        {new Date(reply.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-white/10 bg-[#0A0E11] rounded-b-2xl">
                                {attachment && (
                                    <div className="mb-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
                                        <span className="text-xs text-blue-400 truncate flex items-center gap-2">
                                            <Paperclip size={12} /> {attachment.name}
                                        </span>
                                        <button onClick={() => setAttachment(null)} className="text-blue-400 hover:text-white">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                                <form onSubmit={handleSendReply} className="flex gap-2 items-end">
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl focus-within:border-[#00FF9D]/50 transition-colors flex items-center p-2 relative">
                                        <label className="p-2 text-gray-400 hover:text-[#00FF9D] cursor-pointer transition-colors">
                                            <Paperclip size={20} />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setAttachment(e.target.files[0])}
                                            />
                                        </label>
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your reply here..."
                                            className="w-full bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 min-h-[44px] max-h-32 resize-none px-2 py-2.5"
                                            rows="1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendReply(e);
                                                }
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isReplying || (!newMessage.trim() && !attachment)}
                                        className="h-[60px] px-6 bg-[#00FF9D] hover:bg-[#00FF9D]/80 text-black font-bold flex items-center justify-center rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isReplying ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
        </DashboardLayout>
    );
};
export default Feedback;
