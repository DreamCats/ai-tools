import { marked } from 'marked';
import hljs from 'highlight.js';

// 扩展 marked 选项类型
declare module 'marked' {
    interface MarkedOptions {
        highlight?: (code: string, lang: string) => string;
        breaks?: boolean;
        gfm?: boolean;
    }
}

// 配置 marked
export function configureMarked(): void {
    marked.setOptions({
        highlight: (code: string, lang: string): string => {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });
}
