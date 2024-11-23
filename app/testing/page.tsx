"use client";
import React, { useState } from "react";

import ReminderSelector from "../components/ReminderSelector/ReminderSelector";

const ExamplePage: React.FC = () => {
	const [reminders, setRemindeers] = useState<any[]>([]);

	return (
		<div>
			<h1>Testing Page</h1>

			<ReminderSelector
				reminders={reminders}
				setReminders={setRemindeers}
			/>
		</div>
	);
};

export default ExamplePage;
