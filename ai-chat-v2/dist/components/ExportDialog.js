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
exports.ExportDialog = void 0;
class ExportDialog {
    constructor(onExport) {
        this.onExport = onExport;
        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);
    }
    createDialog() {
        const dialog = document.createElement('dialog');
        dialog.className = 'export-dialog glass-effect';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>导出对话</h3>
                <div class="export-options">
                    <div class="format-options">
                        <div class="format-option" data-format="txt">
                            <span class="material-icons">description</span>
                            <span>TXT</span>
                            <div class="export-status">
                                <span class="material-icons loading">sync</span>
                                <span class="status-text">导出中...</span>
                            </div>
                        </div>
                        <div class="format-option" data-format="md">
                            <span class="material-icons">code</span>
                            <span>Markdown</span>
                            <div class="export-status">
                                <span class="material-icons loading">sync</span>
                                <span class="status-text">导出中...</span>
                            </div>
                        </div>
                        <div class="format-option" data-format="docx">
                            <span class="material-icons">article</span>
                            <span>Word</span>
                            <div class="export-status">
                                <span class="material-icons loading">sync</span>
                                <span class="status-text">导出中...</span>
                            </div>
                        </div>
                    </div>
                    <input type="text" id="exportFilename" placeholder="文件名（可选）" class="filename-input">
                </div>
                <div class="dialog-actions">
                    <button class="secondary-btn" id="cancelExport">取消</button>
                    <button class="primary-btn" id="confirmExport" disabled>导出</button>
                </div>
            </div>
        `;
        this.bindDialogEvents(dialog);
        return dialog;
    }
    bindDialogEvents(dialog) {
        const cancelBtn = dialog.querySelector('#cancelExport');
        const confirmBtn = dialog.querySelector('#confirmExport');
        const formatOptions = dialog.querySelectorAll('.format-option');
        const filenameInput = dialog.querySelector('#exportFilename');
        let selectedFormat = null;
        formatOptions.forEach(option => {
            option.addEventListener('click', () => {
                formatOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedFormat = option.getAttribute('data-format');
                confirmBtn.disabled = !selectedFormat;
            });
        });
        cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener('click', () => this.close());
        confirmBtn === null || confirmBtn === void 0 ? void 0 : confirmBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            if (selectedFormat) {
                const selectedOption = dialog.querySelector(`.format-option[data-format="${selectedFormat}"]`);
                if (selectedOption) {
                    try {
                        // 显示导出状态
                        selectedOption.classList.add('exporting');
                        yield this.onExport({
                            format: selectedFormat,
                            filename: filenameInput.value.trim() || undefined
                        });
                        // 显示成功状态
                        selectedOption.classList.remove('exporting');
                        selectedOption.classList.add('export-success');
                        // 1秒后关闭对话框
                        setTimeout(() => {
                            this.close();
                            // 重置状态
                            selectedOption.classList.remove('export-success');
                        }, 1000);
                    }
                    catch (error) {
                        // 显示错误状态
                        selectedOption.classList.remove('exporting');
                        selectedOption.classList.add('export-error');
                        // 3秒后重置状态
                        setTimeout(() => {
                            selectedOption.classList.remove('export-error');
                        }, 3000);
                    }
                }
            }
        }));
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog)
                this.close();
        });
    }
    show() {
        // 重置所有选项的状态
        const formatOptions = this.dialog.querySelectorAll('.format-option');
        formatOptions.forEach(option => {
            option.classList.remove('selected', 'exporting', 'export-success', 'export-error');
        });
        const confirmBtn = this.dialog.querySelector('#confirmExport');
        confirmBtn.disabled = true;
        const filenameInput = this.dialog.querySelector('#exportFilename');
        filenameInput.value = '';
        this.dialog.showModal();
    }
    close() {
        this.dialog.close();
    }
}
exports.ExportDialog = ExportDialog;
