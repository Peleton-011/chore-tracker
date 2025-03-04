"use client";

import React, { useState, useEffect } from "react";
import Button from "../Button/Button";
import AutonomousModal from "../Modals/AutonomousModal";
import formatDateTime from "@/app/utils/formatDate";
import DateTimeSelector from "../DateTimeSelector/DateTimeSelector";
import UserSelector from "../UserSelector/UserSelector";

import { edit, add } from "@/app/utils/Icons";
import { Household, Task, DEFAULT_TASK, User } from "@/models/types";
import {
	checkCurrentHousehold,
	fetchHouseholdMembers,
} from "@/app/utils/households";

interface CreateTaskProps {
	task?: Task | null;
	updateTask: (task: Task) => void;
	createTask: (task: Task) => void;
}

function CreateTask({ task, updateTask, createTask }: CreateTaskProps) {
	const [taskState, setTaskState] = useState<Task>({
		...DEFAULT_TASK,
		...task,
	});

	const [currentHouseholdMembers, setCurrentHouseholdMembers] = useState<
		User[] | null
	>(null);

	const [targetUsers, setTargetUsers] = useState<User[]>([]);

	// Check if there is an active household, if so, add it to the task
	const currentHouseholdId = checkCurrentHousehold();

	useEffect(() => {
		if (currentHouseholdId) {
			setTaskState((prev) => ({
				...prev,
				household: currentHouseholdId,
			}));

			const fetchMembers = async () => {
				const members = await fetchHouseholdMembers(currentHouseholdId);
				setCurrentHouseholdMembers(members || null);
			};

			fetchMembers();
		}
	}, [currentHouseholdId]);

	const [modals, setModals] = useState({
		isUserSelectorOpen: false,
		isDateTimeOpen: false,
	});

	const updateTaskState = (key: keyof Task, value: any) => {
		setTaskState((prev) => ({ ...prev, [key]: value }));
	};

	const updateModalState = (key: keyof typeof modals, value: boolean) => {
		setModals((prev) => ({ ...prev, [key]: value }));
	};

	const isUpdate = !!taskState._id;

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isUpdate) {
			updateTask(taskState);
		} else {
			createTask(taskState);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="create-content-form">
			<h1>{isUpdate ? "Update Task" : "Create Task"}</h1>

			<div className="create-content-body grid">
				<div className="input-control">
					<label htmlFor="title">Title</label>
					<input
						id="title"
						type="text"
						placeholder="Title"
						value={taskState.title}
						onChange={(e) =>
							updateTaskState("title", e.target.value)
						}
					/>
				</div>

				<div className="input-control">
					<label htmlFor="description">Description</label>
					<textarea
						id="description"
						rows={4}
						placeholder="Description"
						value={taskState.description}
						onChange={(e) =>
							updateTaskState("description", e.target.value)
						}
					/>
				</div>

				<button
					className="outline"
					onClick={(e) => {
						e.preventDefault();
						updateModalState("isDateTimeOpen", true);
					}}
				>
					Date & Time <br />
					{formatDateTime(taskState.date)}
				</button>
				<AutonomousModal
					isOpen={modals.isDateTimeOpen}
					onClose={() => updateModalState("isDateTimeOpen", false)}
				>
					<DateTimeSelector
						handleSubmit={(data) => {
							updateTaskState("date", data.selectedDate);
							updateModalState("isDateTimeOpen", false);
						}}
					/>
				</AutonomousModal>
				{currentHouseholdId && (
					<AutonomousModal
						isOpen={modals.isUserSelectorOpen}
						onClose={() =>
							updateModalState("isUserSelectorOpen", false)
						}
					>
						<UserSelector
							users={currentHouseholdMembers || []}
							selectedUserIds={[taskState.user]}
							handleSubmit={(data) => {
								updateModalState("isUserSelectorOpen", false);
							}}
						/>
					</AutonomousModal>
				)}

				<div className="toggler-group">
					<label>
						Completed
						<input
							type="checkbox"
							checked={taskState.isCompleted}
							onChange={(e) =>
								updateTaskState("isCompleted", e.target.checked)
							}
						/>
					</label>
					<label>
						Important
						<input
							type="checkbox"
							checked={taskState.isImportant}
							onChange={(e) =>
								updateTaskState("isImportant", e.target.checked)
							}
						/>
					</label>
				</div>
			</div>

			<div className="submit-btn" style={{ marginTop: "2rem" }}>
				<Button
					type="submit"
					name={isUpdate ? "Update Task" : "Create Task"}
					icon={isUpdate ? edit : add}
					padding="0.8rem 2rem"
					borderRad="0.8rem"
					fw="500"
					fs="1.2rem"
					background="rgb(0, 163, 255)"
				/>
			</div>
		</form>
	);
}

export default CreateTask;
