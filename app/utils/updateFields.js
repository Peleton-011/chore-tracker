const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
	throw new Error("MongoDB connection URI is not provided");
}

const mongooseConnection = async () => {
	if (mongoose.connections[0].readyState) {
		// Use current db connection
		return;
	}

	return await mongoose
		.connect(MONGODB_URI)
		.then(() => console.log("Connected to MongoDB"))
		.catch((error) => {
			console.error("MongoDB connection error:", error);
			throw error;
		});
};

async function addFieldToAllDocuments() {
	try {
		// Connect to the database (if not already connected)
		mongooseConnection();

		//TASK SCHEMA

		const TaskSchema = new Schema(
			{
				title: { type: String, required: true },
				description: String,
				date: { type: Date, required: true },
				isCompleted: { type: Boolean, default: false },
				isImportant: { type: Boolean, default: false },
				user: {
					type: mongoose.Types.ObjectId,
					ref: "User",
					required: true,
				},

				// Custom recurrence fields
				isRecurring: { type: Boolean, default: false },
				intervalValue: {
					type: Number,
					validate: {
						validator: function () {
							// Only require `intervalValue` if `isRecurring` is true
							return (
								!this.isRecurring ||
								(this.isRecurring && this.intervalValue != null)
							);
						},
						message:
							"intervalValue is required if the task is recurring",
					},
				},
				intervalUnit: {
					type: String,
					enum: [
						"minutes",
						"hours",
						"days",
						"weeks",
						"months",
						"years",
					],
					validate: {
						validator: function () {
							// Only require `intervalUnit` if `isRecurring` is true
							return (
								!this.isRecurring ||
								(this.isRecurring && this.intervalUnit != null)
							);
						},
						message:
							"intervalUnit is required if the task is recurring",
					},
				},
				recurrenceEndDate: Date,
				nextOccurrence: Date,
			},
			{ timestamps: true }
		);

		const Task =
			mongoose.models["Task"] || mongoose.model("Task", TaskSchema);

		//TASK SCHEMA

		// Update all documents to include the new field if not already set
		const result = await Task.updateMany(
			{ isRecurring: { $exists: false } }, // Only add where newField does not exist
			{ $set: { isRecurring: false } } // Default value or any other value you'd like
		);

		console.log(
			`Updated ${result.modifiedCount} documents to add the new field.`
		);
	} catch (error) {
		console.error("Error updating documents:", error);
	} finally {
		await mongoose.disconnect();
	}
}

addFieldToAllDocuments();
