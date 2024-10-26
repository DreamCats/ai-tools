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
    marked_1.marked.setOptions({
        highlight: (code, lang) => {
            if (lang && highlight_js_1.default.getLanguage(lang)) {
                return highlight_js_1.default.highlight(code, { language: lang }).value;
            }
            return highlight_js_1.default.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });
}
exports.configureMarked = configureMarked;
