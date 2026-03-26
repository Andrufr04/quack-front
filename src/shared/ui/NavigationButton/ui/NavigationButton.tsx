import { useState } from "react"
import type { NavigationButtonProps } from "../model/navigationButtonType"
import style from "./NavigationButton.module.css"
import { useNavigate } from "react-router-dom"

export default function NavigationButton({ 
    navigationButton, 
    visible, 
    onAction,
    showTooltip = true // 🔥 Отримуємо нове налаштування (за замовчуванням true)
}: { 
    navigationButton: NavigationButtonProps, 
    visible: boolean, 
    onAction?: () => void,
    showTooltip?: boolean // 🔥 Додаємо типізацію
}) {
    const [isHovered, setHovered] = useState(false)
    const navigate = useNavigate()

    const onClick = () => {
        navigate(navigationButton.slug)
        if (onAction) {
            onAction()
        }
    }

    // Показуємо тултип ТІЛЬКИ якщо юзер це увімкнув в налаштуваннях 
    // І якщо сайдбар зараз згорнутий (!visible)
    const shouldShowTooltip = showTooltip && !visible;

    return <div className={style.navigation}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        
        // 🔥 Динамічно рендеримо атрибути тултипу
        data-tooltip-id={shouldShowTooltip ? "my-tooltip" : undefined}
        data-tooltip-content={shouldShowTooltip ? navigationButton.text : undefined}
        data-tooltip-place="right"
    >
        {isHovered && <div className={`${style.bg} ${visible ? style.expandedBg : ""}`}></div>}
        <div className={style.icon} style={{ color: isHovered ? "var(--color-hover-icon)" : "" }}>{navigationButton.icon}</div>
        {visible && <div className={style.text} style={{ color: isHovered ? "var(--color-hover-icon-text)" : "" }}>{navigationButton.text}</div>}
    </div>
}