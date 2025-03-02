"use client";

import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import dateTaskUtils from "../utils/dateTaskUtils";

interface Task {
	name: string;
	description: string;
	date: string;
	householdId: string;
	userId: string;
	_id?: string; // Adding _id since you're likely using it for deletion
}

interface Household {
	_id: string;
	name: string;
	description?: string;
	members: string[];
	tasks: Task[];
	recurringTasks: Task[];
}

interface User {
	_id: string;
	// add other properties as needed
}

interface TaskTrade {
	_id: string;
	taskId: string;
	fromUserId: string;
	toUserId: string;
	isAccepted?: boolean;
	// add other properties as needed
}

interface FilteredTasks {
	overdue: Task[];
	today: Task[];
	laterThisWeek: Task[];
	laterThisMonth: Task[];
	someday: Task[];
}

// Define the shape of your context
interface GlobalContextType {
	tasks: Task[];
	filteredTasks: FilteredTasks;
	deleteTask: (id: string) => Promise<void>;
	isLoading: boolean;
	taskModal: boolean;
	setTaskModal: (value: boolean) => void;
	updateHousehold: (household: string) => Promise<void>;
	households: Household[];
	setHouseholds: (households: Household[]) => void;
	fetchHouseholds: () => Promise<void>;
	generateInviteLink: (householdId: string) => Promise<string | undefined>;
	joinHousehold: (token: string) => Promise<void>;
	fetchHouseholdFromToken: (token: string) => Promise<Household | undefined>;
	currentHouseholdId: string;
	setCurrentHouseholdId: (id: string) => void;
	updateCurrentHouseholdId: () => void;
	currentHouseholdUsers: any[]; // Consider typing this more specifically
	currentHouseholdTasks: Task[];
	fetchCurrentHouseholdTasks: () => Promise<void>;
	user: User | null;
	error: Error | null;
	taskTrades: TaskTrade[];
	taskTradesFromUser: TaskTrade[];
	fetchTaskTrades: (userId?: string) => Promise<void>;
	fetchTaskTradesFromUser: (userId?: string) => Promise<void>;
	solicitTaskTrade: (taskId: string, toUserId: string) => Promise<void>;
	respondToTaskTrade: (tradeId: string, isAccepted: boolean) => Promise<void>;
	currentHousehold: Household | null;
	fetchTasks: () => Promise<void>;
    editingTask: Task | null;
    setEditingTask: (task: Task | null) => void;
}

// Define the shape of your update context if needed
interface GlobalUpdateContextType {
	// Add any update methods here
}

