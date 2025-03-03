"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import React, { useState } from "react";
import { plus } from "@/app/utils/Icons";
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

function Tasks({ lists, title }: Props) {
	const { setTaskModal, setEditingTask } = useGlobalState();

	lists = lists.filter((list) => list.tasks.length > 0);
	// console.log("TASKS: ", tasks)
	return (
		<div className="tasks-container">
			{false && <IconsDisplay />}

			{lists.map(({ title, tasks }, index) => {
				return (
					<div key={index}>
						<h1>{title}</h1>

						<div className="tasks">
							{tasks &&
								tasks.map((task: any) => (
									<TaskItem
										key={task._id}
										task={task}
                                        editTask={(newTask) => {
                                            setEditingTask(newTask)
                                            setTaskModal(true)
                                        }}
									/>
								))}

							{
								// If its the last element in the list, add the create task button
								index === lists.length - 1 && (
									<button
										className="create-task"
										onClick={() => setTaskModal(true)}
									>
										{plus} Add New Task
									</button>
								)
							}
						</div>
					</div>
				);
			})}

			{lists.every((list) => list.tasks.length === 0) && (
				<button onClick={() => setTaskModal(true)} className="no-tasks">
					<h3>No Tasks Found :c</h3>
					<div>Click here and add a new task to get started</div>
				</button>
			)}
		</div>
	);
}

export default Tasks;
