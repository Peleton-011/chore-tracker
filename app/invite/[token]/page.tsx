"use client"; // This ensures the component is client-side
import { auth } from "@clerk/nextjs";
import { use, useEffect, useState } from "react";
import { useGlobalState } from "@/app/context/globalProvider";

interface Household {
	_id: string;
	name: string;
}

interface InviteResponse {
	household: Household;
	inviteToken: string;
	error?: string;
}

// You receive params directly in the component when using the new app directory
export default function page({ params }: { params: { token: string } }) {
	const { joinHousehold, fetchHouseholdFromToken } = useGlobalState();
	const { token } = params; // Use params to get the token

	const [household, setHousehold] = useState<Household>();

	//Fetch household from token (async)
	useEffect(() => {
		const fetchHousehold = async () => {
			const fetchedHousehold = await fetchHouseholdFromToken(token);
			setHousehold(fetchedHousehold);
		};
		fetchHousehold();
	}, []);

	if (!household) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>
				You've been invited to join <i><u>{household.name}</u></i>!
			</h1>
			<button onClick={() => joinHousehold(token)}>Join Household</button>
		</div>
	);
}
