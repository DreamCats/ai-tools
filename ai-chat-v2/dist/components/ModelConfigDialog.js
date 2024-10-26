"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConfigDialog = void 0;
class ModelConfigDialog {
    constructor(aiService) {
        this.aiService = aiService;
        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);
    }
    createDialog() {
        const dialog = document.createElement('dialog');
        dialog.className = 'model-config-dialog glass-effect';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>API 设置</h3>
                <div class="config-form">
                    <div class="form-group">
                        <label for="apiKey">API Key</label>
                        <div class="input-with-icon">
                            <input type="password" id="apiKey" class="config-input" 
                                placeholder="请输入 API Key" />
                            <button class="icon-btn small toggle-password" title="显示/隐藏">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="baseUrl">API Base URL</label>
                        <input type="text" id="baseUrl" class="config-input" 
                            placeholder="请输入 API Base URL" />
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="secondary-btn" id="cancelConfig">取消</button>
                    <button class="primary-btn" id="saveConfig">保存</button>
                </div>
            </div>
        `;
        this.bindDialogEvents(dialog);
        return dialog;
    }
    bindDialogEvents(dialog) {
        const cancelBtn = dialog.querySelector('#cancelConfig');
        const saveBtn = dialog.querySelector('#saveConfig');
        const apiKeyInput = dialog.querySelector('#apiKey');
        const baseUrlInput = dialog.querySelector('#baseUrl');
        const togglePasswordBtn = dialog.querySelector('.toggle-password');
        // 切换密码显示
        togglePasswordBtn === null || togglePasswordBtn === void 0 ? void 0 : togglePasswordBtn.addEventListener('click', () => {
            const icon = togglePasswordBtn.querySelector('i');
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                icon === null || icon === void 0 ? void 0 : icon.classList.replace('bi-eye', 'bi-eye-slash');
            }
            else {
                apiKeyInput.type = 'password';
                icon === null || icon === void 0 ? void 0 : icon.classList.replace('bi-eye-slash', 'bi-eye');
            }
        });
        // 取消按钮
        cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener('click', () => this.close());
        // 保存按钮
        saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            const baseUrl = baseUrlInput.value.trim();
            if (!apiKey) {
                alert('请输入 API Key');
                return;
            }
            this.aiService.updateConfig({
                apiKey,
                baseUrl: baseUrl || undefined
            });
            this.close();
        });
        // 点击外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog)
                this.close();
        });
    }
    show() {
        const config = this.aiService.getConfig();
        const apiKeyInput = this.dialog.querySelector('#apiKey');
        const baseUrlInput = this.dialog.querySelector('#baseUrl');
        apiKeyInput.value = config.apiKey || '';
        baseUrlInput.value = config.baseUrl || '';
        this.dialog.showModal();
    }
    close() {
        this.dialog.close();
    }
}
exports.ModelConfigDialog = ModelConfigDialog;
