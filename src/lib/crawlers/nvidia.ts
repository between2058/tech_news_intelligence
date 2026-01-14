import { Crawler, CrawlerResult } from './base';
import { normalizeDocument } from '../normalization';
import { chromium } from 'playwright';

export class NvidiaCrawler implements Crawler {
    async crawl(): Promise<CrawlerResult[]> {
        const browser = await chromium.launch({ headless: true });
        const results: CrawlerResult[] = [];

        try {
            const page = await browser.newPage();

            // 1. Navigate to In the News
            await page.goto('https://nvidianews.nvidia.com/in-the-news?year=2026', { waitUntil: 'domcontentloaded', timeout: 30000 });

            // 2. Extract article links
            // NVIDIA newsroom structure: usually a list of articles in a grid or list
            // Selector: looking for links within the news list container.
            // We'll grab all links that look like news articles or external links
            // NVIDIA "In the news" links to external sites usually.

            // Wait for list to load
            await page.waitForSelector('main', { timeout: 10000 }).catch(() => { });

            const articles = await page.evaluate(() => {
                // This is heuristic: find links that seem to be news items. 
                // Often inside a specific container class.
                // For MVP, we'll try to find all 'a' tags that are inside typical list elements
                const links = Array.from(document.querySelectorAll('main a'));
                return links
                    .map(a => {
                        const anchor = a as HTMLAnchorElement;
                        return {
                            url: anchor.href,
                            title: (anchor.textContent || '').trim()
                        };
                    })
                    .filter(a => a.url && a.title.length > 10)
                    .slice(0, 5);
            });

            // 3. Visit each article (filtered)
            for (const article of articles) {
                try {
                    const articlePage = await browser.newPage();
                    await articlePage.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 20000 });

                    const content = await articlePage.evaluate(() => {
                        return document.body.innerText;
                    });

                    const normalized = normalizeDocument(
                        article.title,
                        article.url,
                        content.substring(0, 5000),
                        'nvidia',
                        new Date() // Timestamp might need extraction from page if possible
                    );

                    results.push(normalized);
                    await articlePage.close();
                } catch (e) {
                    console.error(`Failed to crawl NVIDIA article ${article.url}`, e);
                }
            }

        } catch (error) {
            console.error('NVIDIA crawl failed:', error);
        } finally {
            await browser.close();
        }

        return results;
    }
}
