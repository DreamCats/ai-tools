"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TabManager_1 = require("./core/TabManager");
const ChatView_1 = require("./views/ChatView");
const DrawerView_1 = require("./views/DrawerView");
// 初始化应用
class App {
    constructor() {
        // 初始化 tabManager 属性
        this.tabManager = new TabManager_1.TabManager({
            chat: new ChatView_1.ChatView(),
            drawer: new DrawerView_1.DrawerView()
        });
        try {
            console.log('App initializing...'); // 调试日志
            this.init();
        }
        catch (error) {
            console.error('Error in App constructor:', error);
        }
    }
    init() {
        try {
            console.log('App init...'); // 调试日志
            // 初始化标签页管理
            this.tabManager.init();
            console.log('Tab manager initialized');
            // 默认显示聊天页面
            this.tabManager.switchTab('chat');
        }
        catch (error) {
            console.error('Error in App init:', error);
        }
    }
}
// 启动应用
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...'); // 调试日志
    new App();
});
