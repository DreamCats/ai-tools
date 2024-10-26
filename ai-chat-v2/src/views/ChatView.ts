import { AIService } from '../services/AIService';
import { RoleManager } from '../services/RoleManager';
import { ChatHistoryManager } from '../services/ChatHistoryManager';
import { BaseView } from '../types/view';
import { ChatMessage } from '../types/openai';
import { marked } from 'marked';
import { configureMarked } from '../config/marked.config';
import { RoleConfigDialog } from '../components/RoleConfigDialog';
import { RoleConfigManager } from '../services/RoleConfigManager';
import { TagSelectDialog } from '../components/TagSelectDialog';
import { UToolsStorage } from '../services/UToolsStorage';
import { IStorage } from '../interfaces/storage';  // 从 interfaces 目录导入
import { ExportService } from '../services/ExportService';
import { ExportDialog } from '../components/ExportDialog';
import { ExportOptions } from '../services/ExportService';

export class ChatView implements BaseView {
    private aiService: AIService;
    private roleManager: RoleManager;
    private chatHistory: ChatHistoryManager;
    private roleConfigDialog: RoleConfigDialog;
    private tagSelectDialog: TagSelectDialog;
    private storage: IStorage;
    private readonly STORAGE_KEY_ROLE = 'selected_role';
    private readonly STORAGE_KEY_MODEL = 'selected_model';
    private exportDialog: ExportDialog;
    private exportService: ExportService;
    
    constructor() {
        this.storage = UToolsStorage.getInstance();
        this.aiService = new AIService('sk-Bd4aUrOoCdd6mYjQ590939B91d4b44Bd95DeF08c8f297385');
        this.roleManager = new RoleManager();
        this.chatHistory = new ChatHistoryManager();
        this.roleConfigDialog = new RoleConfigDialog(() => this.updateRoleSelect());
        this.tagSelectDialog = new TagSelectDialog(this.handleImportContent.bind(this));
        this.exportService = ExportService.getInstance();
        this.exportDialog = new ExportDialog(this.handleExport.bind(this));
        
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
                <div class="chat-bottom-bar">
                    <div class="chat-hints">
                        <span class="hint-item">
                            <span class="material-icons">keyboard</span>
                            Alt + Enter 发送消息
                        </span>
                    </div>
                    <div class="chat-actions">
                        <button id="exportChat" class="icon-btn" title="导出对话">
                            <span class="material-icons">download</span>
                        </button>
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
        
        // 初始化时更新角色选择列表并恢复上次选择
        this.updateRoleSelect();
        this.restoreSelections();
    }

    private restoreSelections(): void {
        // 恢复角色选择
        const savedRoleId = this.storage.getItem<string>(this.STORAGE_KEY_ROLE);
        if (savedRoleId) {
            const roleSelect = this.container?.querySelector('#roleSelect') as HTMLSelectElement;
            const roleConfig = RoleConfigManager.getInstance().getRoleConfig(savedRoleId);
            if (roleSelect && roleConfig) {
                roleSelect.value = savedRoleId;
                this.aiService.setSystemPrompt(roleConfig.systemPrompt);
            }
        }

        // 恢复模型选择
        const savedModel = this.storage.getItem<string>(this.STORAGE_KEY_MODEL);
        if (savedModel) {
            const modelSelect = this.container?.querySelector('#modelSelect') as HTMLSelectElement;
            if (modelSelect) {
                modelSelect.value = savedModel;
                this.aiService.updateOptions({ model: savedModel });
            }
        }
    }

