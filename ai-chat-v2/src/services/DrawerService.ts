import { IStorage } from '../interfaces/storage';
import { DrawerItem, DrawerFilter, IDrawerService } from '../interfaces/drawer';
import { UToolsStorage } from './UToolsStorage';

export class DrawerService implements IDrawerService {
    private static instance: DrawerService;
    private storage: IStorage;
    private items: Map<string, DrawerItem>;
    private readonly STORAGE_KEY = 'drawer_items';

    private constructor(storage: IStorage) {
        this.storage = storage;
        this.items = new Map();
        this.loadFromStorage();
    }

    public static getInstance(): DrawerService {
        if (!DrawerService.instance) {
            DrawerService.instance = new DrawerService(UToolsStorage.getInstance());
        }
        return DrawerService.instance;
    }

    public getItems(filter?: DrawerFilter): DrawerItem[] {
        let items = Array.from(this.items.values());
        
        if (filter) {
            if (filter.text) {
                const searchText = filter.text.toLowerCase();
                items = items.filter(item => 
                    item.title.toLowerCase().includes(searchText) ||
                    item.content.toLowerCase().includes(searchText)
                );
            }
            
            if (filter.tags && filter.tags.length > 0) {
                items = items.filter(item =>
                    filter.tags!.some(tag => item.tags.includes(tag))
                );
            }
        }

        // 按更新时间降序排序
        return items.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    public getItem(id: string): DrawerItem | null {
        return this.items.get(id) || null;
    }

    public addItem(item: Omit<DrawerItem, 'id' | 'createdAt' | 'updatedAt'>): DrawerItem {
        const now = Date.now();
        const newItem: DrawerItem = {
            ...item,
            id: `drawer_${now}`,
            createdAt: now,
            updatedAt: now
        };
        
        this.items.set(newItem.id, newItem);
        this.saveToStorage();
        return newItem;
    }

    public updateItem(id: string, updates: Partial<Omit<DrawerItem, 'id' | 'createdAt'>>): boolean {
        const item = this.items.get(id);
        if (item) {
            const updatedItem: DrawerItem = {
                ...item,
                ...updates,
                updatedAt: Date.now()
            };
            this.items.set(id, updatedItem);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    public deleteItem(id: string): boolean {
        if (this.items.has(id)) {
            this.items.delete(id);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    private saveToStorage(): void {
        try {
            const items = Array.from(this.items.values());
            this.storage.setItem(this.STORAGE_KEY, items);
        } catch (error) {
            console.error('Failed to save drawer items:', error);
        }
    }

    private loadFromStorage(): void {
        try {
            const items = this.storage.getItem<DrawerItem[]>(this.STORAGE_KEY);
            if (items) {
                items.forEach(item => {
                    this.items.set(item.id, item);
                });
            }
        } catch (error) {
            console.error('Failed to load drawer items:', error);
        }
    }
}
