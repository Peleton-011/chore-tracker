import axios from "axios";
import toast from "react-hot-toast";

export const fetchHouseholds = async () => {
	try {
		const response = await axios.get(`/api/households`);
		// console.log(response.data);
		const data = await response.data.households;
        return data;
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