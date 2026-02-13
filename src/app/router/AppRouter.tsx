import { BrowserRouter, Route, Routes } from "react-router-dom";
import {routes} from './routes'
import HomePage from "../../pages/HomePage/ui/HomePage";


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={routes.home} element={<HomePage/>} />
            </Routes>
        </BrowserRouter>
    )
}