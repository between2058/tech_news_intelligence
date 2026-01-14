import { Crawler, CrawlerResult } from './base';
import { normalizeDocument } from '../normalization';

export class TechCrunchCrawler implements Crawler {
    async crawl(): Promise<CrawlerResult[]> {
        try {
            // 1. Fetch latest news list
            const response = await fetch('https://techcrunch.com/latest/');
            if (!response.ok) {
                throw new Error(`Failed to fetch TechCrunch: ${response.status}`);
            }
            const html = await response.text();

            // 2. Extract article URLs (simple regex for MVP)
            // Look for links that look like article deep links
            // e.g. <a href="https://techcrunch.com/2026/01/14/..." ...>
            const linkRegex = /href="(https:\/\/techcrunch\.com\/\d{4}\/\d{2}\/\d{2}\/[^"]+)"/g;
            const links = new Set<string>();
            let match;
            while ((match = linkRegex.exec(html)) !== null) {
                links.add(match[1]);
                if (links.size >= 5) break; // Limit to 5 articles
            }

            const results: CrawlerResult[] = [];

            // 3. Fetch each article
            for (const url of Array.from(links)) {
                try {
                    const articleRes = await fetch(url);
                    if (!articleRes.ok) continue;
                    const articleHtml = await articleRes.text();

                    // Extract Title
                    const titleMatch = articleHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
                    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'No Title';

                    // Extract Content (Entry Content)
                    // TechCrunch usually puts content in <div class="entry-content ..."> or similar
                    // For MVP, we'll try to grab standard content blocks or just body text if specific class fails
                    // This regex tries to grab everything between entry-content div start and end roughly
                    // Note: Regex parsing HTML is fragile, but acceptable for MVP as per strict instructions.
                    // Better approach: Grab plain text from paragraphs
                    const pRegex = /<p>([\s\S]*?)<\/p>/g;
                    let content = '';
                    let pMatch;
                    while ((pMatch = pRegex.exec(articleHtml)) !== null) {
                        content += pMatch[1] + '\n\n';
                    }

                    if (content.length > 5000) content = content.substring(0, 5000); // Truncate

                    // Extract Date
                    // <time ... datetime="2026-01-14...">
                    const dateMatch = articleHtml.match(/datetime="([^"]+)"/);
                    const publishedAt = dateMatch ? new Date(dateMatch[1]) : new Date();

                    const normalized = normalizeDocument(title, url, content, 'techcrunch', publishedAt);
                    results.push(normalized);

                } catch (e) {
                    console.error(`Failed to process ${url}`, e);
                }
            }

            return results;
        } catch (error) {
            console.error('TechCrunch crawl failed:', error);
            return [];
        }
    }
}
