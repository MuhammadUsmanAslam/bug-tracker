const express = require("express");
const User = require("../db/models/User.js");
const router = express.Router();

const { body, validationResult } = require("express-validator");

// router.get("/login", (req, res) => {
// 	res.status(200).json({ name: "Hello i'm Login" });
// });

router.post(
	"/register",
	// Express-Validation //
	body(
		"firstName",
		"FirstName must be a string and 4-20 characters long"
	).isLength({
		min: 4,
		max: 20,
	}),
	body(
		"lastName",
		"LastName must be a string and 4-20 characters long"
	).isLength({
		min: 4,
		max: 20,
	}),
	body("email", "Not a valid email address").isEmail(),
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
	body("cPassword").custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error("Password and Confirm Password does not match");
		}
		return true;
	}),
	body("email").custom((email) => {
		return User.findOne({ email }).then((user) => {
			if (user) {
				return Promise.reject("E-mail already in use");
			}
		});
	}),
	// Express-Validation \\

	async (req, res) => {
		// Express-Validation //
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		// Express-Validation \\

		const createdUser = await User.create({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: req.body.password,
			cPassword: req.body.cPassword,
		});
		res.status(201).json({ "User Created As ": createdUser });
	}
);

module.exports = router;
