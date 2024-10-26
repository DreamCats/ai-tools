"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleConfigDialog = void 0;
const RoleConfigManager_1 = require("../services/RoleConfigManager");
class RoleConfigDialog {
    constructor(onUpdate) {
        this.roleManager = RoleConfigManager_1.RoleConfigManager.getInstance();
        this.onUpdate = onUpdate;
        this.dialog = this.createDialog();
        document.body.appendChild(this.dialog);
    }
    createDialog() {
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
    bindDialogEvents(dialog) {
        const closeBtn = dialog.querySelector('#closeDialog');
        const addBtn = dialog.querySelector('#addRole');
        closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.addEventListener('click', () => this.close());
        addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener('click', () => this.showAddRoleForm());
        // 点击外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog)
                this.close();
        });
    }
    renderRoleList() {
        const roleList = this.dialog.querySelector('.role-list');
        if (!roleList)
            return;
        roleList.innerHTML = '';
        this.roleManager.getAllRoles().forEach(role => {
            const roleElement = this.createRoleElement(role);
            roleList.appendChild(roleElement);
        });
    }
    createRoleElement(role) {
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
            editBtn === null || editBtn === void 0 ? void 0 : editBtn.addEventListener('click', () => this.showEditRoleForm(role));
            deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.addEventListener('click', () => this.deleteRole(role.id));
        }
        return div;
    }
    showAddRoleForm() {
        this.showRoleForm();
    }
    showEditRoleForm(role) {
        this.showRoleForm(role);
    }
    showRoleForm(role) {
        const form = document.createElement('div');
        form.className = 'role-form';
        form.innerHTML = `
            <h3>${role ? '编辑角色' : '添加角色'}</h3>
            <input type="text" id="roleName" placeholder="角色名称" value="${(role === null || role === void 0 ? void 0 : role.name) || ''}">
            <input type="text" id="roleDescription" placeholder="角色描述" value="${(role === null || role === void 0 ? void 0 : role.description) || ''}">
            <textarea id="rolePrompt" placeholder="系统提示词">${(role === null || role === void 0 ? void 0 : role.systemPrompt) || ''}</textarea>
            <div class="form-actions">
                <button class="secondary-btn" id="cancelForm">取消</button>
                <button class="primary-btn" id="saveRole">保存</button>
            </div>
        `;
        const currentContent = this.dialog.querySelector('.dialog-content');
        currentContent === null || currentContent === void 0 ? void 0 : currentContent.classList.add('hide');
        this.dialog.appendChild(form);
        const cancelBtn = form.querySelector('#cancelForm');
        const saveBtn = form.querySelector('#saveRole');
        cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener('click', () => {
            form.remove();
            currentContent === null || currentContent === void 0 ? void 0 : currentContent.classList.remove('hide');
        });
        saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.addEventListener('click', () => {
            const name = form.querySelector('#roleName').value;
            const description = form.querySelector('#roleDescription').value;
            const systemPrompt = form.querySelector('#rolePrompt').value;
            if (role) {
                this.roleManager.updateRole(role.id, { name, description, systemPrompt });
            }
            else {
                this.roleManager.addCustomRole({ name, description, systemPrompt });
            }
            form.remove();
            currentContent === null || currentContent === void 0 ? void 0 : currentContent.classList.remove('hide');
            this.renderRoleList();
            this.onUpdate();
        });
    }
    deleteRole(id) {
        if (confirm('确定要删除这个角色吗？')) {
            this.roleManager.deleteRole(id);
            this.renderRoleList();
            this.onUpdate();
        }
    }
    show() {
        this.renderRoleList();
        this.dialog.showModal();
    }
    close() {
        this.dialog.close();
    }
}
exports.RoleConfigDialog = RoleConfigDialog;
