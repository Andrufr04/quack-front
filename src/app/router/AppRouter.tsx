import { BrowserRouter, Route, Routes } from "react-router-dom";
import { routes } from './routes'
import HomePage from "../../pages/HomePage/ui/HomePage";
import ProfilePage from "../../pages/ProfilePage/ui/ProfilePage";
import MainLayout from "./MainLayout";
import DemoPage from "../../pages/DemoPage/DemoPage";
import SignInPage from "../../pages/SignInPage/ui/SignInPage";
import Page404 from "../../pages/Page404/ui/Page404";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import TasksPage from "../../pages/TasksPage/ui/TaskPage";
import TasksExaminationPage from "../../pages/TaskExaminationPage/ui/TaskPage";
import TasksDonePage from "../../pages/TaskDonePage/ui/TaskPage";
import ManageTasks from "../../pages/ManageTasksPage/ui/ManageTasks";
import ManageCheckTasks from "../../pages/ManageCheckTasksPage/ui/ManageCheckTasks";


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={routes.signin} element={<PublicRoute><SignInPage /></PublicRoute>} />
                <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                    <Route path={routes.home} element={<HomePage />} />
                    <Route path={routes.profile} element={<ProfilePage />} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks/examination" element={<TasksExaminationPage />} />
                    <Route path="/tasks/done" element={<TasksDonePage />} />
                    <Route path="/managetasks" element={<ManageTasks />} />
                    <Route path="/managechecktasks" element={<ManageCheckTasks />} />
                <Route
                    path="*"
                    element={<Page404/>}
                />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}