"use client";

import React, { useState, useEffect } from "react";
import Button from "../Button/Button";
import AutonomousModal from "../Modals/AutonomousModal";
import formatDateTime from "@/app/utils/formatDate";
import DateTimeSelector from "../DateTimeSelector/DateTimeSelector";
import UserSelector from "../UserSelector/UserSelector";
import { addHours, startOfHour } from "date-fns";

import { edit, add } from "@/app/utils/Icons";
import {
	Household,
	Task,
	DEFAULT_TASK,
	User,
	DEFAULT_HOUSEHOLD,
} from "@/models/types";
import {
	checkCurrentHousehold,
	fetchHousehold,
	fetchHouseholdMembers,
} from "@/app/utils/households";
import RotationScheduleInput from "../DateTimeSelector/RotationInput";
import { OrganizationMembership } from "@clerk/nextjs/server";

interface CreateTaskProps {
	task?: Task | null;
	updateTask: (task: Task) => void;
	createTask: (task: Task) => void;
}

function CreateTask({ task, updateTask, createTask }: CreateTaskProps) {
	const [taskState, setTaskState] = useState<Task>({
		...DEFAULT_TASK,
		...task,
		date: task?.date || startOfHour(addHours(new Date(), 1)),
	});

	const [recurrenceDefinition, setRecurrenceDefinition] = useState<any>(null);

	const [targetUsers, setTargetUsers] = useState<User[]>([]);

	// Check if there is an active household
	const [currentHouseholdId, setCurrentHouseholdId] = useState<string>("");

	useEffect(() => {
		const fetchedHh = checkCurrentHousehold();
		setCurrentHouseholdId(fetchedHh || "");
	}, []);

	// Single piece of state to manage all of the household info at once
	const [household, setHousehold] = useState<Household | null>(null);

	// Fetch all of the important household data when the currentHouseholdId changes
	useEffect(() => {
		if (!currentHouseholdId) {
			return;
		}

		setTaskState((prev) => ({
			...prev,
			household: currentHouseholdId,
		}));

		const fetchMembers = async () => {
			const members =
				(await fetchHouseholdMembers(currentHouseholdId)) || [];
			const shallowHousehold =
				(await fetchHousehold(currentHouseholdId)) || DEFAULT_HOUSEHOLD;

			setHousehold({
				...shallowHousehold,
				_id: currentHouseholdId,
				members: members,
			});
		};

		fetchMembers();
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
						dateTime={taskState.date}
						recurrenceDefinition={recurrenceDefinition}
						members={targetUsers}
						handleSubmit={(data) => {
							updateTaskState("date", data.dateTime);
							setRecurrenceDefinition(data.recurrenceDefinition);
							updateModalState("isDateTimeOpen", false);
						}}
					/>
				</AutonomousModal>

				{currentHouseholdId && (
					<button
						className="outline"
						onClick={(e) => {
							e.preventDefault();
							updateModalState("isUserSelectorOpen", true);
						}}
					>
						Users <br />
						{targetUsers.length + " selected"}
					</button>
				)}

				{currentHouseholdId && (
					<AutonomousModal
						isOpen={modals.isUserSelectorOpen}
						onClose={() =>
							updateModalState("isUserSelectorOpen", false)
						}
					>
						<UserSelector
							users={(household?.members as User[]) || []}
							selectedUserIds={[taskState.user]}
							handleSubmit={(data) => {
                                setTargetUsers(data.selectedUserIds)
                                console.log(data)
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
