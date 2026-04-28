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

    // 🔥 ДОДАНО: Обробник для кліку коліщатком миші
    const onAuxClick = (e: React.MouseEvent) => {
        if (e.button === 1) { // 1 = клік коліщатком
            e.preventDefault()
            
            if (navigationButton.slug) {
                // Перевіряємо, чи використовується HashRouter (як в Electron/Capacitor)
                const isHashMode = window.location.hash.startsWith('#');
                const fullUrl = isHashMode 
                    ? `${window.location.origin}/#${navigationButton.slug}` 
                    : `${window.location.origin}${navigationButton.slug}`;
                
                window.open(fullUrl, '_blank');
            }
        }
    }

    const isTooltipHidden = !showTooltip || visible;

    return <div className={style.navigation}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        onAuxClick={onAuxClick} // 🔥 Додано подію
        
        data-tooltip-id="my-tooltip"
        data-tooltip-content={navigationButton.text}
        data-tooltip-hidden={isTooltipHidden}
        data-tooltip-place="right"
    >
        {isHovered && <div className={`${style.bg} ${visible ? style.expandedBg : ""}`}></div>}
        <div className={style.icon} style={{ color: isHovered ? "var(--color-hover-icon)" : "" }}>{navigationButton.icon}</div>
        {visible && <div className={style.text} style={{ color: isHovered ? "var(--color-hover-icon-text)" : "" }}>{navigationButton.text}</div>}
    </div>
}