import { BaseView } from '../types/view';

export class DrawerView implements BaseView {
    private template = `
        <div class="drawer-container">
            <!-- 搜索和新增区域 -->
            <div class="drawer-header">
                <div class="search-container">
                    <input type="text" id="drawerSearch" placeholder="搜索文字或标签...">
                </div>
                <button id="addDrawer" class="icon-btn primary" title="新增抽屉">
                    <span class="material-icons">add</span>
                </button>
            </div>

            <!-- 抽屉列表区域 -->
            <div class="drawer-list" id="drawerList">
                <!-- 抽屉项会动态插入到这里 -->
            </div>

            <!-- 抽屉编辑弹窗 -->
            <div class="drawer-editor-modal" id="drawerEditor" style="display: none;">
                <div class="modal-content">
                    <textarea id="markdownEditor" placeholder="支持 Markdown 编辑..."></textarea>
                    <div class="tags-container">
                        <input type="text" id="tagInput" placeholder="添加标签...">
                        <div id="tagsList" class="tags-list"></div>
                    </div>
                    <div class="editor-actions">
                        <button id="cancelEdit">取消</button>
                        <button id="saveDrawer">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    private container: HTMLElement | null = null;
    private drawers: Array<{
        id: string;
        content: string;
        tags: string[];
    }> = [];

    public render(container: HTMLElement): void {
        this.container = container;
        container.innerHTML = this.template;
        this.bindEvents();
        this.loadDrawers();
    }

    private bindEvents(): void {
        if (!this.container) return;

        // 搜索功能
        const searchInput = this.container.querySelector('#drawerSearch');
        searchInput?.addEventListener('input', (e) => this.handleSearch((e.target as HTMLInputElement).value));

        // 新增抽屉
        const addButton = this.container.querySelector('#addDrawer');
        addButton?.addEventListener('click', () => this.showEditor());

        // 编辑器相关事件
        const cancelButton = this.container.querySelector('#cancelEdit');
        cancelButton?.addEventListener('click', () => this.hideEditor());

        const saveButton = this.container.querySelector('#saveDrawer');
        saveButton?.addEventListener('click', () => this.saveDrawer());
    }

    private handleSearch(query: string): void {
        // 实现搜索逻辑
    }

    private showEditor(drawerId?: string): void {
        const editor = this.container?.querySelector('#drawerEditor');
        if (editor) {
            editor.setAttribute('style', 'display: block');
        }
    }

    private hideEditor(): void {
        const editor = this.container?.querySelector('#drawerEditor');
        if (editor) {
            editor.setAttribute('style', 'display: none');
        }
    }

    private saveDrawer(): void {
        // 保存抽屉内容逻辑
    }

    private loadDrawers(): void {
        // 从存储加载抽屉数据
    }

    private renderDrawerItem(drawer: { id: string; content: string; tags: string[] }): HTMLElement {
        const drawerElement = document.createElement('div');
        drawerElement.className = 'drawer-item';
        drawerElement.innerHTML = `
            <div class="drawer-content">
                <div class="drawer-actions">
                    <button class="edit-btn">编辑</button>
                    <button class="delete-btn">删除</button>
                </div>
                <div class="markdown-preview">${this.renderMarkdown(drawer.content)}</div>
                <div class="drawer-tags">
                    ${drawer.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        // 绑定事件
        drawerElement.querySelector('.edit-btn')?.addEventListener('click', () => this.showEditor(drawer.id));
        drawerElement.querySelector('.delete-btn')?.addEventListener('click', () => this.deleteDrawer(drawer.id));
        drawerElement.addEventListener('click', (e) => {
            if (!(e.target as HTMLElement).closest('.drawer-actions')) {
                this.toggleDrawerExpand(drawer.id);
            }
        });

        return drawerElement;
    }

    private renderMarkdown(content: string): string {
        // 实现 Markdown 渲染逻辑
        return content; // 临时返回原始内容
    }

    private deleteDrawer(id: string): void {
        // 实现删除逻辑
    }

    private toggleDrawerExpand(id: string): void {
        // 实现抽屉展开/收起逻辑
    }

    public destroy(): void {
        // 清理事件监听等资源
    }
}
