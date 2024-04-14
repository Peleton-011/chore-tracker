import prisma from "@/app/utils/connect";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

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

		const task = await prisma.task.create({
			data: {
				title,
				description,
				date,
				isCompleted: completed,
				isImportant: important,
				userId,
			},
		});

        return NextResponse.json({
            task
        })

	} catch (error) {
		console.log("ERROR CREATING TASK", error);
		return NextResponse.json({
			error: "Something went wrong",
			status: 500,
		});
	}
}

export async function GET(req: Request) {
	try {
		return new Response("Hello, Next.js!");
	} catch (error) {
		console.log("ERROR GETTING TASK", error);
		return NextResponse.json({
			error: "Something went wrong",
			status: 500,
		});
	}
}

export async function PUT(req: Request) {
	try {
		return new Response("Hello, Next.js!");
	} catch (error) {
		console.log("ERROR UPDATING TASK", error);
		return NextResponse.json({
			error: "Something went wrong",
			status: 500,
		});
	}
}

export async function DELETE(req: Request) {
	try {
		return new Response("Hello, Next.js!");
	} catch (error) {
		console.log("ERROR DELETING TASK", error);
		return NextResponse.json({
			error: "Something went wrong",
			status: 500,
		});
	}
}
