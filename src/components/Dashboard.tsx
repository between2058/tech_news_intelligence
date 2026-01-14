'use client';

import { useState } from 'react';
import WorkspaceTabs from './WorkspaceTabs';
import WorkspaceView from './WorkspaceView';
import ProviderConfig from './ProviderConfig';

export default function Dashboard() {
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
    const [showConfig, setShowConfig] = useState(false);

    return (
        <div className="flex h-[calc(100vh-2rem)] border rounded-lg overflow-hidden bg-white shadow-xl">
            <WorkspaceTabs
                activeId={activeWorkspaceId}
                onSelect={setActiveWorkspaceId}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
                <header className="bg-white border-b p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">
                        {activeWorkspaceId ? 'Workspace Active' : 'Select a Workspace'}
                    </h1>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {showConfig ? 'Hide Config' : 'Settings'}
                    </button>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    {showConfig ? (
                        <div className="absolute inset-0 z-10 bg-white p-4 overflow-auto">
                            <ProviderConfig />
                        </div>
                    ) : activeWorkspaceId ? (
                        <WorkspaceView workspaceId={activeWorkspaceId} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select or create a workspace to begin research.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
