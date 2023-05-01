const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    });
};

exports.registerUser = async (req, res) => {
    let success = true
    try {
        const { username, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            success = false
            return res.status(400).json({ success, error: "Sorry the user with this email alreay exists!", success })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const token = generateToken(newUser);
        success = true

        const { password: _, ...userWithoutPassword } = newUser.toObject();

        res.status(201).json({ token, success, user: userWithoutPassword });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    let success = true;
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            success = false
            return res.status(400).json({ message: 'User with this email does not exists! Try with another email', success });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            success = false
            return res.status(400).json({ message: 'Invalid Password', success });
        }

        const token = generateToken(user);
        success = true

        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(201).json({ token, success, user: userWithoutPassword });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.userId, '-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateProfilePicture = async (req, res) => {
    const filePath = req.file.path;

    try {
        await updateProfilePictureInDatabase(req.userId, filePath);

        res.status(200).json({ message: 'Profile picture updated successfully', filePath });
    } catch (error) {
        console.error('Error in updateProfilePicture:', error);
        res.status(500).json({ message: 'Error updating profile picture', error: error.message });
    }
};

const updateProfilePictureInDatabase = async (userId, filePath) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { profilePicture: filePath },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        console.error('Error updating profile picture in the database:', error);
        throw error;
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        user.resetToken = resetToken;
        user.resetTokenExpires = Date.now() + 3600000;

        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.USER_PASSWORD,
            },
        });

        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: 'Password Reset Request',
            text: `To reset your password, click the following link: ${resetUrl}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Reset password email sent' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { password, token } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.validateToken = (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(200).json({ message: 'Token is valid' });
    });
};
