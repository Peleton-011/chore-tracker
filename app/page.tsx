"use client";
import Tasks from "./components/Tasks/Tasks";
import { useGlobalState } from "@/app/context/globalProvider";

export default function Home() {
	const { filteredTasks } = useGlobalState();

	const taskLists = [
		{
			title: "Overdue",
			tasks: filteredTasks.overdue,
		},
		{
			title: "Today",
			tasks: filteredTasks.today,
		},
		{
			title: "Later this week",
			tasks: filteredTasks.laterThisWeek,
		},
		{
			title: "Later this month",
			tasks: filteredTasks.laterThisMonth,
		},
		{
			title: "Someday",
			tasks: filteredTasks.someday,
		},
	];

    return (
		<>
			<Tasks lists={ taskLists } />
		</>
	);
}
