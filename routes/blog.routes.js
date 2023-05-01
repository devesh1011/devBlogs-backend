const express = require('express');
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware.optional, blogController.getAllBlogs);
router.get('/search', authMiddleware.optional, blogController.searchBlogs); 
router.get('/:id', authMiddleware.optional, blogController.getBlogById);
router.get('/user/:userId', authMiddleware.optional, blogController.getBlogsByUserId);
router.post('/createblog', authMiddleware.optional, blogController.createBlog);
router.put('/:id', authMiddleware.optional, blogController.updateBlog);
router.delete('/:id', authMiddleware.optional, blogController.deleteBlog);
router.patch('/like/:id', authMiddleware.optional, blogController.updateLikeCount);

module.exports = router;
