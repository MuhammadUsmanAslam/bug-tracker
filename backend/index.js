const express = require("express");
const connectToMongoDB = require("./db/db.js");
const app = express();
const PORT = 5000;
app.use(express.json());

connectToMongoDB();

app.use("/auth", require("./auth/auth.js"));

app.listen(PORT, () => {
	console.log(`App is running on port number: ${PORT}`);
});
