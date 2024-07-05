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
}

function Tasks({ lists }: Props) {
	const { isLoading, modal, editedTask, createTask, editTask } =
		useGlobalState();

	// console.log("TASKS: ", tasks)
	return (
		<div className="tasks-container">
			{false && <IconsDisplay />}

			{modal && <Modal content={<CreateContent task={editedTask} />} />}

			{lists.map(({ title, tasks }) => {
				return (
					tasks.length > 0 && (
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
							</div>
						</>
					)
				);
			})}
			<button className="create-task" onClick={createTask}>
				{plus} Add New Task
			</button>
		</div>
	);
}

export default Tasks;
