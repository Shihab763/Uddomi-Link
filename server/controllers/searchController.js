const Product = require('../models/productModel');
const User = require('../models/userModel');
const Portfolio = require('../models/portfolioModel');

const search = async (req, res) => {
  // 1. Capture 'q' (from Navbar) OR 'keyword' (from Sidebar)
  const q = req.query.q || req.query.keyword || '';
  const { itemType = 'all', page = 1, limit = 20 } = req.query;

  console.log("🔍 SEARCH HIT - Query:", q);

  const regex = q ? new RegExp(q, 'i') : null;
  let results = [];

  try {
    // --- SEARCH PRODUCTS ---
    if (itemType === 'product' || itemType === 'all') {
      const productQuery = {};
      
      // Search in Name, Description, or Category
      if (regex) {
        productQuery.$or = [
          { name: regex },
          { description: regex },
          { category: regex }
        ];
      }

      // REMOVED 'isApproved: true' so you can see your test products immediately
      // If you want to enable it later, uncomment the next line:
      // productQuery.isApproved = true;

      const products = await Product.find(productQuery)
        .populate('sellerId', 'name profileImage email'); // Changed 'seller' to 'sellerId' to match your schema

      // Map to format expected by frontend
      results.push(...products.map(p => ({
        itemType: 'product',
        item: {
          ...p._doc,
          seller: p.sellerId // Map sellerId to 'seller' for frontend compatibility
        }
      })));
    }

    // --- SEARCH PORTFOLIOS ---
    if (itemType === 'portfolio' || itemType === 'all') {
      const portfolioQuery = {};
      if (regex) {
        portfolioQuery.$or = [
          { title: regex },
          { description: regex },
          { 'skills': regex }
        ];
      }

      const portfolios = await Portfolio.find(portfolioQuery)
        .populate('userId', 'name profileImage'); 

      results.push(...portfolios.map(p => ({
        itemType: 'portfolio',
        item: {
          ...p._doc,
          creator: p.userId // Map userId to 'creator'
        }
      })));
    }

    // --- SEARCH USERS (CREATORS) ---
    if (itemType === 'user' || itemType === 'all') {
      const userQuery = { roles: { $in: ['business-owner', 'artist'] } }; // Only search creators
      if (regex) {
        userQuery.name = regex;
      }

      const users = await User.find(userQuery).select('name email roles profile profileImage');

      results.push(...users.map(u => ({ 
        itemType: 'user', 
        item: u 
      })));
    }

    console.log(`✅ Found ${results.length} total items`);

    res.json({
      results,
      pagination: { total: results.length, page: 1, totalPages: 1 },
      filters: { applied: { q } },
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ 
        results: [], 
        pagination: { total: 0, page: 1, totalPages: 1 },
        error: error.message 
    });
  }
};

module.exports = { search };
