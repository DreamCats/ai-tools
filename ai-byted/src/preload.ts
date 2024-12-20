import { Psm, PsmList } from './domain/models/psm';
import { Region, RegionList } from './domain/models/region';
import { SettingsModal } from './ui/settings/SettingsModal';
import { Function, FunctionList, DEFAULT_REGION } from './domain/models/function';
import { StorageService } from './services/StorageService';
import { UrlService } from './services/UrlService';
import { ExternalService } from './services/ExternalService';
import { LogIdItem } from './domain/models/logid';

interface PsmItem {
    id: string;
    title: string;
    clicks: number;
    timestamp: number;
    lastClickedFunction?: {
        title: string;
        timestamp: number;
    };
}

class SearchApp {
    private searchInput: HTMLInputElement;
    private listContainer: HTMLElement;
    private settingsBtn: HTMLElement;
    private searchTimeout: number | null = null;
    private psmList: PsmItem[] = [];
    private regionList: Region[] = [];
    private functionList: FunctionList = new FunctionList();
    private searchLimit: number = 50;
    private currentPsmId: string | null = null;
    private bottomBar: HTMLElement;
    private timeInterval: number | null = null;
    private currentFocusIndex: number = -1;
    private items: HTMLElement[] = [];
    private currentRegionIndex: number = -1;
    private regionItems: HTMLElement[] = [];

