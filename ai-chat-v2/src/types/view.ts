export interface BaseView {
    render(container: HTMLElement): void;
    destroy?(): void;
}
