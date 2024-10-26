import { DrawerService } from '../services/DrawerService';

export class TagSelectDialog {
    private dialog: HTMLDialogElement;
    private selectedTags: Set<string> = new Set();
    private onImport: (content: string) => void;
    private drawerService: DrawerService;

    constructor(onImport: (content: string) => void) {
        this.onImport = onImport;
        this.drawerService = DrawerService.getInstance();
        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);
    }

    private createDialog(): HTMLDialogElement {
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

    private bindDialogEvents(dialog: HTMLDialogElement): void {
        const cancelBtn = dialog.querySelector('#cancelImport');
        const confirmBtn = dialog.querySelector('#confirmImport');

        cancelBtn?.addEventListener('click', () => this.close());
        confirmBtn?.addEventListener('click', () => this.handleImport());

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) this.close();
        });
    }

    private getAllTags(): string[] {
        const items = this.drawerService.getItems();
        const tagsSet = new Set<string>();
        items.forEach(item => {
            item.tags.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet);
    }

    private renderTags(): void {
        const tagsList = this.dialog.querySelector('.tags-list');
        if (!tagsList) return;

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

    private getTagCount(tag: string): number {
        return this.drawerService.getItems({ tags: [tag] }).length;
    }

    private toggleTag(tag: string): void {
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
        } else {
            this.selectedTags.add(tag);
        }
    }

    private updateSelectedCount(): void {
        const countElement = this.dialog.querySelector('.selected-count');
        if (countElement) {
            countElement.textContent = `已选择 ${this.selectedTags.size} 个标签`;
        }
    }

    private handleImport(): void {
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

        const content = items.map(item => 
            `### ${item.title}\n${item.content}`
        ).join('\n\n---\n\n');

        this.onImport(content);
        this.close();
    }

    public show(): void {
        this.selectedTags.clear();
        this.renderTags();
        this.updateSelectedCount();
        this.dialog.showModal();
    }

    public close(): void {
        this.dialog.close();
        this.selectedTags.clear();
    }
}
