const express = require('express');
const router = express.Router();
const {
    searchItems,
    getSearchSuggestions,
    getSearchFilters,
    getPopularSearches
} = require('../controllers/searchController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, searchItems);
router.get('/suggestions', optionalAuth, getSearchSuggestions);
router.get('/filters', optionalAuth, getSearchFilters);
router.get('/popular', optionalAuth, getPopularSearches);

module.exports = router;
