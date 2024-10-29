export class ExternalService {
    static openUrl(url: string): void {
        try {
            utools.shellOpenExternal(url);
        } catch (error) {
            console.error('Failed to open external URL:', error);
            throw error;
        }
    }
} 