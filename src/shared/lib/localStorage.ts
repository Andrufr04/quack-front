export function isDark(): boolean {
    return localStorage.getItem("mode") == "dark"
}