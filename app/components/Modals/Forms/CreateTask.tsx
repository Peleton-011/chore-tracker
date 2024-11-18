"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../Button/Button";
import AutonomousModal from "../../Modals/AutonomousModal";
import UserSelector from "../../UserSelector/UserSelector";

import { edit, add, plus } from "@/app/utils/Icons";
import Calendar from "react-calendar";
import formatDate, { formatTime, formatDateTime } from "@/app/utils/formatDate";
import DateTimeSelector from "../../DateTimeSelector/DateTimeSelector";
import { addHours, startOfToday } from "date-fns";

function CreateTask({
	task: {
		id,
		title: argtitle,
		description: argdescription,
		date: argdate,
		completed: argcompleted,
		important: argimportant,
	},
	isMobile,
}: any) {
	const [title, setTitle] = useState(argtitle || "");
	const [description, setDescription] = useState(argdescription || "");
	const [date, setDate] = useState(argdate || new Date());
	const [completed, setCompleted] = useState(argcompleted || false);
	const [important, setImportant] = useState(argimportant || false);

	const inputs: any = {};

	//USERS STUFF
	const [isUserSelectorOpen, setUserSelectorOpen] = useState(false);

	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	//END USERS STUFF

	//DATETIME STUFF
	const [isDateTimeOpen, setDateTimeOpen] = useState(false);

	const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
	const [selectedTime, setSelectedTime] = useState<Date>(
		new Date(addHours(new Date(), 1).setMinutes(0))
	);
	const [recurrenceEndDate, setRecurrenceEndDate] = useState<
		Date | undefined
	>(undefined);
	const [isRecurring, setIsRecurring] = useState<boolean>(false);

	const [recurrenceIntervalValue, setRecurrenceIntervalValue] = useState<
		number | undefined
	>(undefined);

	const [recurrenceIntervalUnit, setRecurrenceIntervalUnit] = useState<
		string | undefined
	>(undefined);
	//End of datetime stuff

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
		householdOpened,
		fetchCurrentHouseholdTasks,
		currentHouseholdUsers,
	} = useGlobalState();

	const handleChange = (key: string, value: string | Value) => {
		switch (key) {
			case "title":
				setTitle(value);
				break;
			case "description":
				setDescription(value);
				break;
			case "date":
				setDate(value);
				break;
			case "completed":
				setCompleted(!completed);
				break;
			case "important":
				setImportant(!important);
				break;

			default:
				break;
		}
	};

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
				householdId: householdOpened || null,
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
					selectedDate={selectedDate}
					setSelectedDate={setSelectedDate}
					selectedTime={selectedTime}
					setSelectedTime={setSelectedTime}
					recurrenceEndDate={recurrenceEndDate}
					setRecurrenceEndDate={setRecurrenceEndDate}
					isRecurring={isRecurring}
					setIsRecurring={setIsRecurring}
					recurrenceIntervalUnit={recurrenceIntervalUnit}
					setRecurrenceIntervalUnit={setRecurrenceIntervalUnit}
					recurrenceIntervalValue={recurrenceIntervalValue}
					setRecurrenceIntervalValue={setRecurrenceIntervalValue}
				/>
				<button onClick={() => setDateTimeOpen(false)}>
					Apply changes
				</button>
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
					setSelectedUserIds={setSelectedUserIds}
				/>
				<button onClick={() => setUserSelectorOpen(false)}>
					Apply changes
				</button>
			</AutonomousModal>
		</>
	);

	return (
		<form onSubmit={handleSubmit} className="create-content-form">
			<h1>{isUpdate ? "Update a Task" : "Create a Task"}</h1>
			<div className="create-content-body grid">
				{isMobile && (
					<TitleInput title={title} handleChange={handleChange} />
				)}

				{!isMobile && (
					<div className="input-control">
						<TitleInput title={title} handleChange={handleChange} />
						{/* <ToggleInputs
							completed={completed}
							important={important}
							handleChange={handleChange}
						/> */}
					</div>
				)}
				<DescriptionInput
					description={description}
					handleChange={handleChange}
				/>

				{inputs.DateTime}

				{householdOpened && inputs.Users}

				<button>
					Reminder <br />
					on due date
					{/* TODO: Add toggle // ++ 5'before, the day before ...*/}
				</button>

				{(() => {
					const reminder = false;
					if (reminder) {
						return (
							<button>
								Overdue Reminder
								{/* TODO: Add toggle and options similar to the reminder thingy */}
							</button>
						);
					}
				})()}

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

function TitleInput({ title, handleChange }: any) {
	return (
		<div className="input-control">
			<label htmlFor="title">Title</label>
			<input
				name="title"
				id="title"
				type="text"
				placeholder="Title"
				value={title}
				onChange={(e) => handleChange("title", e.target.value)}
			/>
		</div>
	);
}
function DescriptionInput({ description, handleChange }: any) {
	return (
		<div className="input-control">
			<label htmlFor="description">Description</label>
			<textarea
				name="description"
				id="description"
				rows={4}
				placeholder="Description"
				value={description}
				onChange={(e) => handleChange("description", e.target.value)}
			/>
		</div>
	);
}

function ToggleInputs({ completed, important, handleChange }: any) {
	return (
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
						onChange={(e) =>
							handleChange("completed", e.target.value)
						}
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
						onChange={(e) =>
							handleChange("important", e.target.value)
						}
					/>
				</label>
			</div>
		</div>
	);
}

export default CreateTask;
