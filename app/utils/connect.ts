import mongoose from "mongoose";

console.log(process.env)

const MONGODB_URI  = process.env.MONGODB_URI || "sample" ;

if (!MONGODB_URI) {
	throw new Error("MongoDB connection URI is not provided");
}

const mongooseConnection = () => mongoose
	.connect(
		MONGODB_URI
		//     ,{
		//   useNewUrlParser: true,
		//   useUnifiedTopology: true,
		// }
	)
	.then(() => console.log("Connected to MongoDB"))
	.catch((error: unknown) => {
		console.error("MongoDB connection error:", error);
		throw error;
	});

export default mongooseConnection;
