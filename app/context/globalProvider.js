"use client";

import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
// import { useRouter } from "next/router";

import dateTaskUtils from "../utils/dateTaskUtils";

// interface Household {
//     _id: string;
//     name: string;
// }

// interface GlobalContextProps {
//     userId: string;
//     households: Household[];
//     fetchHouseholds: () => void;
//     setUserId: (id: string) => void;
// }

export const GlobalContext = createContext();
export const GlobalUpdateContext = createContext();

export const GlobalProvider = ({ children }) => {
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [modal, setModal] = useState(false);
	const [collapsed, setCollapsed] = useState(true);

	const [households, setHouseholds] = useState(/*<Household[]>*/ []);
	// const router = useRouter();
// 
	// useEffect(() => {
		// console.log(router.pathname);
	// }, [router.isReady]);
// 
	// useEffect(() => {
		// console.log("changed");
	// }, [error]);

	const fetchHouseholds = async () => {
		try {
			const response = await axios.get(`/api/household`);
			console.log(response.data);
			response.data.households && setHouseholds(response.data.households);
		} catch (error) {
			console.error("Failed to fetch households", error);
			setError(error.message);
		}
	};

	const [tasks, setTasks] = useState([]);
	const [filteredTasks, setFilteredTasks] = useState({
		overdue: [],
		today: [],
		laterThisWeek: [],
		laterThisMonth: [],
		someday: [],
	});

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
			const orderedTasks = res.data.sort((a, b) => {
				return new Date(a.date) - new Date(b.date);
			});
			setTasks(orderedTasks);

			setFilteredTasks({
				overdue: dateTaskUtils.overdue(orderedTasks),
				today: dateTaskUtils.today(orderedTasks),
				laterThisWeek: dateTaskUtils.laterThisWeek(orderedTasks),
				laterThisMonth: dateTaskUtils.laterThisMonth(orderedTasks),
				someday: dateTaskUtils.someday(orderedTasks),
			});

			setIsLoading(false);
			console.log(res.data);
		} catch (error) {
			console.log(error);
			setError(error.message);
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
		fetchHouseholds();
		allTasks();
	}, []);

	return (
		<GlobalContext.Provider
			value={{
				tasks,
				allTasks,
				filteredTasks,
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
				households,
				setHouseholds,
				fetchHouseholds,
				error,
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
