import { normalizeDocument, cleanContent } from '../../lib/normalization';

describe('Document Normalization', () => {
    test('cleanContent removes script and style tags', () => {
        const html = '<div>Hello <script>alert("bad")</script> <style>body { color: red; }</style>World</div>';
        expect(cleanContent(html)).toBe('Hello World');
    });

    test('cleanContent removes HTML tags', () => {
        const html = '<p>Hello <b>World</b></p>';
        expect(cleanContent(html)).toBe('Hello World');
    });

    test('normalizeDocument returns structured data', () => {
        const doc = normalizeDocument(
            '  My Title  ',
            'https://example.com/news ',
            '<p>Some content</p>',
            'techcrunch',
            '2026-01-14T12:00:00Z'
        );

        expect(doc).toEqual({
            title: 'My Title',
            url: 'https://example.com/news',
            content: 'Some content',
            source: 'techcrunch',
            publishedAt: new Date('2026-01-14T12:00:00Z')
        });
    });
});
