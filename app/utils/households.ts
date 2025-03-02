import axios from "axios";
import toast from "react-hot-toast";

export const fetchHouseholds = async () => {
	try {
		const response = await axios.get(`/api/households`);
		// console.log(response.data);
		return response.data.households
	} catch (error: any) {
		console.error("Failed to fetch households", error);
		throw new Error(error.message);
	}
};

export const deleteHousehold = async (id: string) => {
	try {
		const res = await axios.delete(`/api/households/${id}`);
		toast.success("Household deleted");
		fetchHouseholds();
	} catch (error) {
		console.log(error);
		toast.error("Something went wrong");
	}
};

export const createHousehold = () => {};

export const generateInviteLink = async (householdId: string) => {
	try {
		const { data } = await axios.post(
			`/api/households/${householdId}/invites`
		);

		return data.inviteLink;
	} catch (err) {
		alert("Failed to generate invite link: " + err);
	}
};

export const fetchHouseholdTasks = async (householdId: string) => {
	try {
		const {data } = await axios.get(
			`/api/households/${householdId}/tasks`
		);
		console.log( data);
        return data
	} catch (error) {
		console.log(error);
	}
};
