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
          const sellerAddress = `${seller.profile?.address?.city || ''} ${seller.profile?.address?.district || ''}`;
          matchesLocation = sellerAddress.toLowerCase().includes(location.toLowerCase());
        }

        if (rating) {
           
            matchesRating = (seller.rating || 0) >= Number(rating);
        }

        return matchesLocation && matchesRating;
      });
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { searchProducts };
