import { SVG_CALENDAR, SVG_CHATS, SVG_FOLDER, SVG_HOME, SVG_LOGOUT, SVG_NEWS, SVG_PROFILE, SVG_SETTINGS, SVG_TASKS } from "../ui/icons/icons";
import type { NavigationButtonProps } from "../ui/NavigationButton/model/navigationButtonType";

export const navigationButtonsStudent: NavigationButtonProps[] = [
    {icon : SVG_HOME, text : "Головна сторінка", slug : "/"},
    {icon : SVG_PROFILE, text : "Профіль", slug : "/profile"},
    {icon : SVG_CHATS, text : "Чати", slug : "/chats"},
    {icon : SVG_TASKS, text : "Завдання", slug : "/tasks"},
    {icon : SVG_FOLDER, text : "Архів", slug : "/archive"},
    {icon : SVG_NEWS, text : "Новини", slug : "/news"},
    {icon : SVG_CALENDAR, text : "Розклад", slug : "/calendar"},
]

export const navigationButtonsTeacher: NavigationButtonProps[] = [
    {icon : SVG_HOME, text : "Головна сторінка", slug : "/"},
    {icon : SVG_PROFILE, text : "Профіль", slug : "/profile"},
    {icon : SVG_CHATS, text : "Чати", slug : "/chats"},
    {icon : SVG_TASKS, text : "Завдання", slug : "/managetasks"},
    {icon : SVG_CALENDAR, text : "Розклад", slug : "/calendar"},
]

export const settingsButtons: NavigationButtonProps[] = [
    {icon : SVG_SETTINGS, text : "Налаштування", slug : "/setting"},
    {icon : SVG_LOGOUT, text : "Вихід", slug : "/"},
]