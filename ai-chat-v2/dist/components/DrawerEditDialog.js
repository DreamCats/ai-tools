"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawerEditDialog = void 0;
const marked_1 = require("marked");
class DrawerEditDialog {
    constructor(onSave) {
        this.tags = new Set();
        this.onSave = onSave;
        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);
    }
    createDialog() {
        const dialog = document.createElement('dialog');
        dialog.className = 'drawer-edit-dialog glass-effect';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h2>编辑抽屉</h2>
                <div class="edit-form">
                    <input type="text" id="drawerTitle" placeholder="标题" class="drawer-input">
                    <div class="editor-container">
                        <div class="editor-wrapper">
                            <textarea id="drawerContent" placeholder="内容（支持 Markdown）" class="drawer-textarea"></textarea>
                        </div>
                        <div class="preview-wrapper">
                            <div id="markdownPreview" class="markdown-preview"></div>
                        </div>
                    </div>
                    <div class="tags-input-container">
                        <input type="text" id="tagInput" placeholder="输入标签，按回车添加" class="tag-input">
                        <div id="tagsList" class="tags-list"></div>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="secondary-btn" id="cancelEdit">取消</button>
                    <button class="primary-btn" id="saveDrawer">保存</button>
                </div>
            </div>
        `;
        this.bindDialogEvents(dialog);
        return dialog;
    }
    bindDialogEvents(dialog) {
        const cancelBtn = dialog.querySelector('#cancelEdit');
        const saveBtn = dialog.querySelector('#saveDrawer');
        const contentInput = dialog.querySelector('#drawerContent');
        const preview = dialog.querySelector('#markdownPreview');
        const tagInput = dialog.querySelector('#tagInput');
        // 取消按钮
        cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener('click', () => this.close());
        // 保存按钮
        saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.addEventListener('click', () => this.handleSave());
        // 实时预览
        contentInput === null || contentInput === void 0 ? void 0 : contentInput.addEventListener('input', () => {
            if (preview) {
                preview.innerHTML = (0, marked_1.marked)(contentInput.value);
            }
        });
        // 标签输入
        tagInput === null || tagInput === void 0 ? void 0 : tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag(tagInput.value.trim());
                tagInput.value = '';
            }
        });
        // 点击外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog)
                this.close();
        });
    }
    addTag(tag) {
        if (!tag || this.tags.has(tag))
            return;
        this.tags.add(tag);
        this.renderTags();
    }
    removeTag(tag) {
        this.tags.delete(tag);
        this.renderTags();
    }
    renderTags() {
        const tagsList = this.dialog.querySelector('#tagsList');
        if (!tagsList)
            return;
        tagsList.innerHTML = Array.from(this.tags).map(tag => `
            <div class="tag">
                ${tag}
                <span class="tag-remove" data-tag="${tag}">×</span>
            </div>
        `).join('');
        // 绑定删除标签事件
        tagsList.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                if (tag)
                    this.removeTag(tag);
            });
        });
    }
    handleSave() {
        const titleInput = this.dialog.querySelector('#drawerTitle');
        const contentInput = this.dialog.querySelector('#drawerContent');
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        if (!title || !content) {
            alert('标题和内容不能为空');
            return;
        }
        this.onSave({
            title,
            content,
            tags: Array.from(this.tags)
        });
        this.close();
    }
    show(item) {
        this.currentItem = item;
        this.tags.clear();
        const titleInput = this.dialog.querySelector('#drawerTitle');
        const contentInput = this.dialog.querySelector('#drawerContent');
        const preview = this.dialog.querySelector('#markdownPreview');
        if (item) {
            titleInput.value = item.title;
            contentInput.value = item.content;
            item.tags.forEach(tag => this.tags.add(tag));
            if (preview) {
                preview.innerHTML = (0, marked_1.marked)(item.content);
            }
        }
        else {
            titleInput.value = '';
            contentInput.value = '';
            if (preview) {
                preview.innerHTML = '';
            }
        }
        this.renderTags();
        this.dialog.showModal();
    }
    close() {
        this.dialog.close();
        this.currentItem = undefined;
        this.tags.clear();
    }
}
exports.DrawerEditDialog = DrawerEditDialog;
