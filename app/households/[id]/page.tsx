"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import { edit } from "../../utils/Icons";

interface Household {
	_id: string;
	name: string;
	members: string[];
	tasks: any[];
	recurringTasks: any[];
}

function page({ params }: { params: { id: string } }) {
	const {
		households: importedHouseholds,
		editHousehold,
		deleteHousehold,
		generateInviteLink,
	} = useGlobalState();

	const [error, setError] = useState<string>("");
	const { id } = params; // Use params to get the token
	const households = Array.from(importedHouseholds);

	const household: any = households.filter((hh: any) => hh._id === id)[0];

	if (!household) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>{household.name}</h1>
			{error && <div>{error}</div>}
			<p>{JSON.stringify(household, null, 2)}</p>
			<button onClick={() => {}}>Create Household</button>
		</div>
	);
}

export default page;
