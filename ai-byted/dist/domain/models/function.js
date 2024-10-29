"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionList = exports.DEFAULT_REGION = void 0;
const functions_1 = require("../constants/functions");
// 添加默认的中国区域配置
exports.DEFAULT_REGION = {
    id: 'China-North',
    name: 'China-North',
    icon: 'flag'
};
class FunctionList {
    constructor(items = []) {
        this.items = items;
    }
    add(func) {
        this.items.push(func);
    }
    getByPsmId(psmId) {
        return this.items.filter(item => item.psmId === psmId);
    }
    incrementClicks(id) {
        const func = this.items.find(item => item.id === id);
        if (func) {
            func.clicks += 1;
            func.timestamp = Date.now();
        }
    }
    initializeForPsm(psmId) {
        // 检查是否已经初始化
        const existingFunctions = this.getByPsmId(psmId);
        if (existingFunctions.length === 0) {
            // 为新的 PSM 添加预置功能
            functions_1.PRESET_FUNCTIONS.forEach((preset) => {
                this.add({
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    title: preset.title,
                    description: preset.description,
                    psmId: psmId,
                    clicks: 0,
                    timestamp: Date.now()
                });
            });
        }
    }
    update(id, updates) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items[index] = { ...this.items[index], ...updates };
        }
    }
    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
    }
    getAll() {
        return [...this.items];
    }
}
exports.FunctionList = FunctionList;
