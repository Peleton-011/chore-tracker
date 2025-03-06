import React, { useState } from "react";
import RecurrenceInput from "./RecurrenceInput";
import DateTimeInput from "./DateTimeInput";

interface RecurrenceDefinition {
	intervalValue: number;
	intervalUnit: string;
	doesRecurrenceEnd: boolean;
	recurrenceEndDate: Date | null;
}

const defaultRecurrenceDefinition: RecurrenceDefinition = {
	intervalUnit: "days",
	intervalValue: 1,
	doesRecurrenceEnd: false,
	recurrenceEndDate: null,
};

const DateTimeSelector: React.FC<{ handleSubmit: (data: any) => void }> = ({
	handleSubmit,
}) => {
	const [dateTime, setDateTime] = useState<Date | null>(null);
	const [recurrenceDefinition, setRecurrenceDefinition] =
		useState<RecurrenceDefinition>(defaultRecurrenceDefinition);

	return (
		<div>
			<h1>Date & Time</h1>
			<DateTimeInput dateTime={dateTime} setDateTime={setDateTime} />
			<RecurrenceInput
				recurrenceDefinition={recurrenceDefinition}
				setRecurrenceDefinition={(rec) => {
					setRecurrenceDefinition(rec);
					console.log(rec);
				}}
			/>
			<button
				onClick={() =>
					handleSubmit({
						dateTime,
						recurrenceDefinition,
					})
				}
			>
				Apply changes
			</button>
		</div>
	);
};

export default DateTimeSelector;
