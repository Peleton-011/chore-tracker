"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import React, { useState } from "react";
import { plus } from "@/app/utils/Icons";
import CreateContent from "../Modals/CreateContent";
import Modal from "../Modals/Modal";
import TaskItem from "../TaskItem/TaskItem";

interface Props {
	title: string;
	tasks: any[];
}

function Tasks({ title, tasks }: Props) {
	const { isLoading, openModal, modal } = useGlobalState();

	const [editedTask, setEditedTask] = useState({
		id: "",
		title: "",
		description: "",
		date: "",
		isCompleted: false,
		isImportant: false,
	});

	const resetEditedTask = () => {
		setEditedTask({
			id: "",
			title: "",
			description: "",
			date: "",
			isCompleted: false,
			isImportant: false,
		});
	};

	const createTask = () => {
		resetEditedTask();
		openModal();
	};

	const editTask = (task: any) => {
		setEditedTask({
			id: task.id,
			title: task.title,
			description: task.description,
			date: task.date,
			isCompleted: task.isCompleted,
			isImportant: task.isImportant,
		});

		openModal();
	};

	// console.log("TASKS: ", tasks)
	return (
		<div className="tasks-container">
			{modal && <Modal content={<CreateContent task={editedTask} />} />}
			<h1>{title}</h1>

			<button className="btn-rounded" onClick={createTask}>
				{plus}
			</button>

			<div className="tasks">
				{tasks &&
					tasks.map((task: any) => (
						<TaskItem
							key={task._id}
							id={task._id}
							{...task}
							editTask={editTask}
						/>
					))}

				<button className="create-task" onClick={createTask}>
					{plus} Add New Task
				</button>
			</div>
		</div>
	);
}

export default Tasks;
