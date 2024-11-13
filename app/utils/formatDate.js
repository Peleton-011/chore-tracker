import { format } from "date-fns";

const formatDate = (date) => {
	let out;
	try {
		out = format(date, "EEEE d/M/yy");
	} catch (error) {
		out = "Error displaying date";
	}
	return out;
};

function formatTime(date, use12HourFormat = false) {
	return use12HourFormat ? format(date, "hh:mm a") : format(date, "HH:mm");
}

function formatDateTime(date, use12HourFormat = false) {
	return (
		format(date, "EE d/M/yy") + " , " + formatTime(date, use12HourFormat)
	);
}
export default formatDate;
export { formatTime, formatDateTime };
