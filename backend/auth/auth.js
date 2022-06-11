const express = require("express")
const User = require("../db/models/User.js")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Signup/Register starts here
router.post(
	"/register",
	// Express-Validation //
	// Validate FirstName if it's a String which contains minimum 4 and maximum 20 characters
	body("firstName", "FirstName must be a string and 4-20 characters long")
		.isString()
		.isLength({
			min: 4,
			max: 20,
		}),
	// Validate LastName if it's a String which contains minimum 4 and maximum 20 characters
	body("lastName", "LastName must be a string and 4-20 characters long")
		.isString()
		.isLength({
			min: 4,
			max: 20,
		}),
	// Validate email if it's an email or just a String value
	body("email", "Not a valid email address").isEmail(),
	// Validate the passsword if it is a valid password or not
	body("password", "Not a valid Password").isStrongPassword({
		minLength: 8,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
		returnScore: false,
		pointsPerUnique: 1,
		pointsPerRepeat: 0.5,
		pointsForContainingLower: 10,
		pointsForContainingUpper: 10,
		pointsForContainingNumber: 10,
		pointsForContainingSymbol: 10,
	}),
	// Matches both passwords
	body("cPassword").custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error("Password and Confirm Password does not match")
		}
		return true
	}),
	// Checks if email already in use
	body("email").custom((email) => {
		return User.findOne({ email }).then((user) => {
			if (user) {
				return Promise.reject("E-mail already in use")
			}
		})
	}),
	// Express-Validation \\

	async (req, res) => {
		// Express-Validation //
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		// Express-Validation \\

		// Password is being encrypted using bcrypt liberary
		// TODO: saltRounds must be stored in dotenv / .env file
		let saltRounds = process.env.SALT_ROUNDS
		let hashedPassword = await bcrypt.hash(req.body.password, saltRounds)

		// Saving/Creating new user in mongoDB usinf User model of mongoose
		const createdUser = await User.create({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: hashedPassword,
		})
		return res.status(201).json({ "User Created As ": createdUser })
	}
)
// Signup/Register ends here

// Login/Signin starts here
//
router.get(
	"/login",
	body("email", "Not a valid email address").isEmail(),
	async (req, res) => {
		// Express-Validation //
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			console.log(errors)
			return res.status(400).json({ errors: errors.array() })
		}
		// Express-Validation \\

		let userExists = await User.findOne({ email: req.body.email })

		if (!userExists) {
			return res.status(400).json({
				errors: errors.errors.concat({
					value: req.body.email,
					msg: "User doesn't not exists",
					param: "email",
					location: "body",
				}),
			})
		}
		let passwordMatched = await bcrypt.compare(
			req.body.password,
			userExists.password
		)
		if (!passwordMatched) {
			return res.status(400).json({
				errors: errors.errors.concat({
					value: req.body.password,
					msg: "Password doesn't not match",
					param: "password",
					location: "body",
				}),
			})
		}

		let data = { email: userExists.email }
		let jwtSecretKey = process.env.JWT_SECRET_KEY
		const token = await jwt.sign(data, jwtSecretKey)

		res.cookie("auth", token, {
			httpOnly: true,
			secure: true,
		})
		res.status(200).json({ token })
	}
)
//
// Login/Signin ends here

module.exports = router
