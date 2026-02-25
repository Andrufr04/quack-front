import { Outlet } from "react-router-dom";
import Sidebar from "../../widgets/Sidebar/ui/Sidebar";
import ButtonsMenu from "../../widgets/ButtonsMenu/ui/ButtonsMenu";
import styles from './MainLayout.module.css'

export default function MainLayout() {
    return <>
        <Sidebar />
        <main className={styles.container}><Outlet /></main>
        <ButtonsMenu/>
    </>
}