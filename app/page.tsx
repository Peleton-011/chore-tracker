"use client"
import Tasks from "./components/Tasks/Tasks";
import { useGlobalState } from "@/app/context/globalProvider";

export default function Home() {

    const { tasks } = useGlobalState();

	return (
		<>
			<Tasks title="Today" tasks={tasks}/>
		</>
	);
}
