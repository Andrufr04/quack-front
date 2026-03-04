import { useState } from "react"
import { SVG_PLUS } from "../../../shared/ui/icons/icons"
import RoundButton from "../../../shared/ui/RoundButton/RoundButton"
import styles from "./ProfilePage.module.css"

export default function ProfilePage() {

    const [expanded, setExpanded] = useState(false)

    const text = "Цей користувач найкрутіший на платформі Quack. Його багатозначна задача — це створювати максимально круті речі та ламати систему."

    return (
        <>
            <title>Quack | Профіль</title>

            <div className={styles.info}>
                <div>
                    <div className={styles.iconPlus}>
                        <RoundButton button={{ icon: SVG_PLUS, text: "Додати картинку профілю" }} />
                    </div>
                    <div className={styles.profileImg}></div>
                </div>

                <div className={styles.name}>Ім'я</div>

                <div className={styles.description}>
                    {expanded ? (
                        text
                    ) : (
                        <>
                            {text.slice(0, 92)}...
                            <span
                                className={styles.showMore}
                                onClick={() => setExpanded(true)}
                            >
                                {" "}Показати більше
                            </span>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}