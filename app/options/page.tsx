"use client";
import React from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import Tasks from "../components/Tasks/Tasks";

function page() {
	const { completedTasks } = useGlobalState();
	return (
		<div>
			<h1>Options</h1>
			{false && <Tasks title="Completed Tasks" tasks={completedTasks} />}
		</div>
	);
}

export default page;
