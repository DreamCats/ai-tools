import { AIService } from '../services/AIService';
import { RoleManager } from '../services/RoleManager';
import { ChatHistoryManager } from '../services/ChatHistoryManager';
import { BaseView } from '../types/view';
import { ChatMessage } from '../types/openai';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { configureMarked } from '../config/marked.config';

export class ChatView implements BaseView {
    private aiService: AIService;
    private roleManager: RoleManager;
    private chatHistory: ChatHistoryManager;
    
    constructor() {
        // 初始化服务
        this.aiService = new AIService('sk-Bd4aUrOoCdd6mYjQ590939B91d4b44Bd95DeF08c8f297385');
        this.roleManager = new RoleManager();
        this.chatHistory = new ChatHistoryManager();
        
        // 配置 marked
        configureMarked();
    }

    private template = `
        <div class="chat-container glass-effect">
            <!-- 聊天内容区 -->
            <div class="chat-messages" id="chatMessages">
                <div class="message-list"></div>
            </div>
            
            <!-- 输入区域 -->
            <div class="chat-input-container">
                <textarea id="chatInput" placeholder="输入消息..."></textarea>
                <div class="chat-actions">
                    <button id="importChat" class="icon-btn" title="导入对话">
                        <span class="material-icons">upload_file</span>
                    </button>
                    <button id="clearChat" class="icon-btn" title="清除对话">
                        <span class="material-icons">delete_outline</span>
                    </button>
                    <button id="sendMessage" class="icon-btn primary" title="发送消息">
                        <span class="material-icons">send</span>
                    </button>
                </div>
            </div>
            
            <!-- 功能区域 -->
            <div class="chat-toolbar">
                <div class="ai-role-container toolbar-item">
                    <span class="material-icons toolbar-icon">smart_toy</span>
                    <select id="roleSelect" class="role-select">
                        <option value="assistant">AI助手</option>
                        <option value="programmer">程序员</option>
                        <option value="translator">翻译官</option>
                    </select>
                    <button class="icon-btn small" id="roleConfig" title="角色设置">
                        <span class="material-icons">settings</span>
                    </button>
                </div>
                
                <div class="model-container toolbar-item">
                    <span class="material-icons toolbar-icon">psychology</span>
                    <select id="modelSelect" class="model-select">
                        <option value="gpt-4o-mini">gpt-4o-mini</option>
                        <option value="gpt-3.5">GPT-3.5</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4o-all">gpt-4o-all</option>
                    </select>
                    <button class="icon-btn small" id="modelConfig" title="模型设置">
                        <span class="material-icons">tune</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    private container: HTMLElement | null = null;

    public render(container: HTMLElement): void {
        this.container = container;
        container.innerHTML = this.template;
        this.bindEvents();
    }

    private bindEvents(): void {
        if (!this.container) return;

        const sendButton = this.container.querySelector('#sendMessage') as HTMLButtonElement;
        const clearButton = this.container.querySelector('#clearChat') as HTMLButtonElement;
        const importButton = this.container.querySelector('#importChat') as HTMLButtonElement;
        const chatInput = this.container.querySelector('#chatInput') as HTMLTextAreaElement;
        const roleSelect = this.container.querySelector('#roleSelect') as HTMLSelectElement;
        const modelSelect = this.container.querySelector('#modelSelect') as HTMLSelectElement;

        // 发送消息
        const sendMessage = async () => {
            const message = chatInput?.value.trim();
            if (message) {
                await this.handleSendMessage(message);
                // 清空输入框并重置高度
                chatInput.value = '';
                chatInput.style.height = 'auto';
                // 强制触发输入框的 input 事件以更新状态
                chatInput.dispatchEvent(new Event('input'));
            }
        };

        sendButton?.addEventListener('click', sendMessage);

        // 清除对话
        clearButton?.addEventListener('click', () => this.handleClearChat());
        
        // 导入对话
        importButton?.addEventListener('click', () => this.handleImportChat());

        // 回车发送，Shift+Enter 换行
        chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // 阻止默认的换行行为
                sendMessage();
            }
        });

        // 自适应输入框高度
        chatInput?.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
        });

        // 角色切换
        roleSelect?.addEventListener('change', (e) => {
            const roleId = (e.target as HTMLSelectElement).value;
            const role = this.roleManager.getRole(roleId);
            if (role) {
                this.aiService.setRole(role);
            }
        });

        // 模型切换
        modelSelect?.addEventListener('change', (e) => {
            const model = (e.target as HTMLSelectElement).value;
            this.aiService.updateOptions({ model });
        });
    }

    private async handleSendMessage(message: string): Promise<void> {
        const messagesContainer = this.container?.querySelector('.message-list');
        if (!messagesContainer) return;

        // 添加用户消息
        const userMessage: ChatMessage = { role: 'user', content: message };
        this.chatHistory.addMessage(userMessage);
        this.renderMessage(messagesContainer, userMessage);

        try {
            // 显示等待状态
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'message ai-message fade-in';
            loadingMessage.innerHTML = `
                <div class="message-avatar">
                    <span class="material-icons loading">sync</span>
                </div>
                <div class="message-content">正在思考...</div>
            `;
            messagesContainer.appendChild(loadingMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // 获取 AI 回复
            const aiResponse = await this.aiService.chat(this.chatHistory.getHistory());
            
            // 移除等待状态
            messagesContainer.removeChild(loadingMessage);

            // 添加 AI 回复
            const aiMessage: ChatMessage = { role: 'assistant', content: aiResponse };
            this.chatHistory.addMessage(aiMessage);
            this.renderMessage(messagesContainer, aiMessage);

        } catch (error) {
            console.error('AI回复错误:', error);
            // 显示错误消息
            const errorMessage = document.createElement('div');
            errorMessage.className = 'message system-message fade-in';
            errorMessage.innerHTML = `
                <div class="message-avatar">
                    <span class="material-icons">error_outline</span>
                </div>
                <div class="message-content">抱歉，发生了一些错误。请稍后重试。</div>
            `;
            messagesContainer.appendChild(errorMessage);
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    private formatMarkdownContent(content: string): string {
        // 1. 移除多余的空行
        content = content.replace(/\n{3,}/g, '\n\n');

        // 2. 规范化代码块
        content = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            code = code.trim();
            // 确保代码块前后有空行
            return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
        });

        // 3. 规范化列表
        content = content.replace(/^(\s*[-*+])\s+/gm, '$1 ');
        content = content.replace(/^(\s*\d+\.)\s+/gm, '$1 '); // 有序列表

        // 4. 规范化标题
        content = content.replace(/^(#{1,6})\s*(.+?)[\s#]*$/gm, '$1 $2');

        // 5. 规范化引用
        content = content.replace(/^(>\s*)+/gm, (match) => {
            return match.replace(/\s+/g, ' ');
        });

        // 6. 规范化表格
        content = content.replace(/\|\s+/g, '| ').replace(/\s+\|/g, ' |');

        // 7. 规范化加粗和斜体
        content = content.replace(/\*\*\s*(.+?)\s*\*\*/g, '**$1**');
        content = content.replace(/\*\s*(.+?)\s*\*/g, '*$1*');
        content = content.replace(/__\s*(.+?)\s*__/g, '__$1__');
        content = content.replace(/_\s*(.+?)\s*_/g, '_$1_');

        // 8. 处理段落间距
        content = content.split('\n\n').map(paragraph => {
            return paragraph.trim();
        }).filter(Boolean).join('\n\n');

        return content;
    }

    private renderMessage(container: Element, message: ChatMessage): void {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role === 'user' ? 'user-message' : 'ai-message'} fade-in`;
        
        // 统一处理消息内容，不使用 Markdown 渲染
        const content = message.content
            .replace(/\n/g, '<br>')
            .replace(/ /g, '&nbsp;');

        messageElement.innerHTML = `
            <div class="message-avatar">
                <span class="material-icons">${message.role === 'user' ? 'person' : 'smart_toy'}</span>
            </div>
            <div class="message-content">${content}</div>
        `;
        
        container.appendChild(messageElement);
        container.scrollTop = container.scrollHeight;
    }

    private handleClearChat(): void {
        const messagesContainer = this.container?.querySelector('.message-list');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            this.chatHistory.clear();
        }
    }

    private handleImportChat(): void {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const content = event.target?.result as string;
                        this.chatHistory.importHistory(content);
                        this.refreshChatView();
                    } catch (error) {
                        console.error('导入失败:', error);
                    }
                };
                reader.readAsText(file);
            }
        });

        fileInput.click();
    }

    private refreshChatView(): void {
        const messagesContainer = this.container?.querySelector('.message-list');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            this.chatHistory.getHistory().forEach(message => {
                this.renderMessage(messagesContainer, message);
            });
        }
    }

    public destroy(): void {
        // 清理事件监听
        this.container = null;
    }
}
