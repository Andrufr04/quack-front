import { useEffect, useRef, useState } from "react"
import { navigationButtons, settingsButtons } from "../../../shared/config/sidebarConfig"
import NavigationButton from "../../../shared/ui/NavigationButton/ui/NavigationButton"
import style from "./Sidebar.module.css"
import { SVG_EXPAND } from "../../../shared/ui/icons/icons"
import { useLocation, useNavigate } from "react-router-dom"

export default function Sidebar() {
    const [expanded, setExpanded] = useState(false)
    const [isHovered, setHovered] = useState(false)
    const navigate = useNavigate()

    const location = useLocation()

    useEffect(() => {
        setExpanded(false)
    }, [location.pathname])

    const onSignOut = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
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
        <div ref={sidebarRef} className={`${style.sidebar} ${expanded ? style.expanded : ""}`}
            onClick={() => setExpanded(!expanded)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>
            <div className={style.logo}>
                {expanded ?
                    <div className={style.topMenu}>
                        <img src="/icons/logo-full.svg" alt="Logo" />
                        <div className={style.logoWrap}><div className={style.expandIcon}>{SVG_EXPAND}</div></div>
                    </div>
                    : isHovered ?
                        <div className={style.logoWrap}><div className={style.expandIcon}>{SVG_EXPAND}</div></div>
                        : <img src="/icons/logo.svg" alt="Logo" />}
            </div>
            <div className={style.icons}>
                <div className={style.iconsPages} onClick={(e) => e.stopPropagation()}>{navigationButtons.map(b => <NavigationButton key={b.text} navigationButton={b} visible={expanded} />)}</div>
                <div className={style.iconsSettings} onClick={(e) => e.stopPropagation()}>
                    <NavigationButton navigationButton={settingsButtons[0]} visible={expanded} />
                    <NavigationButton navigationButton={settingsButtons[1]} visible={expanded} onAction={onSignOut}/>
                    </div>
            </div>
        </div>
    </>
}
