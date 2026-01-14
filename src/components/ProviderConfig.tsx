'use client';

import { useState, useEffect } from 'react';

interface Provider {
    id: string;
    name: string;
    baseUrl: string;
    modelName: string;
    isDefault: boolean;
}

export default function ProviderConfig() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [newProvider, setNewProvider] = useState({
        name: 'LLAMA 3.3 70B',
        baseUrl: 'http://172.18.212.157:31199/v1',
        apiKey: '',
        modelName: 'LLAMA 3.3 70B'
    });
    const [loading, setLoading] = useState(false);

    const fetchProviders = async () => {
        const res = await fetch('/api/providers');
        if (res.ok) {
            setProviders(await res.json());
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await fetch('/api/providers', {
            method: 'POST',
            body: JSON.stringify(newProvider),
            headers: { 'Content-Type': 'application/json' }
        });
        setNewProvider({ name: '', baseUrl: 'http://localhost:11434/v1', apiKey: '', modelName: 'llama3' });
        await fetchProviders();
        setLoading(false);
    };

    return (
        <div className="p-4 bg-white rounded shadow text-black">
            <h2 className="text-xl font-bold mb-4">LLM Configuration</h2>

            <div className="mb-6">
                <h3 className="font-semibold mb-2">Existing Providers</h3>
                <ul className="space-y-2">
                    {providers.map(p => (
                        <li key={p.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span>{p.name} ({p.modelName}) {p.isDefault && <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Default</span>}</span>
                        </li>
                    ))}
                    {providers.length === 0 && <p className="text-gray-500 text-sm">No providers configured.</p>}
                </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <h3 className="font-semibold">Add Provider</h3>
                <input
                    placeholder="Name (e.g. Local Ollama)"
                    className="w-full border p-2 rounded"
                    value={newProvider.name}
                    onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
                    required
                />
                <input
                    placeholder="Base URL"
                    className="w-full border p-2 rounded"
                    value={newProvider.baseUrl}
                    onChange={e => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                    required
                />
                <input
                    placeholder="API Key (optional)"
                    type="password"
                    className="w-full border p-2 rounded"
                    value={newProvider.apiKey}
                    onChange={e => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                />
                <input
                    placeholder="Model Name"
                    className="w-full border p-2 rounded"
                    value={newProvider.modelName}
                    onChange={e => setNewProvider({ ...newProvider, modelName: e.target.value })}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Add Provider'}
                </button>
            </form>
        </div>
    );
}
