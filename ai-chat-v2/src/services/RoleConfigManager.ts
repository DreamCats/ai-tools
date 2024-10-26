import { IStorage } from '../interfaces/storage';
import { UToolsStorage } from './UToolsStorage';

export interface RoleConfig {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    isCustom: boolean;
}

export class RoleConfigManager {
    private static instance: RoleConfigManager;
    private roles: Map<string, RoleConfig>;
    private storage: IStorage;
    private readonly STORAGE_KEY = 'custom_roles';

    private constructor(storage: IStorage) {
        this.storage = storage;
        this.roles = new Map();
        this.initDefaultRoles();  // 先初始化默认角色
        this.loadFromStorage();   // 然后加载存储的自定义角色
    }

    public static getInstance(): RoleConfigManager {
        if (!RoleConfigManager.instance) {
            RoleConfigManager.instance = new RoleConfigManager(UToolsStorage.getInstance());
        }
        return RoleConfigManager.instance;
    }

    private initDefaultRoles(): void {
        const defaultRoles: RoleConfig[] = [
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

    public getRoleConfig(id: string): RoleConfig | undefined {
        return this.roles.get(id);
    }

    public getAllRoles(): RoleConfig[] {
        return Array.from(this.roles.values());
    }

    public addCustomRole(role: Omit<RoleConfig, 'id' | 'isCustom'>): string {
        const id = `custom_${Date.now()}`;
        const newRole: RoleConfig = {
            ...role,
            id,
            isCustom: true
        };
        this.roles.set(id, newRole);
        this.saveToStorage();
        return id;
    }

    public updateRole(id: string, updates: Partial<Omit<RoleConfig, 'id' | 'isCustom'>>): boolean {
        const role = this.roles.get(id);
        if (role && role.isCustom) {
            this.roles.set(id, { ...role, ...updates });
            this.saveToStorage();
            return true;
        }
        return false;
    }

    public deleteRole(id: string): boolean {
        const role = this.roles.get(id);
        if (role && role.isCustom) {
            this.roles.delete(id);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    private saveToStorage(): void {
        try {
            const customRoles = Array.from(this.roles.values())
                .filter(role => role.isCustom);
            console.log('Saving custom roles:', customRoles); // 添加日志
            this.storage.setItem(this.STORAGE_KEY, customRoles);
        } catch (error) {
            console.error('Failed to save custom roles:', error);
        }
    }

    private loadFromStorage(): void {
        try {
            const customRoles = this.storage.getItem<RoleConfig[]>(this.STORAGE_KEY);
            if (customRoles) {
                console.log('Loading custom roles:', customRoles); // 添加日志
                customRoles.forEach(role => {
                    if (role.id && role.name) {  // 确保必要的字段存在
                        this.roles.set(role.id, {
                            ...role,
                            isCustom: true  // 确保 isCustom 标记正确
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load custom roles:', error);
        }
    }

    // 添加一个方法来重新加载角色
    public reloadRoles(): void {
        this.roles.clear();
        this.initDefaultRoles();
        this.loadFromStorage();
    }
}
