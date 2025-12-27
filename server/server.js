const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use((req, res, next) => {
  console.log("🌐", req.method, req.originalUrl);
  next();
});


app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin', require('./routes/adminProductRoutes'));
app.use('/api/admin', require('./routes/analyticsRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/role-requests', require('./routes/roleRequestRoutes'));
app.use('/api/seller', require('./routes/sellerAnalyticsRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/portfolios', require('./routes/portfolioRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/trainings', require('./routes/trainingRoutes'));
app.use('/api/mentorship', require('./routes/mentorshipRoutes'));
app.use('/api/custom-orders', require('./routes/customOrderRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
