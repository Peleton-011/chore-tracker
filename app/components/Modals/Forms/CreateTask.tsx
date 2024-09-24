"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../Button/Button";
import { edit, add, plus } from "@/app/utils/Icons";
import Calendar from "react-calendar";

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

	type ValuePiece = Date | null;

	type Value = ValuePiece | [ValuePiece, ValuePiece];

	const isUpdate =
		!!id ||
		!!argtitle ||
		!!argdescription ||
		!!argdate ||
		!!argcompleted ||
		!!argimportant;

	const { theme, allTasks, closeModal } = useGlobalState();

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

		if (isUpdate) {
			const task = {
				id,
				title,
				description,
				date,
				completed,
				important,
			};

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
				closeModal();
			} catch (error) {
				console.log(error);
				toast.error("Something went wrong");
				console.log("ERROR UPDATING TASK: ", error);
			}

			return;
		}

		const task = {
			title,
			description,
			date,
			completed,
			important,
		};

		try {
			// @ts-ignore
			// const response = createTask(...task);
			const response = await axios.post("/api/tasks", task);

			console.log(JSON.stringify(response));
			// @ts-ignore
			if (response.data.error) {
				// @ts-ignore
				toast.error(response.data.error);
			}

			toast.success("Task created successfully");
			allTasks();
			closeModal();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
			console.log("ERROR CREATING TASK: ", error);
		}
	};

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
						<ToggleInputs
							completed={completed}
							important={important}
							handleChange={handleChange}
						/>
					</div>
				)}
				<DescriptionInput
					description={description}
					handleChange={handleChange}
				/>

				{isMobile && (
					<ToggleInputs
						completed={completed}
						important={important}
						handleChange={handleChange}
					/>
				)}

				<DateInput date={date} handleChange={handleChange} isMobile={isMobile} />
			</div>
			<div className="submit-btn">
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
function DateInput({ date, handleChange, isMobile }: any) {
	return (
		<div className={"input-control " + (isMobile ? "" : "wide")}>
			<label htmlFor="date">Date</label>
			<Calendar
				onChange={(e) => handleChange("date", e)}
				value={date}
				// name="date"
				// id="date"
				next2Label={null}
				prev2Label={null}
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
