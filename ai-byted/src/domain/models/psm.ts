export interface Psm {
    id: string;
    title: string;
    clicks: number;
    timestamp: number;
    lastClickedFunction?: {
        title: string;
        timestamp: number;
    };
}

export class PsmList {
    constructor(private items: Psm[] = []) {}

    add(psm: Psm): void {
        this.items.push(psm);
    }

    remove(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
    }

    update(id: string, updates: Partial<Psm>): void {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items[index] = { ...this.items[index], ...updates };
        }
    }

    getAll(): Psm[] {
        return [...this.items];
    }

    updateLastClickedFunction(psmId: string, functionTitle: string): void {
        const psm = this.items.find(p => p.id === psmId);
        if (psm) {
            psm.lastClickedFunction = {
                title: functionTitle,
                timestamp: Date.now()
            };
        }
    }
} 