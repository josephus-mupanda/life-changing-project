import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Trash2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

interface Props {
    isFooter?: boolean;
}

export const Chatbot = ({ isFooter }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isArchiveView, setIsArchiveView] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [archiveMessages, setArchiveMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load active history and archive on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('lceo_chat_history');
        const savedArchive = localStorage.getItem('lceo_chat_archive');

        if (savedHistory) {
            try {
                setMessages(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse chat history", e);
                initDefaultMessage();
            }
        } else {
            initDefaultMessage();
        }

        if (savedArchive) {
            try {
                setArchiveMessages(JSON.parse(savedArchive));
            } catch (e) {
                console.error("Failed to parse chat archive", e);
            }
        }
    }, []);

    // Save history and archive on changes
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('lceo_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        if (archiveMessages.length > 0) {
            localStorage.setItem('lceo_chat_archive', JSON.stringify(archiveMessages));
        }
    }, [archiveMessages]);

    useEffect(() => {
        if (messagesEndRef.current && !isArchiveView) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, isArchiveView]);

    const initDefaultMessage = () => {
        setMessages([
            {
                id: Date.now(),
                text: "Hello! I'm the LCEO Virtual Assistant. How can I help you support young women and girls in Rwanda today?",
                sender: 'bot',
                timestamp: new Date().toISOString()
            }
        ]);
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate bot response
        setTimeout(() => {
            const botMsg: Message = {
                id: Date.now() + 1,
                text: getBotResponse(input),
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    const deleteMessage = (id: number) => {
        setMessages(prev => {
            const msgToDelete = prev.find(m => m.id === id);
            if (msgToDelete) {
                const newArchive = [...archiveMessages, msgToDelete];
                setArchiveMessages(newArchive);
                localStorage.setItem('lceo_chat_archive', JSON.stringify(newArchive));
            }
            const updated = prev.filter(m => m.id !== id);
            localStorage.setItem('lceo_chat_history', JSON.stringify(updated));
            return updated;
        });
    };

    const clearHistory = () => {
        if (window.confirm("Move all messages to archive?")) {
            const newArchive = [...archiveMessages, ...messages];
            setArchiveMessages(newArchive);
            localStorage.setItem('lceo_chat_archive', JSON.stringify(newArchive));
            localStorage.removeItem('lceo_chat_history');
            initDefaultMessage();
        }
    };

    const getBotResponse = (text: string) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('donate')) return "You can support our mission by clicking the 'Donate' button in the navigation bar or visiting our donation page. Every contribution makes a difference!";
        if (lowerText.includes('work') || lowerText.includes('what you do')) return "We empower vulnerable young women through education, entrepreneurship (IkiraroBiz), and mentorship. Check our 'How We Work' page for details!";
        if (lowerText.includes('location') || lowerText.includes('rwanda')) return "We are primarily active in the Bugesera District of Rwanda, where we run our Safe Space centers.";
        if (lowerText.includes('volunteer')) return "We'd love to have you! Please fill out the volunteer form on our 'How We Work' page or contact us directly.";
        return "Thank you for reaching out! I'm learning more every day. Could you please specify if you'd like to know about our programs, donations, or volunteering?";
    };

    return (
        <div style={isFooter ? { position: 'relative', display: 'inline-block' } : {}}>
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed z-50 p-0 rounded-full shadow-2xl text-white d-flex align-items-center justify-content-center"
                style={{
                    background: 'linear-gradient(135deg, #122f2b 0%, #17d1ac 100%)',
                    width: '65px',
                    height: '65px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 1000,
                    bottom: '65px',
                    right: '25px',
                    position: 'fixed',
                    boxShadow: '0 10px 25px rgba(18, 47, 43, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: 'none'
                }}
                whileHover={{
                    scale: 1.1,
                    boxShadow: '0 15px 30px rgba(18, 47, 43, 0.5)'
                }}
                whileTap={{ scale: 0.9 }}
                title="Open Assistant"
            >
                <div className="position-relative">
                    <MessageCircle size={32} strokeWidth={1.5} />
                    <span className="position-absolute" style={{
                        top: '-5px',
                        right: '-5px',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ff4b2b',
                        borderRadius: '50%',
                        border: '2px solid #fff',
                        boxShadow: '0 0 10px rgba(255, 75, 43, 0.5)'
                    }}></span>
                </div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        drag
                        dragMomentum={false}
                        dragConstraints={{ top: 0, left: -window.innerWidth + 350, right: 0, bottom: window.innerHeight - 500 }}
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        className="fixed z-50 shadow-2xl overflow-hidden d-flex flex-column"
                        style={{
                            width: '320px',
                            height: '450px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'grab',
                            zIndex: 1001,
                            top: '90px',
                            right: '25px',
                            position: 'fixed',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                            background: '#122f2b'
                        }}
                    >
                        <div className="p-3 text-white d-flex align-items-center justify-content-between shadow-sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'grab' }}>
                            <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle p-2 mr-2">
                                    <Bot size={18} color="#122f2b" strokeWidth={1.5} />
                                </div>
                                <div style={{ pointerEvents: 'none' }}>
                                    <h6 className="mb-0 font-weight-bold" style={{ fontSize: '0.9rem' }}>
                                        {isArchiveView ? 'Chat History' : 'LCEO Assistant'}
                                    </h6>
                                    <small className="opacity-75" style={{ fontSize: '0.7rem' }}>
                                        {isArchiveView ? 'Archive' : 'Online'}
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <button
                                    onClick={() => setIsArchiveView(!isArchiveView)}
                                    className="btn btn-link text-white p-1 opacity-75 hover-opacity-100"
                                    title={isArchiveView ? "Back to Chat" : "View History"}
                                >
                                    <History size={16} style={{ color: isArchiveView ? '#17d1ac' : 'white' }} strokeWidth={1.5} />
                                </button>
                                {!isArchiveView && (
                                    <button onClick={clearHistory} className="btn btn-link text-white p-1 opacity-50 hover-opacity-100" title="Archive All">
                                        <Trash2 size={14} strokeWidth={1.5} />
                                    </button>
                                )}
                                {isArchiveView && archiveMessages.length > 0 && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Permanently delete all archived history?")) {
                                                setArchiveMessages([]);
                                                localStorage.removeItem('lceo_chat_archive');
                                            }
                                        }}
                                        className="btn btn-link text-white p-1 opacity-50 hover-opacity-100"
                                        title="Clear Archive"
                                    >
                                        <Trash2 size={14} strokeWidth={1.5} />
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="btn btn-link text-white p-1 hover-scale" style={{ cursor: 'pointer' }}>
                                    <X size={18} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow-1 p-3 overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(100% - 110px)', cursor: 'default', background: 'rgba(255,255,255,0.03)' }} onPointerDown={e => e.stopPropagation()}>
                            {(isArchiveView ? archiveMessages : messages).map((msg) => (
                                <div key={msg.id} className={"d-flex mb-3 group " + (msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start')}>
                                    <div className="position-relative d-flex flex-column" style={{ maxWidth: '85%', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                        <div
                                            className={"p-2 rounded-lg shadow-sm " + (msg.sender === 'user' ? 'text-white' : 'text-white')}
                                            style={{
                                                borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                                backgroundColor: msg.sender === 'user' ? '#17d1ac' : 'rgba(255,255,255,0.1)',
                                                fontSize: '0.8rem',
                                                lineHeight: '1.4',
                                                opacity: isArchiveView ? 0.7 : 1
                                            }}
                                        >
                                            <p className="mb-0">{msg.text}</p>
                                        </div>
                                        <div className="d-flex align-items-center mt-1 opacity-50" style={{ fontSize: '0.65rem' }}>
                                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {isArchiveView && <span className="ml-1 font-italic">(Archived)</span>}
                                        </div>
                                        {!isArchiveView && (
                                            <button
                                                onClick={() => deleteMessage(msg.id)}
                                                className="position-absolute border-0 bg-transparent text-danger p-0"
                                                style={{
                                                    [msg.sender === 'user' ? 'left' : 'right']: '-20px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                                            >
                                                <X size={12} strokeWidth={1.5} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isArchiveView && archiveMessages.length === 0 && (
                                <div className="text-center mt-5 opacity-40 text-white">
                                    <History size={32} className="mb-2" strokeWidth={1.5} />
                                    <p style={{ fontSize: '0.8rem' }}>No archived messages yet.</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 bg-transparent" style={{ cursor: 'default', borderTop: '1px solid rgba(255,255,255,0.1)' }} onPointerDown={e => e.stopPropagation()}>
                            {!isArchiveView ? (
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control border-0 text-white"
                                        placeholder="Type a message..."
                                        style={{ borderRadius: '10px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.1)' }}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <div className="input-group-append ml-2">
                                        <button
                                            className="btn p-0 d-flex align-items-center justify-content-center"
                                            style={{ width: '35px', height: '35px', backgroundColor: '#17d1ac', color: '#fff', borderRadius: '10px', border: 'none' }}
                                            onClick={handleSend}
                                        >
                                            <Send size={16} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsArchiveView(false)}
                                    className="btn btn-block btn-sm rounded-pill text-white"
                                    style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}
                                >
                                    Return to Active Chat
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
