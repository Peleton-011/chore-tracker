"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import Tasks from "../components/Tasks/Tasks";

interface Household {
	_id: string;
	name: string;
}

function page() {
	const { userId, households, fetchHouseholds } = useGlobalState();
	const [newHouseholdName, setNewHouseholdName] = useState("");
	const [error, setError] = useState<string>("");

	const createHousehold = async () => {
		if (!newHouseholdName) {
			alert("Please enter a household name");
			return;
		}

		try {
			const response = await axios.post("/api/household", {
				userId,
				name: newHouseholdName,
			});

			if (response.status === 201) {
				fetchHouseholds(); // Refresh the households list
				setNewHouseholdName("");
			} else {
				alert(response.data.error);
			}
		} catch (err) {
			alert("Failed to create household");
		}
	};

	const generateInviteLink = async (householdId: string) => {
		try {
			const response = await axios.post(
				`/api/household/${householdId}/invite`
			);

			if (response.status === 201) {
				alert(`Invite link: ${response.data.inviteLink}`);
			} else {
				alert(response.data.error);
			}
		} catch (err) {
			alert("Failed to generate invite link");
		}
	};
	return (
		<div>
			<h1>Your Households</h1>
			{error && <div>{error}</div>}
			<ul>
				{households.map((household: Household) => (
					<li key={household._id}>
						{household.name}
						<button
							onClick={() => generateInviteLink(household._id)}
						>
							Generate Invite Link
						</button>
					</li>
				))}
			</ul>

			<h2>Create New Household</h2>
			<input
				type="text"
				value={newHouseholdName}
				onChange={(e) => setNewHouseholdName(e.target.value)}
				placeholder="Household Name"
			/>
			<button onClick={createHousehold}>Create</button>
		</div>
	);
}

export default page;
