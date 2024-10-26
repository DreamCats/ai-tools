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
exports.ChatView = void 0;
const AIService_1 = require("../services/AIService");
const RoleManager_1 = require("../services/RoleManager");
const ChatHistoryManager_1 = require("../services/ChatHistoryManager");
const marked_1 = require("marked");
const marked_config_1 = require("../config/marked.config");
const RoleConfigDialog_1 = require("../components/RoleConfigDialog");
const RoleConfigManager_1 = require("../services/RoleConfigManager");
class ChatView {
    constructor() {
        this.template = `
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
        this.container = null;
        // 初始化服务
        this.aiService = new AIService_1.AIService('sk-Bd4aUrOoCdd6mYjQ590939B91d4b44Bd95DeF08c8f297385');
        this.roleManager = new RoleManager_1.RoleManager();
        this.chatHistory = new ChatHistoryManager_1.ChatHistoryManager();
        this.roleConfigDialog = new RoleConfigDialog_1.RoleConfigDialog(() => this.updateRoleSelect());
        // 配置 marked
        (0, marked_config_1.configureMarked)();
    }
    render(container) {
        this.container = container;
        container.innerHTML = this.template;
        this.bindEvents();
        // 初始化时更新角色选择列表
        this.updateRoleSelect();
        // 设置默认角色的系统提示词
        const defaultRole = RoleConfigManager_1.RoleConfigManager.getInstance().getRoleConfig('assistant');
        if (defaultRole) {
            this.aiService.setSystemPrompt(defaultRole.systemPrompt);
        }
    }
    bindEvents() {
        var _a;
        if (!this.container)
            return;
        const sendButton = this.container.querySelector('#sendMessage');
        const clearButton = this.container.querySelector('#clearChat');
        const importButton = this.container.querySelector('#importChat');
        const chatInput = this.container.querySelector('#chatInput');
        const roleSelect = this.container.querySelector('#roleSelect');
        const modelSelect = this.container.querySelector('#modelSelect');
        // 发送消息
        const sendMessage = () => __awaiter(this, void 0, void 0, function* () {
            const message = chatInput === null || chatInput === void 0 ? void 0 : chatInput.value.trim();
            if (message) {
                yield this.handleSendMessage(message);
                chatInput.value = '';
                chatInput.style.height = 'auto';
                chatInput.dispatchEvent(new Event('input'));
            }
        });
        sendButton === null || sendButton === void 0 ? void 0 : sendButton.addEventListener('click', sendMessage);
        clearButton === null || clearButton === void 0 ? void 0 : clearButton.addEventListener('click', () => this.handleClearChat());
        importButton === null || importButton === void 0 ? void 0 : importButton.addEventListener('click', () => this.handleImportChat());
        // 删除原来的回车发送事件监听器，只保留一个键盘事件处理
        chatInput === null || chatInput === void 0 ? void 0 : chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        // 其他事件监听保持不变...
        chatInput === null || chatInput === void 0 ? void 0 : chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
        });
        roleSelect === null || roleSelect === void 0 ? void 0 : roleSelect.addEventListener('change', (e) => {
            const roleId = e.target.value;
            const roleConfig = RoleConfigManager_1.RoleConfigManager.getInstance().getRoleConfig(roleId);
            if (roleConfig) {
                console.log('Switching to role:', roleConfig); // 添加日志
                this.aiService.setSystemPrompt(roleConfig.systemPrompt);
                if (confirm('切换角色后，是否要清空当前对话？')) {
                    this.handleClearChat();
                }
            }
        });
        modelSelect === null || modelSelect === void 0 ? void 0 : modelSelect.addEventListener('change', (e) => {
            const model = e.target.value;
            this.aiService.updateOptions({ model });
        });
        // 修改键盘事件监听
        chatInput === null || chatInput === void 0 ? void 0 : chatInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
        const roleConfigBtn = (_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('#roleConfig');
        roleConfigBtn === null || roleConfigBtn === void 0 ? void 0 : roleConfigBtn.addEventListener('click', () => {
            this.roleConfigDialog.show();
        });
    }
    handleSendMessage(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const messagesContainer = (_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('.message-list');
            if (!messagesContainer)
                return;
            // 添加用户消息
            const userMessage = { role: 'user', content: message };
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
                const aiResponse = yield this.aiService.chat(this.chatHistory.getHistory());
                // 移除等待状态
                messagesContainer.removeChild(loadingMessage);
                // 添加 AI 回复
                const aiMessage = { role: 'assistant', content: aiResponse };
                this.chatHistory.addMessage(aiMessage);
                this.renderMessage(messagesContainer, aiMessage);
            }
            catch (error) {
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
        });
    }
    renderMessage(container, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role === 'user' ? 'user-message' : 'ai-message'} fade-in`;
        let content;
        if (message.role === 'assistant') {
            content = (0, marked_1.marked)(message.content);
        }
        else {
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
            avatar === null || avatar === void 0 ? void 0 : avatar.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const textContent = message.content;
                    yield navigator.clipboard.writeText(textContent);
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
                }
                catch (err) {
                    console.error('复制失败:', err);
                }
            }));
        }
        container.appendChild(messageElement);
        container.scrollTop = container.scrollHeight;
    }
    handleClearChat() {
        var _a;
        const messagesContainer = (_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('.message-list');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            this.chatHistory.clear();
        }
    }
    handleImportChat() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => {
            var _a;
            const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    var _a;
                    try {
                        const content = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                        this.chatHistory.importHistory(content);
                        this.refreshChatView();
                    }
                    catch (error) {
                        console.error('导入失败:', error);
                    }
                };
                reader.readAsText(file);
            }
        });
        fileInput.click();
    }
    refreshChatView() {
        var _a;
        const messagesContainer = (_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('.message-list');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            this.chatHistory.getHistory().forEach(message => {
                this.renderMessage(messagesContainer, message);
            });
        }
    }
    destroy() {
        // 清理事件监听
        this.container = null;
    }
    handleKeyPress(event) {
        var _a;
        const chatInput = (_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('#chatInput');
        if (event.key === 'Enter' && event.altKey) {
            event.preventDefault(); // 阻止默认行为
            const message = chatInput === null || chatInput === void 0 ? void 0 : chatInput.value.trim();
            if (message) {
                this.handleSendMessage(message);
                chatInput.value = '';
                chatInput.style.height = 'auto';
                chatInput.dispatchEvent(new Event('input'));
            }
        }
        // 普通回车就使用默认的换行行为，不要特殊处理
    }
    updateRoleSelect() {
        var _a;
        const roleSelect = (_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('#roleSelect');
        if (!roleSelect)
            return;
        const roles = RoleConfigManager_1.RoleConfigManager.getInstance().getAllRoles();
        roleSelect.innerHTML = roles.map(role => `
            <option value="${role.id}">${role.name}</option>
        `).join('');
        // 保持当前选中的角色（如果存在）
        const currentRole = roleSelect.value;
        if (currentRole && roles.some(role => role.id === currentRole)) {
            roleSelect.value = currentRole;
        }
    }
}
exports.ChatView = ChatView;