"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHistoryManager = void 0;
class ChatHistoryManager {
    constructor() {
        this.messages = [];
        this.maxHistoryLength = 100;
    }
    addMessage(message) {
        this.messages.push(message);
        if (this.messages.length > this.maxHistoryLength) {
            this.messages = this.messages.slice(-this.maxHistoryLength);
        }
    }
    getHistory() {
        return [...this.messages];
    }
    clear() {
        this.messages = [];
    }
    exportHistory() {
        return JSON.stringify(this.messages, null, 2);
    }
    importHistory(history) {
        try {
            const messages = JSON.parse(history);
            if (Array.isArray(messages)) {
                this.messages = messages;
            }
        }
        catch (error) {
            console.error('Failed to import chat history:', error);
            throw error;
        }
    }
    setMaxHistoryLength(length) {
        this.maxHistoryLength = length;
        if (this.messages.length > length) {
            this.messages = this.messages.slice(-length);
        }
    }
}
exports.ChatHistoryManager = ChatHistoryManager;
