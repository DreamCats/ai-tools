export interface DrawerItem {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
}

export interface DrawerFilter {
    text?: string;
    tags?: string[];
}

export interface IDrawerService {
    getItems(filter?: DrawerFilter): DrawerItem[];
    getItem(id: string): DrawerItem | null;
    addItem(item: Omit<DrawerItem, 'id' | 'createdAt' | 'updatedAt'>): DrawerItem;
    updateItem(id: string, updates: Partial<Omit<DrawerItem, 'id' | 'createdAt'>>): boolean;
    deleteItem(id: string): boolean;
}
