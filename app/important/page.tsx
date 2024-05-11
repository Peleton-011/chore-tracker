"use client";
import React from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import Tasks from "../components/Tasks/Tasks";

function page() {
	const { importantTasks } = useGlobalState();
	return <Tasks title="Importent Tasks" tasks={importantTasks} />;
}

export default page;
