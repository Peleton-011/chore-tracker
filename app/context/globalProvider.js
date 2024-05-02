"use client";

import { createContext, useState, useContext, useEffect } from "react";
import themes from "./themes";
import axios from "axios";

export const GlobalContext = createContext();
export const GlobalUpdateContext = createContext();

export const GlobalProvider = ({ children }) => {
	//The themes are stored in an array; the first one is 0, the second is 1
	const [selectedTheme, setSelectedTheme] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
	const theme = themes[selectedTheme];

    const [tasks, setTasks] = useState([]);

    const allTasks = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("/api/tasks");
            setTasks(res.data);
            setIsLoading(false);
            console.log(res.data)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        allTasks();
    }, [])

	return (
		<GlobalContext.Provider
			value={{
				theme,
                tasks
			}}
		>
			<GlobalUpdateContext.Provider value={{}}>
				{children}
			</GlobalUpdateContext.Provider>
		</GlobalContext.Provider>
	);
};

export const useGlobalState = () => useContext(GlobalContext);
export const useGlobalUpdate = () => useContext(GlobalUpdateContext);
