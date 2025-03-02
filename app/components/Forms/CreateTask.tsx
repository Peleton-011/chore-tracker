"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Button from "../Button/Button";
import AutonomousModal from "../Modals/AutonomousModal";
import UserSelector from "../UserSelector/UserSelector";

import { edit, add, plus } from "@/app/utils/Icons";
import Calendar from "react-calendar";
import formatDate, { formatTime, formatDateTime } from "@/app/utils/formatDate";
import DateTimeSelector from "../DateTimeSelector/DateTimeSelector";
import { addHours, startOfToday } from "date-fns";
// import ReminderSelector from "../../ReminderSelector/ReminderSelector";
// import { Reminder } from "@/app/components/ReminderSelector/ReminderSelector";

function CreateTask({
	task: {
		id,
		title: argtitle,
		description: argdescription,
		date: argdate,
		completed: argcompleted,
		important: argimportant,
		users: argusers,
		recurrenceEndDate: argrecurrenceEndDate,
		recurrenceIntervalValue: argrecurrenceIntervalValue,
		recurrenceIntervalUnit: argrecurrenceIntervalUnit,
	},
	isMobile,
}: any) {
	const [title, setTitle] = useState(argtitle || "");
	const [description, setDescription] = useState(argdescription || "");
	const [completed, setCompleted] = useState(argcompleted || false);
	const [important, setImportant] = useState(argimportant || false);

	const inputs: any = {};

	//USERS STUFF
	const [isUserSelectorOpen, setUserSelectorOpen] = useState(false);

	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	//END USERS STUFF

	//DATETIME STUFF
	const [isDateTimeOpen, setDateTimeOpen] = useState(false);

	const [date, setDate] = useState(argdate || new Date());
	const [time, setTime] = useState<Date>(
		new Date(addHours(new Date(), 1).setMinutes(0))
	);
	const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(
		null
	);
	const [isRecurring, setIsRecurring] = useState<boolean>(false);

	const [recurrenceIntervalValue, setRecurrenceIntervalValue] =
		useState<number>(0);

	const [recurrenceIntervalUnit, setRecurrenceIntervalUnit] =
		useState<string>("days");
	//End of datetime stuff

	//REMINDERS vv
	// const [reminders, setReminders] = useState<Reminder[]>([]);
	// const [isReminderModalOpen, setReminderModalOpen] = useState(false);
	//REMINDERS ^^

	type ValuePiece = Date | null;

	type Value = ValuePiece | [ValuePiece, ValuePiece];

	const isUpdate =
		!!id ||
		!!argtitle ||
		!!argdescription ||
		!!argdate ||
		!!argcompleted ||
		!!argimportant;

	const {
		theme,
		allTasks,
		closeModal,
		currentHouseholdId,
		fetchCurrentHouseholdTasks,
		currentHouseholdUsers,
	} = useGlobalState();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const task = {
			title,
			description,
			date,
			completed: completed || false,
			important: important || false,
			isRecurring,
			intervalValue: recurrenceIntervalValue,
			intervalUnit: recurrenceIntervalUnit,
			recurrenceEndDate,
			// reminders,
			// setReminders,
			selectedUserIds,
		};

		if (isUpdate) {
			try {
				// @ts-ignore
				// const response = updateTask(...task);
				const response = await axios.put("/api/tasks", task);
				// @ts-ignore
				if (response.data.error) {
					// @ts-ignore
					toast.error(response.data.error);
				}
				toast.success("Task updated successfully");
				allTasks();
				fetchCurrentHouseholdTasks();
				closeModal();
			} catch (error) {
				console.log(error);
				toast.error("Something went wrong");
				console.log("ERROR UPDATING TASK: ", error);
			}

			return;
		}

		try {
			// @ts-ignore
			// const response = createTask(...task);
			const response = await axios.post("/api/tasks", {
				...task,
				householdId: currentHouseholdId || null,
			});

			console.log(JSON.stringify(response));

			// @ts-ignore
			if (response.data.error) {
				// @ts-ignore
				toast.error(response.data.error);
			}

			toast.success("Task created successfully");
			allTasks();
			fetchCurrentHouseholdTasks();
			closeModal();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
			console.log("ERROR CREATING TASK: ", error);
		}
	};

	inputs.DateTime = (
		<>
			<button
				className="outline"
				onClick={(e) => {
					e.preventDefault();
					setDateTimeOpen(true);
				}}
			>
				Date & Time <br />
				{/* {formatDate(date) + " , " + formatTime(date)} */}
				{formatDateTime(date)}
			</button>
			<AutonomousModal
				isOpen={isDateTimeOpen}
				onClose={() => setDateTimeOpen(false)}
			>
				<DateTimeSelector
					handleSubmit={(data) => {
						const {
							selectedDate,
							selectedTime,
							isRecurring,
							recurrenceIntervalValue,
							recurrenceIntervalUnit,
							recurrenceEndDate,
						} = data;
						setDate(selectedDate);
						setTime(selectedTime);
						setIsRecurring(isRecurring);
						setRecurrenceIntervalValue(recurrenceIntervalValue);
						setRecurrenceIntervalUnit(recurrenceIntervalUnit);
						setRecurrenceEndDate(recurrenceEndDate);
						setDateTimeOpen(false);

						console.log(JSON.stringify(data, null, 2));
					}}
				/>
			</AutonomousModal>
		</>
	);
	inputs.Users = (
		<>
			<button
				className="outline"
				onClick={(e) => {
					e.preventDefault();
					setUserSelectorOpen(true);
				}}
			>
				Choose Members <br />
			</button>
			{/* User Selector Modal */}
			<AutonomousModal
				isOpen={isUserSelectorOpen}
				onClose={() => setUserSelectorOpen(false)}
			>
				<UserSelector
					users={currentHouseholdUsers.map((u: any) => {
						return {
							_id: u._id,
							name: u.username,
							avatar: u.profilePic,
						};
					})}
					selectedUserIds={selectedUserIds}
					handleSubmit={(data) => {
						const { selectedUserIds } = data;

						setSelectedUserIds(selectedUserIds);
						setUserSelectorOpen(false);
					}}
				/>
			</AutonomousModal>
		</>
	);
	/*inputs.Reminders = (
		<>
			<button
				className="outline"
				onClick={(e) => {
					e.preventDefault();
					setReminderModalOpen(true);
				}}
			>
				Set Reminders <br />
			</button>
			{/* User Selector Modal *a/}
			<AutonomousModal
				isOpen={isReminderModalOpen}
				onClose={() => setReminderModalOpen(false)}
			>
				<ReminderSelector
					reminders={reminders}
					handleSubmit={(data) => {
						const { reminders } = data;

						setReminders(reminders);
						setReminderModalOpen(false);
					}}
				/>
			</AutonomousModal>
		</>
	);*/
	inputs.Title = (
		<div className="input-control">
			<label htmlFor="title">Title</label>
			<input
				name="title"
				id="title"
				type="text"
				placeholder="Title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>
		</div>
	);

	inputs.DescriptionInput = (
		<div className="input-control">
			<label htmlFor="description">Description</label>
			<textarea
				name="description"
				id="description"
				rows={4}
				placeholder="Description"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
			/>
		</div>
	);

	inputs.ToggleInputs = (
		<div className="toggler-group">
			<div className="input-control toggler">
				<label htmlFor="completed">
					Toggle Complete
					<input
						name="completed"
						id="completed"
						type="checkbox"
						placeholder="Completed"
						value={completed.toString()}
						onChange={(e) => setCompleted(e.target.value)}
					/>
				</label>
			</div>

			<div className="input-control toggler">
				<label htmlFor="important">
					Toggle Important
					<input
						name="important"
						id="important"
						type="checkbox"
						placeholder="Important"
						value={important.toString()}
						onChange={(e) => setImportant(e.target.value)}
					/>
				</label>
			</div>
		</div>
	);

	return (
		<form onSubmit={handleSubmit} className="create-content-form">
			<h1>{isUpdate ? "Update a Task" : "Create a Task"}</h1>
			<div className="create-content-body grid">
				{isMobile && inputs.Title}

				{!isMobile && (
					<div className="input-control">
						{inputs.Title}
						{/* <ToggleInputs
							completed={completed}
							important={important}
							handleChange={handleChange}
						/> */}
					</div>
				)}

				{inputs.DescriptionInput}

				{inputs.DateTime}

				{currentHouseholdId && inputs.Users}

				{/*inputs.Reminders*/}

				{/* {isMobile && (
					// <ToggleInputs
					// 	completed={completed}
					// 	important={important}
					// 	handleChange={handleChange}
					// />
				)} */}

				{/* <DateInput
					date={date}
					handleChange={handleChange}
					isMobile={isMobile}
				/> */}
			</div>
			<div className="submit-btn" style={{ marginTop: "2rem" }}>
				<Button
					type="submit"
					name={isUpdate ? "Update Task" : "Create Task"}
					icon={isUpdate ? edit : add}
					padding={"0.8rem 2rem"}
					borderRad={"0.8rem"}
					fw={"500"}
					fs={"1.2rem"}
					background={"rgb(0, 163, 255)"}
				/>
			</div>
		</form>
	);
}

export default CreateTask;
