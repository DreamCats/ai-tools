import { Area } from '../constants/area';

export interface Region {
    id: string;
    name: string;
    icon: string;
    area: Area;
}

export class RegionList {
    constructor(private items: Region[] = []) {}

    add(region: Region): void {
        this.items.push(region);
    }

    remove(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
    }

    update(id: string, updates: Partial<Region>): void {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items[index] = { ...this.items[index], ...updates };
        }
    }

    getAll(): Region[] {
        return [...this.items];
    }

    getRegionsByArea(area: Area): Region[] {
        return this.items.filter(item => item.area === area);
    }
} 