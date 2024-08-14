"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import React, { useState } from "react";
import { plus } from "@/app/utils/Icons";
import CreateContent from "../Modals/CreateContent";
import Modal from "../Modals/Modal";
import TaskItem from "../TaskItem/TaskItem";
import IconsDisplay from "@/app/utils/IconsDisplay";

interface TaskList {
	title: string;
	tasks: any[];
}

interface Props {
	lists: TaskList[];
    title?: string;
}

function Tasks({ lists }: Props) {
	const { isLoading, modal, editedTask, createTask, editTask } =
		useGlobalState();

	lists = lists.filter((list) => list.tasks.length > 0);
	// console.log("TASKS: ", tasks)
	return (
		<div className="tasks-container">
			{false && <IconsDisplay />}

			{modal && <Modal content={<CreateContent task={editedTask} />} />}

			{lists.map(({ title, tasks }, index) => {
				return (
					<>
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

							{
								// If its the last element in the list, add the create task button
								index === lists.length - 1 && (
									<button
										className="create-task"
										onClick={createTask}
									>
										{plus} Add New Task
									</button>
								)
							}
						</div>
					</>
				);
			})}
		</div>
	);
}

export default Tasks;
