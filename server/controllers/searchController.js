const Product = require('../models/productModel');
const User = require('../models/userModel');
const Portfolio = require('../models/portfolioModel');

const search = async (req, res) => {
  const { q, itemType = 'all', page = 1, limit = 20 } = req.query;

  const regex = q ? new RegExp(q, 'i') : null;
  let results = [];

  if (itemType === 'product' || itemType === 'all') {
    const products = await Product.find({
      isApproved: true,
      ...(regex && { name: regex }),
    }).populate('seller', 'name profileImage');

    results.push(...products.map(p => ({ itemType: 'product', item: p })));
  }

  if (itemType === 'portfolio' || itemType === 'all') {
    const portfolios = await Portfolio.find(
      regex ? { title: regex } : {}
    ).populate('creator', 'name profileImage');

    results.push(...portfolios.map(p => ({ itemType: 'portfolio', item: p })));
  }

  if (itemType === 'user' || itemType === 'all') {
    const users = await User.find(
      regex ? { name: regex } : {}
    );

    results.push(...users.map(u => ({ itemType: 'user', item: u })));
  }

  res.json({
    results,
    pagination: { total: results.length, page: 1, totalPages: 1 },
    filters: { applied: {} },
  });
};

module.exports = { search };
