"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMarked = void 0;
const marked_1 = require("marked");
const highlight_js_1 = __importDefault(require("highlight.js"));
// 配置 marked
function configureMarked() {
    // 创建新的 marked 实例
    const renderer = new marked_1.marked.Renderer();
    // 重写代码块渲染
    renderer.code = (code, language) => {
        const validLanguage = language || 'plaintext';
        let highlightedCode;
        try {
            highlightedCode = highlight_js_1.default.highlight(code, {
                language: validLanguage,
            }).value;
        }
        catch (e) {
            console.error('Highlight error:', e);
            highlightedCode = highlight_js_1.default.highlightAuto(code).value;
        }
        return `<pre><code class="hljs language-${validLanguage}">${highlightedCode}</code></pre>`;
    };
    marked_1.marked.setOptions({
        renderer: renderer,
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false,
        sanitize: false,
        silent: false,
        langPrefix: 'hljs language-',
        highlight: function (code, lang) {
            console.log('highlight called:', { code, lang });
            if (lang && highlight_js_1.default.getLanguage(lang)) {
                try {
                    return highlight_js_1.default.highlight(code, {
                        language: lang,
                    }).value;
                }
                catch (e) {
                    console.error('Highlight.js error:', e);
                }
            }
            return highlight_js_1.default.highlightAuto(code).value;
        }
    });
}
exports.configureMarked = configureMarked;
