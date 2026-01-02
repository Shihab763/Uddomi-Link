const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPosts, createPost, addComment, likePost } = require('../controllers/forumController');

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.post('/:id/comment', protect, addComment);
router.put('/:id/like', protect, likePost);

module.exports = router;