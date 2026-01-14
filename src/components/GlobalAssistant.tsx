'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function GlobalAssistant() {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ message: userMsg }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + (data.error || 'Failed to get response') }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Connection failed' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all z-50 font-bold flex items-center gap-2"
            >
                <span className="text-xl">💬</span>
                Chat Assistant
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-[420px] h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <div>
                        <h3 className="font-bold">Global Assistant</h3>
                        <p className="text-xs text-purple-200">Cross-workspace intelligence</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/20 p-2 rounded-lg transition text-xl"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="font-medium">Ask me anything about your research!</p>
                        <p className="text-sm mt-1">I can analyze and compare data across all workspaces.</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                            }`}>
                            {m.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-pre:bg-gray-800 prose-pre:text-green-400 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <span>{m.content}</span>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-gray-400 text-sm">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about your research..."
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition font-medium"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
