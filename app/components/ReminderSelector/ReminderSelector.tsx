import React, { useState } from "react";
import AutonomousModal from "../Modals/AutonomousModal";

interface Reminder {
	type: "before" | "after";
	value: number;
	unit: string;
	total: number;
}

interface ReminderSelectorProps {
	handleSubmit: ({ reminders }: { reminders: Reminder[] }) => void;
	reminders: Reminder[];
}
interface ReminderSelectorSectionProps {
	type: "before" | "after";
}

const ReminderSelector: React.FC<ReminderSelectorProps> = ({
	handleSubmit,
	reminders: initialReminders,
}) => {
	const [reminders, setReminders] = useState<Reminder[]>(
		initialReminders || []
	);
	const [newReminder, setNewReminder] = useState<Reminder>({
		type: "before",
		value: 5,
		unit: "minutes",
		total: -5,
	});
	const [isCustomModalOpen, setCustomModalOpen] = useState(false);

	const timeUnits = ["minutes", "hours", "days", "weeks"];
	const preselectedOptions = [
		{ key: 1, value: 5, unit: "minutes" },
		{ key: 2, value: 1, unit: "hours" },
		{ key: 3, value: 1, unit: "days" },
	]; // Reasonable defaults

	const handleAddReminder = (reminder: Reminder) => {
		const calculatedMinutes = calculateMinutes(
			reminder.value,
			reminder.unit,
			reminder.type
		);
		const isDuplicate = reminders.some(
			(r) => r.total === calculatedMinutes
		);
		if (isDuplicate) {
			alert("This reminder already exists.");
			return;
		}

		setReminders([...reminders, reminder]);
	};

	const handleSaveCustomReminder = () => {
		handleAddReminder({
			...newReminder,
			total: calculateMinutes(
				newReminder.value,
				newReminder.unit,
				newReminder.type
			),
		});
		setCustomModalOpen(false); // Close the modal
	};

	const handleRemoveReminder = (index: number) => {
		const updatedReminders = [...reminders];
		updatedReminders.splice(index, 1);
		setReminders(updatedReminders);
	};

	const calculateMinutes = (
		value: number,
		unit: string,
		type: "before" | "after"
	): number => {
		const typeMultiplier = type === "before" ? -1 : 1;
		switch (unit) {
			case "hours":
				return value * 60 * typeMultiplier;
			case "days":
				return value * 24 * 60 * typeMultiplier;
			case "weeks":
				return value * 7 * 24 * 60 * typeMultiplier;
			default:
				return value * typeMultiplier; // Minutes
		}
	};

	const ReminderSelectorSection: React.FC<ReminderSelectorSectionProps> = ({
		type,
	}) => {
		return (
			<>
				{/* Add Reminder */}
				<div style={{ marginTop: "1rem" }}>
					<h3>{type.slice(0, 1).toUpperCase() + type.slice(1)}:</h3>

					{/* Pre-Selected Options */}
					<div
						style={{
							display: "flex",
							gap: "0.5rem",
							marginBottom: "1rem",
						}}
					>
						{preselectedOptions.map((option) => (
							<button
								key={option.key}
								onClick={() =>
									handleAddReminder({
										type,
										value: option.value,
										unit: option.unit,
										total: calculateMinutes(
											option.value,
											option.unit,
											type
										),
									})
								}
							>
								{getDisplayText(
									option.value,
									option.unit,
									type
								)}
							</button>
						))}
						{/* Open Modal for Custom Reminder */}
						<button
							onClick={() => {
								setCustomModalOpen(true),
									setNewReminder({
										value: 5,
										unit: "minutes",
										type: type,
										total: 5 * (type === "before" ? -1 : 1),
									});
							}}
						>
							Custom
						</button>
					</div>
				</div>
			</>
		);
	};

	const getDisplayText = (
		argValue: number,
		argUnit: string,
		type?: "before" | "after"
	) => {
		const changeUnits = (value: number, unit: string) => {
			let newValue = value;
			let newUnit = unit;
			switch (unit) {
				case "minutes":
					if (value % 60 !== 0) break;

					newValue /= 60;
					newUnit = "hours";

					break;
				case "hours":
					if (value % 24 !== 0) break;

					newValue /= 24;
					newUnit = "days";

					break;
				case "days":
					if (value % 7 !== 0) break;

					newValue /= 7;
					newUnit = "weeks";

					break;
				default:
					break;
			}

			return { unit: newUnit, value: newValue };
		};

		const { value, unit } = changeUnits(argValue, argUnit);

		// vv TODO: This should run when on mobile vv
		// if (unit === "minutes") return value + "' " + (type ? " " + type : "");
		if (value !== 1) return value + " " + unit + (type ? " " + type : "");
		if (unit === "days" && type) return "The day " + type;

		return (
			"One " + unit.slice(0, unit.length - 1) + (type ? " " + type : "")
		);
	};
	const ReminderListSection: React.FC<{
		title: string;
		reminders: any[];
		baseIndex: number;
	}> = ({ title, reminders, baseIndex }) => {
		return (
			<>
				<h3>{title}</h3>
				{reminders.map((reminder: any, index: number) => (
					<div
						key={index + baseIndex}
						style={{
							display: "flex",
							border: "1px",
							alignItems: "center",
							gap: "3rem",
						}}
					>
						<p style={{ margin: "0" }}>
							{getDisplayText(
								reminder.value,
								reminder.unit,
								reminder.type
							)}{" "}
							({reminder.total})
						</p>
						<button
							onClick={() =>
								handleRemoveReminder(index + baseIndex)
							}
						>
							Remove
						</button>
					</div>
				))}
			</>
		);
	};

	const ReminderList: React.FC<{ reminders: any[] }> = ({ reminders }) => {
		if (reminders.length === 0) return <p>No reminders added.</p>;
		const tempReminders = reminders.sort((a, b) => a.total - b.total);
		const before = tempReminders.filter((r) => r.total < 0);
		const after = tempReminders.filter((r) => r.total > 0);

		return (
			<>
				{before.length ? (
					<ReminderListSection
						title={"Before: "}
						reminders={before}
						baseIndex={0}
					/>
				) : null}
				{before.length && after.length ? <hr /> : null}
				{after.length ? (
					<ReminderListSection
						title={"After: "}
						reminders={after}
						baseIndex={before.length}
					/>
				) : null}
			</>
		);
	};

	return (
		<div>
			<h2>Reminder Selector</h2>

			{/* Add reminders */}
			<div style={{ marginLeft: "2rem" }}>
				<ReminderSelectorSection type="before" />
				<ReminderSelectorSection type="after" />
			</div>

			{/* Existing Reminders */}
			<h3>Existing Reminders</h3>
			<div style={{ marginLeft: "2rem" }}>
				<ReminderList reminders={reminders} />
			</div>

			{/* Custom Reminder Modal */}
			<AutonomousModal
				isOpen={isCustomModalOpen}
				onClose={() => setCustomModalOpen(false)}
			>
				<div>
					<h2>
						Add Reminder{" "}
						{newReminder.type.slice(0, 1).toUpperCase() +
							newReminder.type.slice(1)}
					</h2>
					{/* Value Selector */}
					<div style={{ marginBottom: "1rem" }}>
						<label>
							Value:
							<input
								type="number"
								min="1"
								value={newReminder.value}
								onChange={(e) =>
									setNewReminder({
										...newReminder,
										value:
											parseInt(e.target.value, 10) || 0,
									})
								}
								style={{ marginLeft: "0.5rem" }}
							/>
						</label>
					</div>

					{/* Unit Selector */}
					<div style={{ marginBottom: "1rem" }}>
						<label>
							Unit:
							<select
								value={newReminder.unit}
								onChange={(e) =>
									setNewReminder({
										...newReminder,
										unit: e.target.value,
									})
								}
								style={{ marginLeft: "0.5rem" }}
							>
								{timeUnits.map((unit) => (
									<option key={unit} value={unit}>
										{unit}
									</option>
								))}
							</select>
						</label>
					</div>

					{/* Save Button */}
					<button onClick={handleSaveCustomReminder}>
						Save Reminder
					</button>
				</div>
			</AutonomousModal>

			{/* Submit Button */}
			<button onClick={(e) => handleSubmit({ reminders })}>
				Apply changes
			</button>
		</div>
	);
};

export default ReminderSelector;
