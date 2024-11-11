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
	const [modal, setModal] = useState({ type: "none" });
	const [collapsed, setCollapsed] = useState(true);
	const [householdOpened, setHouseholdOpened] = useState(null);

	const [households, setHouseholds] = useState(/*<Household[]>*/ []);

	const [user, setUser] = useState({});

	const blankModels = {
		none: {},
		task: {
			id: "",
			title: "",
			description: "",
			date: "",
			isCompleted: false,
			isImportant: false,
		},
		household: {
			id: "",
			name: "",
			members: [],
			tasks: [],
			recurringTasks: [],
		},
	};

	const fetchHouseholds = async () => {
		try {
			const response = await axios.get(`/api/households`);
			console.log(response.data);
			response.data.households && setHouseholds(response.data.households);
		} catch (error) {
			console.error("Failed to fetch households", error);
			setError(error.message);
		}
	};

	const [currentHouseholdUsers, setCurrentHouseholdUsers] = useState([]);

	useEffect(() => {
		const fetchCurrentUsers = async () => {
			try {
				const response = await axios.get(
					`/api/households/${householdOpened}/members`
				);
				response.data.length && setCurrentHouseholdUsers(response.data);
				console.log(response.data);
			} catch (error) {
				console.error("Failed to fetch members", error);
				setError(error.message);
			}
		};
		fetchCurrentUsers();
	}, [householdOpened]);

	useEffect(() => {
		console.log(currentHouseholdUsers);
	}, [currentHouseholdUsers]);

	const [tasks, setTasks] = useState([]);
	const [filteredTasks, setFilteredTasks] = useState({
		overdue: [],
		today: [],
		laterThisWeek: [],
		laterThisMonth: [],
		someday: [],
	});

	const openModal = (arg) => {
		setModal({ ...arg, data: arg.data || blankModels[arg.type] });
	};

	const closeModal = () => {
		setModal({ type: "none" });
	};

	const collapseMenu = () => {
		setCollapsed(!collapsed);
	};

	const createTask = () => {
		openModal({ type: "task" });
	};

	const editTask = (task) => {
		openModal({
			type: "task",
			data: {
				id: task.id,
				title: task.title,
				description: task.description,
				date: task.date,
				isCompleted: task.isCompleted,
				isImportant: task.isImportant,
			},
		});
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

	const [currentHouseholdTasks, setCurrentHouseholdTasks] = useState([]);
	const fetchCurrentHouseholdTasks = async () => {
		try {
			if (!householdOpened) return;
			const res = await axios.get(
				`/api/households/${householdOpened}/tasks`
			);
			setCurrentHouseholdTasks(res.data);
			console.log(res.data);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		//fetch current household tasks from /api/households/[id]/tasks
		fetchCurrentHouseholdTasks();
		console.log("household changed");
	}, [householdOpened]);

	const updateHouseholdOpened = () => {
		const url = window.location.href;
		const currentHousehold = url.includes("/households/")
			? url.split("/households/")[1]
			: null;

		setHouseholdOpened(currentHousehold);
	};

	const createHousehold = async () => {
		openModal({ type: "household" });
	};

	const deleteHousehold = async (id) => {
		try {
			const res = await axios.delete(`/api/households/${id}`);
			toast.success("Household deleted");
			fetchHouseholds();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	};

	const updateHousehold = async (household) => {
		try {
			const res = await axios.put(`/api/households`, household);
			toast.success("Household updated");
			fetchHouseholds();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	};

	const editHousehold = (household) => {
		openModal({
			type: "household",
			data: {
				id: household.id,
				name: household.name,
				members: household.members,
				tasks: household.tasks,
				recurringTasks: household.recurringTasks,
			},
		});
	};

	const generateInviteLink = async (householdId) => {
		try {
			const { data } = await axios.post(
				`/api/households/${householdId}/invites`
			);

			return data.inviteLink;
		} catch (err) {
			alert("Failed to generate invite link: " + err);
		}
	};

	const joinHousehold = async (token) => {
		try {
			console.log(token);
			const response = await fetch(`/api/invites/${token}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			const data = await response.json();
			if (response.ok) {
				alert("User added to household");
				// Optionally redirect to a dashboard or household page
			} else {
				alert(data.error);
			}

			fetchHouseholds();
		} catch (err) {
			alert("Failed to join household");
		}
	};

	const fetchHouseholdFromToken = async (token) => {
		try {
			const response = await fetch(`/api/invites/${token}`);
			const data = await response.json();
			return data.household;
		} catch (err) {
			console.error(err);
		}
	};

	const fetchUser = async () => {
		try {
			const response = await axios.get("/api/users");
			setUser(response.data.user);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchHouseholds();
		allTasks();
		fetchUser();
	}, []);

	useEffect(() => {
		const currentHousehold = window.location.href.includes("/households/")
			? window.location.href.split("/households/")[1]
			: null;

		// console.log(window.location.href);
		console.log(currentHousehold);

		setHouseholdOpened(currentHousehold);
	}, [window.location.href]);

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
				editTask,
				createTask,
				createHousehold,
				deleteHousehold,
				updateHousehold,
				editHousehold,
				households,
				setHouseholds,
				fetchHouseholds,
				generateInviteLink,
				joinHousehold,
				fetchHouseholdFromToken,
				householdOpened,
				setHouseholdOpened,
				updateHouseholdOpened,
				currentHouseholdUsers,
				currentHouseholdTasks,
				fetchCurrentHouseholdTasks,
				user,
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
