import { NextResponse } from "next/server";
import { Task, RecurringTaskDefinition } from "@/models/index";
import { addMinutes, addDays, addMonths, subMonths, isAfter } from "date-fns";
import { calculateNextDate } from "@/app/utils/nextTaskDate";
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
