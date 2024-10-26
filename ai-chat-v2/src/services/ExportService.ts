import { ChatMessage } from '../types/openai';

export interface ExportOptions {
    format: 'txt' | 'md' | 'docx';
    filename?: string;
}

export class ExportService {
    private static instance: ExportService;

    private constructor() {}

    public static getInstance(): ExportService {
        if (!ExportService.instance) {
            ExportService.instance = new ExportService();
        }
        return ExportService.instance;
    }

    public async exportChat(messages: ChatMessage[], options: ExportOptions): Promise<void> {
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
                await this.exportDocx(content, filename);
                break;
        }
    }

    private formatContent(messages: ChatMessage[]): string {
        return messages.map(msg => {
            const role = msg.role === 'user' ? '用户' : 
                        msg.role === 'assistant' ? 'AI' : '系统';
            return `### ${role}\n\n${msg.content}\n\n`;
        }).join('---\n\n');
    }

    private exportTxt(content: string, filename: string): void {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        this.downloadFile(blob, `${filename}.txt`);
    }

    private exportMarkdown(content: string, filename: string): void {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        this.downloadFile(blob, `${filename}.md`);
    }

    private async exportDocx(content: string, filename: string): Promise<void> {
        // 这里可以使用类似 docx.js 的库来生成 Word 文档
        // 为简单起见，这里先导出为带有 .docx 扩展名的文本文件
        const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        this.downloadFile(blob, `${filename}.docx`);
    }

    private downloadFile(blob: Blob, filename: string): void {
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
