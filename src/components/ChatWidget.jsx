import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'agent', text: "Hi — I'm an AI assistant from Tier 4 Intelligence. I can answer questions about the Growth Flywheel, how our system works, or help you book a call with our team. What would you like to know?" }
    ]);
    const [inputText, setInputText] = useState("");

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Add user message
        setMessages([...messages, { role: 'user', text: inputText }]);
        setInputText("");

        // Simulate agent response (stub for actual API endpoint connection)
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'agent', text: "I'll connect you directly with Matt and the operations team. Shall I initiate a booking sequence?" }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Open chat"
                className={`fixed bottom-8 right-8 z-[9999] w-14 h-14 bg-brand-green rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(94,192,138,0.4)] magnetic-btn transition-transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 animate-pulse-slow'}`}
            >
                <MessageSquare className="text-white" size={24} aria-hidden="true" />
            </button>

            {/* Chat Panel */}
            <div className={`fixed bottom-8 right-8 z-[9999] w-[350px] bg-navy-deep border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>

                {/* Header */}
                <div className="bg-slate-dark px-4 py-3 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="font-sans font-bold text-white text-sm">Tier 4 Assistant</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} aria-label="Close chat" className="text-white/50 hover:text-white transition-colors">
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                {/* Messages */}
                <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-navy-deep/80 text-sm font-sans flex flex-col">
                    {messages.map((msg, i) => (
                        <div key={i} className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'agent' ? 'bg-slate-dark text-white self-start rounded-tl-sm' : 'bg-brand-green text-white self-end rounded-tr-sm'}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 bg-slate-dark border-t border-white/5 flex items-center gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your question..."
                        className="flex-1 bg-navy-deep border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-green/50 transition-colors"
                    />
                    <button type="submit" aria-label="Send message" className="w-9 h-9 flex items-center justify-center bg-brand-green rounded-full text-white magnetic-btn shrink-0">
                        <Send size={16} aria-hidden="true" />
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatWidget;
