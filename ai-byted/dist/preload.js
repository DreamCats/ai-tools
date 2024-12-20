"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const psm_1 = require("./domain/models/psm");
const region_1 = require("./domain/models/region");
const SettingsModal_1 = require("./ui/settings/SettingsModal");
const function_1 = require("./domain/models/function");
const StorageService_1 = require("./services/StorageService");
const UrlService_1 = require("./services/UrlService");
const ExternalService_1 = require("./services/ExternalService");
class SearchApp {
    constructor() {
        var _a;
        this.searchTimeout = null;
        this.psmList = [];
        this.regionList = [];
        this.functionList = new function_1.FunctionList();
        this.searchLimit = 50;
        this.currentPsmId = null;
        this.timeInterval = null;
        this.currentFocusIndex = -1;
        this.items = [];
        this.currentRegionIndex = -1;
        this.regionItems = [];
        this.searchInput = document.getElementById('searchInput');
        this.listContainer = document.getElementById('listContainer');
        this.settingsBtn = document.getElementById('settingsBtn');
        if (!this.searchInput || !this.listContainer || !this.settingsBtn) {
            throw new Error('Required elements not found');
        }
        this.initializeEventListeners();
        this.loadInitialData();
        this.bottomBar = document.createElement('div');
        this.bottomBar.className = 'bottom-bar';
        (_a = document.querySelector('.container')) === null || _a === void 0 ? void 0 : _a.appendChild(this.bottomBar);
        this.initializeBottomBar();
        // 添加键盘事件监听
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }
    initializeEventListeners() {
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
    }
    handleSearchKeydown(e) {
        // 如果在二级列表页面，且搜索框为空，按下 Backspace 键时返回上一页
        if (e.key === 'Backspace' &&
            this.searchInput.value === '' &&
            this.currentPsmId !== null) {
            e.preventDefault();
            this.currentPsmId = null;
            this.showPsmList();
        }
    }
    loadInitialData() {
        try {
            const storedPsmList = StorageService_1.StorageService.getItem('psmList') || [];
            const storedRegionList = StorageService_1.StorageService.getItem('regionList') || [];
            const storedFunctionList = StorageService_1.StorageService.getItem('functionList') || [];
            this.psmList = storedPsmList;
            this.regionList = storedRegionList;
            this.functionList = new function_1.FunctionList(storedFunctionList);
            if (this.regionList.length === 0) {
                console.log('No regions found in storage');
            }
            this.showPsmList();
        }
        catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }
    handleSearch() {
        if (this.searchTimeout) {
            window.clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = window.setTimeout(() => {
            const searchValue = this.searchInput.value.trim();
            const logIdPattern = /([A-F\d]{34})|(\d{15}[\da-f]{38})/;
            if (logIdPattern.test(searchValue)) {
                this.showLogIdCard(searchValue);
                return;
            }
            this.filterAndShowResults(searchValue);
        }, 100);
    }
    filterAndShowResults(searchValue) {
        if (!searchValue.trim()) {
            this.showPsmList();
            return;
        }
        const filteredItems = this.psmList
            .filter(item => item.title.toLowerCase().includes(searchValue.toLowerCase()))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, this.searchLimit);
        if (filteredItems.length === 0) {
            this.showSuggestedPsm(searchValue);
        }
        else {
            this.renderList(filteredItems);
        }
    }
    showSuggestedPsm(searchValue) {
        const suggestedPsm = {
            id: 'suggested_' + Date.now().toString(36),
            title: searchValue,
            clicks: 0,
            timestamp: Date.now()
        };
        this.listContainer.innerHTML = `
            <div class="suggested-section">
                <div class="suggested-header">
                    <span class="material-icons">lightbulb</span>
                    <span>未找到匹配结果，建议添加：</span>
                </div>
                <div class="list-item suggested-item" data-id="${suggestedPsm.id}">
                    <div class="item-title">${this.escapeHtml(suggestedPsm.title)}</div>
                    <div class="item-meta">
                        <span class="material-icons">add_circle_outline</span>
                    </div>
                </div>
            </div>
        `;
        const suggestedItem = this.listContainer.querySelector('.suggested-item');
        suggestedItem === null || suggestedItem === void 0 ? void 0 : suggestedItem.addEventListener('click', () => {
            if (confirm(`是否将 "${searchValue}" 添加到 PSM 列表中？`)) {
                const newPsm = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    title: searchValue,
                    clicks: 1,
                    timestamp: Date.now()
                };
                this.psmList.push(newPsm);
                StorageService_1.StorageService.setItem('psmList', this.psmList);
                this.showFunctionList(newPsm.id);
            }
        });
    }
    showPsmList() {
        const sortedItems = [...this.psmList]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, this.searchLimit);
        this.renderList(sortedItems);
        // 聚焦到搜索框
        this.searchInput.focus();
    }
    renderList(items) {
        this.listContainer.innerHTML = items.map(item => {
            const lastClickedFunction = item.lastClickedFunction;
            const shouldShowRegions = lastClickedFunction &&
                ['argos', 'tce', 'tcc'].includes(lastClickedFunction.title.toLowerCase());
            return `
                <div class="list-item" data-id="${item.id}">
                    <div class="item-content">
                        <div class="item-title">${this.escapeHtml(item.title)}</div>
                        ${lastClickedFunction ? `
                            <div class="function-tags">
                                <div class="function-tag">
                                    <span class="tag-name">${this.escapeHtml(lastClickedFunction.title)}</span>
                                    ${shouldShowRegions ? `
                                        <div class="tag-regions">
                                            ${this.regionList.map(region => `
                                                <span class="mini-region-icon material-icons" 
                                                      data-tooltip="${this.escapeHtml(region.name)}"
                                                      data-function="${this.escapeHtml(lastClickedFunction.title)}"
                                                      data-region="${this.escapeHtml(region.name)}"
                                                      data-area="${this.escapeHtml(region.area)}"
                                                      data-psm="${this.escapeHtml(item.title)}"
                                                      onclick="event.stopPropagation()">
                                                    ${this.escapeHtml(region.icon)}
                                                </span>
                                            `).join('')}
                                        </div>
                                    ` : `
                                        <div class="tag-regions">
                                            <span class="mini-region-icon material-icons" 
                                                  data-tooltip="${function_1.DEFAULT_REGION.name}"
                                                  data-function="${this.escapeHtml(lastClickedFunction.title)}"
                                                  data-region="China"
                                                  data-area="cn"
                                                  data-psm="${this.escapeHtml(item.title)}"
                                                  onclick="event.stopPropagation()">
                                                ${function_1.DEFAULT_REGION.icon}
                                            </span>
                                        </div>
                                    `}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="item-meta">
                        <span>点击: ${item.clicks}</span>
                        <span>${this.formatDate(item.timestamp)}</span>
                    </div>
                </div>
            `;
        }).join('');
        this.listContainer.querySelectorAll('.mini-region-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const functionName = icon.getAttribute('data-function');
                const region = icon.getAttribute('data-region');
                const area = icon.getAttribute('data-area');
                const psm = icon.getAttribute('data-psm');
                const psmItem = this.psmList.find(item => item.title === psm);
                if (psmItem) {
                    psmItem.clicks += 1;
                    psmItem.timestamp = Date.now();
                    if (functionName) {
                        psmItem.lastClickedFunction = {
                            title: functionName,
                            timestamp: Date.now()
                        };
                    }
                    StorageService_1.StorageService.setItem('psmList', this.psmList);
                    this.showPsmList();
                }
                if (functionName && region && area && psm) {
                    const url = UrlService_1.UrlService.buildUrl(functionName, {
                        area: area,
                        region: region,
                        psm: psm
                    });
                    console.log('Generated URL:', url);
                    if (url) {
                        try {
                            ExternalService_1.ExternalService.openUrl(url);
                        }
                        catch (error) {
                            console.error('Failed to open URL:', error);
                        }
                    }
                }
            });
        });
        this.listContainer.querySelectorAll('.list-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                if (id) {
                    this.handlePsmClick(id);
                    this.showFunctionList(id);
                }
            });
        });
        this.clearFocus();
    }
    handlePsmClick(psmId) {
        const psm = this.psmList.find(p => p.id === psmId);
        if (psm) {
            psm.clicks += 1;
            psm.timestamp = Date.now();
            StorageService_1.StorageService.setItem('psmList', this.psmList);
        }
    }
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInMinutes < 1) {
            return '刚刚';
        }
        else if (diffInMinutes < 60) {
            return `${diffInMinutes}分钟前`;
        }
        else if (diffInHours < 24) {
            return `${diffInHours}小时前`;
        }
        else if (diffInDays < 7) {
            return `${diffInDays}天前`;
        }
        else {
            return date.toLocaleDateString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\//g, '-');
        }
    }
    showSpecialCard(value) {
        const regionIcons = this.regionList.map(region => `
            <span class="material-icons" title="${this.escapeHtml(region.name)}">${this.escapeHtml(region.icon)}</span>
        `).join('');
        this.listContainer.innerHTML = `
            <div class="special-card">
                <div class="region-icons">${regionIcons}</div>
                <div class="value">${this.escapeHtml(value)}</div>
                <div class="card-meta">
                    <span>点击: 0</span>
                    <span>${new Date().toLocaleString()}</span>
                </div>
            </div>
        `;
    }
    showFunctionList(psmId) {
        this.currentPsmId = psmId;
        const psm = this.psmList.find(p => p.id === psmId);
        if (!psm)
            return;
        this.functionList.initializeForPsm(psmId);
        const functions = this.functionList.getByPsmId(psmId);
        this.listContainer.innerHTML = `
            <div class="list-header">
                <button class="back-btn material-icons">arrow_back</button>
                <h2>${this.escapeHtml(psm.title)}</h2>
            </div>
            <div class="function-grid">
                ${functions.map(func => this.renderFunctionCard(func)).join('')}
            </div>
        `;
        this.listContainer.querySelectorAll('.function-card').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                if (id) {
                    this.handleFunctionClick(id);
                }
            });
        });
        const backBtn = this.listContainer.querySelector('.back-btn');
        backBtn === null || backBtn === void 0 ? void 0 : backBtn.addEventListener('click', () => {
            this.currentPsmId = null;
            this.showPsmList();
        });
        this.listContainer.querySelectorAll('.region-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const functionName = chip.getAttribute('data-function');
                const region = chip.getAttribute('data-region');
                const area = chip.getAttribute('data-area');
                const psmId = chip.getAttribute('data-psm-id');
                if (psmId) {
                    const psmItem = this.psmList.find(p => p.id === psmId);
                    if (psmItem && functionName) {
                        psmItem.clicks += 1;
                        psmItem.timestamp = Date.now();
                        psmItem.lastClickedFunction = {
                            title: functionName,
                            timestamp: Date.now()
                        };
                        const functions = this.functionList.getByPsmId(psmId);
                        const func = functions.find(f => f.title.toLowerCase() === functionName.toLowerCase());
                        if (func) {
                            this.functionList.incrementClicks(func.id);
                            StorageService_1.StorageService.setItem('functionList', this.functionList.getAll());
                        }
                        StorageService_1.StorageService.setItem('psmList', this.psmList);
                        if (region && area) {
                            const url = UrlService_1.UrlService.buildUrl(functionName, {
                                area: area,
                                region: region,
                                psm: psmItem.title
                            });
                            console.log('Generated URL:', url);
                            if (url) {
                                try {
                                    ExternalService_1.ExternalService.openUrl(url);
                                }
                                catch (error) {
                                    console.error('Failed to open URL:', error);
                                }
                            }
                        }
                        this.showFunctionList(psmId);
                    }
                }
            });
        });
        // 清除之前的焦点状态
        this.clearFocus();
        // 初始化导航并聚焦第一个卡片
        this.initializeNavigation();
        if (this.items.length > 0) {
            this.currentFocusIndex = 0;
            this.updateFocus();
        }
    }
    renderFunctionCard(func) {
        const shouldShowRegions = ['argos', 'tce', 'tcc'].includes(func.title.toLowerCase());
        return `
            <div class="function-card" data-id="${func.id}">
                <div class="function-content">
                    <div class="function-title">${this.escapeHtml(func.title)}</div>
                    ${func.description ? `
                        <div class="function-description">${this.escapeHtml(func.description)}</div>
                    ` : ''}
                    <div class="region-list">
                        ${shouldShowRegions ?
            this.regionList.map(region => `
                                <span class="region-chip" 
                                      data-tooltip="${this.escapeHtml(region.name)}"
                                      data-function="${this.escapeHtml(func.title)}"
                                      data-region="${this.escapeHtml(region.name)}"
                                      data-area="${this.escapeHtml(region.area)}"
                                      data-psm-id="${this.currentPsmId}"
                                      onclick="event.stopPropagation()">
                                    <span class="material-icons">${this.escapeHtml(region.icon)}</span>
                                </span>
                            `).join('')
            : `
                            <span class="region-chip" 
                                  data-tooltip="${function_1.DEFAULT_REGION.name}"
                                  data-function="${this.escapeHtml(func.title)}"
                                  data-region="China"
                                  data-area="cn"
                                  data-psm-id="${this.currentPsmId}"
                                  onclick="event.stopPropagation()">
                                <span class="material-icons">${function_1.DEFAULT_REGION.icon}</span>
                            </span>
                            `}
                    </div>
                </div>
                <div class="function-meta">
                    <span>点击: ${func.clicks}</span>
                    <span>${this.formatDate(func.timestamp)}</span>
                </div>
            </div>
        `;
    }
    handleFunctionClick(functionId) {
        const func = this.functionList.getAll().find(f => f.id === functionId);
        if (!func || !this.currentPsmId)
            return;
        // 更新功能点击次数
        this.functionList.incrementClicks(functionId);
        StorageService_1.StorageService.setItem('functionList', this.functionList.getAll());
        // 更新 PSM 的最后点击功能
        const psm = this.psmList.find(p => p.id === this.currentPsmId);
        if (psm) {
            psm.lastClickedFunction = {
                title: func.title,
                timestamp: Date.now()
            };
            StorageService_1.StorageService.setItem('psmList', this.psmList);
        }
        // 更新显示
        if (this.currentPsmId) {
            this.showFunctionList(this.currentPsmId);
        }
    }
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    openSettings() {
        const settingsModal = new SettingsModal_1.SettingsModal(new psm_1.PsmList(this.psmList), new region_1.RegionList(this.regionList));
        settingsModal.onDataChange = (type, data) => {
            if (type === 'psm') {
                this.psmList = data;
                this.showPsmList();
            }
            else if (type === 'region') {
                this.regionList = data;
                if (this.currentPsmId) {
                    this.showFunctionList(this.currentPsmId);
                }
            }
        };
        settingsModal.show();
    }
    initializeBottomBar() {
        this.updateBottomBar();
        // 每分钟更新一次时间
        this.timeInterval = window.setInterval(() => {
            this.updateBottomBar();
        }, 60000);
    }
    updateBottomBar() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        this.bottomBar.innerHTML = `
            <div class="author">
                <span class="material-icons">person</span>
                <span>作者：maimai，有问题lark联系：maifeng@bytedance.com</span>
            </div>
            <div class="time">
                <span class="material-icons">schedule</span>
                <span>${timeStr}</span>
            </div>
        `;
    }
    showLogIdCard(logId) {
        const logIdItem = {
            title: logId,
            timestamp: Date.now()
        };
        this.listContainer.innerHTML = `
            <div class="logid-card">
                <div class="logid-content">
                    <div class="logid-title">${this.escapeHtml(logIdItem.title)}</div>
                    <div class="region-list">
                        ${this.regionList.map(region => `
                            <span class="region-chip logid-region" 
                                  data-tooltip="${this.escapeHtml(region.name)}"
                                  data-region="${this.escapeHtml(region.name)}"
                                  data-area="${this.escapeHtml(region.area)}"
                                  data-logid="${this.escapeHtml(logIdItem.title)}"
                                  onclick="event.stopPropagation()">
                                <span class="material-icons">${this.escapeHtml(region.icon)}</span>
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div class="logid-meta">
                    <span>${this.formatDate(logIdItem.timestamp)}</span>
                </div>
            </div>
        `;
        this.listContainer.querySelectorAll('.logid-region').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const region = chip.getAttribute('data-region');
                const area = chip.getAttribute('data-area');
                const logId = chip.getAttribute('data-logid');
                if (region && area && logId) {
                    const url = UrlService_1.UrlService.buildUrl('logid', {
                        area: area,
                        region: region,
                        logId: logId
                    });
                    console.log('Generated LogID URL:', url);
                    if (url) {
                        try {
                            ExternalService_1.ExternalService.openUrl(url);
                        }
                        catch (error) {
                            console.error('Failed to open URL:', error);
                        }
                    }
                }
            });
        });
        this.clearFocus();
    }
    handleKeyboardNavigation(e) {
        // 如果正在输入搜索内容，不处理导航
        if (document.activeElement === this.searchInput) {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.initializeNavigation();
            }
            return;
        }
        switch (e.key) {
            case 'Tab':
                e.preventDefault();
                this.clearRegionFocus();
                if (e.shiftKey) {
                    this.focusPreviousItem();
                }
                else {
                    this.focusNextItem();
                }
                break;
            case 'Backspace':
                // 如果当前在二级列表且有卡片被聚焦，则返回上一页
                if (this.currentPsmId !== null && this.currentFocusIndex >= 0) {
                    e.preventDefault();
                    this.currentPsmId = null;
                    this.showPsmList();
                    // 回退时聚焦到搜索框
                    this.searchInput.focus();
                }
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                if (this.currentFocusIndex >= 0) {
                    const currentCard = this.items[this.currentFocusIndex];
                    // 如果当前没有 region 焦点，初始化 region 导航
                    if (this.currentRegionIndex === -1) {
                        this.initializeRegionNavigation(currentCard);
                    }
                    if (this.regionItems.length > 0) {
                        e.preventDefault();
                        if (e.key === 'ArrowLeft') {
                            this.focusPreviousRegion();
                        }
                        else {
                            this.focusNextRegion();
                        }
                    }
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (this.currentRegionIndex >= 0 && this.regionItems.length > 0) {
                    this.regionItems[this.currentRegionIndex].click();
                }
                else if (this.currentFocusIndex >= 0) {
                    this.items[this.currentFocusIndex].click();
                }
                break;
            case 'Escape':
                this.clearFocus();
                this.clearRegionFocus();
                this.searchInput.focus();
                break;
        }
    }
    initializeNavigation() {
        this.items = Array.from(this.listContainer.querySelectorAll('.list-item, .function-card'));
        if (this.items.length > 0 && this.currentFocusIndex === -1) {
            this.currentFocusIndex = 0;
            this.updateFocus();
        }
    }
    initializeRegionNavigation(parentElement) {
        this.regionItems = Array.from(parentElement.querySelectorAll('.region-chip, .mini-region-icon, .logid-region'));
        if (this.regionItems.length > 0) {
            this.currentRegionIndex = -1;
        }
    }
    focusNextItem() {
        if (this.items.length === 0) {
            this.initializeNavigation();
            return;
        }
        this.currentFocusIndex = (this.currentFocusIndex + 1) % this.items.length;
        this.updateFocus();
    }
    focusPreviousItem() {
        if (this.items.length === 0) {
            this.initializeNavigation();
            return;
        }
        this.currentFocusIndex = (this.currentFocusIndex - 1 + this.items.length) % this.items.length;
        this.updateFocus();
    }
    focusNextRegion() {
        if (this.regionItems.length === 0)
            return;
        this.currentRegionIndex = this.currentRegionIndex === -1 ?
            0 : (this.currentRegionIndex + 1) % this.regionItems.length;
        this.updateRegionFocus();
    }
    focusPreviousRegion() {
        if (this.regionItems.length === 0)
            return;
        this.currentRegionIndex = this.currentRegionIndex === -1 ?
            0 : (this.currentRegionIndex - 1 + this.regionItems.length) % this.regionItems.length;
        this.updateRegionFocus();
    }
    updateFocus() {
        this.items.forEach((item, index) => {
            if (index === this.currentFocusIndex) {
                item.classList.add('keyboard-focus');
                item.setAttribute('tabindex', '0');
                item.focus();
                // 不再自动初始化 region 导航
                this.clearRegionFocus();
            }
            else {
                item.classList.remove('keyboard-focus');
                item.setAttribute('tabindex', '-1');
            }
        });
    }
    updateRegionFocus() {
        this.regionItems.forEach((item, index) => {
            if (index === this.currentRegionIndex) {
                item.classList.add('keyboard-focus');
                item.setAttribute('tabindex', '0');
                item.focus();
            }
            else {
                item.classList.remove('keyboard-focus');
                item.setAttribute('tabindex', '-1');
            }
        });
    }
    clearFocus() {
        this.currentFocusIndex = -1;
        this.items.forEach(item => {
            item.classList.remove('keyboard-focus');
            item.setAttribute('tabindex', '-1');
        });
        this.clearRegionFocus();
    }
    clearRegionFocus() {
        this.currentRegionIndex = -1;
        this.regionItems = [];
        this.regionItems.forEach(item => {
            item.classList.remove('keyboard-focus');
            item.setAttribute('tabindex', '-1');
        });
    }
    // 在组件销毁时清理定时器
    destroy() {
        if (this.timeInterval) {
            window.clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    }
}
// 确保 DOM 加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    try {
        new SearchApp();
    }
    catch (error) {
        console.error('Failed to initialize SearchApp:', error);
    }
});
