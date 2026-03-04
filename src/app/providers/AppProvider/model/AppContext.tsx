import { createContext } from 'react'

export type AppContextType = {
    mode: string,
    switchMode: () => void
}

const init: AppContextType = {
    mode: "light",
    switchMode: () => {
        throw "Not Implemented 'switchMode'";
    }
}


export const AppContext = createContext<AppContextType>(init)
