"use client"; // This ensures the component is client-side
import { auth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
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
	const { joinHousehold } = useGlobalState();
	const { token } = params; // Use params to get the token
	// const [household, setHousehold] = useState<Household | null>(null);
	// const [error, setError] = useState<string>("");

	// useEffect(() => {
	// 	if (token) {
	//         console.log(typeof token)
	// 		fetch(`/api/invite/${token}`)
	// 			.then((res) => res.json())
	// 			.then((data: InviteResponse) => {
	// 				if (data.error) {
	// 					setError(data.error);
	// 				} else {
	// 					setHousehold(data.household);
	// 				}
	// 			})
	// 			.catch((err) => setError("Failed to fetch invite details"));
	// 	}
	// }, [token]);

	// if (error) {
	// 	return <div>{error}</div>;
	// }

	// if (!household) {
	// 	return <div>Loading...</div>;
	// }

	return (
		<div>
			{/* <h1>Join Household: {household.name}</h1> */}
			<button onClick={() => joinHousehold(token)}>Join Household</button>
		</div>
	);
}
