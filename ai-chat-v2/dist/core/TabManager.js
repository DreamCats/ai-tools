"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabManager = void 0;
class TabManager {
    constructor(views) {
        this.currentTab = null;
        this.tabs = views;
    }
    init() {
        this.bindEvents();
        // 默认显示第一个标签页
        const firstTab = Object.keys(this.tabs)[0];
        this.switchTab(firstTab);
    }
    bindEvents() {
        const navTabs = document.querySelector('.nav-tabs');
        // 使用事件委托处理标签点击
        navTabs === null || navTabs === void 0 ? void 0 : navTabs.addEventListener('click', (e) => {
            const target = e.target;
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
    switchTab(tabName) {
        if (this.currentTab === tabName)
            return;
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
        }
        else {
            console.error('Failed to find content element or tab view');
        }
    }
}
exports.TabManager = TabManager;
