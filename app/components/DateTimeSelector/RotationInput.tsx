import { User } from "@/models/types";
import React, { useState } from "react";

interface RotationInputProps {
	members: User[];
	setMembers: (members: string[]) => void;
	schedule: boolean[][];
	setSchedule: (schedule: boolean[][]) => void;
}

const RotationInput = ({
	members,
	setMembers,
	schedule: argSchedule,
	setSchedule: updateArgSchedule,
}: RotationInputProps) => {
	const [schedule, setSchedule] = useState(argSchedule);

	const addRow = () => {
		setSchedule([...schedule, new Array(members.length).fill(false)]);
	};

	const removeRow = (index: number) => {
		const newSchedule = [...schedule];
		newSchedule.splice(index, 1);
		setSchedule(newSchedule);
	};

	// Grid with members and checkboxes
	return (
		<div>
			{members.map((member) => (
				<div key={member._id} className="user-card">
					<img
						src={member.avatar}
						alt={`${member.name}'s avatar`}
						className="avatar"
						style={{
							width: "50px",
							height: "50px",
							borderRadius: "50%",
						}}
					/>
					<p>{member.name}</p>
				</div>
			))}
		</div>
	);
};

export default RotationInput;
