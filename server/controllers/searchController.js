const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Advanced Search for Products
// @route   GET /api/search
const searchProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, location, rating } = req.query;

    console.log("🔍 SEARCH API HIT");
    console.log("Params:", req.query);

    // 1. Build the Basic Query (Product Fields)
    let query = {};

    // Keyword Search
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        // Fallback in case schema uses 'title' instead of 'name'
        { title: { $regex: keyword, $options: 'i' } } 
      ];
    }

    // Category Filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 2. Fetch Products with Seller Data
    let products = await Product.find(query).populate('sellerId', 'name email profile address rating');

    // 3. Post-Fetch Filtering (For Seller Fields)
    if (location || rating) {
      products = products.filter(product => {
        const seller = product.sellerId;
        if (!seller) return false; 

        let matchesLocation = true;
        let matchesRating = true;

        if (location) {
          const city = seller.profile?.address?.city || '';
          const district = seller.profile?.address?.district || '';
          const sellerAddress = `${city} ${district}`.toLowerCase();
          matchesLocation = sellerAddress.includes(location.toLowerCase());
        }

        if (rating) {
            const sellerRating = seller.rating || 0; 
            matchesRating = sellerRating >= Number(rating);
        }

        return matchesLocation && matchesRating;
      });
    }

    console.log(`✅ Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json([]); // Return empty array on error
  }
};

module.exports = { searchProducts };
