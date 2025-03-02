"use client";

import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Button from "../Button/Button";
import AutonomousModal from "../Modals/AutonomousModal";
import formatDateTime from "@/app/utils/formatDate";
import DateTimeSelector from "../DateTimeSelector/DateTimeSelector";

import { edit, add } from "@/app/utils/Icons";
import { Household, Task } from "@/models/types";

interface CreateTaskProps {
	task: Task | null;
	closeModal: () => void;
	household?: Household;
}

function CreateTask({ task, closeModal, household }: CreateTaskProps) {
	const {
		_id,
		title: argTitle = "",
		description: argDescription = "",
		date: argDate = new Date(),
		isCompleted: argIsCompleted = false,
		isImportant: argIsImportant = false,
		user: argUser = "",
		household: argHousehold = "",
		recurringTaskDefinition: argRecurringTask = "",
		isPlaceholder: argIsPlaceholder = false,
		reminders: argReminders = [],
	} = task || {};

	const [taskState, setTaskState] = useState<Task>({
		_id: _id || "", // Ensure we always have an ID
		title: argTitle,
		description: argDescription,
		date: argDate,
		isCompleted: argIsCompleted,
		isImportant: argIsImportant,
		user: argUser,
		household: argHousehold,
		recurringTaskDefinition: argRecurringTask,
		isPlaceholder: argIsPlaceholder,
		reminders: argReminders.length
			? argReminders
			: [{ type: "before", offsetMinutes: 30, notified: false }],
		createdAt: new Date(),
		updatedAt: new Date(),
	});

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

	const isUpdate = !!_id;

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const response = isUpdate
				? await axios.put("/api/tasks", taskState)
				: await axios.post("/api/tasks", {
						...taskState,
						household: household?._id,
				  });

			if (response.data.error) {
				toast.error(response.data.error);
			} else {
				toast.success(
					isUpdate
						? "Task updated successfully"
						: "Task created successfully"
				);
				closeModal();
			}
		} catch (error) {
			console.error(error);
			toast.error("Something went wrong");
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
