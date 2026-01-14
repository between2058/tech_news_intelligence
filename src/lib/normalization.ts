export interface NormalizedDocument {
    title: string;
    url: string;
    content: string;
    source: 'nvidia' | 'techcrunch' | 'yahoo';
    publishedAt?: Date;
}

export function cleanContent(html: string): string {
    // Simple heuristic-based cleaning
    // Remove script and style tags
    let cleaned = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");

    // Remove HTML tags, keeping just text
    cleaned = cleaned.replace(/<[^>]+>/g, ' ');

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

export function normalizeDocument(
    title: string,
    url: string,
    rawContent: string,
    source: 'nvidia' | 'techcrunch' | 'yahoo',
    publishedAt?: Date | string
): NormalizedDocument {
    const content = cleanContent(rawContent);
    const date = publishedAt ? new Date(publishedAt) : undefined;

    return {
        title: title.trim(),
        url: url.trim(),
        content,
        source,
        publishedAt: date && !isNaN(date.getTime()) ? date : undefined,
    };
}
