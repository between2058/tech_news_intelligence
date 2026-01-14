import { Crawler, CrawlerResult } from './base';
import { normalizeDocument } from '../normalization';
import { chromium } from 'playwright';

export class YahooCrawler implements Crawler {
    async crawl(): Promise<CrawlerResult[]> {
        // Yahoo is sensitive to automation, so we use headless browser with some delays
        const browser = await chromium.launch({ headless: true });
        const results: CrawlerResult[] = [];

        try {
            const page = await browser.newPage();

            // 1. Visit Yahoo Tech or Finance News
            await page.goto('https://finance.yahoo.com/topic/tech/', { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Delay to avoid aggressive rate limits
            await page.waitForTimeout(2000);

            // 2. Extract article links
            // Yahoo structure uses streams using <li> elements usually or clean feed
            const articles = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('#Fin-Stream li a')); // Common yahoo stream selector
                // If that fails, try generic large news links
                if (links.length === 0) {
                    const genericLinks = Array.from(document.querySelectorAll('a[href*="/news/"]'));
                    return genericLinks
                        .map(a => {
                            const anchor = a as HTMLAnchorElement;
                            return { url: anchor.href, title: (anchor.textContent || '').trim() };
                        })
                        .filter(a => a.title.length > 20)
                        .slice(0, 5);
                }

                return links
                    .map(a => {
                        const anchor = a as HTMLAnchorElement;
                        return {
                            url: anchor.href,
                            title: (anchor.textContent || '').trim()
                        };
                    })
                    .filter(a => a.url && a.title.length > 10 && !a.url.includes('/video/'))
                    .slice(0, 5);
            });

            // 3. Visit each article
            for (const article of articles) {
                try {
                    const articlePage = await browser.newPage();
                    await articlePage.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
                    await articlePage.waitForTimeout(1000); // Polite delay

                    const content = await articlePage.evaluate(() => {
                        // Yahoo logic often puts content in .caas-body or similar
                        const body = document.querySelector('.caas-body') as HTMLElement;
                        return body ? body.innerText : document.body.innerText;
                    });

                    const normalized = normalizeDocument(
                        article.title,
                        article.url,
                        content.substring(0, 5000),
                        'yahoo',
                        new Date()
                    );

                    results.push(normalized);
                    await articlePage.close();
                } catch (e) {
                    console.error(`Failed to crawl Yahoo article ${article.url}`, e);
                }
            }

        } catch (error) {
            console.error('Yahoo crawl failed:', error);
        } finally {
            await browser.close();
        }

        return results;
    }
}
