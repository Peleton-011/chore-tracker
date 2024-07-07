const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const MONGODB_URI = process.argv[2];

if (!MONGODB_URI) {
	throw new Error("MongoDB connection URI is not provided");
}
mongoose.connect(MONGODB_URI);

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

const HouseholdSchema = new Schema({
	name: { type: String, required: true },
	members: [{ type: Schema.Types.ObjectId, ref: "User" }],
	tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
	recurringTasks: [{ type: Schema.Types.ObjectId, ref: "RecurringTask" }],
});

console.log("Bouta connecter");
const taskModel = model("Task", taskSchema);

const householdModel = model("Household", HouseholdSchema);

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

const createHousehold = async () => {
	try {
		const household = await householdModel.create({
			name: "My Household",
			members: ["668a97a156b0ccfd0e0b5044"],
		});
		console.log("Household created:", household);
		return household;
	} catch (error) {
		console.error("Error creating household:", error);
		throw error;
	}
};

(async () => {
	try {
		const task = await createHousehold();
		console.log(task);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		mongoose.disconnect(); // Close the connection after operation completes
	}
})();
