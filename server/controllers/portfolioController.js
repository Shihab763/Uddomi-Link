const Portfolio = require('../models/portfolioModel');

const createPortfolio = async (req, res) => {
  const portfolio = await Portfolio.create({
    creator: req.user._id,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    tags: req.body.tags ? req.body.tags.split(',') : [],
    acceptsCustomOrders: req.body.acceptsCustomOrders,
    mediaUrl: `/uploads/${req.file.filename}`,
  });

  res.status(201).json(portfolio);
};

const getMyPortfolios = async (req, res) => {
  const items = await Portfolio.find({ creator: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(items);
};

const getPortfolioById = async (req, res) => {
  const item = await Portfolio.findById(req.params.id).populate(
    'creator',
    'name email profileImage'
  );

  if (!item) {
    return res.status(404).json({ message: 'Portfolio not found' });
  }

  res.json(item);
};

module.exports = {
  createPortfolio,
  getMyPortfolios,
  getPortfolioById,
};