// Create contexts with proper type annotations
export const GlobalContext = createContext<GlobalContextType>({} as GlobalContextType);
export const GlobalUpdateContext = createContext<GlobalUpdateContextType>({} as GlobalUpdateContextType);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [taskModal, setTaskModal] = useState(false);
	const [currentHouseholdId, setCurrentHouseholdId] = useState("");
	const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [households, setHouseholds] = useState<Household[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [taskTrades, setTaskTrades] = useState<TaskTrade[]>([]);
	const [taskTradesFromUser, setTaskTradesFromUser] = useState<TaskTrade[]>([]);

	const fetchHouseholds = async () => {
		try {
			const response = await axios.get('/api/households');
			response.data.households && setHouseholds(response.data.households);
		} catch (error: any) {
			console.error("Failed to fetch households", error);
			setError(error);
		}
	};

	const [currentHouseholdUsers, setCurrentHouseholdUsers] = useState([]);

	useEffect(() => {
		if (!currentHouseholdId) {
			setCurrentHousehold(null);
			return;
		}
		const fetchCurrentHousehold = async () => {
			try {
				const response = await axios.get(`/api/households/${currentHouseholdId}`);
				response.data && setCurrentHousehold(response.data);
			} catch (error: any) {
				console.error("Failed to fetch current household", error);
				setError(error);
			}
		};
		fetchCurrentHousehold();
	}, [currentHouseholdId]);

	useEffect(() => {
		if (!currentHouseholdId) return;
		const fetchCurrentUsers = async () => {
			try {
				const response = await axios.get(`/api/households/${currentHouseholdId}/members`);
				response.data.length && setCurrentHouseholdUsers(response.data);
				console.log(response.data);
			} catch (error: any) {
				console.error("Failed to fetch members", error);
				setError(error);
			}
		};
		fetchCurrentUsers();
	}, [currentHouseholdId]);

	useEffect(() => {
		console.log(currentHouseholdUsers);
	}, [currentHouseholdUsers]);

	const [tasks, setTasks] = useState<Task[]>([]);
	const [filteredTasks, setFilteredTasks] = useState<FilteredTasks>({
		overdue: [],
		today: [],
		laterThisWeek: [],
		laterThisMonth: [],
		someday: [],
	});

	const fetchTasks = async () => {
		setIsLoading(true);
		try {
			const res = await axios.get("/api/tasks");
			const orderedTasks = res.data.sort((a: Task, b: Task) => {
				return Number(new Date(a.date)) - Number(new Date(b.date));
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
		} catch (error: any) {
			console.log(error);
			setError(error);
		}
	};

	const deleteTask = async (id: string) => {
		try {
			const res = await axios.delete(`/api/tasks/${id}`);
			toast.success("Task deleted");
			fetchTasks();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	};

	const [currentHouseholdTasks, setCurrentHouseholdTasks] = useState<Task[]>([]);
	const fetchCurrentHouseholdTasks = async () => {
		try {
			if (!currentHouseholdId) return;
			const res = await axios.get(`/api/households/${currentHouseholdId}/tasks`);
			setCurrentHouseholdTasks(res.data);
			console.log(res.data);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (!currentHouseholdId) return;
		fetchCurrentHouseholdTasks();
		console.log("household changed");
	}, [currentHouseholdId]);

	const updateCurrentHouseholdId = () => {
		const url = window.location.href;
		const currentHousehold = url.includes("/households/")
			? url.split("/households/")[1]
			: null;

		currentHousehold && setCurrentHouseholdId(currentHousehold);
	};

	const deleteHousehold = async (id: string) => {
		try {
			const res = await axios.delete(`/api/households/${id}`);
			toast.success("Household deleted");
			fetchHouseholds();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	};

	const updateHousehold = async (household: string) => {
		try {
			const res = await axios.put('/api/households', household);
			toast.success("Household updated");
			fetchHouseholds();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	};

	const generateInviteLink = async (householdId: string) => {
		try {
			const { data } = await axios.post(`/api/households/${householdId}/invites`);
			return data.inviteLink;
		} catch (err) {
			alert("Failed to generate invite link: " + err);
			return undefined;
		}
	};

	const joinHousehold = async (token: string) => {
		try {
			console.log(token);
			const response = await axios.post(`/api/invites/${token}`);

			const data = await response.data;
			if (response.status === 200) {
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

	const fetchHouseholdFromToken = async (token: string) => {
		try {
			const response = await fetch(`/api/invites/${token}`);
			const data = await response.json();
			return data.household;
		} catch (err) {
			console.error(err);
			return undefined;
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
		fetchTasks();
		fetchUser();
	}, []);

	useEffect(() => {
		const currentHousehold = window.location.href.includes("/households/")
			? window.location.href.split("/households/")[1]
			: null;

		if (!currentHousehold) return;
		console.log(currentHousehold);

		setCurrentHouseholdId(currentHousehold);
	}, [window.location.href]);

	// Fetch task trades based on "toUser" prop
	const fetchTaskTrades = async (toUser = user?._id) => {
		try {
			const response = await axios.get(`/api/trades/toUser/${toUser}`);
			setTaskTrades(response.data.trades);
		} catch (error) {
			console.log(error);
		}
	};

	// Fetch task trades based on "fromUser" prop
	const fetchTaskTradesFromUser = async (fromUser = user?._id) => {
		try {
			const response = await axios.get(`/api/trades/fromUser/${fromUser}`);
			setTaskTradesFromUser(response.data.trades);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (!user || !user._id) return;
		fetchTaskTrades(user._id);
		fetchTaskTradesFromUser(user._id);
	}, [user]);

	const solicitTaskTrade = async (taskId: string, toUserId: string) => {
		try {
			const response = await axios.post('/api/trades', {
				taskId,
				toUserId,
			});
			console.log(response);
		} catch (error) {
			console.log(error);
		}
	};

	const respondToTaskTrade = async (tradeId: string, isAccepted: boolean) => {
		try {
			const response = await axios.put(`/api/trades/${tradeId}`, {
				isAccepted,
			});
			console.log(response);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		const setup = async () => {
			try {
				const response1 = await axios.delete("/api/tasks/old");
				const response2 = await axios.post("/api/tasks/placeholders");

				console.log(response1);
				console.log(response2);
			} catch (error: any) {
				console.log(error);
				setError(error);
			}
		};
		setup();
	}, []);

	return (
		<GlobalContext.Provider
			value={{
				tasks,
				filteredTasks,
				deleteTask,
				isLoading,
				taskModal,
				setTaskModal,
				updateHousehold,
				households,
				setHouseholds,
				fetchHouseholds,
				generateInviteLink,
				joinHousehold,
				fetchHouseholdFromToken,
				currentHouseholdId,
				setCurrentHouseholdId,
				updateCurrentHouseholdId,
				currentHouseholdUsers,
				currentHouseholdTasks,
				fetchCurrentHouseholdTasks,
				user,
				error,
				taskTrades,
				taskTradesFromUser,
				fetchTaskTrades,
				fetchTaskTradesFromUser,
				solicitTaskTrade,
				respondToTaskTrade,
				currentHousehold,
				fetchTasks, editingTask, setEditingTask
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