"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawerEditDialog = void 0;
const marked_1 = require("marked");
class DrawerEditDialog {
    constructor(onSave) {
        this.tags = new Set();
        this.isEditMode = false;
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
        // 实时预览和高度调整
        contentInput === null || contentInput === void 0 ? void 0 : contentInput.addEventListener('input', () => {
            if (preview) {
                preview.innerHTML = (0, marked_1.marked)(contentInput.value);
                // 处理预览中的图片
                preview.querySelectorAll('img').forEach(img => {
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    // 图片加载完成后再调整容器高度
                    img.onload = () => {
                        contentInput.style.height = 'auto';
                        contentInput.style.height = `${contentInput.scrollHeight}px`;
                        preview.style.height = `${contentInput.scrollHeight}px`;
                    };
                });
                // 立即调整高度（对于非图片内容）
                contentInput.style.height = 'auto';
                contentInput.style.height = `${contentInput.scrollHeight}px`;
                preview.style.height = `${contentInput.scrollHeight}px`;
            }
        });
        // 标签输入 - 同时支持回车和空格添加标签
        tagInput === null || tagInput === void 0 ? void 0 : tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const tag = tagInput.value.trim();
                if (tag) {
                    this.addTag(tag);
                }
            }
        });
        // 标签输入框失去焦点时也添加标签
        tagInput === null || tagInput === void 0 ? void 0 : tagInput.addEventListener('blur', () => {
            const tag = tagInput.value.trim();
            if (tag) {
                this.addTag(tag);
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
        // 添加标签到集合
        this.tags.add(tag);
        this.renderTags();
        // 清空输入框
        const tagInput = this.dialog.querySelector('#tagInput');
        if (tagInput) {
            tagInput.value = '';
        }
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
        var _a;
        const titleInput = this.dialog.querySelector('#drawerTitle');
        const contentInput = this.dialog.querySelector('#drawerContent');
        const tagInput = this.dialog.querySelector('#tagInput');
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const currentTag = tagInput.value.trim();
        if (!title || !content) {
            alert('标题和内容不能为空');
            return;
        }
        if (currentTag) {
            this.addTag(currentTag);
        }
        this.onSave({
            title,
            content,
            tags: Array.from(this.tags)
        }, this.isEditMode, (_a = this.currentItem) === null || _a === void 0 ? void 0 : _a.id);
        this.close();
    }
    show(item) {
        this.currentItem = item;
        this.isEditMode = !!item; // 根据是否有 item 来设置编辑模式
        this.tags.clear();
        const titleInput = this.dialog.querySelector('#drawerTitle');
        const contentInput = this.dialog.querySelector('#drawerContent');
        const preview = this.dialog.querySelector('#markdownPreview');
        const dialogTitle = this.dialog.querySelector('h2');
        // 更新对话框标题
        if (dialogTitle) {
            dialogTitle.textContent = this.isEditMode ? '编辑抽屉' : '新建抽屉';
        }
        if (item) {
            titleInput.value = item.title;
            contentInput.value = item.content;
            item.tags.forEach(tag => this.tags.add(tag));
            if (preview) {
                preview.innerHTML = (0, marked_1.marked)(item.content);
                contentInput.style.height = 'auto';
                contentInput.style.height = `${contentInput.scrollHeight}px`;
                preview.style.height = `${contentInput.scrollHeight}px`;
            }
        }
        else {
            titleInput.value = '';
            contentInput.value = '';
            if (preview) {
                preview.innerHTML = '';
                contentInput.style.height = 'auto';
                preview.style.height = 'auto';
            }
        }
        this.renderTags();
        this.dialog.showModal();
    }
    close() {
        this.dialog.close();
        this.currentItem = undefined;
        this.isEditMode = false;
        this.tags.clear();
    }
}
exports.DrawerEditDialog = DrawerEditDialog;
