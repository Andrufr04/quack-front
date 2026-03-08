import { useState } from "react"
import type { NavigationButtonProps } from "../model/navigationButtonType"
import style from "./NavigationButton.module.css"
import { useNavigate } from "react-router-dom"

export default function NavigationButton({navigationButton, visible, onAction} : {navigationButton : NavigationButtonProps, visible : boolean, onAction?: () => void}) {
    const [isHovered, setHovered] = useState(false)
    const navigate = useNavigate()

    const onClick = () => {
        navigate(navigationButton.slug)
        if (onAction) {
            onAction()
        }
    }
    
    return <div className={style.navigation} 
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}>
        {isHovered && <div className={`${style.bg} ${visible ? style.expandedBg : ""}`}></div>}
        <div className={style.icon} style={{color: isHovered ? "var(--color-hover-icon)" : ""}}>{navigationButton.icon}</div>
        {visible && <div className={style.text} style={{color: isHovered ? "var(--color-hover-icon-text)" : ""}}>{navigationButton.text}</div>}
    </div>
}