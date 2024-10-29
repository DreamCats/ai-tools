"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormModal = void 0;
class FormModal {
    constructor(title, fields, onSubmit) {
        this.fields = fields;
        this.onSubmit = onSubmit;
        this.modal = this.createModal(title);
    }
    createModal(title) {
        const modal = document.createElement('div');
        modal.className = 'form-modal';
        modal.innerHTML = `
            <div class="form-content">
                <div class="form-header">
                    <h3>${title}</h3>
                    <button class="close-btn material-icons">close</button>
                </div>
                <form class="form-body">
                    ${this.fields.map(field => this.createField(field)).join('')}
                    <div class="form-actions">
                        <button type="button" class="cancel-btn">取消</button>
                        <button type="submit" class="submit-btn">确定</button>
                    </div>
                </form>
            </div>
        `;
        this.attachEventListeners(modal);
        return modal;
    }
    createField(field) {
        if (field.type === 'select' && field.options) {
            return `
                <div class="form-field">
                    <label for="${field.id}">${field.label}</label>
                    <div class="select-wrapper">
                        <select 
                            id="${field.id}" 
                            name="${field.id}"
                            ${field.required ? 'required' : ''}
                        >
                            ${field.options.map(option => `
                                <option 
                                    value="${this.escapeHtml(option.value)}"
                                    ${field.value === option.value ? 'selected' : ''}
                                >
                                    ${this.escapeHtml(option.label)}
                                </option>
                            `).join('')}
                        </select>
                        <span class="material-icons select-arrow">expand_more</span>
                    </div>
                </div>
            `;
        }
        return `
            <div class="form-field">
                <label for="${field.id}">${field.label}</label>
                <input 
                    type="${field.type}" 
                    id="${field.id}" 
                    name="${field.id}"
                    ${field.value ? `value="${this.escapeHtml(field.value)}"` : ''}
                    ${field.required ? 'required' : ''}
                >
            </div>
        `;
    }
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    attachEventListeners(modal) {
        const form = modal.querySelector('form');
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        modal.querySelectorAll('select').forEach(select => {
            const field = this.fields.find(f => f.id === select.id);
            const onChange = field === null || field === void 0 ? void 0 : field.onChange;
            if (onChange) {
                select.addEventListener('change', (e) => {
                    const target = e.target;
                    onChange(target.value);
                });
            }
        });
        form === null || form === void 0 ? void 0 : form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            this.onSubmit(data);
            this.hide();
        });
        closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.addEventListener('click', () => this.hide());
        cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener('click', () => this.hide());
    }
    show() {
        document.body.appendChild(this.modal);
    }
    hide() {
        this.modal.remove();
    }
}
exports.FormModal = FormModal;
