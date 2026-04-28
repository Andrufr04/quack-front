import { useEffect, useRef, useState } from "react"
import { navigationButtonsAdministration, navigationButtonsCurator, navigationButtonsStudent, navigationButtonsTeacher, settingsButtons } from "../../../shared/config/sidebarConfig"
import NavigationButton from "../../../shared/ui/NavigationButton/ui/NavigationButton"
import style from "./Sidebar.module.css"
import { SVG_EXPAND, SVG_LOGO } from "../../../shared/ui/icons/icons"
import { useLocation, useNavigate } from "react-router-dom"
import { isAdministration, isCurator, isStudent, isTeacher } from "../../../entities/session/lib/jwt"

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
                        <div className={style.logoFullWrap}>
                            <SvgLogoFull />
                        </div>
                        <div className={style.logoWrap}>
                            <div className={style.expandIcon}>{SVG_EXPAND}</div>
                        </div>
                    </div>
                    : isHovered ?
                        <div className={style.logoWrap}><div className={style.expandIcon}>{SVG_EXPAND}</div></div>
                        : <SvgLogo />
                }
            </div>
            <div className={style.icons}>
                <div className={style.iconsPages} onClick={(e) => e.stopPropagation()}>
                    {
                        isStudent() ? navigationButtonsStudent.map(b => <NavigationButton key={b.text} navigationButton={b} visible={expanded} showTooltip={settings.showTooltips} />)
                            : isTeacher() ? navigationButtonsTeacher.map(b => <NavigationButton key={b.text} navigationButton={b} visible={expanded} showTooltip={settings.showTooltips} />)
                                : isAdministration() ? navigationButtonsAdministration.map(b => <NavigationButton key={b.text} navigationButton={b} visible={expanded} showTooltip={settings.showTooltips} />)
                                    : isCurator() ? navigationButtonsCurator.map(b => <NavigationButton key={b.text} navigationButton={b} visible={expanded} showTooltip={settings.showTooltips} />)
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


const SvgLogo = () => (
    <svg className={style.svgLogo} width="30" height="36" viewBox="0 0 30 36" fill="none">
        <g clipPath="url(#clip0_488_160)">
            <g filter="url(#filter0_i_488_160)">
                <path
                    d="M15 0C23.0322 0.000217465 29.5899 6.31395 29.9814 14.249H29.9922V14.5361C29.9969 14.6902 30 14.8448 30 15C30 15.1551 29.9969 15.3099 29.9922 15.4639V35.6211C25.7426 35.6211 22.2061 32.5765 21.4404 28.5498C19.4889 29.4792 17.3054 29.9999 15 30C6.71582 29.9999 0.000167863 23.2842 0 15C0.000286574 6.71594 6.71589 7.62842e-05 15 0ZM15.1426 9.14258C11.9869 9.14274 9.42892 11.7018 9.42871 14.8574C9.42888 18.0131 11.9869 20.5711 15.1426 20.5713C18.2982 20.5711 20.8573 18.0131 20.8574 14.8574C20.8572 11.7018 18.2982 9.1428 15.1426 9.14258Z"
                    fill="var(--color-main)"
                />
            </g>
        </g>
        <defs>
            <filter
                id="filter0_i_488_160"
                x="0"
                y="0"
                width="30"
                height="38.6211"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="3" />
                <feGaussianBlur stdDeviation="4.95" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_488_160" />
            </filter>
            <clipPath id="clip0_488_160">
                <rect width="30" height="36" fill="white" />
            </clipPath>
        </defs>
    </svg>
);

export const SvgLogoFull = () => (
    <svg className={style.svgLogoFull} width="89" height="36" viewBox="0 0 89 36" fill="none">
        <g filter="url(#filter0_i_490_163)">
            <path
                d="M15 0C23.0322 0.000217465 29.5899 6.31395 29.9814 14.249H29.9922V14.5361C29.9969 14.6902 30 14.8448 30 15C30 15.1551 29.9969 15.3099 29.9922 15.4639V35.6211C25.7426 35.6211 22.2061 32.5765 21.4404 28.5498C19.4889 29.4792 17.3054 29.9999 15 30C6.71582 29.9999 0.000167863 23.2842 0 15C0.000286574 6.71594 6.71589 7.62842e-05 15 0ZM15.1426 9.14258C11.9869 9.14274 9.42892 11.7018 9.42871 14.8574C9.42888 18.0131 11.9869 20.5711 15.1426 20.5713C18.2982 20.5711 20.8573 18.0131 20.8574 14.8574C20.8572 11.7018 18.2982 9.1428 15.1426 9.14258Z"
                fill="var(--color-main)"
            />
        </g>

        <path
            d="M36.48 22.864C35.04 22.864 33.912 22.44 33.096 21.592C32.296 20.744 31.896 19.584 31.896 18.112V10.048C31.896 9.87199 31.984 9.78399 32.16 9.78399H33.648C33.84 9.78399 33.936 9.87199 33.936 10.048V17.248C33.936 18.48 34.184 19.408 34.68 20.032C35.176 20.656 35.952 20.968 37.008 20.968C37.616 20.968 38.216 20.816 38.808 20.512C39.416 20.192 39.92 19.704 40.32 19.048C40.736 18.392 40.944 17.56 40.944 16.552V10.048C40.944 9.87199 41.032 9.78399 41.208 9.78399H42.72C42.88 9.78399 42.96 9.87199 42.96 10.048V22.312C42.96 22.504 42.88 22.6 42.72 22.6H41.4C41.208 22.6 41.112 22.504 41.112 22.312L41.04 20.272C40.576 21.136 39.912 21.784 39.048 22.216C38.2 22.648 37.344 22.864 36.48 22.864ZM52.1291 22.864C50.8971 22.864 49.8171 22.576 48.8891 22C47.9771 21.424 47.2651 20.64 46.7531 19.648C46.2571 18.64 46.0091 17.488 46.0091 16.192C46.0091 14.896 46.2571 13.752 46.7531 12.76C47.2651 11.752 47.9771 10.968 48.8891 10.408C49.8171 9.83199 50.8971 9.54399 52.1291 9.54399C53.1531 9.54399 54.0811 9.77599 54.9131 10.24C55.7611 10.688 56.4091 11.304 56.8571 12.088L56.9291 10.048C56.9291 9.87199 57.0251 9.78399 57.2171 9.78399H58.5131C58.6891 9.78399 58.7771 9.87199 58.7771 10.048V22.312C58.7771 22.504 58.6891 22.6 58.5131 22.6H57.2171C57.0251 22.6 56.9291 22.504 56.9291 22.312L56.8571 20.272C56.4091 21.056 55.7611 21.68 54.9131 22.144C54.0811 22.624 53.1531 22.864 52.1291 22.864ZM52.5131 20.968C53.3931 20.968 54.1611 20.768 54.8171 20.368C55.4731 19.968 55.9851 19.408 56.3531 18.688C56.7371 17.968 56.9291 17.136 56.9291 16.192C56.9291 15.232 56.7371 14.4 56.3531 13.696C55.9851 12.976 55.4731 12.416 54.8171 12.016C54.1611 11.616 53.3931 11.416 52.5131 11.416C51.6491 11.416 50.8811 11.616 50.2091 12.016C49.5531 12.416 49.0331 12.976 48.6491 13.696C48.2811 14.4 48.0971 15.232 48.0971 16.192C48.0971 17.136 48.2811 17.968 48.6491 18.688C49.0331 19.408 49.5531 19.968 50.2091 20.368C50.8811 20.768 51.6491 20.968 52.5131 20.968ZM68.2134 22.864C66.9174 22.864 65.7894 22.576 64.8294 22C63.8694 21.424 63.1254 20.64 62.5974 19.648C62.0854 18.64 61.8294 17.488 61.8294 16.192C61.8294 14.88 62.0934 13.728 62.6214 12.736C63.1494 11.744 63.8854 10.968 64.8294 10.408C65.7894 9.83199 66.9174 9.54399 68.2134 9.54399C69.5414 9.54399 70.6614 9.83199 71.5734 10.408C72.5014 10.984 73.1894 11.864 73.6374 13.048C73.6854 13.208 73.6214 13.312 73.4454 13.36L72.1974 13.744C72.0534 13.792 71.9414 13.736 71.8614 13.576C71.1734 12.136 69.9894 11.416 68.3094 11.416C67.3014 11.416 66.4694 11.64 65.8134 12.088C65.1734 12.52 64.6934 13.104 64.3734 13.84C64.0694 14.56 63.9174 15.344 63.9174 16.192C63.9174 17.04 64.0774 17.832 64.3974 18.568C64.7174 19.288 65.1974 19.872 65.8374 20.32C66.4934 20.752 67.3174 20.968 68.3094 20.968C70.0694 20.968 71.2774 20.208 71.9334 18.688C71.9974 18.544 72.1094 18.496 72.2694 18.544L73.6374 18.904C73.8134 18.952 73.8614 19.056 73.7814 19.216C73.3174 20.448 72.6054 21.368 71.6454 21.976C70.6854 22.568 69.5414 22.864 68.2134 22.864ZM76.9513 22.6C76.7593 22.6 76.6633 22.504 76.6633 22.312V3.83199C76.6633 3.65599 76.7593 3.56799 76.9513 3.56799H78.4393C78.6153 3.56799 78.7033 3.65599 78.7033 3.83199V15.64L84.6073 9.92799C84.7033 9.83199 84.8153 9.78399 84.9433 9.78399H86.8873C87.0153 9.78399 87.0873 9.82399 87.1033 9.90399C87.1353 9.96799 87.1113 10.04 87.0313 10.12L82.3993 14.488L87.6553 22.264C87.7673 22.488 87.7113 22.6 87.4873 22.6H85.6873C85.5433 22.6 85.4313 22.544 85.3513 22.432L80.9113 15.904L78.7033 17.992V22.312C78.7033 22.504 78.6153 22.6 78.4393 22.6H76.9513Z"
            fill="var(--color-main)"
        />

        <defs>
            <filter
                id="filter0_i_490_163"
                x="0"
                y="0"
                width="30"
                height="38.6211"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="3" />
                <feGaussianBlur stdDeviation="4.95" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_490_163" />
            </filter>
        </defs>
    </svg>
);