"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionList = void 0;
class RegionList {
    constructor(items = []) {
        this.items = items;
    }
    add(region) {
        this.items.push(region);
    }
    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
    }
    update(id, updates) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items[index] = { ...this.items[index], ...updates };
        }
    }
    getAll() {
        return [...this.items];
    }
    getRegionsByArea(area) {
        return this.items.filter(item => item.area === area);
    }
}
exports.RegionList = RegionList;
