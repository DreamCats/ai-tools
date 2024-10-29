"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsmList = void 0;
class PsmList {
    constructor(items = []) {
        this.items = items;
    }
    add(psm) {
        this.items.push(psm);
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
    updateLastClickedFunction(psmId, functionTitle) {
        const psm = this.items.find(p => p.id === psmId);
        if (psm) {
            psm.lastClickedFunction = {
                title: functionTitle,
                timestamp: Date.now()
            };
        }
    }
}
exports.PsmList = PsmList;
