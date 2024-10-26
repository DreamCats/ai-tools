"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UToolsStorage = void 0;
class UToolsStorage {
    constructor() { }
    static getInstance() {
        if (!UToolsStorage.instance) {
            UToolsStorage.instance = new UToolsStorage();
        }
        return UToolsStorage.instance;
    }
    setItem(key, value) {
        try {
            window.utools.dbStorage.setItem(key, value);
        }
        catch (error) {
            console.error('Storage setItem error:', error);
            throw new Error('Failed to set item in storage');
        }
    }
    getItem(key) {
        try {
            const value = window.utools.dbStorage.getItem(key);
            return value;
        }
        catch (error) {
            console.error('Storage getItem error:', error);
            return null;
        }
    }
    removeItem(key) {
        try {
            window.utools.dbStorage.removeItem(key);
        }
        catch (error) {
            console.error('Storage removeItem error:', error);
            throw new Error('Failed to remove item from storage');
        }
    }
}
exports.UToolsStorage = UToolsStorage;
