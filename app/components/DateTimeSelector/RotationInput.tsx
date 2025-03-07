import { User } from "@/models/types";
import React, { useEffect, useState } from "react";
import { trash } from "@/app/utils/Icons";

interface RotationInputProps {
	members: User[];
	schedule: boolean[][];
	handleSubmit: (schedule: boolean[][]) => void;
}

const RotationInput = ({
	members,
	schedule: argSchedule,
	handleSubmit,
}: RotationInputProps) => {
	const [schedule, setSchedule] = useState(argSchedule);

	const randomSchedule = (length: number) => {
		const newSchedule = [];
		for (let i = 0; i < length; i++) {
			newSchedule.push(
				new Array(members.length)
					.fill(false)
					.map(() => Math.random() < 0.5)
			);
		}
		return newSchedule;
	};

	useEffect(() => {
		setSchedule(randomSchedule(3));
	}, []);

	const addRow = () => {
		setSchedule([...schedule, new Array(members.length).fill(false)]);
	};

	const removeRow = (index: number) => {
		const newSchedule = [...schedule];
		newSchedule.splice(index, 1);
		setSchedule(newSchedule);
	};

	const updateCell = (row: number, col: number, value: boolean) => {
		const newSchedule = [...schedule];
		newSchedule[row][col] = value;
		setSchedule(newSchedule);
	};

	// Grid with members and checkboxes
	return (
		<div
			className="grid center-children"
			style={{
				gridTemplateColumns: `repeat(${members.length + 2}, 1fr)`,
			}}
		>
			{/* First row, members surrounded by two empty cells */}
			<div></div>
			{members.map((member, index) => (
				<div key={member._id}>
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
				</div>
			))}
			<div></div>

			{/* The rest of the table */}
			{schedule.map((row, index) => {
				const fullRow = ["title", ...row, "delete"];
				return fullRow.map((cell, jindex) => {
					if (typeof cell === "string") {
						if (cell === "title") {
							return (
								<div key={index + "title"}>
									Cycle #{index + 1}
								</div>
							);
						} else {
							return (
								<button
									className="delete"
									onClick={() => removeRow(index)}
								>
									{trash}
								</button>
							);
						}
					} else {
						return (
							<button
								className="outline"
								key={jindex}
								onClick={() =>
									updateCell(index, jindex - 1, !cell)
								}
							>
								{cell ? "✔️" : "❌"}
							</button>
						);
					}
				});
			})}

			{/* Add row button */}
			<div></div>
			<div
				style={{
					gridColumn: "span " + members.length,
					padding: "1rem",
				}}
			>
				<button
					onClick={addRow}
					style={{ width: "100%", fontSize: "2rem", padding: "0px" }}
				>
					{" "}
					+{" "}
				</button>
			</div>
			<div></div>

			<div
				style={{
					gridColumn: "span " + (members.length + 2),
					padding: "1rem",
				}}
			>
				<button
					className="outline"
					onClick={() => handleSubmit(schedule)}
					style={{ width: "100%" }}
				>
					Save
				</button>
			</div>
		</div>
	);
};

export default RotationInput;
