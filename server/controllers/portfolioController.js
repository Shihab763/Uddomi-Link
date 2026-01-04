const Portfolio = require('../models/portfolioModel');
const User = require('../models/userModel');

// @desc    Get Portfolio by User ID
// @route   GET /api/portfolios/:userId
const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.params.userId }).populate('userId', 'name email profile');
    
    // If no portfolio exists yet, return a basic structure so UI doesn't crash
    if (!portfolio) {
      return res.status(200).json({ 
        exists: false, 
        projects: [], 
        skills: [] 
      });
    }
    
    res.json({ exists: true, ...portfolio._doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or Update Portfolio
// @route   POST /api/portfolios
const updatePortfolio = async (req, res) => {
  try {
    const { bio, skills, experienceYears, videoIntro, awards } = req.body;

    let portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (portfolio) {
      // Update existing
      portfolio.bio = bio || portfolio.bio;
      portfolio.skills = skills || portfolio.skills;
      portfolio.experienceYears = experienceYears || portfolio.experienceYears;
      portfolio.videoIntro = videoIntro || portfolio.videoIntro;
      portfolio.awards = awards || portfolio.awards;
      await portfolio.save();
    } else {
      // Create new
      portfolio = await Portfolio.create({
        userId: req.user._id,
        bio,
        skills,
        experienceYears,
        videoIntro,
        awards
      });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a Project to Portfolio
// @route   POST /api/portfolios/project
const addProject = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) return res.status(404).json({ message: 'Create portfolio first' });

    portfolio.projects.unshift(req.body); // Add to top
    await portfolio.save();
    
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Project
// @route   DELETE /api/portfolios/project/:projectId
const deleteProject = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

    portfolio.projects = portfolio.projects.filter(p => p._id.toString() !== req.params.projectId);
    await portfolio.save();
    
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPortfolio, updatePortfolio, addProject, deleteProject };
