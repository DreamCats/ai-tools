import { DrawerItem } from '../interfaces/drawer';
import { marked } from 'marked';

export class DrawerEditDialog {
    private dialog: HTMLDialogElement;
    private onSave: (item: Omit<DrawerItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
    private currentItem?: DrawerItem;
    private tags: Set<string> = new Set();

    constructor(onSave: (item: Omit<DrawerItem, 'id' | 'createdAt' | 'updatedAt'>) => void) {
        this.onSave = onSave;
        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);
    }

    private createDialog(): HTMLDialogElement {
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

    private bindDialogEvents(dialog: HTMLDialogElement): void {
        const cancelBtn = dialog.querySelector('#cancelEdit');
        const saveBtn = dialog.querySelector('#saveDrawer');
        const contentInput = dialog.querySelector('#drawerContent') as HTMLTextAreaElement;
        const preview = dialog.querySelector('#markdownPreview');
        const tagInput = dialog.querySelector('#tagInput') as HTMLInputElement;

        // 取消按钮
        cancelBtn?.addEventListener('click', () => this.close());

        // 保存按钮
        saveBtn?.addEventListener('click', () => this.handleSave());

        // 实时预览
        contentInput?.addEventListener('input', () => {
            if (preview) {
                preview.innerHTML = marked(contentInput.value);
            }
        });

        // 标签输入
        tagInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag(tagInput.value.trim());
                tagInput.value = '';
            }
        });

        // 点击外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) this.close();
        });
    }

    private addTag(tag: string): void {
        if (!tag || this.tags.has(tag)) return;

        this.tags.add(tag);
        this.renderTags();
    }

    private removeTag(tag: string): void {
        this.tags.delete(tag);
        this.renderTags();
    }

    private renderTags(): void {
        const tagsList = this.dialog.querySelector('#tagsList');
        if (!tagsList) return;

        tagsList.innerHTML = Array.from(this.tags).map(tag => `
            <div class="tag">
                ${tag}
                <span class="tag-remove" data-tag="${tag}">×</span>
            </div>
        `).join('');

        // 绑定删除标签事件
        tagsList.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = (btn as HTMLElement).dataset.tag;
                if (tag) this.removeTag(tag);
            });
        });
    }

    private handleSave(): void {
        const titleInput = this.dialog.querySelector('#drawerTitle') as HTMLInputElement;
        const contentInput = this.dialog.querySelector('#drawerContent') as HTMLTextAreaElement;

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

    public show(item?: DrawerItem): void {
        this.currentItem = item;
        this.tags.clear();

        const titleInput = this.dialog.querySelector('#drawerTitle') as HTMLInputElement;
        const contentInput = this.dialog.querySelector('#drawerContent') as HTMLTextAreaElement;
        const preview = this.dialog.querySelector('#markdownPreview');

        if (item) {
            titleInput.value = item.title;
            contentInput.value = item.content;
            item.tags.forEach(tag => this.tags.add(tag));
            if (preview) {
                preview.innerHTML = marked(item.content);
            }
        } else {
            titleInput.value = '';
            contentInput.value = '';
            if (preview) {
                preview.innerHTML = '';
            }
        }

        this.renderTags();
        this.dialog.showModal();
    }

    public close(): void {
        this.dialog.close();
        this.currentItem = undefined;
        this.tags.clear();
    }
}
