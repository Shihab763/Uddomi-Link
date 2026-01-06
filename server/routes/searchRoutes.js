const express = require('express');
const router = express.Router();
const { search } = require('../controllers/searchController');

// This handles GET /api/search
router.get('/', search);

// Mock endpoints for suggestions/filters to prevent 404 errors on frontend
router.get('/suggestions', (req, res) => res.json({ suggestions: [] }));
router.get('/filters', (req, res) => res.json({ categories: [], skills: [], tags: [] }));

module.exports = router;
