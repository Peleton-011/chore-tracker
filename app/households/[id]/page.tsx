"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import { edit } from "../../utils/Icons";
import Tasks from "@/app/components/Tasks/Tasks";
import axios from "axios";
import CopyShareButton from "@/app/components/CopyShareButton/CopyShareButton";

interface Household {
	_id: string;
	name: string;
	description?: string;
	members: string[];
	tasks: any[];
	recurringTasks: any[];
}

function page({ params }: { params: { id: string } }) {
	const { generateInviteLink } = useGlobalState();

	const [error, setError] = useState<string>("");
	const { id } = params; // Use params to get the token
	const [household, setHousehold] = useState<any>();
	const [link, setLink] = useState("");

	//Get household
	useEffect(() => {
		async function fetchHousehold(token: string) {
			try {
				const { data } = await axios.get("/api/households/" + token);
				setHousehold(data);
			} catch (err) {
				console.error(err);
			}
		}
		fetchHousehold(id);
	}, []);

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

	if (!household) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>{household.name}</h1>
			{error && <div>{error}</div>}
			{/* <p>{JSON.stringify(household, null, 2)}</p> */}
			<div>
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
			<div>
				<Tasks lists={[{ title: "Tasks", tasks: household.tasks }]} />
			</div>
		</div>
	);
}

export default page;
