const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../client/.env') });

// Import routes
const authRoutes = require('./routes/auth.routes');
const blogRoutes = require('./routes/blog.routes');
const commentRoutes = require('./routes/comment.routes');

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);

app.post('/send', async (req, res) => {
	const { name, email, message } = req.body;


	// Set up Nodemailer transporter (use your Gmail account)
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.USER,
			pass: process.env.USER_PASSWORD,
		},
	});

	// Set up email options
	const mailOptions = {
		from: email,
		to: 'deveshk237@gmail.com',
		subject: `New message from ${name} via DevBlogs contact form`,
		text: `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
	};

	// Send the email
	try {
		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: 'Email sent successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Error sending email', error });
	}
});

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 300000 })
	.then(() => {
		console.log('Connected to MongoDB');
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error.message);
	});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
