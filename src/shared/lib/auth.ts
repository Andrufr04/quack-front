export const hasRole = (role: string): boolean => {
    const rolesRaw = localStorage.getItem("user_roles");
    if (!rolesRaw) return false;
    const roles: string[] = JSON.parse(rolesRaw);
    return roles.includes(role);
};