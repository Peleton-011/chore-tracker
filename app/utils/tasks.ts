import { Task } from "@/models/types";
import axios from "axios";
import toast from "react-hot-toast";

export const fetchTasks = async () => {
	try {
		const res = await axios.get("/api/tasks");
		const orderedTasks = res.data.sort((a: Task, b: Task) => {
			return Number(new Date(a.date)) - Number(new Date(b.date));
		});

		return orderedTasks;
	} catch (error) {
		console.error(error);
		toast.error("Something went wrong");
	}
};
