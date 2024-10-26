import { BaseView } from '../types/view';

interface TabViews {
    [key: string]: BaseView;
}

export class TabManager {
    private tabs: TabViews;
    private currentTab: string | null = null;

    constructor(views: TabViews) {
        this.tabs = views;
    }

    public init(): void {
        this.bindEvents();
        // 默认显示第一个标签页
        const firstTab = Object.keys(this.tabs)[0];
        this.switchTab(firstTab);
    }

    private bindEvents(): void {
        const navTabs = document.querySelector('.nav-tabs');
        
        // 使用事件委托处理标签点击
        navTabs?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            console.log('Tab clicked:', target);
            if (target.classList.contains('tab-item')) {
                const tabName = target.dataset.tab;
                console.log('Tab name:', tabName);
                if (tabName) {
                    this.switchTab(tabName);
                }
            }
        });
    }

    public switchTab(tabName: string): void {
        if (this.currentTab === tabName) return;

        // 更新标签页样式
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            }
        });

        // 切换视图
        const contentElement = document.getElementById('content');
        console.log('Content element:', contentElement);
        if (contentElement && this.tabs[tabName]) {
            contentElement.innerHTML = '';
            console.log('Rendering view for tab:', tabName);
            this.tabs[tabName].render(contentElement);
            this.currentTab = tabName;
        } else {
            console.error('Failed to find content element or tab view');
        }
    }
}
