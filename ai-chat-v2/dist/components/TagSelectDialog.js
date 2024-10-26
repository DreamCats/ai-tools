"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagSelectDialog = void 0;
const DrawerService_1 = require("../services/DrawerService");
class TagSelectDialog {
    constructor(onImport) {
        this.selectedTags = new Set();
        this.onImport = onImport;
        this.drawerService = DrawerService_1.DrawerService.getInstance();
        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);
    }
    createDialog() {
        const dialog = document.createElement('dialog');
        dialog.className = 'tag-select-dialog glass-effect';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>选择标签导入内容</h3>
                <div class="tags-container">
                    <div class="tags-list"></div>
                </div>
                <div class="dialog-footer">
                    <span class="selected-count">已选择 0 个标签</span>
                    <div class="dialog-actions">
                        <button class="secondary-btn" id="cancelImport">取消</button>
                        <button class="primary-btn" id="confirmImport">导入</button>
                    </div>
                </div>
            </div>
        `;
        this.bindDialogEvents(dialog);
        return dialog;
    }
    bindDialogEvents(dialog) {
        const cancelBtn = dialog.querySelector('#cancelImport');
        const confirmBtn = dialog.querySelector('#confirmImport');
        cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener('click', () => this.close());
        confirmBtn === null || confirmBtn === void 0 ? void 0 : confirmBtn.addEventListener('click', () => this.handleImport());
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog)
                this.close();
        });
    }
    getAllTags() {
        const items = this.drawerService.getItems();
        const tagsSet = new Set();
        items.forEach(item => {
            item.tags.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet);
    }
    renderTags() {
        const tagsList = this.dialog.querySelector('.tags-list');
        if (!tagsList)
            return;
        const allTags = this.getAllTags();
        tagsList.innerHTML = allTags.map(tag => `
            <div class="tag-item ${this.selectedTags.has(tag) ? 'selected' : ''}" data-tag="${tag}">
                <span class="tag-name">${tag}</span>
                <span class="tag-count">${this.getTagCount(tag)}</span>
            </div>
        `).join('');
        // 绑定标签点击事件
        tagsList.querySelectorAll('.tag-item').forEach(tagElement => {
            tagElement.addEventListener('click', () => {
                const tag = tagElement.getAttribute('data-tag');
                if (tag) {
                    this.toggleTag(tag);
                    tagElement.classList.toggle('selected');
                    this.updateSelectedCount();
                }
            });
        });
    }
    getTagCount(tag) {
        return this.drawerService.getItems({ tags: [tag] }).length;
    }
    toggleTag(tag) {
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
        }
        else {
            this.selectedTags.add(tag);
        }
    }
    updateSelectedCount() {
        const countElement = this.dialog.querySelector('.selected-count');
        if (countElement) {
            countElement.textContent = `已选择 ${this.selectedTags.size} 个标签`;
        }
    }
    handleImport() {
        if (this.selectedTags.size === 0) {
            alert('请至少选择一个标签');
            return;
        }
        const items = this.drawerService.getItems({
            tags: Array.from(this.selectedTags)
        });
        if (items.length === 0) {
            alert('未找到相关内容');
            return;
        }
        const content = items.map(item => `### ${item.title}\n${item.content}`).join('\n\n---\n\n');
        this.onImport(content);
        this.close();
    }
    show() {
        this.selectedTags.clear();
        this.renderTags();
        this.updateSelectedCount();
        this.dialog.showModal();
    }
    close() {
        this.dialog.close();
        this.selectedTags.clear();
    }
}
exports.TagSelectDialog = TagSelectDialog;
