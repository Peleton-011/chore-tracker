"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import { edit } from "../utils/Icons";

interface Household {
	_id: string;
	name: string;
	members: string[];
	tasks: any[];
	recurringTasks: any[];
}

function page() {
	const { households, editHousehold, deleteHousehold, createHousehold } =
		useGlobalState();
	const [error, setError] = useState<string>("");

	const generateInviteLink = async (householdId: string) => {
		try {
			const response = await axios.post(
				`/api/household/${householdId}/invite`
			);

			alert(`Invite link: ${response.data.inviteLink}`);
		} catch (err) {
			alert("Failed to generate invite link: " + err);
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

						<button
							className="edit"
							onClick={() => {
								console.log(households);
								editHousehold({
									...household,
									id: household._id,
								});
							}}
						>
							{edit}
						</button>

						<button onClick={() => deleteHousehold(household._id)}>
							Delete
						</button>
					</li>
				))}
			</ul>
			<button onClick={createHousehold}>Create Household</button>
		</div>
	);
}

export default page;
