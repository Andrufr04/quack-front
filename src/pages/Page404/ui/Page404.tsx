import ActionButton from "../../../shared/ui/ActionButton/ui/ActionButton"
import styles from "./Page404.module.css"

export default function Page404() {
    return <div className={styles.blur}>
        <div className={styles.container}>
            <img className={styles.img} src="/images/page404.png" alt="404" />
            <div className={styles.info}>Упс! Сторінку не знайдено. Сторінка переїхала або URL не коректний.</div>
            <div className={styles.button}>
                <ActionButton actionButton={{ text: "На головну", enabled: true, bgcolor: "#ffffff", height: "32px", color: "#000000" }} />
            </div>
        </div>
    </div>
} 