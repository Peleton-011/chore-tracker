"use client";
import Tasks from "./components/Tasks/Tasks";
import { useGlobalState } from "@/app/context/globalProvider";
import dateTaskUtils from "./utils/dateTaskUtils";

export default function Home() {
	const { tasks } = useGlobalState();

    return (
		<>
			<Tasks lists={ dateTaskUtils.filterAll(tasks) } />
		</>
	);
}
