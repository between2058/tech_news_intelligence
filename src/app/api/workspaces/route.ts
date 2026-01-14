import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const workspaces = await prisma.workspace.findMany({
            orderBy: { id: 'desc' },
            include: {
                _count: {
                    select: { documents: true, outputs: true },
                },
            },
        });
        return NextResponse.json(workspaces);
    } catch (error) {
        console.error('Failed to fetch workspaces:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, topic, providerId } = body;

        if (!name || !topic) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const workspace = await prisma.workspace.create({
            data: {
                name,
                topic,
                providerId,
            },
        });

        return NextResponse.json(workspace);
    } catch (error) {
        console.error('Failed to create workspace:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
