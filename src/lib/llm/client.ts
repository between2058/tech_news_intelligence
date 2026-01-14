import OpenAI from 'openai';


export interface LLMConfig {
    baseUrl: string;
    apiKey?: string;
    modelName: string;
}

export class LLMClient {
    private openai: OpenAI;
    private model: string;

    constructor(config: LLMConfig) {
        this.openai = new OpenAI({
            baseURL: config.baseUrl,
            apiKey: config.apiKey || 'sk-custom-provider', // Fallback for providers that don't need key
            dangerouslyAllowBrowser: false,
        });
        this.model = config.modelName;
    }

    async generateStructuredOutput(prompt: string, schema: any): Promise<any> {
        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are an expert news analyst. Extract structured insights from the provided news content. respond with valid JSON matching the schema.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' },
                // Note: 'json_object' mode guarantees valid JSON but schema validation is separate
                // For full schema compliance, we prompt heavily or use function calling if supported.
                // For local LLMs, 'json_object' + clear schema in prompt is best for generic support.
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('Empty response from LLM');

            return JSON.parse(content);
        } catch (error) {
            console.error('LLM Generation Failed:', error);
            throw error;
        }
    }

    async chat(messages: { role: 'user' | 'assistant' | 'system', content: string }[]): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: messages as any,
        });
        return response.choices[0].message.content || '';
    }
}
