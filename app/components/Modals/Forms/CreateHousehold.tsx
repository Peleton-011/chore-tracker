"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../Button/Button";
import { edit, add, plus } from "@/app/utils/Icons";
import Calendar from "react-calendar";

function CreateHousehold({
	household: {
		id,
		name: argname,
		members: argmembers,
		tasks: argtasks,
		description: argdescription,
	},
	isMobile,
}: any) {
	const [name, setName] = useState(argname || "");
	const [members, setMembers] = useState([...argmembers]);
	const [tasks, setTasks] = useState(argtasks || []);
	const [description, setDescription] = useState(argdescription || []);

	type ValuePiece = Date | null;

	type Value = ValuePiece | [ValuePiece, ValuePiece];

	const isUpdate =
		!!id ||
		!!argname ||
		!!argmembers.length ||
		!!argtasks.length ||
		!!argdescription;

	const { theme, fetchHouseholds, closeModal } = useGlobalState();

	const handleChange = (key: string, value: string | Value) => {
		switch (key) {
			case "name":
				setName(value);
				break;
			case "members":
				setMembers([value]);
				break;
			case "tasks":
				setTasks(value);
				break;
			case "description":
				setDescription(value);
				break;
			default:
				break;
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isUpdate) {
			const household = {
				id,
				name,
				members,
				tasks,
				description,
			};

			try {
				// @ts-ignore
				// const response = updateTask(...task);
				const response = await axios.put("/api/households", household);
				// @ts-ignore
				if (response.data.error) {
					// @ts-ignore
					toast.error(response.data.error);
				}
				toast.success("Household updated successfully");
				fetchHouseholds();
				closeModal();
			} catch (error) {
				console.log(error);
				toast.error("Something went wrong");
				console.log("ERROR UPDATING HOUSEHOLD: ", error);
			}

			return;
		}

		const household = {
			name,
			description,
			members,
			tasks,
		};

		try {
			// @ts-ignore
			// const response = createTask(...task);
			const response = await axios.post("/api/households", household);

			console.log(JSON.stringify(response));
			// @ts-ignore
			if (response.data.error) {
				// @ts-ignore
				toast.error(response.data.error);
			}

			toast.success("Household created successfully");
			fetchHouseholds();
			closeModal();
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
			console.log("ERROR CREATING HOUSEHOLD: ", error);
		}
	};
	return (
		<form onSubmit={handleSubmit} className="create-content-form">
			<h1>{isUpdate ? "Update a Household" : "Create a Household"}</h1>
			<div className="create-content-body grid">
				<TitleInput title={name} handleChange={handleChange} />

				<DescriptionInput
					title={description}
					handleChange={handleChange}
				/>

				{/* {<button>Add image</button> /* TODO: Implement */} */}
			</div>
			<div className="submit-btn">
				<Button
					type="submit"
					name={isUpdate ? "Update Household" : "Create Household"}
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
				onChange={(e) => handleChange("name", e.target.value)}
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

export default CreateHousehold;
