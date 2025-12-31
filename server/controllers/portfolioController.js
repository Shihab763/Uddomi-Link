const Portfolio = require('../models/portfolioModel');

const createPortfolio = async (req, res) => {
  const portfolio = await Portfolio.create({
    creator: req.user._id,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    tags: req.body.tags?.split(',') || [],
    acceptsCustomOrders: req.body.acceptsCustomOrders,
    mediaUrl: `/uploads/${req.file.filename}`,
  });

  res.status(201).json(portfolio);
};

const getMyPortfolio = async (req, res) => {
  const items = await Portfolio.find({ creator: req.user._id });
  res.json(items);
};

module.exports = { createPortfolio, getMyPortfolio };
