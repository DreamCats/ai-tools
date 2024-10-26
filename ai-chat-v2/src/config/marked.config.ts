import { marked } from 'marked';
import hljs from 'highlight.js';

// 扩展 marked 选项类型
declare module 'marked' {
    interface MarkedOptions {
        highlight?: (code: string, lang: string) => string;
        breaks?: boolean;
        gfm?: boolean;
        headerIds?: boolean;
        mangle?: boolean;
        sanitize?: boolean;
        silent?: boolean;
        langPrefix?: string;
    }
}

// 配置 marked
export function configureMarked(): void {
    
    // 创建新的 marked 实例
    const renderer = new marked.Renderer();
    
    // 重写代码块渲染
    renderer.code = (code, language) => {
        const validLanguage = language || 'plaintext';
        let highlightedCode;
        
        try {
            highlightedCode = hljs.highlight(code, {
                language: validLanguage,
            }).value;
        } catch (e) {
            console.error('Highlight error:', e);
            highlightedCode = hljs.highlightAuto(code).value;
        }
        
        return `<pre><code class="hljs language-${validLanguage}">${highlightedCode}</code></pre>`;
    };

    marked.setOptions({
        renderer: renderer,
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false,
        sanitize: false,
        silent: false,
        langPrefix: 'hljs language-',
        highlight: function(code, lang) {
            console.log('highlight called:', { code, lang });
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { 
                        language: lang,
                    }).value;
                } catch (e) {
                    console.error('Highlight.js error:', e);
                }
            }
            return hljs.highlightAuto(code).value;
        }
    });
}

