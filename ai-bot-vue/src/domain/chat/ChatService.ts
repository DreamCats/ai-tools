import { Message } from '../chat';

interface ChatResponse {
  content: string;
  error?: string;
}

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }[];
  error?: {
    message: string;
  };
}

interface StreamChunk {
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }[];
}

export class ChatService {
  private static readonly API_URL = 'https://api.gpt.ge/v1/chat/completions';
  private static readonly API_KEY = 'sk-bFY28crxGiCJbR3W01D8BaB29eB8452bAe0aC69618Bb7d23';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1秒

  static async sendMessage(
    messages: Message[],
    onStream?: (chunk: string) => void
  ): Promise<ChatResponse> {
    let retries = 0;
    let abortController = new AbortController();

    while (retries < this.MAX_RETRIES) {
      try {
        if (onStream) {
          return await this.streamResponse(messages, onStream, abortController.signal);
        } else {
          return await this.normalResponse(messages);
        }
      } catch (error) {
        retries++;
        console.error(`Attempt ${retries} failed:`, error);
        
        if (retries === this.MAX_RETRIES) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * retries));
        abortController = new AbortController(); // 创建新的 AbortController
      }
    }

    throw new Error('Max retries reached');
  }

  private static async normalResponse(messages: Message[]): Promise<ChatResponse> {
    const openAIMessages: OpenAIMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from API');
    }

    const content = data.choices[0].message?.content;
    if (!content) {
      throw new Error('Invalid response format: missing content');
    }

    return { content };
  }

  private static async streamResponse(
    messages: Message[],
    onStream: (chunk: string) => void,
    signal: AbortSignal
  ): Promise<ChatResponse> {
    const openAIMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码当前块
        const chunk = decoder.decode(value, { stream: true });
        
        // 处理每一行数据
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
          
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonData = trimmedLine.slice(6); // 移除 'data: ' 前缀
              const json: StreamChunk = JSON.parse(jsonData);
              
              // 检查是否有新的内容
              const content = json.choices[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onStream(content); // 立即发送新内容
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e, trimmedLine);
            }
          }
        }
      }

      return { content: fullContent };
    } finally {
      reader.releaseLock();
    }
  }
} 