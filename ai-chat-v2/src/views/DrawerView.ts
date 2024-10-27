import { BaseView } from '../types/view';
import { DrawerService } from '../services/DrawerService';
import { DrawerEditDialog } from '../components/DrawerEditDialog';
import { DrawerItem } from '../interfaces/drawer';
import { marked } from 'marked';

export class DrawerView implements BaseView {
    private drawerService: DrawerService;
    private editDialog: DrawerEditDialog;
    private expandedDrawerId: string | null = null;

    constructor() {
        this.drawerService = DrawerService.getInstance();
        this.editDialog = new DrawerEditDialog(this.handleSaveDrawer.bind(this));
    }

    private template = `
        <div class="drawer-container glass-effect">
            <!-- 顶部搜索和操作区 -->
            <div class="drawer-header">
                <div class="search-container">
                    <div class="search-box">
                        <span class="material-icons search-icon">search</span>
                        <input type="text" id="searchInput" placeholder="搜索文字或标签..." class="search-input">
                    </div>
                    <button class="icon-btn" id="addDrawer" title="新建抽屉">
                        <span class="material-icons">add</span>
                    </button>
                </div>
            </div>

            <!-- 抽屉列表 -->
            <div class="drawer-list"></div>

            <!-- 底部状态栏 -->
            <div class="drawer-footer">
                <div class="storage-info">
                    <span class="material-icons">storage</span>
                    <span id="drawerCount">0 个抽屉</span>
                </div>
            </div>
        </div>
    `;

    private renderDrawerItem(item: DrawerItem, isExpanded: boolean = false): string {
        const previewContent = isExpanded 
            ? marked(item.content)
            : item.content.slice(0, 200) + (item.content.length > 200 ? '...' : '');

        return `
            <div class="drawer-item ${isExpanded ? 'expanded' : ''}" data-id="${item.id}">
                <div class="drawer-item-header">
                    <h3 class="drawer-title">${item.title}</h3>
                    <div class="drawer-actions">
                        <button class="icon-btn small edit-drawer" title="编辑">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="icon-btn small delete-drawer" title="删除">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
                <div class="drawer-content markdown-preview">
                    ${previewContent}
                </div>
                <div class="drawer-tags">
                    ${item.tags.map(tag => `
                        <span class="tag" data-tag="${tag}">${tag}</span>
                    `).join('')}
                </div>
                ${!isExpanded ? `
                    <button class="expand-btn">
                        <span class="material-icons">expand_more</span>
                    </button>
                ` : ''}
            </div>
        `;
    }

    private bindEvents(): void {
        if (!this.container) return;

        // 搜索功能
        const searchInput = this.container.querySelector('#searchInput');
        searchInput?.addEventListener('input', (e) => {
            const query = (e.target as HTMLInputElement).value;
            this.handleSearch(query);
        });

        // 新建抽屉
        const addButton = this.container.querySelector('#addDrawer');
        addButton?.addEventListener('click', () => {
            this.editDialog.show();
        });

        // 委托事件处理
        const drawerList = this.container.querySelector('.drawer-list');
        drawerList?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const drawerItem = target.closest('.drawer-item');
            if (!drawerItem) return;

            const drawerId = drawerItem.getAttribute('data-id');
            if (!drawerId) return;

            // 编辑按钮
            if (target.closest('.edit-drawer')) {
                const item = this.drawerService.getItem(drawerId);
                if (item) {
                    this.editDialog.show(item);
                }
                return;
            }

            // 删除按钮
            if (target.closest('.delete-drawer')) {
                if (confirm('确定要删除这个抽屉吗？')) {
                    this.drawerService.deleteItem(drawerId);
                    this.refreshDrawerList();
                }
                return;
            }

            // 标签点击
            if (target.closest('.tag')) {
                const tag = target.getAttribute('data-tag');
                if (tag) {
                    const searchInput = this.container?.querySelector('#searchInput') as HTMLInputElement;
                    searchInput.value = tag;
                    this.handleSearch(tag);
                }
                return;
            }

            // 展开/收起
            if (target.closest('.expand-btn') || target.closest('.drawer-content')) {
                this.toggleDrawerExpand(drawerId);
            }
        });
    }

    private handleSearch(query: string): void {
        const items = this.drawerService.getItems({
            text: query,
            tags: query.startsWith('#') ? [query.slice(1)] : undefined
        });
        this.renderDrawers(items);
    }

    private handleSaveDrawer(
        item: Omit<DrawerItem, 'id' | 'createdAt' | 'updatedAt'>, 
        isEditMode?: boolean, 
        itemId?: string
    ): void {
        if (isEditMode && itemId) {
            // 编辑现有抽屉
            this.drawerService.updateItem(itemId, item);
        } else {
            // 新建抽屉
            this.drawerService.addItem(item);
        }
        this.refreshDrawerList();
    }

    private toggleDrawerExpand(drawerId: string): void {
        if (this.expandedDrawerId === drawerId) {
            this.expandedDrawerId = null;
        } else {
            this.expandedDrawerId = drawerId;
        }
        this.refreshDrawerList();
    }

    private refreshDrawerList(): void {
        const items = this.drawerService.getItems();
        this.renderDrawers(items);
        this.updateDrawerCount(items.length);
    }

    private renderDrawers(items: DrawerItem[]): void {
        const drawerList = this.container?.querySelector('.drawer-list');
        if (!drawerList) return;

        drawerList.innerHTML = items.map(item => 
            this.renderDrawerItem(item, item.id === this.expandedDrawerId)
        ).join('');
    }

    private updateDrawerCount(count: number): void {
        const countElement = this.container?.querySelector('#drawerCount');
        if (countElement) {
            countElement.textContent = `${count} 个抽屉`;
        }
    }

    private container: HTMLElement | null = null;

    public render(container: HTMLElement): void {
        this.container = container;
        container.innerHTML = this.template;
        this.bindEvents();
        this.refreshDrawerList();
    }

    public destroy(): void {
        this.container = null;
    }
}
