const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	profilePicture: {
		type: String,
		default: null,
	},
	createdAt: { type: Date, default: Date.now },
	resetToken: { type: String, default: null },
	resetTokenExpires: { type: Date, default: null },
});

const User = mongoose.model('User', userSchema);

// exporting the schema
module.exports = User;