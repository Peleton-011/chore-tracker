import { Schema, model } from "mongoose";

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
export default model("Task", taskSchema);