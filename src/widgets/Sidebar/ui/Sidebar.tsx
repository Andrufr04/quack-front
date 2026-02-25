import { useState } from "react"
import { navigationButtons, settingsButtons } from "../../../shared/config/sidebarConfig"
import NavigationButton from "../../../shared/ui/NavigationButton/ui/NavigationButton"
import style from "./Sidebar.module.css"
import { SVG_EXPAND } from "../../../shared/ui/icons/icons"

export default function Sidebar() {
    const [expanded, setExpanded] = useState(false)
    const [isHovered, setHovered] = useState(false)

    return <>
        <div className={`${style.sidebar} ${expanded ? style.expanded : ""}`}
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
                <div className={style.iconsPages} onClick={(e) => e.stopPropagation()}>{navigationButtons.map(b => <NavigationButton navigationButton={b} visible={expanded} />)}</div>
                <div className={style.iconsSettings} onClick={(e) => e.stopPropagation()}>{settingsButtons.map(b => <NavigationButton navigationButton={b} visible={expanded} />)}</div>
            </div>
        </div>
    </>
}
