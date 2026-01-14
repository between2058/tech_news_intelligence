'use client';

import { useState, useEffect } from 'react';

interface Workspace {
    id: string;
    name: string;
    topic: string;
}

interface Props {
    activeId: string | null;
    onSelect: (id: string) => void;
}

export default function WorkspaceTabs({ activeId, onSelect }: Props) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newWorkspace, setNewWorkspace] = useState({ name: '', topic: '' });

    const fetchWorkspaces = async () => {
        const res = await fetch('/api/workspaces');
        if (res.ok) {
            setWorkspaces(await res.json());
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/workspaces', {
            method: 'POST',
            body: JSON.stringify(newWorkspace),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            const ws = await res.json();
            await fetchWorkspaces();
            onSelect(ws.id);
            setIsCreating(false);
            setNewWorkspace({ name: '', topic: '' });
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 border-r w-64">
            <div className="p-4 border-b bg-white">
                <h1 className="font-bold text-lg mb-2 text-black">Workspaces</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="w-full bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700"
                >
                    {isCreating ? 'Cancel' : '+ New Workspace'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="p-4 border-b bg-gray-50 text-black">
                    <input
                        placeholder="Name (e.g. GPT-5)"
                        className="w-full border p-2 rounded mb-2 text-sm"
                        value={newWorkspace.name}
                        onChange={e => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                        required
                    />
                    <input
                        placeholder="Topic (for LLM)"
                        className="w-full border p-2 rounded mb-2 text-sm"
                        value={newWorkspace.topic}
                        onChange={e => setNewWorkspace({ ...newWorkspace, topic: e.target.value })}
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white p-1 rounded text-sm">
                        Create
                    </button>
                </form>
            )}

            <div className="flex-1 overflow-y-auto">
                {workspaces.map(ws => (
                    <button
                        key={ws.id}
                        onClick={() => onSelect(ws.id)}
                        className={`w-full text-left p-3 border-b hover:bg-gray-200 text-sm ${activeId === ws.id ? 'bg-blue-50 border-blue-500 border-l-4' : 'text-gray-700'}`}
                    >
                        <div className="font-medium">{ws.name}</div>
                        <div className="text-xs text-gray-500 truncate">{ws.topic}</div>
                    </button>
                ))}
                {workspaces.length === 0 && !isCreating && (
                    <div className="p-4 text-gray-500 text-sm italic">No workspaces yet.</div>
                )}
            </div>
        </div>
    );
}
