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
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-secondary">
              <h2 className="text-2xl font-bold text-dark mb-4">Sales & Orders</h2>
              <p className="text-gray-600">Track orders for your products.</p>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
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

        </div>
      </div>
    </div>
  );
}

export default Dashboard;