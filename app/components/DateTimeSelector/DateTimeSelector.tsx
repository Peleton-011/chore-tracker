import React, { useState } from "react";
import RecurrenceInput from "./RecurrenceInput";
import DateTimeInput from "./DateTimeInput";
import { RecurrenceDefinition, RotationDefinition, User } from "@/models/types";
import RotationInput from "./RotationInput";

interface DateTimeSelectorProps {
	dateTime: Date;
	recurrenceDefinition: RecurrenceDefinition;
	members: User[];
	handleSubmit: (data: any) => void;
}

const DateTimeSelector = ({
	dateTime: argDateTime,
	recurrenceDefinition: argRecurrenceDefinition,
	members,
	handleSubmit,
}: DateTimeSelectorProps) => {
	const [dateTime, setDateTime] = useState<Date>(argDateTime);
	const [recurrenceDefinition, setRecurrenceDefinition] =
		useState<RecurrenceDefinition>(argRecurrenceDefinition);

	const [rotationDefinition, setRotationDefinition] =
		useState<RotationDefinition>({
			members,
			rotationSchedule: [new Array(members.length).fill(false)],
		});

	return (
		<div>
			<h1>Date & Time</h1>
			<DateTimeInput dateTime={dateTime} setDateTime={setDateTime} />
			<RecurrenceInput
				recurrenceDefinition={recurrenceDefinition}
				setRecurrenceDefinition={(rec) => setRecurrenceDefinition(rec)}
			/>

			{members && (
				<RotationInput
					rotationDefinition={rotationDefinition}
					setRotationSchedule={(schedule) =>
						setRotationDefinition({
							...rotationDefinition,
							rotationSchedule: schedule,
						})
					}
				/>
			)}
			<button
				onClick={() =>
					handleSubmit({
						dateTime,
						recurrenceDefinition,
						rotationDefinition,
					})
				}
			>
				Apply changes
			</button>
		</div>
	);
};

export default DateTimeSelector;
