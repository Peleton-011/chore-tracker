"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Button from "../Button/Button";
import { edit, add } from "@/app/utils/Icons";
import AutonomousModal from "../Modals/AutonomousModal";
import ImagePicker from "../ImagePicker/ImagePicker";

import EmptyIcon from "@/public/icons/EmptyIcon";
import HouseIcon from "@/public/icons/HouseIcon";
import SchoolIcon from "@/public/icons/SchoolIcon";
import OfficeIcon from "@/public/icons/OfficeIcon";

import { Household } from "@/models/types";

function CreateHousehold({
	household = null,
	closeModal,
}: {
	household: Household | null;
	closeModal: () => void;
}) {
	const [formData, setFormData] = useState({
		_id: household?._id || "",
		name: household?.name || "",
		members: household?.members || [],
		tasks: household?.tasks || [],
		description: household?.description || "",
	});

	const [iconState, setIconState] = useState({
		isPickerOpen: false,
		selectedIconIndex: 0,
		mainColor: "#D9A8F1",
		backgroundColor: "#9236A4",
	});

	const icons = [
		<EmptyIcon />,
		<HouseIcon />,
		<SchoolIcon />,
		<OfficeIcon />,
	];
	const isUpdate = !!formData._id;

	const handleChange = (key: string, value: any) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const updateIconState = (key: string, value: any) => {
		setIconState((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const response = isUpdate
				? await axios.put("/api/households", formData)
				: await axios.post("/api/households", formData);

			if (response.data.error) {
				toast.error(response.data.error);
				return;
			}

			toast.success(
				`Household ${isUpdate ? "updated" : "created"} successfully`
			);
			closeModal();
		} catch (error) {
			console.error(
				`Error ${isUpdate ? "updating" : "creating"} household:`,
				error
			);
			toast.error("Something went wrong");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="create-content-form">
			<div className="header-container">
				<h1>
					{isUpdate ? "Update a Household" : "Create a Household"}
				</h1>
				<button
					style={{ backgroundColor: iconState.backgroundColor }}
					onClick={(e) => {
						e.preventDefault();
						setIconState((prev) => ({
							...prev,
							isPickerOpen: true,
						}));
					}}
				>
					{React.cloneElement(icons[0], {
						color: iconState.mainColor,
					})}
				</button>
			</div>

			<div className="create-content-body grid">
				<InputField
					label="Title"
					name="name"
					value={formData.name}
					handleChange={handleChange}
				/>
				<InputField
					label="Description"
					name="description"
					value={formData.description}
					handleChange={handleChange}
					textarea
				/>
			</div>

			<AutonomousModal
				isOpen={iconState.isPickerOpen}
				onClose={() =>
					setIconState((prev) => ({ ...prev, isPickerOpen: false }))
				}
			>
				<ImagePicker
					icons={icons}
					iconState={iconState}
					updateIconState={updateIconState}
				/>
				<button
					onClick={() =>
						setIconState((prev) => ({
							...prev,
							isPickerOpen: false,
						}))
					}
				>
					Apply changes
				</button>
			</AutonomousModal>

			<div className="submit-btn">
				<Button
					type="submit"
					name={isUpdate ? "Update Household" : "Create Household"}
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

const InputField = ({
	label,
	name,
	value,
	handleChange,
	textarea = false,
}: {
	label: string;
	name: string;
	value: string;
	handleChange: (name: string, value: string) => void;
	textarea?: boolean;
}) => (
	<div className="input-control">
		<label htmlFor={name}>{label}</label>
		{textarea ? (
			<textarea
				id={name}
				name={name}
				rows={4}
				placeholder={label}
				value={value}
				onChange={(e) => handleChange(name, e.target.value)}
			/>
		) : (
			<input
				id={name}
				name={name}
				type="text"
				placeholder={label}
				value={value}
				onChange={(e) => handleChange(name, e.target.value)}
			/>
		)}
	</div>
);

export default CreateHousehold;
