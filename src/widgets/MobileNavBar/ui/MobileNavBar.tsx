import { useLocation, useNavigate } from "react-router-dom"
import style from "./MobileNavBar.module.css"
import { 
    navigationButtonsAdministration, 
    navigationButtonsCurator, 
    navigationButtonsStudent, 
    navigationButtonsTeacher, 
    settingsButtons 
} from "../../../shared/config/sidebarConfig"
import { isAdministration, isCurator, isStudent, isTeacher } from "../../../entities/session/lib/jwt"

export default function MobileNavBar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Отримуємо правильні кнопки залежно від ролі
    const getButtons = () => {
        if (isStudent()) return navigationButtonsStudent;
        if (isTeacher()) return navigationButtonsTeacher;
        if (isAdministration()) return navigationButtonsAdministration;
        if (isCurator()) return navigationButtonsCurator;
        return [];
    }

    const buttons = getButtons();

    const onSignOut = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('active_role')
        navigate("/signin")
    }

    return (
        <nav className={style.navbar}>
            <div className={style.icons}>
                {/* Основні сторінки */}
                {buttons.map(b => (
                    <div 
                        key={b.text} 
                        // Якщо ми на цій сторінці, додаємо клас active для підсвітки
                        className={`${style.navItem} ${location.pathname === b.slug ? style.active : ""}`}
                        onClick={() => navigate(b.slug)}
                    >
                        <div className={style.icon}>{b.icon}</div>
                    </div>
                ))}
                
                {/* Вертикальна лінія-розділювач */}
                <div className={style.divider}></div>

                {/* Налаштування */}
                <div 
                    className={`${style.navItem} ${location.pathname === settingsButtons[0].slug ? style.active : ""}`}
                    onClick={() => navigate(settingsButtons[0].slug)}
                >
                    <div className={style.icon}>{settingsButtons[0].icon}</div>
                </div>

                {/* Вихід */}
                <div className={style.navItem} onClick={onSignOut}>
                    <div className={style.icon}>{settingsButtons[1].icon}</div>
                </div>
            </div>
        </nav>
    )
}