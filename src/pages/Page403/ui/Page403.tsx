import { useNavigate } from "react-router-dom"
import ActionButton from "../../../shared/ui/ActionButton/ui/ActionButton"
import styles from "./Page403.module.css"

export default function Page403() {
    const navigate = useNavigate()

    return <div className={styles.blur}>
        <div className={styles.container}>
            <img className={styles.img} src="/images/page403.png" alt="403" />
            <div className={styles.info}>Упс! В доступі відмовлено!</div>
            <div className={styles.button}>
                <ActionButton actionButton={{ text: "На головну", enabled: true, bgcolor: "#ffffff", height: "32px", color: "#000000", onClick: () => navigate("/") }} />
            </div>
        </div>
    </div>
} 