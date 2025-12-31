import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Marketplace from './pages/Marketplace';
import MyProducts from './pages/MyProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import SellersDirectory from './pages/SellersDirectory';
import PortfolioPage from './pages/PortfolioPage';
import MyBookings from './pages/MyBookings';
import BookingRequests from './pages/BookingRequests';
import SkillHub from './pages/SkillHub';
import NgoTrainings from './pages/NgoTrainings';
import Creators from './pages/Creators';
import Mentees from './pages/Mentees';
import Mentors from './pages/Mentors';
import MentorshipOffers from './pages/MentorshipOffers';


import AdvancedSearchPage from './pages/AdvancedSearchPage';
import CustomOrdersPage from './pages/CustomOrdersPage';
import WishlistPage from './pages/WishlistPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CustomOrderRequests from './pages/CustomOrderRequests';
import CreateCustomOrder from './pages/CreateCustomOrder';




function App() {
  return (
    <Router>
      <div className="font-sans text-dark">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/sellers" element={<SellersDirectory />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/booking-requests" element={<BookingRequests />} />
          <Route
              path="/skill-hub"
              element={
                <ProtectedRoute requiredRole="business-owner">
                <SkillHub />
                </ProtectedRoute>
              }
          />

          <Route
              path="/ngo/trainings"
              element={
                <ProtectedRoute requiredRole="ngo">
                <NgoTrainings />
                </ProtectedRoute>
              }
          />

          
          <Route
            path="/creators"
            element={
              <ProtectedRoute requiredRole="ngo">
              <Creators />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentees"
            element={
              <ProtectedRoute requiredRole="ngo">
              <Mentees />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentorship-offers"
            element={
              <ProtectedRoute requiredRole="business-owner">
              <MentorshipOffers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentors"
            element={
              <ProtectedRoute requiredRole="business-owner">
              <Mentors />
              </ProtectedRoute>
            }
          />

          <Route path="/custom-orders" element={<CustomOrders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<AdvancedSearchPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/custom-orders" element={<CustomOrdersPage />} />
          <Route path="/custom-order-requests" element={<CustomOrderRequests />} />
          <Route path="/custom-orders" element={<CreateCustomOrder />} />

          <Route path="/wishlist" element={<WishlistPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
