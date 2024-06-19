"use client";

import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const GlobalContext = createContext();
export const GlobalUpdateContext = createContext();

export const GlobalProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [modal, setModal] = useState(false);
	const [collapsed, setCollapsed] = useState(true);

	const [tasks, setTasks] = useState([]);

    const [editedTask, setEditedTask] = useState({
		id: "",
		title: "",
		description: "",
		date: "",
		isCompleted: false,
		isImportant: false,
	});

	const openModal = () => {
		setModal(true);
	};

	const closeModal = () => {
		setModal(false);
	};

	const collapseMenu = () => {
		setCollapsed(!collapsed);
	};

    const resetEditedTask = () => {
		setEditedTask({
			id: "",
			title: "",
			description: "",
			date: "",
			isCompleted: false,
			isImportant: false,
		});
	};

	const createTask = () => {
		resetEditedTask();
		openModal();
	};

    const editTask = (task) => {
		setEditedTask({
			id: task.id,
			title: task.title,
			description: task.description,
			date: task.date,
			isCompleted: task.isCompleted,
			isImportant: task.isImportant,
		});

		openModal();
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

	const updateTask = async (task) => {
		try {
			const res = await axios.put(`/api/tasks`, task);

			toast.success("Task updated");

			allTasks();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	};

	const completedTasks = tasks.filter((task) => task.isCompleted === true);
	const importantTasks = tasks.filter((task) => task.isImportant === true);
	const incompleteTasks = tasks.filter((task) => task.isCompleted === false);

	useEffect(() => {
		allTasks();
	}, []);

	return (
		<GlobalContext.Provider
			value={{
				tasks,
				allTasks,
				deleteTask,
				isLoading,
				completedTasks,
				importantTasks,
				incompleteTasks,
				updateTask,
				allTasks,
				modal,
				openModal,
				closeModal,
				collapsed,
				collapseMenu,
                editedTask,
                editTask,
                createTask,
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
