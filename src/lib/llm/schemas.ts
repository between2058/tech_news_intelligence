export const TechNewsSchema = {
    type: 'object',
    properties: {
        topic: { type: 'string', description: 'The main research topic of the workspace' },
        keyFindings: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of 3-5 key takeaways from the crawled news'
        },
        entities: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['company', 'product', 'person', 'organization'] },
                    relevance: { type: 'string', description: 'Why this entity is relevant to the topic' }
                },
                required: ['name', 'type', 'relevance']
            }
        },
        sentiment: {
            type: 'string',
            enum: ['positive', 'negative', 'neutral', 'mixed'],
            description: 'Overall market sentiment regarding the topic'
        },
        timeline: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    date: { type: 'string' },
                    event: { type: 'string' }
                }
            }
        }
    },
    required: ['topic', 'keyFindings', 'entities', 'sentiment']
};
