import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Task from "@/models/Task";


export async function POST(req: Request) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		const { title, description, date, completed, important } =
			await req.json();

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
			userId,
		});

		console.log(task);
		return NextResponse.json({
			task,
		});
	} catch (error) {
		console.log("ERROR CREATING TASK", error);

		return NextResponse.json({
			error: "Something went wrong",
			status: 500,
		});
	}
}

export async function GET() {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		const tasks = await Task.find({ userId });

		return NextResponse.json(tasks);
	} catch (error) {
		console.log("ERROR GETTING TASKS: ", error);
		return NextResponse.json({ error: "Error updating task", status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const { userId } = auth();
		const { isCompleted, id } = await req.json();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		const task = await Task.findByIdAndUpdate(
			id,
			{ isCompleted },
			{ new: true }
		);

		return NextResponse.json(task);
	} catch (error) {
		console.log("ERROR UPDATING TASK: ", error);
		return NextResponse.json({ error: "Error deleting task", status: 500 });
	}
}
