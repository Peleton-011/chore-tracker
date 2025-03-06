import { RecurrenceDefinition } from "@/models/types";
import { format } from "date-fns";
import React, { useState } from "react";

interface RecurrenceInputProps {
	recurrenceDefinition: RecurrenceDefinition;
	setRecurrenceDefinition: (definition: RecurrenceDefinition) => void;
}

const CustomRecurrenceInput = ({
	recurrenceDefinition,
	setRecurrenceDefinition,
}: RecurrenceInputProps) => {
	// Initialize values
	const [localRecurrenceDefinition, setLocalRecurrenceDefinition] =
		useState<RecurrenceDefinition>({
			...recurrenceDefinition,
		});

	return (
		<>
			<h2>Custom Recurrence</h2>
			<label>
				Interval Value:
				<input
					type="number"
					min="1"
					value={localRecurrenceDefinition.intervalValue || ""}
					onChange={(e) =>
						setLocalRecurrenceDefinition({
							...localRecurrenceDefinition,
							intervalValue: parseInt(e.target.value, 10) || 0,
						})
					}
				/>
			</label>
			<label>
				Interval Unit:
				<select
					value={localRecurrenceDefinition.intervalUnit || ""}
					onChange={(e) =>
						setLocalRecurrenceDefinition({
							...localRecurrenceDefinition,
							intervalUnit: e.target.value,
						})
					}
				>
					<option value="">Select Unit</option>
					<option value="minutes">Minutes</option>
					<option value="hours">Hours</option>
					<option value="days">Days</option>
					<option value="weeks">Weeks</option>
					<option value="months">Months</option>
					<option value="years">Years</option>
				</select>
			</label>
			<label>
				<input
					type="checkbox"
					checked={localRecurrenceDefinition.doesRecurrenceEnd}
					onChange={(e) =>
						setLocalRecurrenceDefinition({
							...localRecurrenceDefinition,
							doesRecurrenceEnd: e.target.checked,
							recurrenceEndDate: e.target.checked
								? localRecurrenceDefinition.recurrenceEndDate
								: null,
						})
					}
				/>
				Recurrence End Date
			</label>
			<input
				type="date"
				value={
					localRecurrenceDefinition.recurrenceEndDate
						? format(
								localRecurrenceDefinition.recurrenceEndDate,
								"yyyy-MM-dd"
						  )
						: ""
				}
				onChange={(e) =>
					setLocalRecurrenceDefinition({
						...localRecurrenceDefinition,
						recurrenceEndDate: new Date(e.target.value),
					})
				}
				disabled={!localRecurrenceDefinition.doesRecurrenceEnd}
			/>
			<button onClick={() => setRecurrenceDefinition(localRecurrenceDefinition)}>Save</button>
		</>
	);
};

export default CustomRecurrenceInput;
