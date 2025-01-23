import { NextResponse } from "next/server";
import { Task, RecurringTaskDefinition } from "@/models/index";
import { addMinutes, addDays, addMonths, subMonths, isAfter } from "date-fns";
import { getUser } from "@/app/utils/getUser";

// Generate placeholder tasks for the next 3 months
export async function POST(req: Request) {
	try {
		const user = await getUser();

		if (!user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const now = new Date();
		const threeMonthsLater = addMonths(now, 3);

		const recurringDefinitions = await RecurringTaskDefinition.find({
			owner: user._id,
		});

		const createdTasks = [];

		for (const definition of recurringDefinitions) {
			let startDate = definition.startDate || now;

			while (
				startDate <= threeMonthsLater &&
				(!definition.endDate || isAfter(definition.endDate, startDate))
			) {
				const placeholderExists = await Task.exists({
					recurringTaskDefinition: definition._id,
					date: startDate,
					isPlaceholder: true,
				});

				if (!placeholderExists) {
					const newTask = await Task.create({
						title: definition.title,
						description: definition.description,
						date: startDate,
						user: definition.owner,
						recurringTaskDefinition: definition._id,
						isPlaceholder: true,
					});

					createdTasks.push(newTask);
				}

				startDate = calculateNextDate(
					startDate,
					definition.intervalValue,
					definition.intervalUnit
				);
			}
		}

		return NextResponse.json({
			message:
				"Placeholder tasks for the next 3 months have been created",
			createdTasks,
		});
	} catch (error) {
		console.error("Error generating placeholder tasks:", error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}

function calculateNextDate(
	currentDate: Date,
	intervalValue: number,
	intervalUnit: string
) {
	switch (intervalUnit) {
		case "minutes":
			return addMinutes(currentDate, intervalValue);
		case "hours":
			return addMinutes(currentDate, intervalValue * 60);
		case "days":
			return addDays(currentDate, intervalValue);
		case "weeks":
			return addDays(currentDate, intervalValue * 7);
		case "months":
			return addMonths(currentDate, intervalValue);
		case "years":
			return addMonths(currentDate, intervalValue * 12);
		default:
			throw new Error("Unsupported interval unit");
	}
}
