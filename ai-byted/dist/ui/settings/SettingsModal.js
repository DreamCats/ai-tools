"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModal = void 0;
const FormModal_1 = require("../components/FormModal");
const StorageService_1 = require("../../services/StorageService");
const area_1 = require("../../domain/constants/area");
class SettingsModal {
    constructor(psmList, regionList) {
        this.MATERIAL_ICONS = [
            // 亚洲
            { value: 'flag', label: '中国' },
            { value: 'flight_takeoff', label: '新加坡' },
            { value: 'flight_land', label: '日本' },
            { value: 'navigation', label: '韩国' },
            { value: 'temple_buddhist', label: '泰国' },
            { value: 'mosque', label: '马来西亚' },
            { value: 'temple_hindu', label: '印度' },
            { value: 'landscape', label: '越南' },
            // 欧洲
            { value: 'explore', label: '德国' },
            { value: 'near_me', label: '英国' },
            { value: 'castle', label: '法国' },
            { value: 'church', label: '意大利' },
            { value: 'cottage', label: '荷兰' },
            { value: 'villa', label: '西班牙' },
            { value: 'apartment', label: '瑞士' },
            { value: 'holiday_village', label: '瑞典' },
            { value: 'gite', label: '挪威' },
            { value: 'cabin', label: '芬兰' },
            // 美洲
            { value: 'language', label: '美国' },
            { value: 'my_location', label: '加拿大' },
            { value: 'festival', label: '墨西哥' },
            { value: 'forest', label: '巴西' },
            { value: 'volcano', label: '智利' },
            { value: 'mountain', label: '阿根廷' },
            // 大洋洲
            { value: 'place', label: '澳大利亚' },
            { value: 'beach_access', label: '新西兰' },
            { value: 'waves', label: '斐济' },
            // 非洲
            { value: 'safari', label: '南非' },
            { value: 'terrain', label: '埃及' },
            { value: 'grass', label: '肯尼亚' },
            // 其他
            { value: 'public', label: '全球' },
            { value: 'cloud', label: '国际' },
            { value: 'hub', label: '通用' }
        ];
        this.psmList = psmList;
        this.regionList = regionList;
        this.modal = this.createModal();
    }
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h2>设置</h2>
                    <button class="close-btn material-icons">close</button>
                </div>
                <div class="settings-body">
                    <div class="settings-section">
                        <h3>PSM 列表</h3>
                        <div class="psm-list"></div>
                        <button class="add-psm-btn">添加 PSM</button>
                    </div>
                    <div class="settings-section">
                        <h3>Region 列表</h3>
                        <div class="region-list"></div>
                        <button class="add-region-btn">添加 Region</button>
                    </div>
                    <div class="settings-section">
                        <h3>其他设置</h3>
                        <label class="setting-item">
                            <span>PSM 补全功能</span>
                            <input type="checkbox" id="psmAutoComplete">
                        </label>
                        <label class="setting-item">
                            <span>搜索结果数量限制</span>
                            <input type="number" id="searchLimit" value="20" min="1" max="100">
                        </label>
                    </div>
                </div>
            </div>
        `;
        this.attachEventListeners(modal);
        return modal;
    }
    attachEventListeners(modal) {
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.addEventListener('click', () => this.hide());
        // PSM 相关事件
        const addPsmBtn = modal.querySelector('.add-psm-btn');
        addPsmBtn === null || addPsmBtn === void 0 ? void 0 : addPsmBtn.addEventListener('click', () => this.showAddPsmForm());
        // Region 相关事件
        const addRegionBtn = modal.querySelector('.add-region-btn');
        addRegionBtn === null || addRegionBtn === void 0 ? void 0 : addRegionBtn.addEventListener('click', () => this.showAddRegionForm());
    }
    show() {
        document.body.appendChild(this.modal);
        this.renderLists();
        this.attachItemEventListeners();
    }
    hide() {
        this.modal.remove();
    }
    renderLists() {
        this.renderPsmList();
        this.renderRegionList();
    }
    renderPsmList() {
        const psmListElement = this.modal.querySelector('.psm-list');
        if (!psmListElement)
            return;
        const psms = this.psmList.getAll();
        psmListElement.innerHTML = psms.map(psm => `
            <div class="list-item" data-id="${psm.id}">
                <span>${psm.title}</span>
                <div class="item-actions">
                    <button class="edit-btn material-icons">edit</button>
                    <button class="delete-btn material-icons">delete</button>
                </div>
            </div>
        `).join('');
        this.attachItemEventListeners();
    }
    renderRegionList() {
        const regionListElement = this.modal.querySelector('.region-list');
        if (!regionListElement)
            return;
        const regions = this.regionList.getAll();
        regionListElement.innerHTML = regions.map(region => `
            <div class="list-item" data-id="${region.id}">
                <span>${region.name}</span>
                <div class="item-actions">
                    <button class="edit-btn material-icons">edit</button>
                    <button class="delete-btn material-icons">delete</button>
                </div>
            </div>
        `).join('');
        this.attachItemEventListeners();
    }
    showAddPsmForm() {
        const fields = [
            { id: 'title', label: 'PSM 名称', type: 'text', required: true }
        ];
        const formModal = new FormModal_1.FormModal('添加 PSM', fields, (data) => {
            var _a;
            const exists = this.psmList.getAll().some(psm => psm.title.toLowerCase() === data.title.toLowerCase());
            if (exists) {
                alert(`PSM "${data.title}" 已存在`);
                return;
            }
            const newPsm = {
                id: this.generateId(),
                title: data.title,
                clicks: 0,
                timestamp: Date.now()
            };
            this.psmList.add(newPsm);
            StorageService_1.StorageService.setItem('psmList', this.psmList.getAll());
            this.renderPsmList();
            (_a = this.onDataChange) === null || _a === void 0 ? void 0 : _a.call(this, 'psm', this.psmList.getAll());
        });
        formModal.show();
    }
    showEditPsmForm(psm) {
        const fields = [
            { id: 'title', label: 'PSM 名称', type: 'text', value: psm.title, required: true }
        ];
        const formModal = new FormModal_1.FormModal('编辑 PSM', fields, (data) => {
            var _a;
            const exists = this.psmList.getAll().some(p => p.id !== psm.id && p.title.toLowerCase() === data.title.toLowerCase());
            if (exists) {
                alert(`PSM "${data.title}" 已存在`);
                return;
            }
            this.psmList.update(psm.id, { ...psm, title: data.title });
            StorageService_1.StorageService.setItem('psmList', this.psmList.getAll());
            this.renderPsmList();
            (_a = this.onDataChange) === null || _a === void 0 ? void 0 : _a.call(this, 'psm', this.psmList.getAll());
        });
        formModal.show();
    }
    showAddRegionForm() {
        const existingRegions = new Set(this.regionList.getAll().map(r => r.name));
        const fields = [
            {
                id: 'area',
                label: '区域',
                type: 'select',
                required: true,
                options: Object.entries(area_1.AreaLabels).map(([value, label]) => ({
                    value,
                    label
                })),
                onChange: (value) => this.updateRegionOptions(value, existingRegions)
            },
            {
                id: 'name',
                label: 'Region 名称',
                type: 'select',
                required: true,
                options: this.getAvailableRegions(area_1.Area.CN, existingRegions)
            },
            {
                id: 'icon',
                label: 'Material Icon',
                type: 'select',
                required: true,
                options: this.MATERIAL_ICONS
            }
        ];
        const formModal = new FormModal_1.FormModal('添加 Region', fields, (data) => {
            var _a;
            const newRegion = {
                id: this.generateId(),
                name: data.name,
                icon: data.icon,
                area: data.area
            };
            this.regionList.add(newRegion);
            StorageService_1.StorageService.setItem('regionList', this.regionList.getAll());
            this.renderRegionList();
            (_a = this.onDataChange) === null || _a === void 0 ? void 0 : _a.call(this, 'region', this.regionList.getAll());
        });
        formModal.show();
    }
    getAvailableRegions(area, existingRegions) {
        return area_1.RegionsByArea[area]
            .filter(region => !existingRegions.has(region))
            .map(region => ({
            value: region,
            label: region
        }));
    }
    updateRegionOptions(area, existingRegions) {
        const regionSelect = document.getElementById('name');
        if (!regionSelect)
            return;
        const availableRegions = this.getAvailableRegions(area, existingRegions);
        regionSelect.innerHTML = availableRegions
            .map(region => `
                <option value="${region.value}">${region.label}</option>
            `).join('');
    }
    showEditRegionForm(region) {
        const existingRegions = new Set(this.regionList.getAll()
            .filter(r => r.id !== region.id)
            .map(r => r.name));
        const fields = [
            {
                id: 'area',
                label: '区域',
                type: 'select',
                value: region.area,
                required: true,
                options: Object.entries(area_1.AreaLabels).map(([value, label]) => ({
                    value,
                    label
                })),
                onChange: (value) => this.updateRegionOptions(value, existingRegions)
            },
            {
                id: 'name',
                label: 'Region 名称',
                type: 'select',
                value: region.name,
                required: true,
                options: [
                    { value: region.name, label: region.name },
                    ...this.getAvailableRegions(region.area, existingRegions)
                ]
            },
            {
                id: 'icon',
                label: 'Material Icon',
                type: 'select',
                value: region.icon,
                required: true,
                options: this.MATERIAL_ICONS
            }
        ];
        const formModal = new FormModal_1.FormModal('编辑 Region', fields, (data) => {
            var _a;
            this.regionList.update(region.id, { ...region, ...data, area: data.area });
            StorageService_1.StorageService.setItem('regionList', this.regionList.getAll());
            this.renderRegionList();
            (_a = this.onDataChange) === null || _a === void 0 ? void 0 : _a.call(this, 'region', this.regionList.getAll());
        });
        formModal.show();
    }
    attachItemEventListeners() {
        const oldButtons = this.modal.querySelectorAll('.edit-btn, .delete-btn');
        oldButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        this.modal.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.list-item');
                if (!item)
                    return;
                const id = item.getAttribute('data-id');
                if (!id)
                    return;
                const psm = this.psmList.getAll().find(p => p.id === id);
                const region = this.regionList.getAll().find(r => r.id === id);
                if (psm) {
                    this.showEditPsmForm(psm);
                }
                else if (region) {
                    this.showEditRegionForm(region);
                }
            });
        });
        this.modal.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                var _a, _b;
                e.stopPropagation();
                const item = e.target.closest('.list-item');
                if (!item)
                    return;
                const id = item.getAttribute('data-id');
                if (!id)
                    return;
                if (confirm('确定要删除吗？')) {
                    if (this.psmList.getAll().some(p => p.id === id)) {
                        this.psmList.remove(id);
                        StorageService_1.StorageService.setItem('psmList', this.psmList.getAll());
                        this.renderPsmList();
                        (_a = this.onDataChange) === null || _a === void 0 ? void 0 : _a.call(this, 'psm', this.psmList.getAll());
                    }
                    else {
                        this.regionList.remove(id);
                        StorageService_1.StorageService.setItem('regionList', this.regionList.getAll());
                        this.renderRegionList();
                        (_b = this.onDataChange) === null || _b === void 0 ? void 0 : _b.call(this, 'region', this.regionList.getAll());
                    }
                }
            });
        });
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
exports.SettingsModal = SettingsModal;
