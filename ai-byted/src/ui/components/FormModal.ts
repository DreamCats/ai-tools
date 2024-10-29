export interface FormField {
    id: string;
    label: string;
    type: string;
    value?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    onChange?: (value: string) => void;
}

export class FormModal {
    private modal: HTMLElement;
    private onSubmit: (data: any) => void;
    private fields: FormField[];

    constructor(title: string, fields: FormField[], onSubmit: (data: any) => void) {
        this.fields = fields;
        this.onSubmit = onSubmit;
        this.modal = this.createModal(title);
    }

    private createModal(title: string): HTMLElement {
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

    private createField(field: FormField): string {
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
                                    value="${option.value}"
                                    ${field.value === option.value ? 'selected' : ''}
                                >
                                    <span class="material-icons">${option.value}</span>
                                    ${option.label}
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
                    ${field.value ? `value="${field.value}"` : ''}
                    ${field.required ? 'required' : ''}
                >
            </div>
        `;
    }

    private attachEventListeners(modal: HTMLElement): void {
        const form = modal.querySelector('form');
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');

        modal.querySelectorAll('select').forEach(select => {
            const field = this.fields.find(f => f.id === select.id);
            const onChange = field?.onChange;
            
            if (onChange) {
                select.addEventListener('change', (e) => {
                    const target = e.target as HTMLSelectElement;
                    onChange(target.value);
                });
            }
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            this.onSubmit(data);
            this.hide();
        });

        closeBtn?.addEventListener('click', () => this.hide());
        cancelBtn?.addEventListener('click', () => this.hide());
    }

    show(): void {
        document.body.appendChild(this.modal);
    }

    hide(): void {
        this.modal.remove();
    }
} 