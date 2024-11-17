import React, { useState } from "react";
import { format, startOfTomorrow, startOfToday, addHours } from "date-fns";
import AutonomousModal from "../Modals/AutonomousModal";

const DateTimeSelector: React.FC = () => {
	const [isDateModalOpen, setDateModalOpen] = useState(false);
	const [isTimeModalOpen, setTimeModalOpen] = useState(false);
	const [isRecurrenceModalOpen, setRecurrenceModalOpen] = useState(false);

	const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
	const [selectedTime, setSelectedTime] = useState<Date>(
		new Date(addHours(new Date(), 1).setMinutes(0))
	);
	const [recurrence, setRecurrence] = useState<string>("Once");

	const handleDateChange = (date: Date) => {
		setSelectedDate(date);
		setDateModalOpen(false);
	};

	const handleTimeChange = (time: Date) => {
		setSelectedTime(time);
		setTimeModalOpen(false);
	};

	const recurrenceOptions = [
		"Once",
		"Daily",
		"Weekly",
		"Monthly",
		"Yearly",
		"Custom",
	];

	return (
		<div>
			<h1>Date & Time</h1>

			<div>
				<h3>Starting</h3>
				<div
					style={{
						display: "flex",
						gap: "1rem",
						alignItems: "center",
					}}
				>
					{/* Date Selector */}
					<button onClick={() => setDateModalOpen(true)}>
						{selectedDate.getTime() === startOfToday().getTime()
							? "Today"
							: selectedDate.getTime() ===
							  startOfTomorrow().getTime()
							? "Tomorrow"
							: format(selectedDate, "yyyy-MM-dd")}
					</button>

					{/* Time Selector */}
					<button onClick={() => setTimeModalOpen(true)}>
						{format(selectedTime, "HH:mm")}
					</button>
				</div>
			</div>

			<div>
				<h3>Occurring</h3>
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
							key={option}
							onClick={() => {
								if (option === "Custom")
									setRecurrenceModalOpen(true);
								else setRecurrence(option);
							}}
							style={{
								padding: "0.5rem 1rem",
								borderRadius: "5px",
								backgroundColor:
									recurrence === option ? "#ddd" : "#fff",
								border: "1px solid #ccc",
								cursor: "pointer",
							}}
						>
							{option}
						</button>
					))}
				</div>
			</div>

			{/* Date Modal */}
			<AutonomousModal
				isOpen={isDateModalOpen}
				onClose={() => setDateModalOpen(false)}
				content={
					<div>
						<h2>Select Date</h2>
						<button
							onClick={() => handleDateChange(startOfToday())}
						>
							Today
						</button>
						<button
							onClick={() => handleDateChange(startOfTomorrow())}
						>
							Tomorrow
						</button>
						{/* Add a more comprehensive date picker component here */}
					</div>
				}
			/>

			{/* Time Modal */}
			<AutonomousModal
				isOpen={isTimeModalOpen}
				onClose={() => setTimeModalOpen(false)}
				content={
					<div>
						<h2>Select Time</h2>
						{/* Example: Allow input for time */}
						<input
							type="time"
							defaultValue={format(selectedTime, "HH:mm")}
							onChange={(e) =>
								handleTimeChange(
									new Date(
										`${format(
											selectedDate,
											"yyyy-MM-dd"
										)}T${e.target.value}`
									)
								)
							}
						/>
					</div>
				}
			/>

			{/* Custom Recurrence Modal */}
			<AutonomousModal
				isOpen={isRecurrenceModalOpen}
				onClose={() => setRecurrenceModalOpen(false)}
				content={
					<div>
						<h2>Custom Recurrence</h2>
						<label>
							Interval Value:
							<input
								type="number"
								min="1"
								onChange={(e) =>
									console.log(
										"Update interval value: ",
										parseInt(e.target.value, 10)
									)
								}
							/>
						</label>
						<label>
							Interval Unit:
							<select
								onChange={(e) =>
									console.log(
										"Update interval unit: ",
										e.target.value
									)
								}
							>
								<option value="minutes">Minutes</option>
								<option value="hours">Hours</option>
								<option value="days">Days</option>
								<option value="weeks">Weeks</option>
								<option value="months">Months</option>
								<option value="years">Years</option>
							</select>
						</label>
						<label>
							Recurrence End Date:
							<input
								type="date"
								onChange={(e) =>
									console.log(
										"Update recurrence end date: ",
										e.target.value
									)
								}
							/>
						</label>
					</div>
				}
			/>
		</div>
	);
};

export default DateTimeSelector;
