export class StorageService {
    static setItem(key: string, value: any): void {
        try {
            utools.dbStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
            throw error;
        }
    }

    static getItem<T>(key: string): T | null {
        try {
            const value = utools.dbStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Failed to get ${key}:`, error);
            throw error;
        }
    }

    static removeItem(key: string): void {
        try {
            utools.dbStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
            throw error;
        }
    }
} 