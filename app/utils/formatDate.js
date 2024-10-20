import { format } from "date-fns";

const formatDate = (date) => {
	let out;
	try {
		out = format(date, "EEEE d/M yy");
	} catch (error) {
		out = "Error displaying date";
	}
	return out;
};

export default formatDate;
