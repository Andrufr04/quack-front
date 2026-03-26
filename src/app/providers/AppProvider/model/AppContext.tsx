import { createContext } from 'react'

export type AppContextType = {
    mode: string,
    switchMode: () => void,
    setMode: (mode:string) => void
}

const init: AppContextType = {
    mode: "light",
    switchMode: () => {
        throw "Not Implemented 'switchMode'";
    },
    setMode: (_) => {
        throw "Not Implemented 'setMode'";
    }
}


export const AppContext = createContext<AppContextType>(init)
