"use client";
import React from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import Tasks from "../components/Tasks/Tasks";

function page() {
	const { incompleteTasks } = useGlobalState();
	return (
		<div>
			<h1>HouseHold</h1>
			{false && (
				<Tasks title="Incomplete Tasks" tasks={incompleteTasks} />
			)}
		</div>
	);
}

export default page;
