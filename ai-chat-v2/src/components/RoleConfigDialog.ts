import { RoleConfig, RoleConfigManager } from '../services/RoleConfigManager';

export class RoleConfigDialog {
    private dialog: HTMLDialogElement;
    private roleManager: RoleConfigManager;
    private onUpdate: () => void;

    constructor(onUpdate: () => void) {
        this.roleManager = RoleConfigManager.getInstance();
        this.onUpdate = onUpdate;
        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);
    }

    private createDialog(): HTMLDialogElement {
        const dialog = document.createElement('dialog');
        dialog.className = 'role-config-dialog glass-effect';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h2>角色配置</h2>
                <div class="role-list"></div>
                <div class="dialog-actions">
                    <button class="secondary-btn" id="addRole">
                        <span class="material-icons">add</span>
                        添加角色
                    </button>
                    <button class="primary-btn" id="closeDialog">关闭</button>
                </div>
            </div>
        `;

        this.bindDialogEvents(dialog);
        return dialog;
    }

    private bindDialogEvents(dialog: HTMLDialogElement): void {
        const closeBtn = dialog.querySelector('#closeDialog');
        const addBtn = dialog.querySelector('#addRole');

        closeBtn?.addEventListener('click', () => this.close());
        addBtn?.addEventListener('click', () => this.showAddRoleForm());

        // 点击外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) this.close();
        });
    }

    private renderRoleList(): void {
        const roleList = this.dialog.querySelector('.role-list');
        if (!roleList) return;

        roleList.innerHTML = '';
        this.roleManager.getAllRoles().forEach(role => {
            const roleElement = this.createRoleElement(role);
            roleList.appendChild(roleElement);
        });
    }

    private createRoleElement(role: RoleConfig): HTMLElement {
        const div = document.createElement('div');
        div.className = 'role-item';
        div.innerHTML = `
            <div class="role-info">
                <h3>${role.name}</h3>
                <p>${role.description}</p>
            </div>
            ${role.isCustom ? `
                <div class="role-actions">
                    <button class="icon-btn small edit-role" title="编辑">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="icon-btn small delete-role" title="删除">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            ` : ''}
        `;

        if (role.isCustom) {
            const editBtn = div.querySelector('.edit-role');
            const deleteBtn = div.querySelector('.delete-role');

            editBtn?.addEventListener('click', () => this.showEditRoleForm(role));
            deleteBtn?.addEventListener('click', () => this.deleteRole(role.id));
        }

        return div;
    }

    private showAddRoleForm(): void {
        this.showRoleForm();
    }

    private showEditRoleForm(role: RoleConfig): void {
        this.showRoleForm(role);
    }

    private showRoleForm(role?: RoleConfig): void {
        const form = document.createElement('div');
        form.className = 'role-form';
        form.innerHTML = `
            <h3>${role ? '编辑角色' : '添加角色'}</h3>
            <input type="text" id="roleName" placeholder="角色名称" value="${role?.name || ''}">
            <input type="text" id="roleDescription" placeholder="角色描述" value="${role?.description || ''}">
            <textarea id="rolePrompt" placeholder="系统提示词">${role?.systemPrompt || ''}</textarea>
            <div class="form-actions">
                <button class="secondary-btn" id="cancelForm">取消</button>
                <button class="primary-btn" id="saveRole">保存</button>
            </div>
        `;

        const currentContent = this.dialog.querySelector('.dialog-content');
        currentContent?.classList.add('hide');
        this.dialog.appendChild(form);

        const cancelBtn = form.querySelector('#cancelForm');
        const saveBtn = form.querySelector('#saveRole');

        cancelBtn?.addEventListener('click', () => {
            form.remove();
            currentContent?.classList.remove('hide');
        });

        saveBtn?.addEventListener('click', () => {
            const name = (form.querySelector('#roleName') as HTMLInputElement).value;
            const description = (form.querySelector('#roleDescription') as HTMLInputElement).value;
            const systemPrompt = (form.querySelector('#rolePrompt') as HTMLTextAreaElement).value;

            if (role) {
                this.roleManager.updateRole(role.id, { name, description, systemPrompt });
            } else {
                this.roleManager.addCustomRole({ name, description, systemPrompt });
            }

            form.remove();
            currentContent?.classList.remove('hide');
            this.renderRoleList();
            this.onUpdate();
        });
    }

    private deleteRole(id: string): void {
        if (confirm('确定要删除这个角色吗？')) {
            this.roleManager.deleteRole(id);
            this.renderRoleList();
            this.onUpdate();
        }
    }

    public show(): void {
        this.renderRoleList();
        this.dialog.showModal();
    }

    public close(): void {
        this.dialog.close();
    }
}
