import { AIRole } from '../types/openai';

export class RoleManager {
    private roles: Map<string, AIRole> = new Map();

    constructor() {
        this.initDefaultRoles();
    }

    private initDefaultRoles(): void {
        this.roles.set('assistant', {
            name: 'AI助手',
            systemPrompt: '你是一个有帮助的助手。'
        });

        this.roles.set('programmer', {
            name: '程序员',
            systemPrompt: '你是一个经验丰富的程序员，擅长编写清晰、简洁、可维护的代码。'
        });

        this.roles.set('translator', {
            name: '翻译官',
            systemPrompt: '你是一个专业的翻译官，精通多国语言，能够准确传达原文的含义和语气。'
        });
    }

    public getRole(roleId: string): AIRole | undefined {
        return this.roles.get(roleId);
    }

    public addRole(roleId: string, role: AIRole): void {
        this.roles.set(roleId, role);
    }

    public getAllRoles(): AIRole[] {
        return Array.from(this.roles.values());
    }
}
