import { NextResponse } from "next/server";
import { Task } from "@/models/index"; // Assuming you have a Task model defined
import { getUser } from "@/app/utils/getUser";

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
        const user = await getUser();
        const { id } = params;

		if (!user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

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
