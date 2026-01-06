const express = require('express');
const router = express.Router();
const { search } = require('../controllers/searchController');

// Main Search Endpoint
router.get('/', search);

// Dummy endpoints to prevent 404s on the frontend
router.get('/filters', (req, res) => {
    res.json({
        categories: [
            { name: "Handicrafts", count: 10 },
            { name: "Art", count: 5 },
            { name: "Textiles", count: 8 }
        ],
        skills: [],
        tags: []
    });
});

router.get('/suggestions', (req, res) => {
    res.json({ suggestions: [] });
});

module.exports = router;
