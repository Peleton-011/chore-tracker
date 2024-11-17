"use client";
import React, { useState } from "react";
import AutonomousModal from "../components/Modals/AutonomousModal";
import ImagePicker from "../components/ImagePicker/ImagePicker";
import UserSelector from "../components/UserSelector/UserSelector";
import DateTimeSelector from "../components/DateTimeSelector/DateTimeSelector"

import HouseIcon from "@/public/icons/HouseIcon";
import SchoolIcon from "@/public/icons/SchoolIcon";
import OfficeIcon from "@/public/icons/OfficeIcon";

const ExamplePage: React.FC = () => {
	const [isImagePickerOpen, setImagePickerOpen] = useState(false);
	const [isUserSelectorOpen, setUserSelectorOpen] = useState(false);

	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	const icons = [<HouseIcon />, <SchoolIcon />, <OfficeIcon />];

	const users = [
		{ _id: "1", name: "Alice", avatar: "avatar.svg" },
		{ _id: "2", name: "Bob", avatar: "avatar.svg" },
		{ _id: "3", name: "Charlie", avatar: "avatar.svg" },
		{ _id: "4", name: "Diana", avatar: "avatar.svg" },
		{ _id: "5", name: "Eve", avatar: "avatar.svg" },
	];

	const [selectedIconIndex, setSelectedIconIndex] = useState<number | null>(
		null
	);
	const [mainColor, setMainColor] = useState<string>("#D9A8F1"); // Default main color
	const [backgroundColor, setBackgroundColor] = useState<string>("#9236A4"); // Default background color

	return (
		<div>
			<h1>Testing Page</h1>

			<h3>Choose an icon</h3>
			<button
				style={{ backgroundColor }}
				onClick={() => setImagePickerOpen(true)}
			>
				{React.cloneElement(icons[0] as React.ReactElement, {
					color: mainColor,
				})}
			</button>

			<button onClick={() => setUserSelectorOpen(true)}>
				<h3>Choose a user</h3>
			</button>

			{/* Image Picker Modal */}
			<AutonomousModal
				isOpen={isImagePickerOpen}
				onClose={() => setImagePickerOpen(false)}
			>
				<ImagePicker
					icons={icons}
					selectedIconIndex={selectedIconIndex}
					setSelectedIconIndex={setSelectedIconIndex}
					mainColor={mainColor}
					setMainColor={setMainColor}
					backgroundColor={backgroundColor}
					setBackgroundColor={setBackgroundColor}
				/>
				<button onClick={() => setImagePickerOpen(false)}>
					Apply changes
				</button>
			</AutonomousModal>

			{/* User Selector Modal */}
			<AutonomousModal
				isOpen={isUserSelectorOpen}
				onClose={() => setUserSelectorOpen(false)}
			>
				<UserSelector
					users={users}
					selectedUserIds={selectedUserIds}
					setSelectedUserIds={setSelectedUserIds}
				/>
				<button onClick={() => setUserSelectorOpen(false)}>
					Apply changes
				</button>
			</AutonomousModal>
			<DateTimeSelector />
		</div>
	);
};

export default ExamplePage;
