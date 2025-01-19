"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import { edit, trash, exclamation } from "@/app/utils/Icons";
import React, { useState } from "react";
import formatDate from "@/app/utils/formatDate";
import TaskTradeSelector from "../TaskTradeSelector/TaskTradeSelector";

interface Props {
	title: string;
	description: string;
	date: string;
	isCompleted: boolean;
	isImportant: boolean;
	id: string;
	editTask: ({
		id,
		isCompleted,
		isImportant,
		title,
		description,
		date,
	}: {
		id: string;
		isCompleted: boolean;
		isImportant: boolean;
		title: string;
		description: string;
		date: string;
	}) => void;
}

function TaskItem({
	title,
	description,
	date,
	isCompleted,
	isImportant,
	id,
	editTask,
}: Props) {
	const { deleteTask, updateTask, solicitTaskTrade, currentHousehold } =
		useGlobalState();
	const [selectedTradeTask, setSelectedTradeTask] = useState<string | null>(
		null
	);
	return (
		<div className="task-item container">
			<h1>
				<span>{title}</span>{" "}
				<span>{isImportant ? exclamation : ""}</span>
			</h1>
			<p>{description}</p>
			<p className="date">{formatDate(date)}</p>
			<div className="task-footer">
				<button
					className={isCompleted ? "completed" : "incomplete"}
					onClick={() => {
						const task = {
							id,
							isCompleted: !isCompleted,
						};

						updateTask(task);
					}}
				>
					{isCompleted ? "Completed" : "Incomplete"}
				</button>
				{currentHousehold && (
					<TaskTradeSelector
						householdId={currentHousehold._id}
						onSelect={(taskId) => setSelectedTradeTask(taskId)}
					/>
				)}
				<button
					className="edit"
					onClick={() =>
						editTask({
							id,
							isCompleted,
							isImportant,
							title,
							description,
							date,
						})
					}
				>
					{edit}
				</button>
				<button
					className="delete"
					onClick={() => {
						console.log(id);
						deleteTask(id);
					}}
				>
					{trash}
				</button>
			</div>
		</div>
	);
}

export default TaskItem;
