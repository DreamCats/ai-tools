import { AIService } from '../services/AIService';

export class ModelConfigDialog {
    private dialog: HTMLDialogElement;
    private aiService: AIService;

    constructor(aiService: AIService) {
        this.aiService = aiService;
        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);
    }

    private createDialog(): HTMLDialogElement {
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

    private bindDialogEvents(dialog: HTMLDialogElement): void {
        const cancelBtn = dialog.querySelector('#cancelConfig');
        const saveBtn = dialog.querySelector('#saveConfig');
        const apiKeyInput = dialog.querySelector('#apiKey') as HTMLInputElement;
        const baseUrlInput = dialog.querySelector('#baseUrl') as HTMLInputElement;
        const togglePasswordBtn = dialog.querySelector('.toggle-password');

        // 切换密码显示
        togglePasswordBtn?.addEventListener('click', () => {
            const icon = togglePasswordBtn.querySelector('i');
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                icon?.classList.replace('bi-eye', 'bi-eye-slash');
            } else {
                apiKeyInput.type = 'password';
                icon?.classList.replace('bi-eye-slash', 'bi-eye');
            }
        });

        // 取消按钮
        cancelBtn?.addEventListener('click', () => this.close());

        // 保存按钮
        saveBtn?.addEventListener('click', () => {
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
            if (e.target === dialog) this.close();
        });
    }

    public show(): void {
        const config = this.aiService.getConfig();
        const apiKeyInput = this.dialog.querySelector('#apiKey') as HTMLInputElement;
        const baseUrlInput = this.dialog.querySelector('#baseUrl') as HTMLInputElement;

        apiKeyInput.value = config.apiKey || '';
        baseUrlInput.value = config.baseUrl || '';

        this.dialog.showModal();
    }

    public close(): void {
        this.dialog.close();
    }
}
