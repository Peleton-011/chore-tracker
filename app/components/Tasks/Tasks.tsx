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
	const { isLoading, modal, editedTask, createTask, editTask } = useGlobalState();

	// console.log("TASKS: ", tasks)
	return (
		<div className="tasks-container">
			{modal && <Modal content={<CreateContent task={editedTask} />} />}
			<h1>{title}</h1>

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
