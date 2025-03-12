import { NextResponse } from "next/server";
import { Task, RecurringTaskDefinition, TaskRotation } from "@/models/index";
import { addMinutes, addDays, addMonths, subMonths, isAfter } from "date-fns";
import { calculateNextDate } from "@/app/utils/nextTaskDate";
import { getUser } from "@/app/utils/getUser";
import mongoose from "mongoose";

// Generate placeholder tasks for the next 3 months
export async function POST(req: Request) {
	const session = await mongoose.startSession(); // Start a new session
	session.startTransaction(); // Start a transaction
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
			let startDate = new Date(Math.max(definition.startDate || now));

			while (
				startDate <= threeMonthsLater &&
				(!definition.endDate || isAfter(definition.endDate, startDate))
			) {
				const placeholderExists = await Task.exists({
					recurringTaskDefinition: definition._id,
					date: startDate,
					isPlaceholder: true,
				});

				if (placeholderExists) {
					startDate = calculateNextDate(
						startDate,
						definition.intervalValue,
						definition.intervalUnit
					);
					return;
				}

				if (!definition.rotation) {
					const newTask = await Task.create(
						{
							title: definition.title,
							description: definition.description,
							date: startDate,
							user: definition.owner,
							recurringTaskDefinition: definition._id,
							isPlaceholder: true,
						},
						{ session }
					);

					createdTasks.push(newTask);
				} else {
					const rotation = await TaskRotation.findById(
						definition.rotation
					);

					if (!rotation) {
						throw new Error("Rotation not found");
					}

					const cycleMembers = rotation[rotation.currentIndex]
						.map((active: boolean, index: number) => {
							if (active) {
								return rotation.members[index];
							} else {
								return null;
							}
						})
						.filter((member: string) => member !== null);

					const newTasks = await Promise.all(
						cycleMembers.map((member: string) =>
							Task.create(
								{
									title: definition.title,
									description: definition.description,
									date: startDate,
									user: member,
									recurringTaskDefinition: definition._id,
									isPlaceholder: true,
								},
								{ session }
							)
						)
					);
					createdTasks.push(...newTasks);

					// Update the rotation index

					rotation.currentIndex =
						(rotation.currentIndex + 1) % rotation.members.length;
					await rotation.save({ session });
				}

				startDate = calculateNextDate(
					startDate,
					definition.intervalValue,
					definition.intervalUnit
				);
			}
		}

		await session.commitTransaction(); // Commit the transaction if all goes well
		session.endSession(); // End the session

		return NextResponse.json({
			message:
				"Placeholder tasks for the next 3 months have been created",
			createdTasks,
		});
	} catch (error) {
		console.error("Error generating placeholder tasks:", error);
		await session.abortTransaction(); // Abort transaction if user not found
		session.endSession();
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
