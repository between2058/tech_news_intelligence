'use client';

import { useState } from 'react';

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
                className="fixed bottom-4 right-4 bg-purple-600 text-white p-4 rounded-full shadow-xl hover:bg-purple-700 z-50 font-bold"
            >
                Chat Assistant
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border border-purple-200 z-50">
            <div className="bg-purple-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                <h3 className="font-bold">Global Assistant</h3>
                <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 text-xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-black">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        Ask me anything about your workspaces!
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white border text-gray-900 rounded-bl-none shadow-sm'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-lg p-3 rounded-bl-none animate-pulse">Thinking...</div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        className="flex-1 border rounded px-3 py-2 text-black focus:outline-none focus:border-purple-500"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your query..."
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
