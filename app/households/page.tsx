"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import { edit } from "../utils/Icons";
import { useRouter } from "next/navigation";
import AutonomousModal from "../components/Modals/AutonomousModal";
import CreateHousehold from "../components/Forms/CreateHousehold";
import {
	fetchHouseholds,
	deleteHousehold,
	createHousehold,
} from "../utils/households";
import { Household } from "../../models/types";
import toast from "react-hot-toast";

function page() {
	const [error, setError] = useState<string>("");
	const router = useRouter();

	const [households, setHouseholds] = useState<Household[]>([]);
	const [editingHousehold, setEditingHousehold] = useState<Household | null>(
		null
	);
	const [isHouseholdModalOpen, setHouseholdModalOpen] = useState(false);

	const openModal = () => {
		setHouseholdModalOpen(true);
	};

	const editHousehold = (household: Household) => {
		setEditingHousehold(household);
		setHouseholdModalOpen(true);
	};

	useEffect(() => {
		const fetch = async () => {
			try {
				setHouseholds(await fetchHouseholds());
			} catch (error: any) {
				toast.error("Something went wrong: " + error.message);
			}
		};
		fetch();
	}, []);

	return (
		<div>
			<h1>Your Households</h1>
			{error && <div>{error}</div>}
			<ul>
				{households.map((household: Household) => (
					<li key={household._id}>
						{household.name}

						<button
							className="edit"
							onClick={() => {
								console.log(households);
								editHousehold({
									...household,
								});
							}}
						>
							{edit}
						</button>

						<button onClick={() => deleteHousehold(household._id)}>
							Delete
						</button>
						<button
							onClick={() =>
								router.push("/households/" + household._id)
							}
						>
							{">"}
						</button>
					</li>
				))}
			</ul>
			<button onClick={openModal}>Create Household</button>

			<AutonomousModal
				isOpen={isHouseholdModalOpen}
				onClose={() => setHouseholdModalOpen(false)}
			>
				<CreateHousehold
					household={editingHousehold || null}
					closeModal={() => {
						setHouseholdModalOpen(false);
						fetchHouseholds();
					}}
				></CreateHousehold>
			</AutonomousModal>
		</div>
	);
}

export default page;
