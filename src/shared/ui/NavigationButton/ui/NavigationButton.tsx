import { useState } from "react"
import type { NavigationButtonProps } from "../model/navigationButtonType"
import style from "./NavigationButton.module.css"
import { useNavigate } from "react-router-dom"

export default function NavigationButton({ 
    navigationButton, 
    visible, 
    onAction,
    showTooltip = true 
}: { 
    navigationButton: NavigationButtonProps, 
    visible: boolean, 
    onAction?: () => void,
    showTooltip?: boolean 
}) {
    const [isHovered, setHovered] = useState(false)
    const navigate = useNavigate()

    const onClick = () => {
        navigate(navigationButton.slug)
        if (onAction) {
            onAction()
        }
    }

    // Тултип ХОВАЄТЬСЯ, якщо:
    // 1. Юзер вимкнув тултипи в налаштуваннях (!showTooltip)
    // 2. Сайдбар зараз відкритий (visible)
    const isTooltipHidden = !showTooltip || visible;

    return <div className={style.navigation}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        
        // 🔥 Статичний ID
        data-tooltip-id="my-tooltip"
        // 🔥 Контент є завжди
        data-tooltip-content={navigationButton.text}
        // 🔥 Використовуємо вбудоване приховування react-tooltip
        data-tooltip-hidden={isTooltipHidden}
        data-tooltip-place="right"
    >
        {isHovered && <div className={`${style.bg} ${visible ? style.expandedBg : ""}`}></div>}
        <div className={style.icon} style={{ color: isHovered ? "var(--color-hover-icon)" : "" }}>{navigationButton.icon}</div>
        {visible && <div className={style.text} style={{ color: isHovered ? "var(--color-hover-icon-text)" : "" }}>{navigationButton.text}</div>}
    </div>
}