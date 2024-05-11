"use client";

import { createContext, useState, useContext, useEffect } from "react";
import themes from "./themes";
import axios from "axios";
import toast from "react-hot-toast";

export const GlobalContext = createContext();
export const GlobalUpdateContext = createContext();

export const GlobalProvider = ({ children }) => {
	//The themes are stored in an array; the first one is 0, the second is 1
	const [selectedTheme, setSelectedTheme] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [modal, setModal] = useState(false);
	const theme = themes[selectedTheme];
    const [collapsed, setCollapsed] = useState(false);

	const [tasks, setTasks] = useState([]);

	const openModal = () => {
		setModal(true);
	};

	const closeModal = () => {
		setModal(false);
	};

    const collapseMenu = () => {
        setCollapsed(!collapsed);
      };

	const allTasks = async () => {
		setIsLoading(true);
		try {
			const res = await axios.get("/api/tasks");
			setTasks(res.data);
			setIsLoading(false);
			console.log(res.data);
		} catch (error) {
			console.log(error);
		}
	};

	const deleteTask = async (id) => {
		try {
			const res = await axios.delete(`/api/tasks/${id}`);
			toast.success("Task deleted");

			allTasks();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	};

	useEffect(() => {
		allTasks();
	}, []);

	return (
		<GlobalContext.Provider
			value={{
				theme,
				tasks,
                allTasks,
                deleteTask,
				modal,
				openModal,
				closeModal,
                collapsed,
                collapseMenu,
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
