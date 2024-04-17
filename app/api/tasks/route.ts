import mongooseConnection from "@/app/utils/connect";
import taskModel from "@/mongoose/taskModel";

const init = async () => {
    try {
      // Wait for the MongoDB connection to be established
      await mongooseConnection();
  
      // Now you can use your MongoDB functions safely
      const newTask = await createTask('Example Task', 'This is an example task', '2024-04-17', false, false, 'user123');
      console.log('New Task:', newTask);
    } catch (error) {
      console.error('Error:', error);
    }
  };

const createTask = async (
    title: string,
    description: string,
    date: string,
    completed: boolean,
    important: boolean,
    userId: string
  ) => {
    return taskModel.create({ title, description, date, isCompleted: completed, isImportant: important, userId });
  };

export default init;






// import prisma from "@/app/utils/connect";
// import { auth } from "@clerk/nextjs";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
// 	try {
// 		const { userId } = auth();
// 		if (!userId) {
// 			return NextResponse.json({ error: "Unauthorized", status: 401 });
// 		}

// 		const { title, description, date, completed, important } =
// 			await req.json();

// 		if (!title || !description || !date) {
// 			return NextResponse.json({
// 				error: "Missing required fields",
// 				status: 400,
// 			});
// 		}

// 		if (title.length < 3) {
// 			return NextResponse.json({
// 				error: "Title must be at least three characters",
// 				status: 400,
// 			});
// 		}

// 		if (title.length > 100) {
// 			return NextResponse.json({
// 				error: "Title must be less than 100 characters",
// 				status: 400,
// 			});
// 		}


// 		const task = await prisma.task.create({
// 			data: {
// 				title,
// 				description,
// 				date,
// 				isCompleted: completed,
// 				isImportant: important,
// 				userId,
// 			},
// 		});

// 		console.log(task);
// 		return NextResponse.json({
// 			task,
// 		});
// 	} catch (error) {
// 		console.log("ERROR CREATING TASK", error);
        
// 		return NextResponse.json({
// 			error: "Something went wrong",
// 			status: 500,
// 		});
// 	}
// }

// export async function GET(req: Request) {
// 	try {
// 		const { userId } = auth();

// 		if (!userId) {
// 			return NextResponse.json({ error: "Unauthorized", status: 401 });
// 		}

// 		// const tasks = await prisma.task.findMany({
// 		// 	where: {
// 		// 		userId,
// 		// 	},
// 		// });

// 		return new Response("Hello, Next.js!");
// 	} catch (error) {
// 		console.log("ERROR GETTING TASK", error);
// 		return NextResponse.json({
// 			error: "Something went wrong",
// 			status: 500,
// 		});
// 	}
// }

// export async function PUT(req: Request) {
// 	try {
// 		return new Response("Hello, Next.js!");
// 	} catch (error) {
// 		console.log("ERROR UPDATING TASK", error);
// 		return NextResponse.json({
// 			error: "Something went wrong",
// 			status: 500,
// 		});
// 	}
// }

// export async function DELETE(req: Request) {
// 	try {
// 		return new Response("Hello, Next.js!");
// 	} catch (error) {
// 		console.log("ERROR DELETING TASK", error);
// 		return NextResponse.json({
// 			error: "Something went wrong",
// 			status: 500,
// 		});
// 	}
// }
