import { NextResponse } from "next/server";
import { Household, Task, RecurringTaskDefinition } from "@/models/index";
import { getUser } from "@/app/utils/getUser";
import mongoose from "mongoose";
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
				console.error("Failed to generate placeholders:", err);
			}
		}

		await task.save({ session });

		await session.commitTransaction(); // Commit the transaction if all goes well
		session.endSession(); // End the session

		return NextResponse.json({
			task,
		});
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

export async function PUT(req: Request) {
	try {
		const user = await getUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		const updates = await req.json();
		const { id, ...updateFields } = updates;

		if (!id) {
			return NextResponse.json({ error: "Missing task ID", status: 400 });
		}

		const task = await Task.findById(id);

		if (!task) {
			return NextResponse.json({ error: "Task not found", status: 404 });
		}

		// Ensure that the task belongs to the user
		if (task.user.toString() !== user._id.toString()) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		Object.keys(updateFields).forEach((key) => {
			task[key] = updateFields[key];
		});

		await task.save();

		return NextResponse.json(task);
	} catch (error) {
		console.log("ERROR UPDATING TASK: ", error);
		return NextResponse.json({ error: "Error updating task", status: 500 });
	}
}