    private bindEvents(): void {
        if (!this.container) return;

        const sendButton = this.container.querySelector('#sendMessage') as HTMLButtonElement;
        const clearButton = this.container.querySelector('#clearChat') as HTMLButtonElement;
        const importButton = this.container.querySelector('#importChat') as HTMLButtonElement;
        const chatInput = this.container.querySelector('#chatInput') as HTMLTextAreaElement;
        const roleSelect = this.container.querySelector('#roleSelect') as HTMLSelectElement;
        const modelSelect = this.container.querySelector('#modelSelect') as HTMLSelectElement;
        const exportButton = this.container.querySelector('#exportChat');

        // 发送消息
        const sendMessage = async () => {
            const message = chatInput?.value.trim();
            if (message) {
                await this.handleSendMessage(message);
                chatInput.value = '';
                chatInput.style.height = 'auto';
                chatInput.dispatchEvent(new Event('input'));
            }
        };

        sendButton?.addEventListener('click', sendMessage);
        clearButton?.addEventListener('click', () => this.handleClearChat());
        importButton?.addEventListener('click', () => this.tagSelectDialog.show());
        exportButton?.addEventListener('click', () => {
            this.exportDialog.show();
        });

        // 删除原来的回车发送事件监听器，只保留一个键盘事件处理
        chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // 其他事件监听保持不变...
        chatInput?.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
        });

        roleSelect?.addEventListener('change', (e) => {
            const roleId = (e.target as HTMLSelectElement).value;
            const roleConfig = RoleConfigManager.getInstance().getRoleConfig(roleId);
            if (roleConfig) {
                this.aiService.setSystemPrompt(roleConfig.systemPrompt);
                // 保存选择
                this.storage.setItem(this.STORAGE_KEY_ROLE, roleId);
                
                if (confirm('切换角色后，是否要清空当前对话？')) {
                    this.handleClearChat();
                }
            }
        });

        modelSelect?.addEventListener('change', (e) => {
            const model = (e.target as HTMLSelectElement).value;
            this.aiService.updateOptions({ model });
            // 保存选择
            this.storage.setItem(this.STORAGE_KEY_MODEL, model);
        });

        // 修改键盘事件监听
        chatInput?.addEventListener('keydown', (e) => this.handleKeyPress(e));

        const roleConfigBtn = this.container?.querySelector('#roleConfig');
        roleConfigBtn?.addEventListener('click', () => {
            this.roleConfigDialog.show();
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

    private renderMessage(container: Element, message: ChatMessage): void {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role === 'user' ? 'user-message' : 'ai-message'} fade-in`;
        
        let content;
        if (message.role === 'assistant') {
            content = marked(message.content);
        } else {
            content = message.content
                .replace(/\n/g, '<br>')
                .replace(/ /g, '&nbsp;');
        }

        messageElement.innerHTML = `
            <div class="message-avatar" ${message.role === 'assistant' ? 'title="点击复制内容"' : ''}>
                <span class="material-icons">${message.role === 'user' ? 'person' : 'smart_toy'}</span>
            </div>
            <div class="message-content">${content}</div>
        `;
        
        // 为 AI 消息添加复制功能
        if (message.role === 'assistant') {
            const avatar = messageElement.querySelector('.message-avatar');
            avatar?.addEventListener('click', async () => {
                try {
                    const textContent = message.content;
                    await navigator.clipboard.writeText(textContent);
                    
                    // 更新图标显示复制成功
                    const icon = avatar.querySelector('.material-icons');
                    if (icon) {
                        icon.textContent = 'check';
                        icon.classList.add('copy-success');
                        
                        // 2秒后恢复原样
                        setTimeout(() => {
                            icon.textContent = 'smart_toy';
                            icon.classList.remove('copy-success');
                        }, 2000);
                    }
                } catch (err) {
                    console.error('复制失败:', err);
                }
            });
        }
        
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

    private handleImportContent(content: string): void {
        const messagesContainer = this.container?.querySelector('.message-list');
        if (!messagesContainer) return;

        // 添加系统消息提示导入成功
        const systemMessage: ChatMessage = {
            role: 'system',
            content: `已导入 ${content.split('###').length - 1} 条相关内容作为助信息`
        };
        this.renderMessage(messagesContainer, systemMessage);

        // 添加导入的内容作为系统消息
        const importMessage: ChatMessage = {
            role: 'system',
            content: content
        };
        this.chatHistory.addMessage(importMessage);
    }

    public destroy(): void {
        // 清理事件监听
        this.container = null;
    }

    private handleKeyPress(event: KeyboardEvent): void {
        const chatInput = this.container?.querySelector('#chatInput') as HTMLTextAreaElement;
        if (event.key === 'Enter' && event.altKey) {
            event.preventDefault(); // 阻止默认行为
            const message = chatInput?.value.trim();
            if (message) {
                this.handleSendMessage(message);
                chatInput.value = '';
                chatInput.style.height = 'auto';
                chatInput.dispatchEvent(new Event('input'));
            }
        }
        // 普通回车就使用默认的换行行为，不要特殊处理
    }

    private updateRoleSelect(): void {
        const roleSelect = this.container?.querySelector('#roleSelect') as HTMLSelectElement;
        if (!roleSelect) return;

        const roles = RoleConfigManager.getInstance().getAllRoles();
        roleSelect.innerHTML = roles.map(role => `
            <option value="${role.id}">${role.name}</option>
        `).join('');

        // 保持当前选中的角色（如果存在）
        const currentRole = roleSelect.value;
        if (currentRole && roles.some(role => role.id === currentRole)) {
            roleSelect.value = currentRole;
        }
    }

    private handleExport(options: ExportOptions): void {
        this.exportService.exportChat(this.chatHistory.getHistory(), options);
    }
}
