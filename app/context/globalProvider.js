"use client"

import { createContext, useState, useContext } from "react"
import { themes } from "../providers/GlobalStylesProvider"

export const GlobalContext = createContext()
export const GlobalUpdateContext = createContext()

export const GlobalProvider = ({ children }) => {

    //The themes are stored in an array; the first one is 0, the second is 1
    const [selectedTheme, setSelectedTheme] = useState(0)
    const theme = themes[selectedTheme]

    return (
        <GlobalContext.Provider value={{
            theme
        }}>
            <GlobalUpdateContext.Provider value={null}>
                {children}
            </GlobalUpdateContext.Provider>
        </GlobalContext.Provider>
    )
}