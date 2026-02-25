import ActionButton from '../../../shared/ui/ActionButton/ui/ActionButton'
import styles from './HomePage.module.css'

export default function HomePage() {
    return <div>
        <title>Quack | Home</title>
        <div className={styles.demoContainer}>
            <ActionButton actionButton={{text: "Початок роботи", onClick: () => console.log('clicked'), enabled: true}}/>
        </div>
    </div>
}