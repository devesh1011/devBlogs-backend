const express = require('express');
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/blog/:blogId', commentController.getCommentsByBlogId);
router.post('/blog/:blogId', authMiddleware.required, commentController.createComment);
router.post('/:parentCommentId/reply', authMiddleware.required, commentController.createReply);

module.exports = router;
