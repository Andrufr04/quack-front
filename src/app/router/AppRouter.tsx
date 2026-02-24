import { BrowserRouter, Route, Routes } from "react-router-dom";
import {routes} from './routes'
import HomePage from "../../pages/HomePage/ui/HomePage";
import ProfilePage from "../../pages/ProfilePage/ProfilePage";
import MainLayout from "./MainLayout";


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route path={routes.home} element={<HomePage/>} />
                    <Route path={routes.profile} element={<ProfilePage/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}