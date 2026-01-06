const Product = require('../models/productModel');
const User = require('../models/userModel');


const searchProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, location, rating } = req.query;

 
    let query = {};


    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

 
    if (category && category !== 'All') {
      query.category = category;
    }

    // Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }


    let products = await Product.find(query).populate('sellerId', 'name email profile address rating');

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

    res.json(products);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json([]); 
  }
};

module.exports = { searchProducts };
