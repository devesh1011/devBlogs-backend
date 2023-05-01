const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

exports.createComment = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = new Comment({
            content: req.body.content,
            author: req.userId,
            blog: blogId,
        });

        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.createReply = async (req, res) => {
    try {
        const parentCommentId = req.params.parentCommentId;

        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const reply = new Comment({
            content: req.body.content,
            author: req.userId,
            blog: parentComment.blog,
            parentComment: parentCommentId,
        });

        await reply.save();
        res.status(201).json(reply);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getCommentsByBlogId = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const comments = await Comment.find({ blog: blogId, parentComment: null })
            .populate('author', 'username')
            .populate({
                path: 'replies',
                match: { parentComment: { $ne: null } },
                populate: { path: 'author', select: 'username' },
            });

        res.status(200).json(comments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
