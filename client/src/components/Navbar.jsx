import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const navigate = useNavigate();
  // user already logged in kina check kora
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [wishlistCount, setWishlistCount] = useState(0); 
  
  useEffect(() => {
    if (user) {
      fetchWishlistCount();
    } else {
      setWishlistCount(0); // Reset when no user
    }
  }, [user]);

  const refreshWishlistCount = () => {
  if (user) {
    fetchWishlistCount();
  }
};

  const fetchWishlistCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/wishlist/my', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const total = data.products.length + data.portfolios.length + data.sellers.length;
        setWishlistCount(total);
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  const onLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-primary p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold tracking-wider flex items-center gap-2">
          <span>🌾</span> Uddomi Link
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/marketplace" className="text-white hover:text-secondary transition font-medium">
            🛍️ Marketplace
          </Link>
          <Link to="/sellers" className="text-white hover:text-secondary transition font-medium">
            🏪 Browse Sellers
          </Link>
          <Link to="/portfolio" className="text-white hover:text-secondary transition font-medium">
            🎨 Portfolio
          </Link>
          <Link to="/custom-orders" className="text-white hover:text-secondary transition font-medium">
            ✨ Custom Orders
          </Link>
          <Link to="/wishlist" className="text-white hover:text-secondary transition font-medium relative">
            ❤️ Wishlist
            {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {wishlistCount}
            </span>
            )}
          </Link>
          {user && user.roles && user.roles.includes('business-owner') && (
            <Link to="/my-products" className="text-white hover:text-secondary transition font-medium">
              📦 My Products
            </Link>
          )}
          {user && (
            <>
              <Link to="/cart" className="text-white hover:text-secondary transition font-medium">
                🛒 Cart
              </Link>
              <Link to="/orders" className="text-white hover:text-secondary transition font-medium">
                📦 Orders
              </Link>
            </>
          )}
          {user ? (
            <>
              {user.roles && user.roles.includes('admin') && (
                <Link
                  to="/admin"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition font-bold"
                >
                  🔐 Admin Panel
                </Link>
              )}
              <Link to={`/profile/${user._id}`} className="text-light hidden md:block hover:text-secondary transition">
                Hello, <span className="text-secondary font-bold">{user.name}</span>
              </Link>
              <button
                onClick={onLogout}
                className="bg-accent hover:bg-red-700 text-white px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-secondary transition">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-secondary text-dark font-bold px-4 py-2 rounded hover:bg-yellow-500 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
