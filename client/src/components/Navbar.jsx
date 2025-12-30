import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchWishlistCount();
    } else {
      setWishlistCount(0);
    }
  }, [user]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const onLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-primary p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold tracking-wider flex items-center gap-2">
          <span>🌾</span> Uddomi Link
        </Link>

        {/* Search Bar - Mobile & Desktop */}
        <form onSubmit={handleSearch} className="w-full md:w-auto md:flex-1 max-w-lg">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search products, creators, skills..."
              className="w-full p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white text-dark"
            />
            <button 
              type="submit" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Navigation Links */}
        <div className="flex items-center flex-wrap justify-center gap-3 md:gap-4">
          <Link to="/marketplace" className="text-white hover:text-secondary transition font-medium text-sm md:text-base">
            🛍️ Marketplace
          </Link>
          
          <Link to="/sellers" className="text-white hover:text-secondary transition font-medium text-sm md:text-base">
            👥 Sellers
          </Link>
          
          <Link to="/portfolio" className="text-white hover:text-secondary transition font-medium text-sm md:text-base">
            🎨 Portfolio
          </Link>
          
          <Link to="/custom-orders" className="text-white hover:text-secondary transition font-medium text-sm md:text-base">
            ✨ Custom
          </Link>
          
          <Link to="/wishlist" className="text-white hover:text-secondary transition font-medium text-sm md:text-base relative">
            ❤️ Wishlist
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          
          {/* Advanced Search Link (Mobile visible) */}
          <Link to="/search" className="md:hidden text-white hover:text-secondary transition font-medium text-sm">
            🔍 Advanced
          </Link>

          {user && user.roles && user.roles.includes('business-owner') && (
            <Link to="/my-products" className="text-white hover:text-secondary transition font-medium text-sm md:text-base">
              📦 My Products
            </Link>
          )}
          
          {user && (
            <>
              <Link to="/cart" className="text-white hover:text-secondary transition font-medium text-sm md:text-base">
                🛒 Cart
              </Link>
              <Link to="/orders" className="text-white hover:text-secondary transition font-medium text-sm md:text-base">
                📦 Orders
              </Link>
            </>
          )}
          
          {user ? (
            <>
              {user.roles && user.roles.includes('admin') && (
                <Link
                  to="/admin"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded transition font-bold text-sm md:text-base"
                >
                  🔐 Admin
                </Link>
              )}
              
              <Link 
                to={`/profile/${user._id}`} 
                className="text-light hover:text-secondary transition text-sm md:text-base hidden md:block"
              >
                Hello, <span className="text-secondary font-bold">{user.name}</span>
              </Link>
              
              <button
                onClick={onLogout}
                className="bg-accent hover:bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded transition text-sm md:text-base"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-secondary transition text-sm md:text-base">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-secondary text-dark font-bold px-3 py-1.5 md:px-4 md:py-2 rounded hover:bg-yellow-500 transition text-sm md:text-base"
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
