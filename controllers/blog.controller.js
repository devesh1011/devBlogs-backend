const Blog = require('../models/Blog');

exports.createBlog = async (req, res) => {
    try {
        const blog = new Blog({ ...req.body, blogCategory: req.body.category, blogTitlePic: req.body.blogImage, author: req.userId });
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 }).populate('author', 'username');
        res.status(200).json(blogs);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getBlogsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 }).populate('author', 'username');
        if (!blogs) {
            return res.status(404).json({ message: 'No blogs found for the specified user' });
        }
        res.status(200).json(blogs);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'username');
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'You are not allowed to update this blog' });
        }
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'You are not allowed to delete this blog' });
        }
        await Blog.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateLikeCount = async (req, res) => {
    try {
        const blogId = req.params.id;

        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { $inc: { like: 1 } },
            { new: true }
        );

        res.json({ success: true, blog: updatedBlog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.searchBlogs = async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const blogs = await Blog.find({
            $text: { $search: searchQuery },
        }).sort({ createdAt: -1 }).populate('author', 'username');
        res.status(200).json(blogs);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

