import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function AdvancedSearchPage() {
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('products'); 
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('relevance'); 
  
  const [results, setResults] = useState({ products: [], creators: [] });
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const q = queryParams.get('q') || '';
    setSearchTerm(q);
  }, [location.search]);

 
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
      
        let url = `http://localhost:5000/api/search?q=${encodeURIComponent(searchTerm)}&type=${filterType}`;
        
        if (filterType === 'products') {
          if (minPrice) url += `&min=${minPrice}`;
          if (maxPrice) url += `&max=${maxPrice}`;
          if (sortOrder) url += `&sort=${sortOrder}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

  
    const timer = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filterType, minPrice, maxPrice, sortOrder]);



  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/300?text=No+Image"; 
  };

  return (
    <div className="min-h-screen bg-light p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-6">🔍 Advanced Search</h1>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* --- SIDEBAR FILTERS --- */}
          <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow h-fit">
            <h3 className="font-bold text-lg mb-4 text-primary border-b pb-2">Filters</h3>

            {/* 1. Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
              >
                <option value="products">Products</option>
                <option value="creators">Creators</option>
              </select>
            </div>

            {/* Additional Filters (Only if Product is selected) */}
            {filterType === 'products' && (
              <>
                {/* 2. Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (৳)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 p-2 border rounded"
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 p-2 border rounded"
                    />
                  </div>
                </div>

                {/* 3. Sorting */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By Price</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sort" 
                        value="relevance"
                        checked={sortOrder === 'relevance'}
                        onChange={(e) => setSortOrder(e.target.value)}
                      />
                      <span className="text-sm">Relevance</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sort" 
                        value="highToLow"
                        checked={sortOrder === 'highToLow'}
                        onChange={(e) => setSortOrder(e.target.value)}
                      />
                      <span className="text-sm">Price: High to Low</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sort" 
                        value="lowToHigh"
                        checked={sortOrder === 'lowToHigh'}
                        onChange={(e) => setSortOrder(e.target.value)}
                      />
                      <span className="text-sm">Price: Low to High</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* result grid */}
          <div className="w-full md:w-3/4">
            
            {/* Input Repetition handling */}
            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to refine search..."
                className="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            {loading ? (
              <p className="text-center text-gray-500 mt-10">Searching...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* PRODUCT RESULTS */}
                {filterType === 'products' && results.products?.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
                    {/* Image Area */}
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={item.imageUrl}  
                        alt={item.name} 
                        onError={handleImageError} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg text-dark mb-1">{item.name}</h3>
                      <p className="text-primary font-bold text-xl mb-2">৳ {item.price}</p>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.stock > 0 ? `In Stock: ${item.stock}` : 'Out of Stock'}
                        </span>
                      </div>

                      {/* View Details Button (No Add to Cart) */}
                      <div className="mt-4 flex gap-2">
                        <Link 
                          to={`/marketplace/${item._id}`}
                          className="flex-1 bg-gray-100 text-dark py-2 rounded text-center text-sm font-semibold hover:bg-gray-200"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* CREATOR RESULTS */}
                {filterType === 'creators' && results.creators?.map((user) => (
                  <div key={user._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4">
                      {/*  */}
                      <img 
                        src={user.profile?.avatar || 'https://via.placeholder.com/150'} 
                        alt={user.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg text-dark">{user.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {user.profile?.businessName || 'Local Entrepreneur'}
                    </p>
                    <Link 
                      to={`/profile/${user._id}`}
                      className="bg-secondary text-dark px-6 py-2 rounded-full font-bold hover:bg-yellow-500 transition"
                    >
                      Visit Profile
                    </Link>
                  </div>
                ))}

                {/* no result handling */}
                {filterType === 'products' && results.products?.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    No products found matching your filters.
                  </div>
                )}
                {filterType === 'creators' && results.creators?.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    No creators found.
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearchPage;
