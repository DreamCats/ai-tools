"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalService = void 0;
class ExternalService {
    static openUrl(url) {
        try {
            utools.shellOpenExternal(url);
        }
        catch (error) {
            console.error('Failed to open external URL:', error);
            throw error;
        }
    }
}
exports.ExternalService = ExternalService;
