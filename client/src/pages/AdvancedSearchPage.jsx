import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const AdvancedSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params (supports ?q= or ?keyword=)
  const initialKeyword = searchParams.get('q') || searchParams.get('keyword') || '';

  const [filters, setFilters] = useState({
    keyword: initialKeyword,
    category: 'All',
    minPrice: '',
    maxPrice: '',
    location: '',
    rating: ''
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync state when URL changes (e.g. typing in Navbar)
  useEffect(() => {
    const urlKeyword = searchParams.get('q') || searchParams.get('keyword') || '';
    if (urlKeyword !== filters.keyword) {
      setFilters(prev => ({ ...prev, keyword: urlKeyword }));
    }
  }, [searchParams]);

  // Auto-search when filters change (with delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults();
    }, 500); 
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      
      // Use 'q' as the standard param name for the backend
      if (filters.keyword) query.append('q', filters.keyword);
      
      if (filters.category !== 'All') query.append('category', filters.category);
      if (filters.minPrice) query.append('minPrice', filters.minPrice);
      if (filters.maxPrice) query.append('maxPrice', filters.maxPrice);
      if (filters.location) query.append('location', filters.location);
      if (filters.rating) query.append('rating', filters.rating);

      const res = await fetch(`http://localhost:5000/api/search?${query.toString()}`);
      
      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();

      // Robust check: Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.results && Array.isArray(data.results)) {
        // Fallback if backend sends { results: [...] }
        setProducts(data.results);
      } else {
        setProducts([]);
      }

    } catch (error) {
      console.error("Search failed:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Banner */}
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">🔍 Advanced Search</h1>
          <p className="opacity-90">Find unique crafts, services, and local talent.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* --- SIDEBAR FILTERS --- */}
        <div className="w-full md:w-1/4 space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-dark border-b pb-2">Filters</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Search Term</label>
              <input 
                type="text" 
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Pottery, Woodwork..." 
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Category</label>
              <select 
                name="category" 
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border p-2 rounded"
              >
                <option value="All">All Categories</option>
                <option value="Handicrafts">Handicrafts</option>
                <option value="Art">Art & Painting</option>
                <option value="Textiles">Textiles & Fabric</option>
                <option value="Food">Organic Food</option>
                <option value="Services">Services</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Price Range (BDT)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min" 
                  className="w-full border p-2 rounded"
                />
                <input 
                  type="number" 
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max" 
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Seller Location</label>
              <input 
                type="text" 
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Dhaka, Sylhet..." 
                className="w-full border p-2 rounded"
              />
            </div>

            <button 
              onClick={() => setFilters({ keyword: '', category: 'All', minPrice: '', maxPrice: '', location: '', rating: '' })}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* --- RESULTS GRID --- */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            {/* Dynamic Results Header */}
            <h2 className="text-xl font-bold text-dark">
              {loading 
                ? "Searching..." 
                : filters.keyword 
                  ? `${products.length} Result${products.length !== 1 ? 's' : ''} Found for "${filters.keyword}"`
                  : `${products.length} Result${products.length !== 1 ? 's' : ''} Found`
              }
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">Searching...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow">
              <p className="text-xl text-gray-500">No items match your filters.</p>
              <button 
                onClick={() => setFilters({ keyword: '', category: 'All', minPrice: '', maxPrice: '', location: '', rating: '' })}
                className="mt-4 text-primary underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link to={`/marketplace/${product._id}`} key={product._id} className="block group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col">
                    <div className="h-48 overflow-hidden bg-gray-100 relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">
                          {product.category}
                        </span>
                        {product.sellerId?.profile?.address?.city && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            📍 {product.sellerId.profile.address.city}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-dark mb-1 group-hover:text-primary transition">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between border-t pt-3 mt-auto">
                        <span className="text-xl font-bold text-green-700">৳{product.price}</span>
                        <div className="text-xs text-right text-gray-500">
                          by <span className="font-semibold text-dark">{product.sellerId?.name || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;
