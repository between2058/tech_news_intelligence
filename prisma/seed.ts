import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding default LLM provider...');

    // Upsert the default provider (Llama 3.3 70B via Groq/Compatible API)
    // Note: API Key must be set via env var OPENAI_API_KEY
    // We use a placeholder here if not provided, but the code relies on the env var mostly.
    // Actually, the app logic in llm/client.ts prefers the DB key, so we should allow valid input.
    // For now, we set a clear instruction.

    await prisma.provider.upsert({
        where: { id: 'default-llama' },
        update: {},
        create: {
            id: 'default-llama',
            name: 'LLAMA 3.3 70B (Default)',
            baseUrl: 'https://api.groq.com/openai/v1', // Using Groq as a high-performance default for Llama 3
            apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder', // Fallback if env not set during seed
            modelName: 'llama-3.3-70b-versatile',
            isDefault: true,
        },
    });

    console.log('Default provider seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
