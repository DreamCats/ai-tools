import { IStorage } from '../interfaces/storage';

export class UToolsStorage implements IStorage {
    private static instance: UToolsStorage;

    private constructor() {}

    public static getInstance(): UToolsStorage {
        if (!UToolsStorage.instance) {
            UToolsStorage.instance = new UToolsStorage();
        }
        return UToolsStorage.instance;
    }

    public setItem(key: string, value: any): void {
        try {
            window.utools.dbStorage.setItem(key, value);
        } catch (error) {
            console.error('Storage setItem error:', error);
            throw new Error('Failed to set item in storage');
        }
    }

    public getItem<T>(key: string): T | null {
        try {
            const value = window.utools.dbStorage.getItem(key);
            return value as T;
        } catch (error) {
            console.error('Storage getItem error:', error);
            return null;
        }
    }

    public removeItem(key: string): void {
        try {
            window.utools.dbStorage.removeItem(key);
        } catch (error) {
            console.error('Storage removeItem error:', error);
            throw new Error('Failed to remove item from storage');
        }
    }
}
