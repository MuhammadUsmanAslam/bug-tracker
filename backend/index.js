const express = require("express")
const connectToMongoDB = require("./db/db.js")
const app = express()
app.use(express.json())
require("dotenv").config()
const PORT = process.env.PORT

// Set up Global configuration access
console.log(process.env.PORT)
connectToMongoDB()

app.use("/auth", require("./auth/auth.js"))

app.listen(PORT, () => {
	console.log(`App is running on port number: ${PORT}`)
})
