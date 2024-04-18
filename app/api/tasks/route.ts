import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
// import taskModel from "@/mongoose/taskModel";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

mongoose.connect(
	"mongodb+srv://nico:uYF1MlqJmvWlRxck@mytasks.7l9kmdf.mongodb.net/MyTasks"
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
	console.log("Connected successfully");
});

const taskSchema = new Schema(
	{
		title: { type: String, required: true },
		description: String,
		date: { type: String, required: true },
		isCompleted: { type: Boolean, default: false },
		isImportant: { type: Boolean, default: false },
		userId: { type: String, required: true },
	},
	{
		timestamps: true, // adds createdAt and updatedAt fields automatically
	}
);

console.log("Bouta connecter");
const taskModel = model("Task", taskSchema);

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

		const task = await taskModel.create({
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

		const tasks = await taskModel.find({ userId });

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

		const task = await taskModel.findByIdAndUpdate(
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
