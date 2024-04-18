const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Replace 'your_database_url' with your actual MongoDB connection string
const uri =
	"mongodb+srv://nico:uYF1MlqJmvWlRxck@mytasks.7l9kmdf.mongodb.net/MyTasks";

mongoose.connect(uri);

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

const createTask = async () => {
	try {
		const task = await taskModel.create({
			title: "Save needed?",
			description: "This is a mongoose test",
			date: "tomorrow",
			isCompleted: true,
			isImportant: false,
			userId: "4555",
		});
		console.log("Task created:", task);
		return task;
	} catch (error) {
		console.error("Error creating task:", error);
		throw error;
	}
};

(async () => {
	try {
		const task = await createTask();
		console.log(task);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		mongoose.disconnect(); // Close the connection after operation completes
	}
})();
