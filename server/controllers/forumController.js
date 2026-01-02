const ForumPost = require('../models/forumPostModel');

// @desc    Get all posts
const getPosts = async (req, res) => {
    try {
        const posts = await ForumPost.find()
            .populate('author', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a post
const createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const post = await ForumPost.create({
            author: req.user._id,
            title,
            content,
            category
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a comment
const addComment = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = {
            user: req.user._id,
            userName: req.user.name,
            text: req.body.text
        };

        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like a post
const likePost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Check if already liked
        if (post.likes.includes(req.user._id)) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            // Like
            post.likes.push(req.user._id);
        }

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPosts, createPost, addComment, likePost };