import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, Send, X, MessageSquare, Loader2, Minimize2 } from 'lucide-react';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm your Financial Assistant. Need help analyzing your expenses or income today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const apiMessages = newMessages.map(m => ({ 
                role: m.role, 
                content: m.text 
            }));

            const res = await axios.post('/api/ai-insights', 
                { messages: apiMessages },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setMessages([...newMessages, { role: 'assistant', text: res.data.insight }]);
        } catch (err) {
            console.error('ChatBot Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #81A6C6 0%, #AACDDC 100%)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(129, 166, 198, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    transition: 'transform 0.3s'
                }}
                className="hover-pop"
            >
                <MessageSquare size={28} />
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '380px',
            height: '550px',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
            border: '1px solid #F1F2F6',
        }} className="animate-fade-in">
            {/* Header */}
            <div style={{ 
                padding: '20px 24px', 
                background: 'linear-gradient(135deg, #81A6C6 0%, #AACDDC 100%)', 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Bot size={24} />
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>AI Assistant</h4>
                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Analyzing live data</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <Minimize2 size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div 
                ref={scrollRef}
                style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#FAFAFA' }}
            >
                {messages.map((m, i) => (
                    <div key={i} style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        background: m.role === 'user' ? '#81A6C6' : 'white',
                        color: m.role === 'user' ? 'white' : '#4A4E69',
                        padding: '12px 16px',
                        borderRadius: m.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        border: m.role === 'user' ? 'none' : '1px solid #F1F2F6'
                    }}>
                        {m.text}
                    </div>
                ))}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 16px', borderRadius: '18px 18px 18px 2px', border: '1px solid #F1F2F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Loader2 size={16} className="animate-spin" color="#81A6C6" />
                        <span style={{ fontSize: '0.85rem', color: '#9A8C98' }}>Thinking...</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ padding: '20px', borderTop: '1px solid #F1F2F6', background: 'white' }}>
                <div style={{ display: 'flex', gap: '10px', background: '#F9FAFB', padding: '6px', borderRadius: '14px', border: '1px solid #F1F2F6' }}>
                    <input 
                        type="text" 
                        placeholder="Ask anything..."
                        style={{ flex: 1, background: 'transparent', border: 'none', padding: '8px 12px', fontSize: '0.9rem', outline: 'none' }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading}
                        style={{ 
                            background: '#81A6C6', 
                            color: 'white', 
                            border: 'none', 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
