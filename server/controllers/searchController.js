const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Advanced Search with Filters
// @route   GET /api/search
const search = async (req, res) => {
  try {
    // Standardize: accept 'q' (from Navbar) or 'keyword' (from Sidebar)
    const keyword = req.query.q || req.query.keyword || '';
    const { category, minPrice, maxPrice, location, rating } = req.query;

    console.log("🔍 SEARCH API HIT");
    console.log("Params:", { keyword, category, minPrice, maxPrice, location });

    // 1. Build the Database Query
    let query = {};

    // Search by Name or Description
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Price
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 2. Fetch Products
    let products = await Product.find(query).populate('sellerId', 'name email profile address rating');

    // 3. Post-Database Filtering (for Seller Location/Rating)
    if (location || rating) {
      products = products.filter(product => {
        const seller = product.sellerId;
        if (!seller) return false;

        let matchesLocation = true;
        let matchesRating = true;

        if (location) {
          // Check city or district
          const address = seller.profile?.address || {};
          const fullAddress = `${address.city || ''} ${address.district || ''} ${address.street || ''}`.toLowerCase();
          matchesLocation = fullAddress.includes(location.toLowerCase());
        }

        if (rating) {
          const sellerRating = seller.rating || 0;
          matchesRating = sellerRating >= Number(rating);
        }

        return matchesLocation && matchesRating;
      });
    }

    console.log(`✅ Found ${products.length} products`);
    
    // Return a simple array to make the Frontend's job easy
    res.json(products);

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json([]); // Return empty array on error to prevent crash
  }
};

module.exports = { search };
