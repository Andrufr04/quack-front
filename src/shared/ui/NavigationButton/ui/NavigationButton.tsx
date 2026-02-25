import { useState } from "react"
import type { NavigationButtonProps } from "../model/navigationButtonType"
import style from "./NavigationButton.module.css"

export default function NavigationButton({navigationButton, visible} : {navigationButton : NavigationButtonProps, visible : boolean}) {
    const [isHovered, setHovered] = useState(false)
    
    return <div className={style.navigation} 
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>
        {isHovered && <div className={`${style.bg} ${visible ? style.expandedBg : ""}`}></div>}
        <div className={style.icon} style={{color: isHovered ? "var(--color-hover-icon)" : ""}}>{navigationButton.icon}</div>
        {visible && <div className={style.text} style={{color: isHovered ? "var(--color-hover-icon-text)" : ""}}>{navigationButton.text}</div>}
    </div>
}