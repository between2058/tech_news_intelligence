import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LLMClient } from '@/lib/llm/client';
import { TechNewsSchema } from '@/lib/llm/schemas';
import { TechCrunchCrawler } from '@/lib/crawlers/techcrunch';
import { NvidiaCrawler } from '@/lib/crawlers/nvidia';
import { YahooCrawler } from '@/lib/crawlers/yahoo';
import { CrawlerResult } from '@/lib/crawlers/base';

// Helper to determine which provider to use
async function getProviderForWorkspace(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { documents: false }
    });

    if (!workspace) return null;

    let provider;
    if (workspace.providerId) {
        provider = await prisma.provider.findUnique({ where: { id: workspace.providerId } });
    } else {
        provider = await prisma.provider.findFirst({ where: { isDefault: true } });
    }

    return { workspace, provider };
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params are async in Next.js 15+ (and 16)
) {
    try {
        const { id } = await params;

        // 1. Get Workspace & Provider
        const context = await getProviderForWorkspace(id);
        if (!context || !context.workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }
        if (!context.provider) {
            return NextResponse.json({ error: 'No LLM provider configured' }, { status: 400 });
        }

        // 2. Run Crawlers
        // In a real app, we'd use a queue (BullMQ). For MVP, we await (slow but simple).
        // We run them in parallel.
        const tcCrawler = new TechCrunchCrawler();
        const nvCrawler = new NvidiaCrawler();
        const yhCrawler = new YahooCrawler();

        const results = await Promise.allSettled([
            tcCrawler.crawl(),
            nvCrawler.crawl(),
            yhCrawler.crawl()
        ]);

        const flatResults: CrawlerResult[] = [];
        results.forEach(r => {
            if (r.status === 'fulfilled') {
                flatResults.push(...r.value);
            } else {
                console.error('Crawler failed', r.reason);
            }
        });

        if (flatResults.length === 0) {
            return NextResponse.json({ error: 'No articles found' }, { status: 500 });
        }

        // 3. Save Documents to DB
        await prisma.$transaction(
            flatResults.map(doc =>
                prisma.document.create({
                    data: {
                        title: doc.title,
                        url: doc.url,
                        content: doc.content,
                        source: doc.source,
                        publishedAt: doc.publishedAt,
                        workspaceId: id
                    }
                })
            )
        );

        // 4. Generate Structured Output via LLM
        const llm = new LLMClient({
            baseUrl: context.provider.baseUrl,
            apiKey: context.provider.apiKey || undefined,
            modelName: context.provider.modelName
        });

        // Prepare prompt with explicit schema
        const articlesText = flatResults
            .slice(0, 10) // Limit to 10 articles for context window safety
            .map((a, i) => `[${i + 1}] ${a.title} (${a.source}):\n${a.content.substring(0, 500)}...`) // Truncate content
            .join('\n\n');

        const prompt = `You are a tech news analyst. Analyze the following articles about "${context.workspace.topic}" and provide structured insights.

ARTICLES:
${articlesText}

You MUST respond with a JSON object in EXACTLY this format (no other format is acceptable):
{
  "topic": "${context.workspace.topic}",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "entities": [
    {"name": "Entity Name", "type": "company|product|person|organization", "relevance": "why this entity matters"}
  ],
  "sentiment": "positive|negative|neutral|mixed",
  "timeline": [
    {"date": "YYYY-MM-DD or description", "event": "what happened"}
  ]
}

IMPORTANT RULES:
- keyFindings: List 3-5 key takeaways from the articles related to the topic "${context.workspace.topic}"
- entities: List important companies, products, or people mentioned
- sentiment: Overall market/news sentiment about the topic
- timeline: Key events or announcements with dates if available

Respond ONLY with the JSON object, no other text.`;

        const structuredData = await llm.generateStructuredOutput(prompt, TechNewsSchema);

        // 5. Save Output
        const output = await prisma.structuredOutput.create({
            data: {
                workspaceId: id,
                jsonData: JSON.stringify(structuredData),
                summary: `Analysis of ${flatResults.length} articles regarding ${context.workspace.topic}. Key findings: ${(structuredData.keyFindings || []).join('; ')}`
            }
        });

        return NextResponse.json({
            success: true,
            articlesCount: flatResults.length,
            outputId: output.id,
            data: structuredData
        });

    } catch (error) {
        console.error('Crawl & Analyze failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
