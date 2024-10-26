"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawerView = void 0;
class DrawerView {
    constructor() {
        this.template = `
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
        this.container = null;
        this.drawers = [];
    }
    render(container) {
        this.container = container;
        container.innerHTML = this.template;
        this.bindEvents();
        this.loadDrawers();
    }
    bindEvents() {
        if (!this.container)
            return;
        // 搜索功能
        const searchInput = this.container.querySelector('#drawerSearch');
        searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        // 新增抽屉
        const addButton = this.container.querySelector('#addDrawer');
        addButton === null || addButton === void 0 ? void 0 : addButton.addEventListener('click', () => this.showEditor());
        // 编辑器相关事件
        const cancelButton = this.container.querySelector('#cancelEdit');
        cancelButton === null || cancelButton === void 0 ? void 0 : cancelButton.addEventListener('click', () => this.hideEditor());
        const saveButton = this.container.querySelector('#saveDrawer');
        saveButton === null || saveButton === void 0 ? void 0 : saveButton.addEventListener('click', () => this.saveDrawer());
    }
    handleSearch(query) {
        // 实现搜索逻辑
    }
    showEditor(drawerId) {
        var _a;
        const editor = (_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('#drawerEditor');
        if (editor) {
            editor.setAttribute('style', 'display: block');
        }
    }
    hideEditor() {
        var _a;
        const editor = (_a = this.container) === null || _a === void 0 ? void 0 : _a.querySelector('#drawerEditor');
        if (editor) {
            editor.setAttribute('style', 'display: none');
        }
    }
    saveDrawer() {
        // 保存抽屉内容逻辑
    }
    loadDrawers() {
        // 从存储加载抽屉数据
    }
    renderDrawerItem(drawer) {
        var _a, _b;
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
        (_a = drawerElement.querySelector('.edit-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.showEditor(drawer.id));
        (_b = drawerElement.querySelector('.delete-btn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.deleteDrawer(drawer.id));
        drawerElement.addEventListener('click', (e) => {
            if (!e.target.closest('.drawer-actions')) {
                this.toggleDrawerExpand(drawer.id);
            }
        });
        return drawerElement;
    }
    renderMarkdown(content) {
        // 实现 Markdown 渲染逻辑
        return content; // 临时返回原始内容
    }
    deleteDrawer(id) {
        // 实现删除逻辑
    }
    toggleDrawerExpand(id) {
        // 实现抽屉展开/收起逻辑
    }
    destroy() {
        // 清理事件监听等资源
    }
}
exports.DrawerView = DrawerView;
