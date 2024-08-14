import mongoose from "mongoose";

// console.log(process.env);

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
		.catch((error: unknown) => {
			console.error("MongoDB connection error:", error);
			throw error;
		});
};

export default mongooseConnection;
