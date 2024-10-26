"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
class ExportService {
    constructor() { }
    static getInstance() {
        if (!ExportService.instance) {
            ExportService.instance = new ExportService();
        }
        return ExportService.instance;
    }
    exportChat(messages, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = this.formatContent(messages);
            const filename = options.filename || `chat_export_${new Date().toISOString().slice(0, 10)}`;
            switch (options.format) {
                case 'txt':
                    this.exportTxt(content, filename);
                    break;
                case 'md':
                    this.exportMarkdown(content, filename);
                    break;
                case 'docx':
                    yield this.exportDocx(content, filename);
                    break;
            }
        });
    }
    formatContent(messages) {
        return messages.map(msg => {
            const role = msg.role === 'user' ? '用户' :
                msg.role === 'assistant' ? 'AI' : '系统';
            return `### ${role}\n\n${msg.content}\n\n`;
        }).join('---\n\n');
    }
    exportTxt(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        this.downloadFile(blob, `${filename}.txt`);
    }
    exportMarkdown(content, filename) {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        this.downloadFile(blob, `${filename}.md`);
    }
    exportDocx(content, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            // 这里可以使用类似 docx.js 的库来生成 Word 文档
            // 为简单起见，这里先导出为带有 .docx 扩展名的文本文件
            const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            this.downloadFile(blob, `${filename}.docx`);
        });
    }
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
exports.ExportService = ExportService;
