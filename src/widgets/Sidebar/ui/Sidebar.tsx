import { useEffect, useRef, useState } from "react"
import { navigationButtonsAdministration, navigationButtonsStudent, navigationButtonsTeacher, settingsButtons } from "../../../shared/config/sidebarConfig"
import NavigationButton from "../../../shared/ui/NavigationButton/ui/NavigationButton"
import style from "./Sidebar.module.css"
import { SVG_EXPAND } from "../../../shared/ui/icons/icons"
import { useLocation, useNavigate } from "react-router-dom"
import { isAdministration, isStudent, isTeacher } from "../../../entities/session/lib/jwt"
import ModeSwitch from "../../ModeSwitch/ui/ModeSwitch"

export default function Sidebar() {
    const [expanded, setExpanded] = useState(false)
    const [isHovered, setHovered] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    // 1. Читаємо налаштування з localStorage при завантаженні
    const [settings, setSettings] = useState({
        openOnHover: localStorage.getItem('sidebar_hover') === 'true',
        keepOpenOnNav: localStorage.getItem('sidebar_keep_open') === 'true',
        showTooltips: localStorage.getItem('sidebar_tooltips') !== 'false' // default true
    });

    // 2. Слухаємо зміни налаштувань, щоб оновлювати Sidebar без перезавантаження сторінки
    useEffect(() => {
        const handleSettingsUpdate = () => {
            setSettings({
                openOnHover: localStorage.getItem('sidebar_hover') === 'true',
                keepOpenOnNav: localStorage.getItem('sidebar_keep_open') === 'true',
                showTooltips: localStorage.getItem('sidebar_tooltips') !== 'false'
            });
        };

        window.addEventListener('interface_settings_changed', handleSettingsUpdate);
        return () => window.removeEventListener('interface_settings_changed', handleSettingsUpdate);
    }, []);

    // 3. Опція: "Не закривати при переході на іншу сторінку"
    useEffect(() => {
        if (!settings.keepOpenOnNav) {
            setExpanded(false)
        }
    }, [location.pathname, settings.keepOpenOnNav])

    const onSignOut = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('active_role')
        navigate("/signin")
    }

    const sidebarRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)
            ) {
                setExpanded(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return <>
        <div 
            ref={sidebarRef} 
            className={`${style.sidebar} ${expanded ? style.expanded : ""}`}
            // Якщо увімкнено відкриття по наведенню - клік більше не працює як toggle (щоб не конфліктувати)
            onClick={() => {
                if (!settings.openOnHover) setExpanded(!expanded)
            }}
            // 4. Опція: "Відкривається при наведенні"
            onMouseEnter={() => {
                setHovered(true)
                if (settings.openOnHover) setExpanded(true)
            }}
            onMouseLeave={() => {
                setHovered(false)
                if (settings.openOnHover) setExpanded(false)
            }}
        >
            <div className={style.logo}>
                {expanded ?
                    <div className={style.topMenu}>
                        <img src="/icons/logo-full.svg" alt="Logo" />
                        <div className={style.logoWrap}>
                            <div className={style.expandIcon}>{SVG_EXPAND}</div>
                        </div>
                    </div>
                    : isHovered ?
                        <div className={style.logoWrap}><div className={style.expandIcon}>{SVG_EXPAND}</div></div>
                        : <img src="/icons/logo.svg" alt="Logo" />}
            </div>
            <div className={style.icons}>
                <div className={style.iconsPages} onClick={(e) => e.stopPropagation()}>
                    {
                        isStudent() ? navigationButtonsStudent.map(b => <NavigationButton key={b.text} navigationButton={b} visible={expanded} showTooltip={settings.showTooltips} />)
                        : isTeacher() ? navigationButtonsTeacher.map(b => <NavigationButton key={b.text} navigationButton={b} visible={expanded} showTooltip={settings.showTooltips} />)
                        : isAdministration() ? navigationButtonsAdministration.map(b => <NavigationButton key={b.text} navigationButton={b} visible={expanded} showTooltip={settings.showTooltips} />)
                        : <></>
                    }
                </div>
                <div className={style.iconsSettings} onClick={(e) => e.stopPropagation()}>
                    {/* <ModeSwitch/> */}
                    <NavigationButton navigationButton={settingsButtons[0]} visible={expanded} showTooltip={settings.showTooltips} />
                    <NavigationButton navigationButton={settingsButtons[1]} visible={expanded} onAction={onSignOut} showTooltip={settings.showTooltips} />
                </div>
            </div>
        </div>
    </>
}