"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
class AIService {
    constructor(apiKey) {
        this.baseUrl = 'https://api.gpt.ge/v1';
        this.defaultOptions = {
            model: 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 2000,
        };
        this.apiKey = apiKey;
        this.currentRole = {
            name: 'assistant',
            systemPrompt: '你是一个有帮助的助手。'
        };
    }
    chat(messages, options) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('chat', messages, options);
            try {
                const mergedOptions = Object.assign(Object.assign({}, this.defaultOptions), options);
                const response = yield fetch(`${this.baseUrl}/chat/completions`, {
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
                const data = yield response.json();
                return data.choices[0].message.content;
            }
            catch (error) {
                console.error('AI chat error:', error);
                throw error;
            }
        });
    }
    setRole(role) {
        this.currentRole = role;
    }
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    updateOptions(options) {
        this.defaultOptions = Object.assign(Object.assign({}, this.defaultOptions), options);
    }
}
exports.AIService = AIService;
