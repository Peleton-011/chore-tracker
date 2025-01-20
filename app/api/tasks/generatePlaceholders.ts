import { calculateNextDate } from "@/app/utils/nextTaskDate";
import { RecurringTaskDefinition, Task } from "@/models/index";
import { add } from "date-fns";

async function generatePlaceholders(recurringDefinitionId: string) {
	const definition = await RecurringTaskDefinition.findById(
		recurringDefinitionId
	);
	if (!definition) throw new Error("Recurring definition not found.");

	const now = new Date();
	const placeholderUntil = add(now, { days: definition.placeholderWindow });

	let lastTask = await Task.findOne({
		recurringTaskDefinition: definition._id,
	}).sort({ date: -1 }); // Get the last generated task
	let startDate = lastTask ? lastTask.date : now;

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
}
