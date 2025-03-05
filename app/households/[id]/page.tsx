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
import { useGlobalState } from "@/app/context/globalProvider";

function page({ params }: { params: { id: string } }) {
	const { id } = params; // Use params to get the token
	const { household, updateCurrentHousehold } = useGlobalState();
	const [error, setError] = useState<string>("");
	const [link, setLink] = useState("");
	const [taskLists, setTaskLists] = useState<TaskList[]>([]);

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

    useEffect(() => {
        updateCurrentHousehold(id);
    }, [id]);

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
		</div>
	);
}

export default page;
