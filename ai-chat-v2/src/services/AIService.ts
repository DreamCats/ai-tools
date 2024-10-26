import { ChatMessage, ChatCompletionOptions, AIRole } from '../types/openai';

export class AIService {
    private apiKey: string;
    private baseUrl: string = 'https://api.gpt.ge/v1';
    private currentRole: AIRole;
    private defaultOptions: ChatCompletionOptions = {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
    };

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.currentRole = {
            name: 'assistant',
            systemPrompt: '你是一个有帮助的助手。'
        };
    }

    public async chat(messages: ChatMessage[], options?: Partial<ChatCompletionOptions>): Promise<string> {
        console.log('chat', messages, options);
        try {
            const mergedOptions = { ...this.defaultOptions, ...options };
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: mergedOptions.model,
                    messages: [
                        { role: 'system', content: this.currentRole.systemPrompt },
                        ...messages
                    ],
                    temperature: mergedOptions.temperature,
                    max_tokens: mergedOptions.maxTokens,
                    top_p: mergedOptions.topP,
                    frequency_penalty: mergedOptions.frequencyPenalty,
                    presence_penalty: mergedOptions.presencePenalty
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI chat error:', error);
            throw error;
        }
    }

    public setRole(role: AIRole): void {
        this.currentRole = role;
    }

    public setApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    public updateOptions(options: Partial<ChatCompletionOptions>): void {
        this.defaultOptions = { ...this.defaultOptions, ...options };
    }
}
