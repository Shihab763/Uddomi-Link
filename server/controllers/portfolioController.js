const Portfolio = require('../models/portfolioModel');
const User = require('../models/userModel');


const getPortfolio = async (req, res) => {
  try {
    const userId = req.params.userId;
    let portfolio = await Portfolio.findOne({ userId }).populate('userId', 'name email profile');
    

    if (!portfolio) {
      const user = await User.findById(userId).select('name email profile');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ 
        exists: false, 
        userId: user, 
        projects: [], 
        skills: [],
        experienceYears: 0,
        bio: ""
      });
    }
    
    res.json({ exists: true, ...portfolio._doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updatePortfolio = async (req, res) => {
  try {
    const { bio, skills, experienceYears, videoIntro, awards } = req.body;

    let portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (portfolio) {
  
      portfolio.bio = bio;
      portfolio.skills = skills;
      portfolio.experienceYears = experienceYears;
      portfolio.videoIntro = videoIntro;
      portfolio.awards = awards;
      await portfolio.save();
    } else {

      portfolio = await Portfolio.create({
        userId: req.user._id,
        bio,
        skills,
        experienceYears,
        videoIntro,
        awards
      });
    }

    const populated = await Portfolio.findById(portfolio._id).populate('userId', 'name email profile');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const addProject = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    
  
    if (!portfolio) {
        portfolio = await Portfolio.create({ userId: req.user._id, projects: [] });
    }

    portfolio.projects.unshift(req.body); // Add to top
    await portfolio.save();
    

    const populated = await Portfolio.findById(portfolio._id).populate('userId', 'name email profile');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteProject = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

    portfolio.projects = portfolio.projects.filter(p => p._id.toString() !== req.params.projectId);
    await portfolio.save();
    
    const populated = await Portfolio.findById(portfolio._id).populate('userId', 'name email profile');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPortfolio, updatePortfolio, addProject, deleteProject };
