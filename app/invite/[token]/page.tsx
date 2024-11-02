"use client"; // This ensures the component is client-side
import { auth } from "@clerk/nextjs";
import { use, useEffect, useState } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import { useRouter } from "next/navigation";

interface InviteResponse {
	household: any;
	inviteToken: string;
	error?: string;
}

// You receive params directly in the component when using the new app directory
export default function page({ params }: { params: { token: string } }) {
	const { joinHousehold, fetchHouseholdFromToken, user } = useGlobalState();
	const { token } = params; // Use params to get the token

	const [household, setHousehold] = useState<any>();
	const router = useRouter();

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

	if (user.households?.includes(household._id)) {
		return (
			<div>
				<h1>
					You're already in{" "}
					<i>
						<u>{household.name}</u>
					</i>
				</h1>
				<button onClick={() => router.push("/households")}>
					Go to Households
				</button>
			</div>
		);
	}

	return (
		<div>
			<h1>
				You've been invited to join{" "}
				<i>
					<u>{household.name}</u>
				</i>
				!
			</h1>
			{household.description && <p>{household.description}</p>}
			<button
				onClick={() => {
					joinHousehold(token);
					router.push("/households");
				}}
			>
				Join Household
			</button>
		</div>
	);
}
