import { NextResponse } from "next/server";
import {
	Household,
	Task,
	RecurringTaskDefinition,
	TaskRotation,
} from "@/models/index";
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
			// Task Data vv
			title,
			description,
			date,
			isCompleted,
			isImportant,
			user: owner,
			// reminders,

			// Recurrence Data vv
			recurrenceDefinition,
			isPlaceholder,

			// Household Data vv
			household: householdId,
			members,

			// Rotation Data vv
			rotationSchedule,
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
		}

		// Rotation vv
		let rotationObj;

		if (rotationSchedule) {
			if (!rotationSchedule.length) {
				return NextResponse.json({
					error: "Missing required fields",
					status: 400,
				});
			}

			if (rotationSchedule.length > 100) {
				return NextResponse.json({
					error: "Rotation schedule must be less than 100 steps",
					status: 400,
				});
			}

			if (!householdId) {
				return NextResponse.json({
					error: "Missing required fields",
					status: 400,
				});
			}

			if (!members || !members.length) {
				return NextResponse.json({
					error: "Missing required fields",
					status: 400,
				});
			}

			rotationObj = await TaskRotation.create({
				household: householdId,
				members,
				rotationSchedule,
				currentIndex: 0,
			});
		}
		// Rotation ^^

		// Recurrence vv
		let recurrenceObj;

		if (recurrenceDefinition) {
			if (
				!recurrenceDefinition.intervalUnit ||
				!recurrenceDefinition.intervalValue
			) {
				return NextResponse.json({
					error: "Missing required fields",
					status: 400,
				});
			}

			if (recurrenceDefinition.intervalValue < 1) {
				return NextResponse.json({
					error: "Interval value must be greater than 0",
					status: 400,
				});
			}

			if (
				recurrenceDefinition.intervalUnit !== "minutes" &&
				recurrenceDefinition.intervalUnit !== "hours" &&
				recurrenceDefinition.intervalUnit !== "days" &&
				recurrenceDefinition.intervalUnit !== "weeks" &&
				recurrenceDefinition.intervalUnit !== "months" &&
				recurrenceDefinition.intervalUnit !== "years"
			) {
				return NextResponse.json({
					error: "Invalid interval unit",
					status: 400,
				});
			}

			if (!recurrenceDefinition.startDate) {
				return NextResponse.json({
					error: "Missing required fields",
					status: 400,
				});
			}

			if (
				recurrenceDefinition.endDate &&
				recurrenceDefinition.endDate < recurrenceDefinition.startDate
			) {
				return NextResponse.json({
					error: "End date must be after start date",
					status: 400,
				});
			}

			recurrenceObj = await RecurringTaskDefinition.create({
				title,
				description,
				startDate: date,
				...recurrenceDefinition,
				owner: owner || user._id,
				allowFutureTrades: true,
				household: householdId,
				rotation: rotationObj?._id,
			});
		}
		// Recurrence ^^

		// Single User Tasks
		if (!householdId) {
			const task = await Task.create({
				title,
				description,
				date,
				isCompleted: isCompleted,
				isImportant: isImportant,
				user: owner || user._id,

				recurringTaskDefinition: recurrenceObj?._id,

				isPlaceholder,
				// reminders,
			});

			// Save changes
			await rotationObj?.save({ session });
			await recurrenceObj?.save({ session });
			await task.save({ session });

			await session.commitTransaction(); // Commit the transaction if all goes well
			session.endSession(); // End the session
		}

		// Shared Completion Tasks
		if (!members && householdId) {
			const task = await Task.create({
				title,
				description,
				date,
				isCompleted: isCompleted,
				isImportant: isImportant,
				household: householdId,

				recurringTaskDefinition: recurrenceObj?._id,

				isPlaceholder,
				// reminders,
			});

			// Edit the household's tasks list to include a reference to the task
			await Household.findByIdAndUpdate(householdId, {
				$push: { tasks: task._id },
			});

			// Save changes
			await rotationObj?.save({ session });
			await recurrenceObj?.save({ session });
			await task.save({ session });

			await session.commitTransaction(); // Commit the transaction if all goes well
			session.endSession(); // End the session
		}

		// Multi-User Single Time Tasks
		if (members && householdId && !recurrenceObj && !rotationObj) {
			members.forEach(async (member: string) => {
				const task = await Task.create(
					{
						title,
						description,
						date,
						isCompleted: isCompleted,
						isImportant: isImportant,
						user: member,
						household: householdId,

						isPlaceholder,
						// reminders,
					}
				);
				
                // Edit the household's tasks list to include a reference to the task
				await Household.findByIdAndUpdate(householdId, {
					$push: { tasks: task._id },
				});

                await task.save({ session });
			});

			await session.commitTransaction(); // Commit the transaction if all goes well
			session.endSession(); // End the session
		}

		// Multi-User Tasks
		if (members && householdId && recurrenceObj && !rotationObj) {
			members.forEach(async (member: string) => {
				const task = await Task.create(
					{
						title,
						description,
						date,
						isCompleted: isCompleted,
						isImportant: isImportant,
						user: member,
						household: householdId,

						recurringTaskDefinition: recurrenceObj?._id,

						isPlaceholder,
						// reminders,
					},
					{ session }
				);
			});

			// Edit the household's tasks list to include a reference to the task
			await Household.findByIdAndUpdate(householdId, {
				$push: { recurringTasks: recurrenceObj._id },
			});

			await recurrenceObj.save({ session });

			await session.commitTransaction(); // Commit the transaction if all goes well
			session.endSession(); // End the session
		}

		// Multi-User Rotating Tasks
		if (members && householdId && recurrenceObj && rotationObj) {
			members.forEach(async (member: string) => {
				const task = await Task.create(
					{
						title,
						description,
						date,
						isCompleted: isCompleted,
						isImportant: isImportant,
						user: member,
						household: householdId,

						recurringTaskDefinition: recurrenceObj?._id,

						isPlaceholder,
						// reminders,
					},
					{ session }
				);
			});

			// Edit the household's tasks list to include a reference to the task
			await Household.findByIdAndUpdate(householdId, {
				$push: { recurringTasks: recurrenceObj._id },
			});

			await rotationObj.save({ session });
			await recurrenceObj.save({ session });

			await session.commitTransaction(); // Commit the transaction if all goes well
			session.endSession(); // End the session
		}

		if (recurrenceDefinition) {
			// Call /api/tasks/generatePlaceholders
			try {
				await axios.post(
					`http://localhost:3000/api/tasks/placeholders/${recurrenceObj._id}`
				);
			} catch (err) {
				return NextResponse.json({
					error: "Failed to generate placeholders",
				});
			}
		}

        return NextResponse.json({ message: "Task created succesfully", status: 201 });
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
