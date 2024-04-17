"use client";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

function CreateContent() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState("");
	const [completed, setCompleted] = useState(false);
	const [important, setImportant] = useState(false);

	const handleChange = (key: string, value: string) => {
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
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
			console.log("ERROR CREATING TASK: ", error);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h1>Create a Task</h1>
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

			<div className="input-control">
				<label htmlFor="description">Description</label>
				<input
					name="description"
					id="description"
					type="text"
					placeholder="Description"
					value={description}
					onChange={(e) =>
						handleChange("description", e.target.value)
					}
				/>
			</div>

			<div className="input-control">
				<label htmlFor="date">Date</label>
				<input
					name="date"
					id="date"
					type="text"
					placeholder="Date"
					value={date}
					onChange={(e) => handleChange("date", e.target.value)}
				/>
			</div>

			<div className="input-control">
				<label htmlFor="completed">Completed</label>
				<input
					name="completed"
					id="completed"
					type="checkbox"
					placeholder="Completed"
					value={completed.toString()}
					onChange={(e) => handleChange("completed", e.target.value)}
				/>
			</div>

			<div className="input-control">
				<label htmlFor="important">Important</label>
				<input
					name="important"
					id="important"
					type="checkbox"
					placeholder="Important"
					value={important.toString()}
					onChange={(e) => handleChange("important", e.target.value)}
				/>
			</div>

			<div className="submit-btn">
				<button type="submit">
					<span>Create</span>
				</button>
			</div>
		</form>
	);
}

export default CreateContent;
