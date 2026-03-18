import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import styles from "./RoleSwitch.module.css";
import { SVG_ARROW_DOWN } from "../../../shared/ui/icons/icons";
import { switchRole } from "../../../features/auth/api/roleSwitch";

export default function RoleSwitch() {
    const [open, setOpen] = useState(false);

    const token = localStorage.getItem('access_token');
    const activeRole = localStorage.getItem('active_role') || "";

    if (!token) return null;

    let roles: string[] = [];
    try {
        const decoded: any = jwtDecode(token);
        roles = decoded.roles || [];
    } catch (e) {
        console.error("Token decode error", e);
    }

    if (roles.length <= 1) return null;

    const toggleDropdown = () => setOpen(!open);

    const selectRole = (role: string) => {
        if (role === activeRole) {
            setOpen(false);
            return;
        }
        switchRole(role)
        setOpen(false);
    };

    const roleLabels: Record<string, string> = {
        student: "Студент",
        teacher: "Викладач",
        administration: "Адмін",
        curator: "Куратор",
        parent: "Батько",
        founder: "Засновник"
    };

    return (
        <div className={styles.dropdownWrapper}>
            <div className={styles.dropdown} onClick={toggleDropdown}>
                <span className={styles.activeRoleLabel}>
                    {roleLabels[activeRole] || activeRole}
                </span>
                <div className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}>
                    {SVG_ARROW_DOWN}
                </div>
            </div>

            {open && (
                <ul className={styles.dropdownList}>
                    {roles.map((role) => (
                        <li
                            key={role}
                            className={`${styles.dropdownItem} ${role === activeRole ? styles.selected : ""}`}
                            onClick={() => selectRole(role)}
                        >
                            {roleLabels[role] || role}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}