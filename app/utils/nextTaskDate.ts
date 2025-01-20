import { add } from "date-fns";

function calculateNextDate(
	startDate: Date,
	intervalValue: number,
	intervalUnit: string
) {
	switch (intervalUnit) {
		case "minutes":
			return add(startDate, { minutes: intervalValue });
		case "hours":
			return add(startDate, { hours: intervalValue });
		case "days":
			return add(startDate, { days: intervalValue });
		case "weeks":
			return add(startDate, { weeks: intervalValue });
		case "months":
			return add(startDate, { months: intervalValue });
		case "years":
			return add(startDate, { years: intervalValue });
		default:
			throw new Error("Invalid interval unit");
	}
}
