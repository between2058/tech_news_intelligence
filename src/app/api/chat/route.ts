import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LLMClient } from '@/lib/llm/client';

export async function POST(request: Request) {
    try {
        const { message, sessionId } = await request.json();

        // 1. Fetch Context (Cross-workspace)
        // We'll fetch the latest output from each workspace to give the assistant global context.
        const latestOutputs = await prisma.structuredOutput.findMany({
            take: 5,
            orderBy: { id: 'desc' },
            include: { workspace: true }
        });

        const context = latestOutputs.map(o =>
            `Workspace: ${o.workspace.name} (${o.workspace.topic})\nSummary: ${o.summary}\nKey Findings: ${JSON.parse(o.jsonData).keyFindings?.join(', ')}`
        ).join('\n---\n');

        // 2. Get Default Provider
        const provider = await prisma.provider.findFirst({ where: { isDefault: true } });
        if (!provider) {
            return NextResponse.json({ error: 'No default LLM provider configured' }, { status: 400 });
        }

        // 3. Generate Response
        const llm = new LLMClient({
            baseUrl: provider.baseUrl,
            apiKey: provider.apiKey || undefined,
            modelName: provider.modelName
        });

        const systemPrompt = `You are a Global Tech News Assistant. You have access to research in multiple workspaces.
    
    Current Research Context:
    ${context}
    
    Answer the user's question based on this context and your general knowledge.
    If the answer is in the context, cite the workspace.`;

        const reply = await llm.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ]);

        return NextResponse.json({ reply });

    } catch (error) {
        console.error('Chat failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
