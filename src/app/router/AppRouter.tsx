import { HashRouter, Route, Routes } from "react-router-dom";
import HomePage from "../../pages/HomePage/ui/HomePage";
import ProfilePage from "../../pages/ProfilePage/ui/ProfilePage";
import MainLayout from "./MainLayout";
import DemoPage from "../../pages/DemoPage/DemoPage";
import SignInPage from "../../pages/SignInPage/ui/SignInPage";
import Page404 from "../../pages/Page404/ui/Page404";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import TasksPage from "../../pages/TasksPage/ui/TaskPage";
import TasksDonePage from "../../pages/TaskDonePage/ui/TaskPage";
import ManageTasks from "../../pages/ManageTasksPage/ui/ManageTasks";
import ManageCheckTasks from "../../pages/ManageCheckTasksPage/ui/ManageCheckTasks";
import ManageLesson from "../../pages/ManageLessons/ui/ManageLessons";
import { CalendarPage } from "../../pages/CalendarPage/ui/CalendarPage";
import ManageSchedule from "../../pages/ManageSchedule/ui/ManageSchedule";
import ManageScheduleDelete from "../../pages/ManageScheduleDeletePage/ui/ManageScheduleDeletePage";
import ManageAccountsPage from "../../pages/ManageAccountsPage/ui/ManageAccountsPage";
import ManageGroupsPage from "../../pages/ManageGroupsPage/ui/ManageGroupsPage";
import TasksExaminationPage from "../../pages/TaskExaminationPage/ui/TaskPageExamination";
import { Toaster } from "react-hot-toast";
import { Tooltip } from 'react-tooltip'
import SettingsPage from "../../pages/SettingsPage/ui/SettingsPage";
import ArchivePage from "../../pages/ArchivePage/ui/ArchivePage";
import NewsPage from "../../pages/NewsPage/ui/NewsPage";
import ManageNewsPage from "../../pages/ManageNewsPage/ui/ManageNewsPage";
import PrivacyPage from "../../pages/PrivacyPage/ui/PrivacyPage";
import ChatsPage from "../../pages/ChatsPage/ui/ChatsPage";
import ManageSubjectsPage from "../../pages/ManageSubjectsPage/ui/ManageSubjectsPage";
import ManageTaskTypesPage from "../../pages/ManageTaskTypesPage/ui/ManageTaskTypesPage";
import ManageLessonTypesPage from "../../pages/ManageLessonTypesPage/ui/ManageLessonTypesPage";


export default function AppRouter() {
    return (
        <HashRouter>
            <Toaster toastOptions={{ style: { backgroundColor: "var(--color-bg)", color: "var(--color-text)" } }} />
            <Tooltip id="my-tooltip" />
            <Routes>
                <Route path="/signin" element={<PublicRoute><SignInPage /></PublicRoute>} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profile/:id?" element={<ProfilePage />} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks/examination" element={<TasksExaminationPage />} />
                    <Route path="/tasks/done" element={<TasksDonePage />} />
                    <Route path="/managetasks" element={<ManageTasks />} />
                    <Route path="/managechecktasks" element={<ManageCheckTasks />} />
                    <Route path="/managelesson" element={<ManageLesson />} />
                    <Route path="/managelesson/:date" element={<ManageLesson />} />
                    <Route path="/manageschedule" element={<ManageSchedule />} />
                    <Route path="/managescheduledelete" element={<ManageScheduleDelete />} />
                    <Route path="/manageaccounts" element={<ManageAccountsPage />} />
                    <Route path="/managetasktypes" element={<ManageTaskTypesPage />} />
                    <Route path="/managelessontypes" element={<ManageLessonTypesPage />} />
                    <Route path="/managegroups" element={<ManageGroupsPage />} />
                    <Route path="/managenews" element={<ManageNewsPage />} />
                    <Route path="/managesubjects" element={<ManageSubjectsPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/archive" element={<ArchivePage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="*" element={<Page404 />} />
                    <Route path="/chats" element={<ChatsPage />} />
                    <Route path="/chats/:chatId" element={<ChatsPage />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}