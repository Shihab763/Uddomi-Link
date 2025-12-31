import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Please Log In</h2>
          <Link to="/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const hasRole = (role) => user.roles && user.roles.includes(role);

  return (
    <div className="min-h-screen bg-light">
      <div
        className="relative h-64 md:h-80 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-secondary shadow-sm">
              Welcome to a crafty place
            </h1>
            <p className="text-xl md:text-2xl font-light">
              Welcome back, {user.name}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 -mt-10 relative z-10">
        {hasRole('admin') && (
          <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-8 rounded-lg shadow-xl text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-3xl font-bold mb-4">🔐 Administrator Access</h2>
            <p className="text-lg mb-6 opacity-90">
              You have full system access. Manage users, monitor activity, and configure settings.
            </p>
            <Link
              to="/admin"
              className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-bold text-lg shadow-lg"
            >
              Go to Admin Panel →
            </Link>
          </div>
        )}

        {/* Main Dashboard Grid - All features remain here */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          <Link
            to="/marketplace"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-primary"
          >
            <div className="text-4xl mb-3">🛍️</div>
            <h3 className="text-lg font-bold text-dark">Marketplace</h3>
            <p className="text-sm text-gray-600 mt-2">Browse products</p>
          </Link>

          <Link
            to="/cart"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-secondary"
          >
            <div className="text-4xl mb-3">🛒</div>
            <h3 className="text-lg font-bold text-dark">My Cart</h3>
            <p className="text-sm text-gray-600 mt-2">View items</p>
          </Link>

          <Link
            to="/orders"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-primary"
          >
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-dark">Orders</h3>
            <p className="text-sm text-gray-600 mt-2">Order history</p>
          </Link>

          <Link
            to="/my-bookings"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-blue-600"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-dark">My Bookings</h3>
            <p className="text-sm text-gray-600 mt-2">View booking requests</p>
          </Link>

          
          {user?.roles?.includes("ngo") && (
            <Link
              to="/creators"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-red-600"
            >
            
            <div className="text-4xl mb-3">👩‍🎨</div>
            <h3 className="text-xl font-bold text-dark">Creators</h3>
            <p className="text-sm text-gray-600 mt-2">Browse Creators</p>
            
            </Link>
          )}

          {user?.roles?.includes("ngo") && (
            <Link
              to="/mentees"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-green-600"
            >
    
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-bold text-dark">Mentees</h3>
            <p className="text-sm text-gray-600 mt-2">Mnanage Your Mentees</p>
    
            </Link>
          )}

          
          {user?.roles?.includes("business-owner") && (
            <Link
              to="/mentorship-offers"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-purple-600"
            >
    
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-xl font-bold text-dark">Mentorship Offers</h3>
            <p className="text-sm text-gray-600 mt-2">Accept or reject offers</p>
    
            </Link>
          )}

          {user?.roles?.includes("business-owner") && (
            <Link
              to="/mentors"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-red-600r"
            >
    
            <div className="text-4xl mb-3">🧑‍🏫</div>
            <h3 className="text-xl font-bold text-dark">Mentors</h3>
            <p className="text-sm text-gray-600 mt-2">Plans & recommendations</p>
    
            </Link>
          )}


          <Link
            to={`/profile/${user._id}`}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-purple-600"
          >
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-lg font-bold text-dark">My Profile</h3>
            <p className="text-sm text-gray-600 mt-2">View & edit</p>
          </Link>

          {user?.roles?.includes("business-owner") && (
            <Link
              to="/skill-hub"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-yellow-600"
            >
    
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-dark">Skill Hub</h3>
            <p className="text-gray-600 text-sm mt-2">Workshops & tutorials</p>
    
            </Link>
          )}

          {(hasRole('business-owner') || hasRole('artist')) && (
            <Link
              to="/analytics"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-indigo-600"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-dark">Analytics</h3>
              <p className="text-sm text-gray-600 mt-2">Track performance</p>
            </Link>
          )}

          {(hasRole('business-owner') || hasRole('artist')) && (
            <Link
              to="/my-products"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-green-600"
            >
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-lg font-bold text-dark">My Products</h3>
              <p className="text-sm text-gray-600 mt-2">Manage listings</p>
            </Link>
          )}

          {(hasRole('business-owner') || hasRole('artist')) && (
            <Link
              to="/portfolio"
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-purple-600"
            >
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-lg font-bold text-dark">Portfolio</h3>
              <p className="text-sm text-gray-600 mt-2">Showcase your work</p>
            </Link>
          )}

          <Link
            to="/custom-orders"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-blue-600"
          >
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-lg font-bold text-dark">Custom Orders</h3>
            <p className="text-sm text-gray-600 mt-2">Request unique work</p>
          </Link>

          <Link
            to="/wishlist"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-pink-600"
          >
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="text-lg font-bold text-dark">Wishlist</h3>
            <p className="text-sm text-gray-600 mt-2">Save favorites</p>
          </Link>

          <Link
            to="/search"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-teal-600"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-dark">Advanced Search</h3>
            <p className="text-sm text-gray-600 mt-2">Find exactly what you need</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
