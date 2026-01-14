export interface CrawlerResult {
    title: string;
    url: string;
    content: string;
    publishedAt?: Date;
    source: 'nvidia' | 'techcrunch' | 'yahoo';
}

export interface Crawler {
    crawl(): Promise<CrawlerResult[]>;
}
