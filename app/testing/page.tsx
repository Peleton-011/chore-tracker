"use client";
import React, { useState } from "react";
import AutonomousModal from "../components/Modals/AutonomousModal";
import ImagePicker from "../components/ImagePicker/ImagePicker";
import HouseIcon from "@/public/icons/HouseIcon";
import SchoolIcon from "@/public/icons/SchoolIcon";
import OfficeIcon from "@/public/icons/OfficeIcon";

const ExamplePage: React.FC = () => {
	const [isModalOpen, setModalOpen] = useState(false);

	const openModal = () => setModalOpen(true);
	const closeModal = () => setModalOpen(false);

	const icons = [<HouseIcon />, <SchoolIcon />, <OfficeIcon />];

	const ContentComponent = ({ closeModal }: { closeModal: () => void }) => (
		<div>
			<h2>Modal Content</h2>
			<p>This is an example of modal content with a close button.</p>
			<button onClick={closeModal}>Close Modal</button>
		</div>
	);

	return (
		<div>
			<h1>Example Page</h1>
			<button onClick={openModal}>Open Modal</button>

			<h3>Choose an icon</h3>
			<ImagePicker icons={icons} />
			<HouseIcon />
			<AutonomousModal
				isOpen={isModalOpen}
				onClose={closeModal}
				content={ContentComponent}
			/>
		</div>
	);
};

export default ExamplePage;
