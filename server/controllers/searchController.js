const Product = require('../models/productModel');
const User = require('../models/userModel');


const getSuggestions = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    
    const regex = new RegExp(query, 'i');


    const products = await Product.find({ name: { $regex: regex } })
      .select('name imageUrl price category') 
      .limit(5);


    const creators = await User.find({
      name: { $regex: regex },
      roles: 'business-owner' 
    }).select('name profile.avatar profile.businessName');

    res.json({ products, creators });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const searchAll = async (req, res) => {
  try {
    const { q, type, min, max, sort } = req.query;
    const regex = q ? new RegExp(q, 'i') : null;
    let results = {};


    if (!type || type === 'products') {
      let queryObj = {};
      if (regex) queryObj.name = { $regex: regex };

      if (min || max) {
        queryObj.price = {};
        if (min) queryObj.price.$gte = Number(min);
        if (max) queryObj.price.$lte = Number(max);
      }

      let sortObj = {};
      if (sort === 'highToLow') sortObj.price = -1; 
      if (sort === 'lowToHigh') sortObj.price = 1;  
      
      const products = await Product.find(queryObj).sort(sortObj);
      results.products = products;
    }


    if (!type || type === 'creators') {
      let userQuery = { roles: 'business-owner' };
      if (regex) userQuery.name = { $regex: regex };

      const creators = await User.find(userQuery).select('-password');
      results.creators = creators;
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSuggestions, searchAll };
