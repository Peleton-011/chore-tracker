import React from "react";
import { format } from "date-fns";
import AutonomousModal from "../Modals/AutonomousModal";
import { RecurrenceDefinition } from "@/models/types";
import CustomRecurrenceInput from "./CustomRecurrenceInput";

interface RecurrenceInputProps {
	recurrenceDefinition: RecurrenceDefinition;
	setRecurrenceDefinition: (definition: RecurrenceDefinition) => void;
}

const RecurrenceInput: React.FC<RecurrenceInputProps> = ({
	recurrenceDefinition,
	setRecurrenceDefinition,
}) => {
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

	const handleRecurrenceSelect = (option: any) => {
		if (option.label === "Custom") {
			setRecurrenceModalOpen(true);
		} else {
			setRecurrenceDefinition({
				...recurrenceDefinition,
				intervalValue: option.value || 0,
				intervalUnit: option.unit || "days",
			});
		}
	};

	return (
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
						key={option.label}
						onClick={() => handleRecurrenceSelect(option)}
					>
						{option.label}
					</button>
				))}
			</div>
			<AutonomousModal
				isOpen={isRecurrenceModalOpen}
				onClose={() => setRecurrenceModalOpen(false)}
			>
				<CustomRecurrenceInput
					recurrenceDefinition={recurrenceDefinition}
					setRecurrenceDefinition={(recurrence) => {
						setRecurrenceDefinition(recurrence);
                        console.log(recurrence)
                        setRecurrenceModalOpen(false)
                    }}
				/>
			</AutonomousModal>
		</div>
	);
};

export default RecurrenceInput;