    constructor() {
        this.searchInput = document.getElementById('searchInput') as HTMLInputElement;
        this.listContainer = document.getElementById('listContainer') as HTMLElement;
        this.settingsBtn = document.getElementById('settingsBtn') as HTMLElement;
        
        if (!this.searchInput || !this.listContainer || !this.settingsBtn) {
            throw new Error('Required elements not found');
        }
        
        this.initializeEventListeners();
        this.loadInitialData();
        
        this.bottomBar = document.createElement('div');
        this.bottomBar.className = 'bottom-bar';
        document.querySelector('.container')?.appendChild(this.bottomBar);
        
        this.initializeBottomBar();
        
        // 添加键盘事件监听
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    private initializeEventListeners(): void {
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
    }

    private handleSearchKeydown(e: KeyboardEvent): void {
        // 如果在二级列表页面，且搜索框为空，按下 Backspace 键时返回上一页
        if (e.key === 'Backspace' && 
            this.searchInput.value === '' && 
            this.currentPsmId !== null) {
            e.preventDefault();
            this.currentPsmId = null;
            this.showPsmList();
        }
    }

    private loadInitialData(): void {
        try {
            const storedPsmList = StorageService.getItem<PsmItem[]>('psmList') || [];
            const storedRegionList = StorageService.getItem<Region[]>('regionList') || [];
            const storedFunctionList = StorageService.getItem<Function[]>('functionList') || [];
            
            this.psmList = storedPsmList;
            this.regionList = storedRegionList;
            this.functionList = new FunctionList(storedFunctionList);
            
            if (this.regionList.length === 0) {
                console.log('No regions found in storage');
            }
            
            this.showPsmList();
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    private handleSearch(): void {
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

    private filterAndShowResults(searchValue: string): void {
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
        } else {
            this.renderList(filteredItems);
        }
    }

    private showSuggestedPsm(searchValue: string): void {
        const suggestedPsm: PsmItem = {
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
        suggestedItem?.addEventListener('click', () => {
            if (confirm(`是否将 "${searchValue}" 添加到 PSM 列表中？`)) {
                const newPsm: PsmItem = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    title: searchValue,
                    clicks: 1,
                    timestamp: Date.now()
                };

                this.psmList.push(newPsm);
                StorageService.setItem('psmList', this.psmList);
                this.showFunctionList(newPsm.id);
            }
        });
    }

    private showPsmList(): void {
        const sortedItems = [...this.psmList]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, this.searchLimit);
        
        this.renderList(sortedItems);
        
        // 聚焦到搜索框
        this.searchInput.focus();
    }

    private renderList(items: PsmItem[]): void {
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
                                                  data-tooltip="${DEFAULT_REGION.name}"
                                                  data-function="${this.escapeHtml(lastClickedFunction.title)}"
                                                  data-region="China"
                                                  data-area="cn"
                                                  data-psm="${this.escapeHtml(item.title)}"
                                                  onclick="event.stopPropagation()">
                                                ${DEFAULT_REGION.icon}
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
                    
                    StorageService.setItem('psmList', this.psmList);
                    
                    this.showPsmList();
                }

                if (functionName && region && area && psm) {
                    const url = UrlService.buildUrl(functionName, {
                        area: area,
                        region: region,
                        psm: psm
                    });

                    console.log('Generated URL:', url);

                    if (url) {
                        try {
                            ExternalService.openUrl(url);
                        } catch (error) {
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

    private handlePsmClick(psmId: string): void {
        const psm = this.psmList.find(p => p.id === psmId);
        if (psm) {
            psm.clicks += 1;
            psm.timestamp = Date.now();
            StorageService.setItem('psmList', this.psmList);
        }
    }

    private formatDate(timestamp: number): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) {
            return '刚刚';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}分钟前`;
        } else if (diffInHours < 24) {
            return `${diffInHours}小时前`;
        } else if (diffInDays < 7) {
            return `${diffInDays}天前`;
        } else {
            return date.toLocaleDateString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\//g, '-');
        }
    }

    private showSpecialCard(value: string): void {
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

    private showFunctionList(psmId: string): void {
        this.currentPsmId = psmId;
        const psm = this.psmList.find(p => p.id === psmId);
        if (!psm) return;

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
        backBtn?.addEventListener('click', () => {
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
                            StorageService.setItem('functionList', this.functionList.getAll());
                        }
                        
                        StorageService.setItem('psmList', this.psmList);
                        
                        if (region && area) {
                            const url = UrlService.buildUrl(functionName, {
                                area: area,
                                region: region,
                                psm: psmItem.title
                            });

                            console.log('Generated URL:', url);

                            if (url) {
                                try {
                                    ExternalService.openUrl(url);
                                } catch (error) {
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

    private renderFunctionCard(func: Function): string {
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
                                  data-tooltip="${DEFAULT_REGION.name}"
                                  data-function="${this.escapeHtml(func.title)}"
                                  data-region="China"
                                  data-area="cn"
                                  data-psm-id="${this.currentPsmId}"
                                  onclick="event.stopPropagation()">
                                <span class="material-icons">${DEFAULT_REGION.icon}</span>
                            </span>
                            `
                        }
                    </div>
                </div>
                <div class="function-meta">
                    <span>点击: ${func.clicks}</span>
                    <span>${this.formatDate(func.timestamp)}</span>
                </div>
            </div>
        `;
    }

    private handleFunctionClick(functionId: string): void {
        const func = this.functionList.getAll().find(f => f.id === functionId);
        if (!func || !this.currentPsmId) return;

        // 更新功能点击次数
        this.functionList.incrementClicks(functionId);
        StorageService.setItem('functionList', this.functionList.getAll());

        // 更新 PSM 的最后点击功能
        const psm = this.psmList.find(p => p.id === this.currentPsmId);
        if (psm) {
            psm.lastClickedFunction = {
                title: func.title,
                timestamp: Date.now()
            };
            StorageService.setItem('psmList', this.psmList);
        }

        // 更新显示
        if (this.currentPsmId) {
            this.showFunctionList(this.currentPsmId);
        }
    }

    private escapeHtml(str: string): string {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    private openSettings(): void {
        const settingsModal = new SettingsModal(
            new PsmList(this.psmList as Psm[]),
            new RegionList(this.regionList)
        );

        settingsModal.onDataChange = (type: 'psm' | 'region', data: any[]) => {
            if (type === 'psm') {
                this.psmList = data as PsmItem[];
                this.showPsmList();
            } else if (type === 'region') {
                this.regionList = data as Region[];
                if (this.currentPsmId) {
                    this.showFunctionList(this.currentPsmId);
                }
            }
        };

        settingsModal.show();
    }

    private initializeBottomBar(): void {
        this.updateBottomBar();
        // 每分钟更新一次时间
        this.timeInterval = window.setInterval(() => {
            this.updateBottomBar();
        }, 60000);
    }

    private updateBottomBar(): void {
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

    private showLogIdCard(logId: string): void {
        const logIdItem: LogIdItem = {
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
                    const url = UrlService.buildUrl('logid', {
                        area: area,
                        region: region,
                        logId: logId
                    });

                    console.log('Generated LogID URL:', url);

                    if (url) {
                        try {
                            ExternalService.openUrl(url);
                        } catch (error) {
                            console.error('Failed to open URL:', error);
                        }
                    }
                }
            });
        });

        this.clearFocus();
    }

    private handleKeyboardNavigation(e: KeyboardEvent): void {
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
                } else {
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
                        } else {
                            this.focusNextRegion();
                        }
                    }
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (this.currentRegionIndex >= 0 && this.regionItems.length > 0) {
                    this.regionItems[this.currentRegionIndex].click();
                } else if (this.currentFocusIndex >= 0) {
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

    private initializeNavigation(): void {
        this.items = Array.from(this.listContainer.querySelectorAll('.list-item, .function-card'));
        if (this.items.length > 0 && this.currentFocusIndex === -1) {
            this.currentFocusIndex = 0;
            this.updateFocus();
        }
    }

    private initializeRegionNavigation(parentElement: HTMLElement): void {
        this.regionItems = Array.from(parentElement.querySelectorAll('.region-chip, .mini-region-icon, .logid-region'));
        if (this.regionItems.length > 0) {
            this.currentRegionIndex = -1;
        }
    }

    private focusNextItem(): void {
        if (this.items.length === 0) {
            this.initializeNavigation();
            return;
        }
        this.currentFocusIndex = (this.currentFocusIndex + 1) % this.items.length;
        this.updateFocus();
    }

    private focusPreviousItem(): void {
        if (this.items.length === 0) {
            this.initializeNavigation();
            return;
        }
        this.currentFocusIndex = (this.currentFocusIndex - 1 + this.items.length) % this.items.length;
        this.updateFocus();
    }

    private focusNextRegion(): void {
        if (this.regionItems.length === 0) return;
        this.currentRegionIndex = this.currentRegionIndex === -1 ? 
            0 : (this.currentRegionIndex + 1) % this.regionItems.length;
        this.updateRegionFocus();
    }

    private focusPreviousRegion(): void {
        if (this.regionItems.length === 0) return;
        this.currentRegionIndex = this.currentRegionIndex === -1 ? 
            0 : (this.currentRegionIndex - 1 + this.regionItems.length) % this.regionItems.length;
        this.updateRegionFocus();
    }

    private updateFocus(): void {
        this.items.forEach((item, index) => {
            if (index === this.currentFocusIndex) {
                item.classList.add('keyboard-focus');
                item.setAttribute('tabindex', '0');
                item.focus();
                // 不再自动初始化 region 导航
                this.clearRegionFocus();
            } else {
                item.classList.remove('keyboard-focus');
                item.setAttribute('tabindex', '-1');
            }
        });
    }

    private updateRegionFocus(): void {
        this.regionItems.forEach((item, index) => {
            if (index === this.currentRegionIndex) {
                item.classList.add('keyboard-focus');
                item.setAttribute('tabindex', '0');
                item.focus();
            } else {
                item.classList.remove('keyboard-focus');
                item.setAttribute('tabindex', '-1');
            }
        });
    }

    private clearFocus(): void {
        this.currentFocusIndex = -1;
        this.items.forEach(item => {
            item.classList.remove('keyboard-focus');
            item.setAttribute('tabindex', '-1');
        });
        this.clearRegionFocus();
    }

    private clearRegionFocus(): void {
        this.currentRegionIndex = -1;
        this.regionItems = [];
        this.regionItems.forEach(item => {
            item.classList.remove('keyboard-focus');
            item.setAttribute('tabindex', '-1');
        });
    }

    // 在组件销毁时清理定时器
    public destroy(): void {
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
    } catch (error) {
        console.error('Failed to initialize SearchApp:', error);
    }
});
