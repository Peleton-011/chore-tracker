"use client";
import React, { useState } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import AutonomousModal from "../components/Modals/AutonomousModal";

const ExamplePage: React.FC = () => {
	const { taskTrades, taskTradesFromUser } = useGlobalState();
	const [isModalOpen, setModalOpen] = useState(false);

	return (
		<div>
			<h1>Testing Page</h1>

			<h3>Task Trades</h3>
			<div>{JSON.stringify(taskTrades, null, 2)}</div>
			<h3>Task Trades From User</h3>
			<div>{JSON.stringify(taskTradesFromUser, null, 2)}</div>

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
