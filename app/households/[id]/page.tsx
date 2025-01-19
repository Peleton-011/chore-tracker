"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import { edit } from "../../utils/Icons";
import Tasks from "@/app/components/Tasks/Tasks";
import axios from "axios";
import CopyShareButton from "@/app/components/CopyShareButton/CopyShareButton";
import UserList from "@/app/components/UserList/UserList";
import Description from "@/app/components/Description/Desscription";
import dateTaskUtils from "@/app/utils/dateTaskUtils";

interface Household {
	_id: string;
	name: string;
	description?: string;
	members: string[];
	tasks: any[];
	recurringTasks: any[];
}

interface TaskList {
	title: string;
	tasks: any[];
}

function page({ params }: { params: { id: string } }) {
	const { generateInviteLink, updateCurrentHouseholdId, currentHouseholdTasks } =
		useGlobalState();

	updateCurrentHouseholdId();
	const [error, setError] = useState<string>("");
	const { id } = params; // Use params to get the token
	const [household, setHousehold] = useState<any>({ tasks: [], members: [] });
	const [link, setLink] = useState("");
	const [taskLists, setTaskLists] = useState<TaskList[]>([]);

	//Filter tasks
	useEffect(() => {
		setTaskLists(dateTaskUtils.filterAll(currentHouseholdTasks));
	}, [household.tasks, currentHouseholdTasks]);

	//Get link
	useEffect(() => {
		const generateLink = async () => {
			try {
				const inviteLink = await generateInviteLink(id);
				setLink(inviteLink);
				console.log(inviteLink);
			} catch (err) {
				console.error("Failed to generate invite link:", err);
			}
		};

		generateLink();
	}, []);

	useEffect(() => {
		//Fetch household from /api/households/[id]
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

	if (!household) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>
				{" "}
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
			{/* {household.members.map((m:any) => JSON.stringify(m, null, 2)).join(" | ")} */}
			<div>
				<h3>Share Household</h3>
				<CopyShareButton
					content={link}
					buttonText="Get Invite Link"
					buttonActivatedText="Invite Link Copied!"
				/>
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
				<Tasks
					lists={taskLists}

				/>
			</div>
		</div>
	);
}

export default page;
