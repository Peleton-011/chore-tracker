import React, { useState } from "react";
import { format, startOfToday, addHours } from "date-fns";
import AutonomousModal from "../Modals/AutonomousModal";

interface DateTimeSelectorProps {
	handleSubmit: (data: {
		selectedDate: Date;
		selectedTime: Date;
		isRecurring: boolean;
		recurrenceIntervalValue: number;
		recurrenceIntervalUnit: string;
		recurrenceEndDate: Date | null;
	}) => void;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
	handleSubmit,
}) => {
	// Virtual form vv

	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedTime, setSelectedTime] = useState(new Date());
	const [isRecurring, setIsRecurring] = useState(false);
	const [doesRecurrenceEnd, setDoesRecurrenceEnd] = useState(true);
	const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(
		null
	);
	const [recurrenceIntervalValue, setRecurrenceIntervalValue] = useState(0);
	const [recurrenceIntervalUnit, setRecurrenceIntervalUnit] =
		useState("days");

	// Virtual form ^^

	const [isRecurrenceModalOpen, setRecurrenceModalOpen] =
		React.useState(false);

	const recurrenceOptions = [
		{ label: "Once", value: 0, unit: "days" },
		{ label: "Daily", value: 1, unit: "days" },
		{ label: "Weekly", value: 1, unit: "weeks" },
		{ label: "Monthly", value: 1, unit: "months" },
		{ label: "Yearly", value: 1, unit: "years" },
		{ label: "Custom", value: null, unit: null },
	];

	const handleRecurrenceSelect = (option: {
		label: string;
		value: number | null;
		unit: string | null;
	}) => {
		if (option.label === "Custom") {
			setRecurrenceModalOpen(true);
		} else {
			setRecurrenceIntervalValue(option.value || 0);
			setRecurrenceIntervalUnit(option.unit || "days");
			setIsRecurring(true);
		}
	};

	const inputs = {
		Date: (
			<input
				type="date"
				value={format(selectedDate, "yyyy-MM-dd")}
				onChange={(e) => setSelectedDate(new Date(e.target.value))}
			/>
		),
		Time: (
			<input
				type="time"
				value={format(selectedTime, "HH:mm")}
				onChange={(e) => {
					const [hours, minutes] = e.target.value.split(":");
					const updatedTime = new Date(selectedDate);
					updatedTime.setHours(
						parseInt(hours, 10),
						parseInt(minutes, 10)
					);
					setSelectedTime(updatedTime);
				}}
			/>
		),
		Recurrence: (
			<div
				style={{
					display: "flex",
					overflowX: "auto",
					gap: "1rem",
					padding: "1rem 0",
				}}
			>
				{recurrenceOptions.map((option) => (
					<button
						key={option.label}
						onClick={() => handleRecurrenceSelect(option)}
						className={
							(((recurrenceIntervalValue === option.value &&
								recurrenceIntervalUnit === option.unit) ||
								(option.label === "Custom" &&
									!recurrenceOptions.some(
										(o) =>
											o.value ===
												recurrenceIntervalValue &&
											o.unit === recurrenceIntervalUnit
									))) &&
								isRecurring) ||
							(option.label === "Once" && !isRecurring)
								? ""
								: "outline"
						}
					>
						{option.label}
					</button>
				))}
			</div>
		),
		CustomRecurrenceModal: (
			<AutonomousModal
				isOpen={isRecurrenceModalOpen}
				onClose={() => setRecurrenceModalOpen(false)}
			>
				<div>
					<h2>Custom Recurrence</h2>
					<div style={{ marginBottom: "1rem" }}>
						<label>
							Interval Value:
							<input
								type="number"
								min="1"
								value={recurrenceIntervalValue || ""}
								onChange={(e) =>
									setRecurrenceIntervalValue(
										e.target.value
											? parseInt(e.target.value, 10)
											: 0
									)
								}
								style={{ marginLeft: "0.5rem" }}
							/>
						</label>
					</div>
					<div style={{ marginBottom: "1rem" }}>
						<label>
							Interval Unit:
							<select
								value={recurrenceIntervalUnit || ""}
								onChange={(e) =>
									setRecurrenceIntervalUnit(e.target.value)
								}
								style={{ marginLeft: "0.5rem" }}
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
					</div>
					{/* Recurrence End Date */}
					<div style={{ marginTop: "1rem" }}>
						<label>
							<input
								type="checkbox"
								checked={doesRecurrenceEnd}
								onChange={(e) => {
									if (!e.target.checked) {
										setRecurrenceEndDate(null); // Clear end date when disabled
									}
									setDoesRecurrenceEnd(e.target.checked);
								}}
							/>
							Recurrence End Date
						</label>
						<input
							type="date"
							value={
								recurrenceEndDate
									? format(recurrenceEndDate, "yyyy-MM-dd")
									: ""
							}
							onChange={(e) =>
								setRecurrenceEndDate(new Date(e.target.value))
							}
							disabled={doesRecurrenceEnd}
						/>
					</div>
					<button
						onClick={() => {
							setRecurrenceModalOpen(false);
						}}
					>
						Save
					</button>
				</div>
			</AutonomousModal>
		),
	};

	return (
		<div>
			<h1>Date & Time</h1>

			{/* Starting Section */}
			<div>
				<h3>Starting</h3>
				<div
					style={{
						display: "flex",
						gap: "1rem",
						alignItems: "center",
					}}
				>
					{/* Date Selector */ inputs.Date}

					{/* Time Selector */ inputs.Time}
				</div>
			</div>

			{/* Occurring Section */}
			<div>
				<h3>Occurring</h3>
				{inputs.Recurrence}
			</div>

			{/* Custom Recurrence Modal */ inputs.CustomRecurrenceModal}

			<button
				onClick={() => {
					handleSubmit({
						selectedDate,
						selectedTime,
						isRecurring,
						recurrenceIntervalValue,
						recurrenceIntervalUnit,
						recurrenceEndDate,
					});
				}}
			>
				Apply changes
			</button>
		</div>
	);
};

export default DateTimeSelector;
