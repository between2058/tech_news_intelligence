import { TechCrunchCrawler } from '../../../lib/crawlers/techcrunch';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TechCrunchCrawler', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    test('crawl fetches latest articles and parses them', async () => {
        // Mock the listing page response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            text: async () => `
        <html>
          <body>
            <a href="https://techcrunch.com/2026/01/14/article-1">Article 1</a>
            <a href="https://techcrunch.com/2026/01/14/article-2">Article 2</a>
          </body>
        </html>
      `
        });

        // Mock individual article responses
        mockFetch.mockResolvedValue({
            ok: true,
            text: async () => `
        <html>
          <body>
            <h1>Test Global 500 Error</h1>
            <time datetime="2026-01-14T10:00:00Z">Jan 14, 2026</time>
            <div class="entry-content">
              <p>Paragraph 1 content.</p>
              <p>Paragraph 2 content.</p>
            </div>
          </body>
        </html>
      `
        });

        const crawler = new TechCrunchCrawler();
        const results = await crawler.crawl();

        expect(results.length).toBe(2);
        expect(results[0].title).toBe('Test Global 500 Error'); // Wait, why this title? because I mocked it
        expect(results[0].url).toContain('techcrunch.com');
        expect(results[0].source).toBe('techcrunch');
        expect(results[0].content).toContain('Paragraph 1 content');

        // 1 call for list + 2 calls for articles
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    test('crawl handles list fetch failure', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500
        });

        const crawler = new TechCrunchCrawler();
        const results = await crawler.crawl();

        expect(results).toEqual([]);
    });
});
