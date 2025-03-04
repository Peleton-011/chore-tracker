"use client";
import React, { useState, useEffect } from "react";
import Tasks from "@/app/components/Tasks/Tasks";
import axios from "axios";
import CopyShareButton from "@/app/components/CopyShareButton/CopyShareButton";
import UserList from "@/app/components/UserList/UserList";
import Description from "@/app/components/Description/Desscription";
import dateTaskUtils from "@/app/utils/dateTaskUtils";

import { Task, TaskList, DEFAULT_TASK as DEF } from "@/models/types";

import {
	fetchHouseholdTasks,
	generateInviteLink,
} from "@/app/utils/households";
import toast from "react-hot-toast";
import AutonomousModal from "@/app/components/Modals/AutonomousModal";
import CreateTask from "@/app/components/Forms/CreateTask";
import { useGlobalState } from "@/app/context/globalProvider";

function page({ params }: { params: { id: string } }) {
	const { id } = params; // Use params to get the token
	const [error, setError] = useState<string>("");
	const [household, setHousehold] = useState<any>({ tasks: [], members: [] });
	const [link, setLink] = useState("");
	const [taskLists, setTaskLists] = useState<TaskList[]>([]);

    const DEFAULT_TASK = {...DEF, household: id};

	const [taskModal, setTaskModal] = useState(false);
	const [editingTask, setEditingTask] = useState<Task>({...DEFAULT_TASK});

	const { updateTask, createTask } = useGlobalState();


	// Fetch & filter tasks
	useEffect(() => {
		const fetch = async () => {
			try {
				const response = await fetchHouseholdTasks(id);
				setTaskLists(dateTaskUtils.filterAll(response));
			} catch (error: any) {
				toast.error(
					"Something went wrong fetching tasks: " + error.message
				);
			}
		};
		fetch();
	}, [id]);

	// Fetch household from /api/households/[id]
	useEffect(() => {
		const fetchHousehold = async () => {
			try {
				const response = await axios.get(`/api/households/${id}`);
				setHousehold(response.data);
			} catch (err) {
				console.error("Failed to fetch household:", err);
			}
		};

		fetchHousehold();
	}, []);

	const handleGenerateLink = async () => {
		try {
			const inviteLink = await generateInviteLink(id);
			setLink(inviteLink);
			console.log(inviteLink);

			// Copy the link to the clipboard automatically
			await navigator.clipboard.writeText(inviteLink);
			alert("Invite link copied to clipboard!"); // You can use a more custom UI for this
		} catch (err) {
			console.error("Failed to generate invite link:", err);
		}
	};

	if (!household) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>
				{household.image && (
					<img
						src={household.image}
						className="w-12 h-12 rounded-full"
						alt=""
					/>
				)}
				{household.name}
			</h1>
			<hr />
			{household.description && (
				<>
					<h3>Description</h3>
					<Description description={household.description} />
					<hr />
				</>
			)}
			{error && <div>{error}</div>}

			<div>
				<h3>Share Household</h3>
				{/* Trigger link generation only when button is clicked */}
				<button onClick={handleGenerateLink}>Get Invite Link</button>
				<CopyShareButton
					content={link.split("/")[link.split("/").length - 1]}
					buttonText="Get Invite Code"
					buttonActivatedText="Invite Code Copied!"
				/>
			</div>
			<hr />
			{household.members && <UserList users={household.members} />}
			<hr />
			<div>
				<h3>Household Tasks</h3>
				<Tasks lists={taskLists} />
			</div>

			{/* For household based/ multi user tasks */}
			<AutonomousModal
				isOpen={taskModal}
				onClose={() => setTaskModal(false)}
			>
				<CreateTask
					task={editingTask || {...DEFAULT_TASK}}
					updateTask={(task) => {
						updateTask({ ...task, household: id });
						setEditingTask({...DEFAULT_TASK});
						setTaskModal(false);
					}}
					createTask={(task) => {
                        console.log(task)
						createTask({ ...task, household: id });
						setTaskModal(false);
					}}
				></CreateTask>
			</AutonomousModal>
		</div>
	);
}

export default page;
