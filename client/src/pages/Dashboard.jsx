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

        {/* NEW: Analytics Dashboard Card (for business owners and artists) */}
        {(hasRole('business-owner') || hasRole('artist')) && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-lg shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2">📊 Analytics Dashboard</h2>
                  <p className="opacity-90">Track your performance, views, and revenue</p>
                </div>
                <Link
                  to="/analytics"
                  className="mt-4 md:mt-0 bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-bold"
                >
                  View Analytics →
                </Link>
              </div>
            </div>
          </div>
        )}

        {hasRole('business-owner') && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
              <h2 className="text-2xl font-bold text-dark mb-4">My Products</h2>
              <p className="text-gray-600 mb-6">Manage your product listings and inventory.</p>
              <Link
                to="/my-products"
                className="block bg-primary text-white text-center px-6 py-2 rounded hover:bg-green-800 transition w-full font-bold"
              >
                Manage Products
              </Link>
            </div>
            
            {/* NEW: Portfolio Management Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-purple-600">
              <h2 className="text-2xl font-bold text-dark mb-4">🎨 Portfolio Management</h2>
              <p className="text-gray-600 mb-6">Showcase your work and attract custom orders.</p>
              <Link
                to="/portfolio"
                className="block bg-purple-600 text-white text-center px-6 py-2 rounded hover:bg-purple-700 transition w-full font-bold"
              >
                Manage Portfolio
              </Link>
            </div>
          </div>
        )}

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

        {/* Main Dashboard Grid - Updated with all 5 new features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {/* Original Features */}
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

          <Link
            to={`/profile/${user._id}`}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-purple-600"
          >
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-lg font-bold text-dark">My Profile</h3>
            <p className="text-sm text-gray-600 mt-2">View & edit</p>
          </Link>

          {/* NEW: Feature 1 - Analytics Dashboard */}
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

          {/* NEW: Feature 2 - Portfolio Management */}
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

          {/* NEW: Feature 3 - Custom Order Requests */}
          <Link
            to="/custom-orders"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-blue-600"
          >
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-lg font-bold text-dark">Custom Orders</h3>
            <p className="text-sm text-gray-600 mt-2">Request unique work</p>
          </Link>

          {/* NEW: Feature 4 - Wishlist & Favorites */}
          <Link
            to="/wishlist"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-pink-600"
          >
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="text-lg font-bold text-dark">Wishlist</h3>
            <p className="text-sm text-gray-600 mt-2">Save favorites</p>
          </Link>

          {/* NEW: Feature 5 - Advanced Search */}
          <Link
            to="/search"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-center border-t-4 border-teal-600"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-dark">Advanced Search</h3>
            <p className="text-sm text-gray-600 mt-2">Find exactly what you need</p>
          </Link>
        </div>

        {/* NEW: Quick Stats Section (for business owners) */}
        {hasRole('business-owner') && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-dark mb-6">Quick Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-bold">Analytics</h4>
                <p className="text-sm text-gray-600">Track performance</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl mb-2">🎨</div>
                <h4 className="font-bold">Portfolio</h4>
                <p className="text-sm text-gray-600">Showcase work</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl mb-2">✨</div>
                <h4 className="font-bold">Custom Orders</h4>
                <p className="text-sm text-gray-600">Get requests</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl mb-2">🔍</div>
                <h4 className="font-bold">Search</h4>
                <p className="text-sm text-gray-600">Find customers</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
