import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const existingProvider = await prisma.provider.findFirst({
        where: { isDefault: true },
    });

    if (!existingProvider) {
        if (!process.env.OPENAI_API_KEY) {
            console.warn(
                '⚠️ No OPENAI_API_KEY found in environment. Skipping default provider creation.'
            );
            return;
        }

        console.log('Creating default OpenAI provider...');
        await prisma.provider.create({
            data: {
                name: 'OpenAI (Default)',
                baseUrl: 'https://api.openai.com/v1',
                apiKey: process.env.OPENAI_API_KEY,
                modelName: 'gpt-4-turbo-preview',
                isDefault: true,
            },
        });
        console.log('✅ Default provider created.');
    } else {
        console.log('ℹ️ Default provider already exists.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
