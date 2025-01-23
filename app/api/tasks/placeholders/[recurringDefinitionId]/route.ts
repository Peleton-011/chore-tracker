import { calculateNextDate } from "@/app/utils/nextTaskDate";
import { RecurringTaskDefinition, Task } from "@/models/index";
import { add } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	return NextResponse.json({ message: "Placeholder tasks api is working." });
}

export async function POST(
	req: Request,
	{ params }: { params: { recurringDefinitionId: string } }
) {
	try {
		const { recurringDefinitionId } = params;
		console.log(recurringDefinitionId);

		const definition = await RecurringTaskDefinition.findById(
			recurringDefinitionId
		);
		if (!definition) {
			return NextResponse.json(
				{ error: "Recurring definition not found." },
				{ status: 404 }
			);

			throw new Error("Recurring definition not found.");
		}

		const now = new Date();
		const placeholderUntil = add(now, {
			days: 90,
		});

		let instances = await Task.find({
			recurringTaskDefinition: definition._id,
		}).sort({ date: -1 }); // Get the last generated task
		let startDate = instances.length ? instances[0].date : now;

		while (
			startDate <= placeholderUntil &&
			(!definition.endDate || startDate <= definition.endDate)
		) {
			startDate = calculateNextDate(
				startDate,
				definition.intervalValue,
				definition.intervalUnit
			);

			await Task.create({
				title: definition.title,
				description: definition.description,
				date: startDate,
				user: definition.owner,
				recurringTaskDefinition: definition._id,
				isPlaceholder: true,
			});
		}

		return NextResponse.json({ message: "Placeholder tasks updated." });
	} catch (err) {
		console.error("Failed to update placeholders:", err);
		return NextResponse.json(
			{ error: "Failed to update placeholders" },
			{ status: 500 }
		);
	}
}
