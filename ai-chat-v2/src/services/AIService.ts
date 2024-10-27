import { ChatMessage, ChatCompletionOptions, AIRole } from '../types/openai';

interface AIConfig {
    apiKey: string;
    baseUrl?: string;
}

export class AIService {
    private apiKey: string;
    private baseUrl: string = 'https://api.gpt.ge';  // 设置默认值
    private currentRole: AIRole;
    private defaultOptions: ChatCompletionOptions = {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
    };
    private systemPrompt: string;
    private model: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.currentRole = {
            name: 'assistant',
            systemPrompt: '你是一个有帮助的助手。'
        };
        this.systemPrompt = '你是一个有帮助的助手。';
        this.model = 'gpt-4o-mini';
    }

    public setSystemPrompt(prompt: string): void {
        this.systemPrompt = prompt;
    }

    public async chat(messages: ChatMessage[]): Promise<string> {
        // 在消息列表开头添加系统提示词
        const allMessages = [
            { role: 'system', content: this.systemPrompt },
            ...messages
        ];

        console.log('chat', allMessages);
        try {
            const mergedOptions = { ...this.defaultOptions };
            let postData  = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: mergedOptions.model,
                    messages: allMessages,
                    temperature: mergedOptions.temperature,
                    max_tokens: mergedOptions.maxTokens,
                    top_p: mergedOptions.topP,
                    frequency_penalty: mergedOptions.frequencyPenalty,
                    presence_penalty: mergedOptions.presencePenalty,
                    stream: false
                })
            }
            console.log("post data:", postData)
            const response = await fetch(`${this.baseUrl}/v1/chat/completions`, postData);

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

    public updateConfig(config: AIConfig): void {
        this.apiKey = config.apiKey;
        if (config.baseUrl) {
            this.baseUrl = config.baseUrl;
        }
    }

    public getConfig(): AIConfig {
        return {
            apiKey: this.apiKey,
            baseUrl: this.baseUrl
        };
    }
}
