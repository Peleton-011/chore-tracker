"use client";
import React, { useState } from "react";
import AutonomousModal from "../components/Modals/AutonomousModal";
import ImagePicker from "../components/ImagePicker/ImagePicker";
import UserSelector from "../components/UserSelector/UserSelector";

import HouseIcon from "@/public/icons/HouseIcon";
import SchoolIcon from "@/public/icons/SchoolIcon";
import OfficeIcon from "@/public/icons/OfficeIcon";

interface User {
	_id: string;
	name: string;
	avatar: string; // URL or path to the avatar image
}

const ExamplePage: React.FC = () => {
	const [isModalOpen, setModalOpen] = useState(false);

	const openModal = () => setModalOpen(true);
	const closeModal = () => setModalOpen(false);

	const [selectedUsers, setSelectedUsers] = useState<User[] | null>(null);

	const handleUserSelect = (users: User[]) => {
		// alert(`Selected users: ${users.map((user) => user.name).join(", ")}`);
		setSelectedUsers(users);
	};

	const icons = [<HouseIcon />, <SchoolIcon />, <OfficeIcon />];

	/* Make some sample users for testing following this schema: 
    interface User {
  _id: string;
  name: string;
  avatar: string; // URL or path to the avatar image
}
    */
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

	const [ModalContent, setModalContent] = useState<React.ReactNode>(null);

	return (
		<div>
			<h1>Testing Page</h1>

			<h3>Choose an icon</h3>
			<button
				style={{ backgroundColor }}
				onClick={() => {
					openModal();
					setModalContent(
						<ImagePicker
							icons={icons}
							selectedIconIndex={selectedIconIndex}
							setSelectedIconIndex={setSelectedIconIndex}
							mainColor={mainColor}
							setMainColor={setMainColor}
							backgroundColor={backgroundColor}
							setBackgroundColor={setBackgroundColor}
						/>
					);
				}}
			>
				{React.cloneElement(icons[0] as React.ReactElement, {
					color: mainColor,
				})}
			</button>

			<h3>Choose a user</h3>
			<UserSelector users={users} onUserSelect={handleUserSelect} />

			<AutonomousModal
				isOpen={isModalOpen}
				onClose={closeModal}
				content={ModalContent}
			>
				<button onClick={closeModal}>Apply changes</button>
			</AutonomousModal>
		</div>
	);
};

export default ExamplePage;
