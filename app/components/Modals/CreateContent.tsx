"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import Button from "../Button/Button";
import { edit, add, plus } from "@/app/utils/Icons";

function CreateContent({
	task: {
		id,
		title: argtitle,
		description: argdescription,
		date: argdate,
		completed: argcompleted,
		important: argimportant,
	},
}: any) {
	const [title, setTitle] = useState(argtitle || "");
	const [description, setDescription] = useState(argdescription || "");
	const [date, setDate] = useState(argdate || "");
	const [completed, setCompleted] = useState(argcompleted || false);
	const [important, setImportant] = useState(argimportant || false);

	const isUpdate =
		!!id ||
		!!argtitle ||
		!!argdescription ||
		!!argdate ||
		!!argcompleted ||
		!!argimportant;

	const { theme, allTasks, closeModal } = useGlobalState();

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
		<CreateContentStyled onSubmit={handleSubmit} theme={theme}>
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
				<textarea
					name="description"
					id="description"
					rows={4}
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

			<div className="input-control toggler">
				<label htmlFor="completed">Toggle Complete</label>
				<input
					name="completed"
					id="completed"
					type="checkbox"
					placeholder="Completed"
					value={completed.toString()}
					onChange={(e) => handleChange("completed", e.target.value)}
				/>
			</div>

			<div className="input-control toggler">
				<label htmlFor="important">Toggle Important</label>
				<input
					name="important"
					id="important"
					type="checkbox"
					placeholder="Important"
					value={important.toString()}
					onChange={(e) => handleChange("important", e.target.value)}
				/>
			</div>

			<div className="submit-btn flex justify-end">
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
		</CreateContentStyled>
	);
}

const CreateContentStyled = styled.form`
	> h1 {
		font-size: clamp(1.2rem, 5vw, 1.6rem);
		font-weight: 600;
	}

	color: ${({ theme }) => theme.colorGrey1};

	.input-control {
		position: relative;
		margin: 1.6rem 0;
		font-weight: 500;

		@media screen and (max-width: 450px) {
			margin: 1rem 0;
		}

		label {
			margin-bottom: 0.5rem;
			display: inline-block;
			font-size: clamp(0.9rem, 5vw, 1.2rem);

			span {
				color: ${({ theme }) => theme.colorGrey3};
			}
		}

		input,
		textarea {
			width: 100%;
			padding: 1rem;

			resize: none;
			background-color: ${({ theme }) => theme.colorGreyDark};
			color: ${({ theme }) => theme.colorGrey2};
			border-radius: 0.5rem;
		}
	}

	.submit-btn button {
		transition: all 0.35s ease-in-out;

		@media screen and (max-width: 500px) {
			font-size: 0.9rem !important;
			padding: 0.6rem 1rem !important;

			i {
				font-size: 1.2rem !important;
				margin-right: 0.5rem !important;
			}
		}

		i {
			color: ${({ theme }) => theme.colorGrey0};
		}

		&:hover {
			background: ${({ theme }) => theme.colorPrimaryGreen} !important;
			color: ${({ theme }) => theme.colorWhite} !important;
		}
	}

	.toggler {
		display: flex;
		align-items: center;
		justify-content: space-between;

		cursor: pointer;

		label {
			flex: 1;
		}

		input {
			width: initial;
		}
	}
`;

export default CreateContent;
