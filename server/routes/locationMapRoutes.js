const express = require('express');
const router = express.Router();
const { getLocationMap } = require('../controllers/locationMapController');
router.get('/', getLocationMap);

module.exports = router;