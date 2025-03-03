"use client";
import React from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import Tasks from "../components/Tasks/Tasks";

function page() {
	const { tasks } = useGlobalState();
	return (
		<div>
			<h1>Options</h1>
			{false && (
				<Tasks
					title="Completed Tasks"
					lists={[
						{
							title: "Completed",
							tasks: tasks.filter((task) => task.isCompleted),
						},
					]}
				/>
			)}
		</div>
	);
}

export default page;
