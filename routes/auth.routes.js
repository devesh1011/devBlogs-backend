const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

router.post('/register', [body('username', 'Enter a valid username').isLength({ min: 3 }), body('email', 'Enter a valid email').isEmail(), body('password', 'Password must be atleast 8 characters').isLength({ min: 8, max: 16 })], authController.registerUser);
router.post('/login', [body('email', 'Enter a valid email').isEmail(), body('password', 'Password cannot be blank').exists()], authController.loginUser);
router.get('/user', authMiddleware.required, authController.getUserDetails);
router.post('/updateProfilePicture', authMiddleware.required, upload.single('profilePicture'), authController.updateProfilePicture);
router.post('/forgot-password', authController.forgotPassword)
router.put('/reset-password', authController.resetPassword)
router.post('/validate-token', authController.validateToken);

module.exports = router;