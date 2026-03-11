import { SVG_PLUS } from "../../icons/icons"
import styles from "./TaskExtendedChecked.module.css"

export default function TaskExtendedChecked({ onCloseClick, task }: { onCloseClick: () => void, task: Task }) {

    return (
        <div className={styles.TaskExtended}>
            <div className={styles.icon} onClick={onCloseClick}>{SVG_PLUS}</div>

            <div>Коментар від викладача: </div>
            <div>Комент про те що ти крутий студент </div>
        </div>
    )
}

