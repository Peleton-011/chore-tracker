"use client";
import React, { useState } from "react";

import AutonomousModal from "../components/Modals/AutonomousModal";

const ExamplePage: React.FC = () => {
	const [isModalOpen, setModalOpen] = useState(false);

	return (
		<div>
			<h1>Testing Page</h1>

			<button onClick={() => setModalOpen(true)}>Set Reminders</button>

			<AutonomousModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
			>
				Hello world!
			</AutonomousModal>
		</div>
	);
};

export default ExamplePage;
