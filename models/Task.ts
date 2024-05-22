import mongoose from "mongoose";
const { Schema, model } = mongoose;

//-------------------------------------------

mongoose.connect(
	"mongodb+srv://nico:uYF1MlqJmvWlRxck@mytasks.7l9kmdf.mongodb.net/MyTasks"
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
	console.log("Connected successfully");
});

//-------------------------------------------

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
const taskModel = /* mongoose.models.Task ? model("Task") :*/ model("Task", taskSchema);

export default /*mongoose.models.Task ||*/ mongoose.model('Task', taskSchema);