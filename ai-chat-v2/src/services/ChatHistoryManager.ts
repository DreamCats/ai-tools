import { ChatMessage } from '../types/openai';

export class ChatHistoryManager {
    private messages: ChatMessage[] = [];
    private maxHistoryLength: number = 100;

    public addMessage(message: ChatMessage): void {
        this.messages.push(message);
        if (this.messages.length > this.maxHistoryLength) {
            this.messages = this.messages.slice(-this.maxHistoryLength);
        }
    }

    public getHistory(): ChatMessage[] {
        return [...this.messages];
    }

    public clear(): void {
        this.messages = [];
    }

    public exportHistory(): string {
        return JSON.stringify(this.messages, null, 2);
    }

    public importHistory(history: string): void {
        try {
            const messages = JSON.parse(history);
            if (Array.isArray(messages)) {
                this.messages = messages;
            }
        } catch (error) {
            console.error('Failed to import chat history:', error);
            throw error;
        }
    }

    public setMaxHistoryLength(length: number): void {
        this.maxHistoryLength = length;
        if (this.messages.length > length) {
            this.messages = this.messages.slice(-length);
        }
    }
}
