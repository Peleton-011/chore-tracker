const mongoose = require("mongoose");

// Replace 'your_database_url' with your actual MongoDB connection string
const uri =
	"sample";

mongoose.connect(uri);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
	console.log("Connected successfully");
});
