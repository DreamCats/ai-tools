"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawerService = void 0;
const UToolsStorage_1 = require("./UToolsStorage");
class DrawerService {
    constructor(storage) {
        this.STORAGE_KEY = 'drawer_items';
        this.storage = storage;
        this.items = new Map();
        this.loadFromStorage();
    }
    static getInstance() {
        if (!DrawerService.instance) {
            DrawerService.instance = new DrawerService(UToolsStorage_1.UToolsStorage.getInstance());
        }
        return DrawerService.instance;
    }
    getItems(filter) {
        let items = Array.from(this.items.values());
        if (filter) {
            if (filter.text) {
                const searchText = filter.text.toLowerCase();
                items = items.filter(item => item.title.toLowerCase().includes(searchText) ||
                    item.content.toLowerCase().includes(searchText));
            }
            if (filter.tags && filter.tags.length > 0) {
                items = items.filter(item => filter.tags.some(tag => item.tags.includes(tag)));
            }
        }
        // 按更新时间降序排序
        return items.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    getItem(id) {
        return this.items.get(id) || null;
    }
    addItem(item) {
        const now = Date.now();
        const newItem = Object.assign(Object.assign({}, item), { id: `drawer_${now}`, createdAt: now, updatedAt: now });
        this.items.set(newItem.id, newItem);
        this.saveToStorage();
        return newItem;
    }
    updateItem(id, updates) {
        const item = this.items.get(id);
        if (item) {
            const updatedItem = Object.assign(Object.assign(Object.assign({}, item), updates), { updatedAt: Date.now() });
            this.items.set(id, updatedItem);
            this.saveToStorage();
            return true;
        }
        return false;
    }
    deleteItem(id) {
        if (this.items.has(id)) {
            this.items.delete(id);
            this.saveToStorage();
            return true;
        }
        return false;
    }
    saveToStorage() {
        try {
            const items = Array.from(this.items.values());
            this.storage.setItem(this.STORAGE_KEY, items);
        }
        catch (error) {
            console.error('Failed to save drawer items:', error);
        }
    }
    loadFromStorage() {
        try {
            const items = this.storage.getItem(this.STORAGE_KEY);
            if (items) {
                items.forEach(item => {
                    this.items.set(item.id, item);
                });
            }
        }
        catch (error) {
            console.error('Failed to load drawer items:', error);
        }
    }
}
exports.DrawerService = DrawerService;
