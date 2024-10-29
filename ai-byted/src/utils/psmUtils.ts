export function GetScmName(psmName: string): string {
    let name = psmName.replace(/\./g, "/")
    return name;
}