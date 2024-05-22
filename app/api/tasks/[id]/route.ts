import mongoose from "mongoose";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Task from "@/models/Task"; // Assuming you have a Task model defined

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = auth();
		const { id } = params;

		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Ensure MongoDB is connected
		// if (mongoose.connection.readyState !== 1) {
		// 	await mongoose.connect(
		// 		"mongodb://localhost:27017/your-database-name",
		// 		{
		// 			useNewUrlParser: true,
		// 			useUnifiedTopology: true,
		// 		}
		// 	);
		// }

		// Find and delete task
		const task = await Task.findByIdAndDelete(id as string);

		if (!task) {
			return NextResponse.json({ error: "Task not found", status: 404 });
		}

		return NextResponse.json(task);
	} catch (error) {
		console.log("ERROR DELETING TASK: ", error);
		return NextResponse.json({ error: "Error deleting task", status: 500 });
	}
}
