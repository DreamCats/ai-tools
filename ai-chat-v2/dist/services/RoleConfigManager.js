"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleConfigManager = void 0;
const UToolsStorage_1 = require("./UToolsStorage");
class RoleConfigManager {
    constructor(storage) {
        this.STORAGE_KEY = 'custom_roles';
        this.storage = storage;
        this.roles = new Map();
        this.initDefaultRoles(); // 先初始化默认角色
        this.loadFromStorage(); // 然后加载存储的自定义角色
    }
    static getInstance() {
        if (!RoleConfigManager.instance) {
            RoleConfigManager.instance = new RoleConfigManager(UToolsStorage_1.UToolsStorage.getInstance());
        }
        return RoleConfigManager.instance;
    }
    initDefaultRoles() {
        const defaultRoles = [
            {
                id: 'assistant',
                name: 'AI助手',
                description: '通用AI助手',
                systemPrompt: '你是一个有帮助的助手。',
                isCustom: false
            },
            {
                id: 'programmer',
                name: '程序员',
                description: '编程专家',
                systemPrompt: '你是一个经验丰富的程序员，擅长代码开发和问题解决。',
                isCustom: false
            },
            {
                id: 'translator',
                name: '翻译官',
                description: '语言翻译专家',
                systemPrompt: '你是一个专业的翻译官，精通多种语言的互译。',
                isCustom: false
            }
        ];
        defaultRoles.forEach(role => {
            this.roles.set(role.id, role);
        });
    }
    getRoleConfig(id) {
        return this.roles.get(id);
    }
    getAllRoles() {
        return Array.from(this.roles.values());
    }
    addCustomRole(role) {
        const id = `custom_${Date.now()}`;
        const newRole = Object.assign(Object.assign({}, role), { id, isCustom: true });
        this.roles.set(id, newRole);
        this.saveToStorage();
        return id;
    }
    updateRole(id, updates) {
        const role = this.roles.get(id);
        if (role && role.isCustom) {
            this.roles.set(id, Object.assign(Object.assign({}, role), updates));
            this.saveToStorage();
            return true;
        }
        return false;
    }
    deleteRole(id) {
        const role = this.roles.get(id);
        if (role && role.isCustom) {
            this.roles.delete(id);
            this.saveToStorage();
            return true;
        }
        return false;
    }
    saveToStorage() {
        try {
            const customRoles = Array.from(this.roles.values())
                .filter(role => role.isCustom);
            console.log('Saving custom roles:', customRoles); // 添加日志
            this.storage.setItem(this.STORAGE_KEY, customRoles);
        }
        catch (error) {
            console.error('Failed to save custom roles:', error);
        }
    }
    loadFromStorage() {
        try {
            const customRoles = this.storage.getItem(this.STORAGE_KEY);
            if (customRoles) {
                console.log('Loading custom roles:', customRoles); // 添加日志
                customRoles.forEach(role => {
                    if (role.id && role.name) { // 确保必要的字段存在
                        this.roles.set(role.id, Object.assign(Object.assign({}, role), { isCustom: true // 确保 isCustom 标记正确
                         }));
                    }
                });
            }
        }
        catch (error) {
            console.error('Failed to load custom roles:', error);
        }
    }
    // 添加一个方法来重新加载角色
    reloadRoles() {
        this.roles.clear();
        this.initDefaultRoles();
        this.loadFromStorage();
    }
}
exports.RoleConfigManager = RoleConfigManager;
