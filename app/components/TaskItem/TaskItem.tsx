"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import { edit, trash, exclamation } from "@/app/utils/Icons";
import React, { useState } from "react";
import formatDate from "@/app/utils/formatDate";
import TaskTradeSelector from "../TaskTradeSelector/TaskTradeSelector";
import { Task, DEFAULT_TASK } from "@/models/types";

interface Props {
	task: Task;
	editTask: (task: Task) => void;
}

function TaskItem({ task, editTask }: Props) {
	const { deleteTask, updateTask, solicitTaskTrade } =
		useGlobalState();
	const [selectedTradeTask, setSelectedTradeTask] = useState<string | null>(
		null
	);

	return (
		<div className="task-item container">
			<h1>
				<span>{task.title}</span>{" "}
				<span>{task.isImportant ? exclamation : ""}</span>
			</h1>
			<p>{task.description}</p>
			<p className="date">{formatDate(task.date)}</p>
			<div className="task-footer">
				<button
					className={task.isCompleted ? "completed" : "incomplete"}
					onClick={() => {
						const newTask = {
							...task,
							isCompleted: !task.isCompleted,
						};

						updateTask(task);
					}}
				>
					{task.isCompleted ? "Completed" : "Incomplete"}
				</button>
				{task.household && (
					<TaskTradeSelector
						householdId={task.household}
						onSelect={(taskId) => setSelectedTradeTask(taskId)}
					/>
				)}
				<button className="edit" onClick={() => editTask(task)}>
					{edit}
				</button>
				<button
					className="delete"
					onClick={() => {
						// console.log(task._id);
						deleteTask(task._id);
					}}
				>
					{trash}
				</button>
			</div>
		</div>
	);
}

export default TaskItem;
