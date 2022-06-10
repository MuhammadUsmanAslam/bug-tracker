const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017";

const connectToMongoDB = async () => {
	await mongoose
		.connect("mongodb://localhost:27017/bug-tracker")
		.then(() => {
			console.log("Connection to mongodb successful");
		})
		.catch((err) => {
			console.log(`Connection to mongodb was failed with error: ${err}`);
		});
};

module.exports = connectToMongoDB;
