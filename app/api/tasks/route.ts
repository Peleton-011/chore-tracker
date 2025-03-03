import { NextResponse } from "next/server";
import { Household, Task, RecurringTaskDefinition } from "@/models/index";
import { getUser } from "@/app/utils/getUser";
import mongoose from "mongoose";
import { calculateNextDate } from "@/app/utils/nextTaskDate";
import axios from "axios";

export async function POST(req: Request) {
	const session = await mongoose.startSession(); // Start a new session
	session.startTransaction(); // Start a transaction
	try {
		const user = await getUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		const {
			title,
			description,
			date,
			completed,
			important,
			householdId,
			isRecurring,
			intervalUnit,
			intervalValue,
			isPlaceholder,
			reminders,
			recurrenceEndDate,
		} = await req.json();

		if (!title || !description || !date) {
			return NextResponse.json({
				error: "Missing required fields",
				status: 400,
			});
		}

		if (title.length < 3) {
			return NextResponse.json({
				error: "Title must be at least three characters",
				status: 400,
			});
		}

		if (title.length > 100) {
			return NextResponse.json({
				error: "Title must be less than 100 characters",
				status: 400,
			});
		}

		const task = await Task.create({
			title,
			description,
			date,
			isCompleted: completed,
			isImportant: important,
			user: user._id,
			isPlaceholder,
			reminders,
		});

		if (householdId) {
			//Get the household associated to the householdId
			const household = await Household.findById(householdId);
			if (!household) {
				return NextResponse.json({
					error: "Household not found",
					status: 404,
				});
			}

			// Ensure the user belongs to this household
			if (!household.members.includes(user._id)) {
				return NextResponse.json({
					error: "User is not authorized for this household",
					status: 403,
				});
			}

			// Edit the household's tasks list to include a reference to the task
			await Household.findByIdAndUpdate(householdId, {
				$push: { tasks: task._id },
			});

			// Add the householdId to the household property of the task
			await Task.findByIdAndUpdate(task._id, {
				$set: { household: householdId },
			});

			console.log(`Task ${task._id} added to household ${householdId}`);
		}

		if (isRecurring) {
			const recurringTaskDefinition =
				await RecurringTaskDefinition.create({
					task: task._id,
					intervalUnit,
					intervalValue,
					isPlaceholder,
					reminders,
					title,
					description,
					owner: user._id,
					startDate: date,
					endDate: recurrenceEndDate,
					allowFutureTrades: true,
					household: householdId,
				});

			// Add the recurringTaskDefinitionId to the corresponding property of the task
			await Task.findByIdAndUpdate(task._id, {
				$set: { recurringTaskDefinition: recurringTaskDefinition._id },
			});

			await recurringTaskDefinition.save({ session });

			// Call /api/tasks/generatePlaceholders
			try {
				await axios.post(
					`http://localhost:3000/api/tasks/placeholders/${recurringTaskDefinition._id}`
				);
			} catch (err) {
				return NextResponse.json({
					error: "Failed to generate placeholders",
				});
			}
		}

		await task.save({ session });

		await session.commitTransaction(); // Commit the transaction if all goes well
		session.endSession(); // End the session

		return NextResponse.json(task);
	} catch (error) {
		console.log("ERROR CREATING TASK", error);
		await session.abortTransaction(); // Abort transaction if user not found
		session.endSession();

		return NextResponse.json({
			error: "Something went wrong",
			status: 500,
		});
	}
}

export async function GET() {
	try {
		const user = await getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		const tasks = await Task.find({ user: user._id }).populate(
			"recurringTaskDefinition"
		);

		return NextResponse.json(tasks);
	} catch (error) {
		console.log("ERROR GETTING TASKS: ", error);
		return NextResponse.json({ error: "Error updating task", status: 500 });
	}
}

// Update a task and handle recurring task logic
export async function PUT(req: Request) {
	try {
		const user = await getUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		const updates = await req.json();
		const { _id, isCompleted, ...updateFields } = updates;

		if (!_id) {
			return NextResponse.json({ error: "Missing task ID", status: 400 });
		}

		const task = await Task.findById(_id);

		if (!task) {
			return NextResponse.json({ error: "Task not found", status: 404 });
		}

		// Ensure that the task belongs to the user
		if (task.user.toString() !== user._id.toString()) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		// Update the task's completion status
		if (isCompleted !== undefined) {
			task.isCompleted = isCompleted;

			if (isCompleted && task.recurringTaskDefinition) {
				// Find the associated recurring task definition
				const definition = await RecurringTaskDefinition.findById(
					task.recurringTaskDefinition
				);

				if (!definition) {
					return NextResponse.json({
						error: "Recurring task definition not found",
						status: 404,
					});
				}
				// Calculate the next date for the recurring task
				const nextDate = calculateNextDate(
					task.date,
					definition.intervalValue,
					definition.intervalUnit
				);

				// Find the next placeholder task for this recurring definition
				const nextTask = await Task.findOne({
					recurringTaskDefinition: definition._id,
					date: nextDate,
					isPlaceholder: true,
				});

				// If a placeholder exists, set it to not be a placeholder
				if (nextTask) {
					nextTask.isPlaceholder = false;
					await nextTask.save();
				} else {
					// If no placeholder exists, create one
					try {
						await axios.post(
							`http://localhost:3000/api/tasks/placeholders/${definition._id}`
						);
					} catch (err) {
						return NextResponse.json({
							error: "Failed to generate placeholders",
							status: 500,
						});
					}
				}
			}
		}

		// Update other fields
		Object.keys(updateFields).forEach((key) => {
			task[key] = updateFields[key];
		});

		await task.save();

		return NextResponse.json(task);
	} catch (error) {
		console.error("Error updating task:", error);
		return NextResponse.json({ error: "Error updating task", status: 500 });
	}
}
