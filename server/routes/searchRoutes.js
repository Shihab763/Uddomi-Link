const express = require('express');
const router = express.Router();
const { getSuggestions, searchAll } = require('../controllers/searchController');

router.get('/suggestions', getSuggestions);
router.get('/', searchAll);

module.exports = router;
