const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPortfolio, updatePortfolio, addProject, deleteProject } = require('../controllers/portfolioController');

router.get('/:userId', getPortfolio);
router.post('/', protect, updatePortfolio);
router.post('/project', protect, addProject);
router.delete('/project/:projectId', protect, deleteProject);

module.exports = router;
