import { BaseView } from '../types/view';

export class DrawerView implements BaseView {
    private template = `
        <div class="drawer-container glass-effect">
            <!-- 顶部搜索和操作区 -->
            <div class="drawer-header">
                <div class="search-box">
                    <input type="text" placeholder="搜索对话..." class="search-input">
                    <span class="material-icons search-icon">search</span>
                </div>
                <div class="header-actions">
                    <button class="icon-btn" title="导入对话">
                        <span class="material-icons">upload_file</span>
                    </button>
                    <button class="icon-btn" title="导出所有">
                        <span class="material-icons">download</span>
                    </button>
                </div>
            </div>

            <!-- 对话列表 -->
            <div class="conversation-list">
                <!-- 对话组 -->
                <div class="conversation-group">
                    <div class="group-header">
                        <span class="group-title">今天</span>
                        <span class="conversation-count">3 个对话</span>
                    </div>
                    <!-- 对话项 -->
                    <div class="conversation-item">
                        <div class="conversation-icon">
                            <span class="material-icons">chat</span>
                        </div>
                        <div class="conversation-content">
                            <div class="conversation-title">关于 AI 的讨论</div>
                            <div class="conversation-preview">探讨了 AI 的发展趋势和未来可能性...</div>
                        </div>
                        <div class="conversation-actions">
                            <button class="icon-btn small" title="导出">
                                <span class="material-icons">file_download</span>
                            </button>
                            <button class="icon-btn small" title="删除">
                                <span class="material-icons">delete_outline</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部状态栏 -->
            <div class="drawer-footer">
                <div class="storage-info">
                    <span class="material-icons">storage</span>
                    <span>已保存 24 个对话</span>
                </div>
                <button class="clear-all-btn">
                    <span class="material-icons">delete_sweep</span>
                    清除全部
                </button>
            </div>
        </div>
    `;

    private container: HTMLElement | null = null;

    public render(container: HTMLElement): void {
        this.container = container;
        container.innerHTML = this.template;
        this.bindEvents();
    }

    private bindEvents(): void {
        if (!this.container) return;

        // 绑定事件处理
        const searchInput = this.container.querySelector('.search-input');
        searchInput?.addEventListener('input', (e) => {
            this.handleSearch((e.target as HTMLInputElement).value);
        });

        // 其他事件绑定...
    }

    private handleSearch(query: string): void {
        // 实现搜索逻辑
        console.log('Searching for:', query);
    }

    public destroy(): void {
        this.container = null;
    }
}
