import { PRESET_FUNCTIONS, PresetFunction } from '../constants/functions';

export interface Function {
    id: string;
    title: string;
    psmId: string;
    clicks: number;
    timestamp: number;
    description?: string;
    showRegions?: boolean;
}

// 添加默认的中国区域配置
export const DEFAULT_REGION = {
    id: 'China-North',
    name: 'China-North',
    icon: 'flag'
};

export class FunctionList {
    constructor(private items: Function[] = []) {}

    add(func: Function): void {
        this.items.push(func);
    }

    getByPsmId(psmId: string): Function[] {
        return this.items.filter(item => item.psmId === psmId);
    }

    incrementClicks(id: string): void {
        const func = this.items.find(item => item.id === id);
        if (func) {
            func.clicks += 1;
            func.timestamp = Date.now();
        }
    }

    initializeForPsm(psmId: string): void {
        // 检查是否已经初始化
        const existingFunctions = this.getByPsmId(psmId);
        if (existingFunctions.length === 0) {
            // 为新的 PSM 添加预置功能
            PRESET_FUNCTIONS.forEach((preset: PresetFunction) => {
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

    update(id: string, updates: Partial<Function>): void {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items[index] = { ...this.items[index], ...updates };
        }
    }

    remove(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
    }

    getAll(): Function[] {
        return [...this.items];
    }
} 