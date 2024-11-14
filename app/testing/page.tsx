"use client"
import React, { useState } from "react";
import AutonomousModal from "../components/Modals/AutonomousModal";

const ExamplePage: React.FC = () => {
	const [isModalOpen, setModalOpen] = useState(false);

	const openModal = () => setModalOpen(true);
	const closeModal = () => setModalOpen(false);

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

			<AutonomousModal
				isOpen={isModalOpen}
				onClose={closeModal}
				content={ContentComponent}
			/>
		</div>
	);
};

export default ExamplePage;
