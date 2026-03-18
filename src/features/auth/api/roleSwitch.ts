import { jwtDecode } from "jwt-decode";

export const switchRole = (newRole: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const decoded: any = jwtDecode(token);
        const roles = decoded.roles || [];

        if (roles.includes(newRole)) {
            localStorage.setItem("active_role", newRole);
            
            window.location.href = '/';
        } else {
            // console.error("User doesn't have this role");
        }
    } catch (e) {
        console.error("Switch role failed", e);
    }
};