import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../widgets/Sidebar/ui/Sidebar";
import ButtonsMenu from "../../widgets/ButtonsMenu/ui/ButtonsMenu";
import styles from './MainLayout.module.css'
import { useNotifications } from "../../features/notifications/lib/useNotifications";

export default function MainLayout() {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
        return <Navigate to="/signin" replace />;
    }
    useNotifications();

    const location = useLocation();

    const horizontalPages = [
        "/"
    ];

    const direction = horizontalPages.includes(location.pathname)
        ? "horizontal"
        : "vertical";

    return (
        <>
            <Sidebar />
            <main className={styles.container}>
                <Outlet />
            </main>
            <ButtonsMenu direction={direction} />
        </>
    );
}