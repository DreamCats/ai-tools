import { TabManager } from './core/TabManager'
import { ChatView } from './views/ChatView'
import { DrawerView } from './views/DrawerView'


// 初始化应用
class App {
    // 初始化 tabManager 属性
    private tabManager: TabManager = new TabManager({
        chat: new ChatView(),
        drawer: new DrawerView()
    });

    constructor() {
        try {
            console.log('App initializing...'); // 调试日志
            this.init();
        } catch (error) {
            console.error('Error in App constructor:', error);
        }
    }

    private init(): void {
        try {
            console.log('App init...'); // 调试日志
            // 初始化标签页管理
            this.tabManager.init();
            console.log('Tab manager initialized');
            
            // 默认显示聊天页面
            this.tabManager.switchTab('chat');
        } catch (error) {
            console.error('Error in App init:', error);
        }
    }
}

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...'); // 调试日志
    new App();
});
