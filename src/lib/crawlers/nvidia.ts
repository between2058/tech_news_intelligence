import { Crawler, CrawlerResult } from './base';
import { normalizeDocument } from '../normalization';
import { chromium } from 'playwright';

export class NvidiaCrawler implements Crawler {
    async crawl(): Promise<CrawlerResult[]> {
        const browser = await chromium.launch({ headless: true });
        const results: CrawlerResult[] = [];

        try {
            const page = await browser.newPage();

            // 1. Navigate to In the News (current year)
            console.log('NVIDIA: Navigating to newsroom...');
            await page.goto('https://nvidianews.nvidia.com/in-the-news', {
                waitUntil: 'networkidle',
                timeout: 30000
            });

            // Wait for content to load
            await page.waitForTimeout(3000);

            // 2. Extract article links using the correct selectors
            // Structure: article.index-item > ... > h3.index-item-text-title > a
            const articles = await page.evaluate(() => {
                const results: { url: string; title: string }[] = [];

                // Primary selector: article title links
                const titleLinks = document.querySelectorAll('article.index-item h3.index-item-text-title a');

                titleLinks.forEach(link => {
                    const anchor = link as HTMLAnchorElement;
                    const title = anchor.textContent?.trim() || '';
                    const url = anchor.href;

                    if (url && title.length > 10) {
                        results.push({ url, title });
                    }
                });

                // Fallback: if above didn't work, try broader selector
                if (results.length === 0) {
                    const allLinks = document.querySelectorAll('main a[target="_blank"]');
                    allLinks.forEach(link => {
                        const anchor = link as HTMLAnchorElement;
                        const title = anchor.textContent?.trim() || '';
                        const url = anchor.href;

                        if (url &&
                            title.length > 15 &&
                            !title.toLowerCase().includes('read more') &&
                            !url.includes('nvidianews.nvidia.com')) {
                            results.push({ url, title });
                        }
                    });
                }

                return results.slice(0, 5);
            });

            console.log(`NVIDIA: Found ${articles.length} articles:`, articles.map(a => a.title));

            // 3. Visit each article
            for (const article of articles) {
                try {
                    console.log(`NVIDIA: Crawling "${article.title.substring(0, 50)}..."`);
                    const articlePage = await browser.newPage();

                    await articlePage.goto(article.url, {
                        waitUntil: 'domcontentloaded',
                        timeout: 20000
                    });

                    const content = await articlePage.evaluate(() => {
                        // Try to get article content, fall back to body text
                        const article = document.querySelector('article');
                        const main = document.querySelector('main');
                        const body = document.body;
                        return (article?.innerText || main?.innerText || body.innerText).substring(0, 5000);
                    });

                    const normalized = normalizeDocument(
                        article.title,
                        article.url,
                        content,
                        'nvidia',
                        new Date()
                    );

                    results.push(normalized);
                    await articlePage.close();

                    console.log(`NVIDIA: Successfully crawled "${article.title.substring(0, 40)}..."`);
                } catch (e) {
                    console.error(`NVIDIA: Failed to crawl article ${article.url}`, e);
                }
            }

        } catch (error) {
            console.error('NVIDIA crawl failed:', error);
        } finally {
            await browser.close();
        }

        console.log(`NVIDIA: Returning ${results.length} total results`);
        return results;
    }
}
