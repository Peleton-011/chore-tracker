"use client";
import React, { useState } from "react";

import ReminderSelector from "../components/ReminderSelector/ReminderSelector";
import AutonomousModal from "../components/Modals/AutonomousModal";

const ExamplePage: React.FC = () => {
	const [reminders, setRemindeers] = useState<any[]>([]);
	const [isReminderModalOpen, setReminderModalOpen] = useState(false);

	return (
		<div>
			<h1>Testing Page</h1>

			<button onClick={() => setReminderModalOpen(true)}>
				Set Reminders
			</button>

			<AutonomousModal
				isOpen={isReminderModalOpen}
				onClose={() => setReminderModalOpen(false)}
			>
				<ReminderSelector
					reminders={reminders}
					setReminders={setRemindeers}
				/>
			</AutonomousModal>
		</div>
	);
};

export default ExamplePage;
