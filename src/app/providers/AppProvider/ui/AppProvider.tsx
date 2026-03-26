import { useEffect, useState } from "react";
import { AppContext } from "../model/AppContext";

export default function AppProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState("light")

    const switchMode = () => {
        const newMode = mode === "light" ? "dark" : "light"
        setModeState(newMode)
        localStorage.setItem("mode", newMode)
    }

    const setMode = (mode: string) => {
        if (mode === "light" || mode === "dark") {
            setModeState(mode)
            localStorage.setItem("mode", mode)
        }
    }

    useEffect(() => {
        const savedMode = localStorage.getItem("mode")
        if (savedMode) {
            setModeState(savedMode)
        }
    }, [])

    useEffect(() => {
        if (mode === "dark") {
            document.documentElement.classList.add(mode)
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [mode])


    return (
        <AppContext.Provider value={{ mode, switchMode, setMode }}>
            {children}
        </AppContext.Provider>
    )
}