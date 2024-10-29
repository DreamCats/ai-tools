"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
class StorageService {
    static setItem(key, value) {
        try {
            utools.dbStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error(`Failed to save ${key}:`, error);
            throw error;
        }
    }
    static getItem(key) {
        try {
            const value = utools.dbStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error(`Failed to get ${key}:`, error);
            throw error;
        }
    }
    static removeItem(key) {
        try {
            utools.dbStorage.removeItem(key);
        }
        catch (error) {
            console.error(`Failed to remove ${key}:`, error);
            throw error;
        }
    }
}
exports.StorageService = StorageService;
