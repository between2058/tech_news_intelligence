import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      select: {
        id: true,
        name: true,
        baseUrl: true,
        modelName: true,
        isDefault: true,
        // Exclude apiKey
      },
    });
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Failed to fetch providers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, baseUrl, apiKey, modelName, isDefault } = body;

    // Basic validation
    if (!name || !baseUrl || !modelName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.provider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const provider = await prisma.provider.create({
      data: {
        name,
        baseUrl,
        apiKey, // In a real app, encrypt this!
        modelName,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Failed to create provider:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
