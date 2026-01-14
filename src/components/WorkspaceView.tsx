'use client';

import { useState, useEffect } from 'react';

interface Document {
    id: string;
    title: string;
    url: string;
    source: string;
    publishedAt: string | null;
}

interface Props {
    workspaceId: string;
}

export default function WorkspaceView({ workspaceId }: Props) {
    const [crawling, setCrawling] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [workspaceInfo, setWorkspaceInfo] = useState<any>(null);
    const [error, setError] = useState('');

    // Load existing data when workspace changes
    useEffect(() => {
        const loadWorkspaceData = async () => {
            setLoading(true);
            setData(null);
            setDocuments([]);
            setError('');

            try {
                const res = await fetch(`/api/workspaces/${workspaceId}`);
                if (res.ok) {
                    const json = await res.json();
                    setWorkspaceInfo(json.workspace);
                    setDocuments(json.documents || []);
                    if (json.latestOutput) {
                        setData(json.latestOutput.data);
                    }
                }
            } catch (err) {
                console.error('Failed to load workspace data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (workspaceId) {
            loadWorkspaceData();
        }
    }, [workspaceId]);

    const handleCrawl = async () => {
        setCrawling(true);
        setError('');
        try {
            const res = await fetch(`/api/workspaces/${workspaceId}/crawl`, { method: 'POST' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Crawl failed');
            setData(json.data);
            // Reload to get updated documents
            const refreshRes = await fetch(`/api/workspaces/${workspaceId}`);
            if (refreshRes.ok) {
                const refreshJson = await refreshRes.json();
                setDocuments(refreshJson.documents || []);
                setWorkspaceInfo(refreshJson.workspace);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCrawling(false);
        }
    };

    // Helper functions
    const getKeyFindings = () => {
        if (data?.keyFindings) return data.keyFindings;
        if (data?.insights) return data.insights.map((i: any) => i.summary || i.title);
        if (data?.findings) return data.findings;
        return [];
    };

    const getEntities = () => {
        if (data?.entities) return data.entities;
        if (data?.insights) {
            return data.insights.map((i: any) => ({
                name: i.title || i.source,
                type: i.source || 'article',
                relevance: i.relevance || i.summary
            }));
        }
        return [];
    };

    const getSentiment = () => data?.sentiment || data?.overall_relevance || 'neutral';
    const getTimeline = () => data?.timeline || [];

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'techcrunch': return 'bg-green-100 text-green-800';
            case 'nvidia': return 'bg-emerald-100 text-emerald-800';
            case 'yahoo': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const keyFindings = getKeyFindings();
    const entities = getEntities();
    const sentiment = getSentiment();
    const timeline = getTimeline();

    if (loading) {
        return (
            <div className="p-6 h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    Loading workspace data...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 h-full overflow-y-auto text-black">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Research Results</h2>
                    {workspaceInfo && (
                        <p className="text-sm text-gray-500">
                            Topic: {workspaceInfo.topic} • {workspaceInfo.documentsCount} documents
                        </p>
                    )}
                </div>
                <button
                    onClick={handleCrawl}
                    disabled={crawling}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                    {crawling ? 'Crawling & Analyzing...' : 'Crawl Sources'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                    {error}
                </div>
            )}

            {data ? (
                <div className="space-y-6">
                    {/* Topic */}
                    {data.topic && (
                        <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded shadow">
                            <h3 className="text-lg font-semibold">Topic Analysis</h3>
                            <p className="text-2xl font-bold mt-1">{data.topic}</p>
                        </section>
                    )}

                    {/* Key Findings */}
                    <section className="bg-white p-4 rounded shadow border">
                        <h3 className="text-lg font-semibold mb-2">Key Findings</h3>
                        {keyFindings.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                                {keyFindings.map((f: string, i: number) => (
                                    <li key={i} className="text-gray-700">{f}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 italic">No key findings extracted</p>
                        )}
                    </section>

                    {/* Sentiment */}
                    <section className="bg-white p-4 rounded shadow border flex items-center gap-4">
                        <h3 className="text-lg font-semibold">Sentiment:</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                    sentiment === 'mixed' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}>
                            {String(sentiment).toUpperCase()}
                        </span>
                    </section>

                    {/* Entities Table */}
                    {entities.length > 0 && (
                        <section className="bg-white p-4 rounded shadow border">
                            <h3 className="text-lg font-semibold mb-4">Identified Entities</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relevance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {entities.map((e: any, i: number) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{e.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{e.type}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{e.relevance}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Timeline */}
                    {timeline.length > 0 && (
                        <section className="bg-white p-4 rounded shadow border">
                            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                            <div className="space-y-3">
                                {timeline.map((t: any, i: number) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-mono">
                                            {t.date}
                                        </span>
                                        <span className="text-gray-700">{t.event}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Source Documents */}
                    {documents.length > 0 && (
                        <section className="bg-white p-4 rounded shadow border">
                            <h3 className="text-lg font-semibold mb-4">📚 Source Documents ({documents.length})</h3>
                            <div className="space-y-3">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="p-3 border rounded hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium block truncate"
                                                    title={doc.title}
                                                >
                                                    {doc.title}
                                                </a>
                                                <p className="text-xs text-gray-400 mt-1 truncate">{doc.url}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceColor(doc.source)}`}>
                                                    {doc.source.toUpperCase()}
                                                </span>
                                                {doc.publishedAt && (
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(doc.publishedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Raw JSON */}
                    <details className="cursor-pointer">
                        <summary className="text-gray-500 mb-2 hover:text-gray-700">View Raw JSON</summary>
                        <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96 text-xs">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </details>
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400">
                    {!crawling && "No data yet. Start a crawl to see results."}
                    {crawling && "Analyzing multiple sources using Playwright and LLM..."}
                </div>
            )}
        </div>
    );
}
