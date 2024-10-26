export interface IStorage {
    setItem(key: string, value: any): void;
    getItem<T>(key: string): T | null;
    removeItem(key: string): void;
}
