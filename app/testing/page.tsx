"use client";
import React, { useState } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import AutonomousModal from "../components/Modals/AutonomousModal";
import RotationInput from "../components/DateTimeSelector/RotationInput";
import { User } from "@/models/types";

const ExamplePage: React.FC = () => {
	const {
		taskTrades,
		taskTradesFromUser,
		fetchTaskTrades,
		fetchTaskTradesFromUser,
	} = useGlobalState();
	const [isModalOpen, setModalOpen] = useState(false);

	const [isRotationModalOpen, setRotationModalOpen] = useState(false);

	const [members, setMembers] = useState<User[]>([
		{
			_id: "1",
			name: "Antonio",
			avatar: "https://static.vecteezy.com/system/resources/previews/024/183/502/original/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg",
		},
		{
			_id: "2",
			name: "Fernando",
			avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
		},
		{
			_id: "1",
			name: "Alonso",
			avatar: "http://www.marktechpost.com/wp-content/uploads/2023/05/7309681-scaled.jpg",
		},
	]);

	return (
		<div>
			<h1>Testing Page</h1>

			<h3>Task Trades</h3>
			<div>{JSON.stringify(taskTrades, null, 2)}</div>
			<h3>Task Trades From User</h3>
			<div>{JSON.stringify(taskTradesFromUser, null, 2)}</div>

			<button onClick={() => setModalOpen(true)}>Set Reminders</button>

			<button onClick={() => setRotationModalOpen(true)}>
				Set Rotation
			</button>

			<AutonomousModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
			>
				Hello world!
			</AutonomousModal>

			<AutonomousModal
				isOpen={isRotationModalOpen}
				onClose={() => setRotationModalOpen(false)}
			>
				<RotationInput
					members={members}
					
					schedule={[Array(members.length).fill(false)]}
					handleSubmit={() => {}}
				/>
			</AutonomousModal>
		</div>
	);
};

export default ExamplePage;
