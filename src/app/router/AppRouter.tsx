import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { routes } from './routes'
import HomePage from "../../pages/HomePage/ui/HomePage";
import ProfilePage from "../../pages/ProfilePage/ProfilePage";
import MainLayout from "./MainLayout";
import DemoPage from "../../pages/DemoPage/DemoPage";
import SignInPage from "../../pages/SignInPage/ui/SignInPage";


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={routes.signin} element={<SignInPage />} />
                <Route path="/" element={<MainLayout />}>
                    <Route path={routes.home} element={<HomePage />} />
                    <Route path={routes.profile} element={<ProfilePage />} />
                    <Route path="/demo" element={<DemoPage />} />
                </Route>
                <Route
                    path="*"
                    element={<Navigate to="/signin" replace />}
                />
            </Routes>
        </BrowserRouter>
    )
}