"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetScmName = void 0;
function GetScmName(psmName) {
    let name = psmName.replace(/\./g, "/");
    return name;
}
exports.GetScmName = GetScmName;
