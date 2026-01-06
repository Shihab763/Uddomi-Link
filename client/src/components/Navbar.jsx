import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import NotificationBell from './NotificationBell';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [wishlistCount, setWishlistCount] = useState(0);


  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], creators: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null); 

  useEffect(() => {
    if (user) {
      fetchWishlistCount();
    } else {
      setWishlistCount(0);
    }

    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        const total = (data.products?.length || 0) + (data.portfolios?.length || 0) + (data.sellers?.length || 0);
        setWishlistCount(total);
      }
    } catch (error) {
      console.log('Wishlist fetch skipped or failed');
    }
  };

  const handleInputChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      try {
        const res = await fetch(`http://localhost:5000/api/search/suggestions?q=${query}`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error fetching suggestions");
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const onLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-primary p-4 shadow-md z-50 relative">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        
        <Link to="/" className="text-white text-2xl font-bold tracking-wider flex items-center gap-2">
          <span>🌾</span> Uddomi Link
        </Link>

        {/* --- Search Bar with Suggestions --- */}
        <div className="w-full md:w-auto md:flex-grow md:max-w-xl md:ml-8 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange} 
              onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
              placeholder=" Search products and creators"
              className="w-full p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white text-dark"
            />
            <button 
              type="submit" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              🔍
            </button>
          </form>

          {/* --- Dropdown Suggestions UI --- */}
          {showSuggestions && (suggestions.products.length > 0 || suggestions.creators.length > 0) && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-b-lg border border-gray-100 mt-1 z-50 max-h-96 overflow-y-auto">
              
              {/* Product Suggestions */}
              {suggestions.products.map((prod) => (
                <Link 
                  key={prod._id} 
                  to={`/marketplace/${prod._id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                >
                  {/* */}
                  <img src={prod.imageUrl || 'https://via.placeholder.com/50'} alt={prod.name} className="w-10 h-10 object-cover rounded" />
                  <div>
                    <p className="text-sm font-semibold text-dark">{prod.name}</p>
                    <p className="text-xs text-primary font-bold">৳{prod.price}</p>
                  </div>
                </Link>
              ))}

              {/* Creator Suggestions */}
              {suggestions.creators.map((creator) => (
                <Link 
                  key={creator._id} 
                  to={`/profile/${creator._id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {creator.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark">{creator.name}</p>
                    <p className="text-xs text-gray-500">Business Owner</p>
                  </div>
                </Link>
              ))}
              
              <div 
                onClick={handleSearchSubmit}
                className="p-3 text-center text-sm text-primary font-bold cursor-pointer hover:underline bg-gray-50"
              >
                See all results for "{searchQuery}"
              </div>
            </div>
          )}
        </div>

        {/* --- Navigation Links --- */}
        <div className="flex items-center flex-wrap justify-center gap-3 md:gap-4">
          <Link to="/marketplace" className="text-white hover:text-secondary transition font-medium text-sm md:text-base">
            🛍️ Marketplace
          </Link>
          
          <Link to="/sellers" className="text-white hover:text-secondary transition font-medium text-sm md:text-base">
            👥 Sellers
          </Link>
          
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

              <div className="text-white">
                <NotificationBell />
              </div>
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
