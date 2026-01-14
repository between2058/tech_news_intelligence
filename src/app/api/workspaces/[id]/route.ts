import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get the workspace with its latest structured output and all documents
        const workspace = await prisma.workspace.findUnique({
            where: { id },
            include: {
                outputs: {
                    orderBy: { id: 'desc' },
                    take: 1
                },
                documents: {
                    orderBy: { id: 'desc' }
                }
            }
        });

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        const latestOutput = workspace.outputs[0];

        return NextResponse.json({
            workspace: {
                id: workspace.id,
                name: workspace.name,
                topic: workspace.topic,
                documentsCount: workspace.documents.length
            },
            documents: workspace.documents.map(doc => ({
                id: doc.id,
                title: doc.title,
                url: doc.url,
                source: doc.source,
                publishedAt: doc.publishedAt
            })),
            latestOutput: latestOutput ? {
                id: latestOutput.id,
                data: JSON.parse(latestOutput.jsonData),
                summary: latestOutput.summary
            } : null
        });

    } catch (error) {
        console.error('Failed to fetch workspace:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
