import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

function AdvancedSearchPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [filters, setFilters] = useState({});
    const [filterOptions, setFilterOptions] = useState({});
    const [pagination, setPagination] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [geolocation, setGeolocation] = useState(null);

    const [searchParams, setSearchParams] = useState({
        q: '',
        itemType: 'all',
        category: '',
        minPrice: '',
        maxPrice: '',
        location: '',
        radius: '10',
        skills: '',
        tags: '',
        acceptsCustomOrders: false,
        acceptsBookings: false,
        availability: '',
        minRating: '',
        sortBy: 'relevance',
        page: 1,
        limit: 20
    });

    const debouncedSearch = useDebounce(searchParams.q, 300);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const initialParams = {};
        
        params.forEach((value, key) => {
            if (key === 'page' || key === 'limit') {
                initialParams[key] = parseInt(value);
            } else if (key === 'minPrice' || key === 'maxPrice' || key === 'minRating') {
                initialParams[key] = parseFloat(value);
            } else if (key === 'acceptsCustomOrders' || key === 'acceptsBookings') {
                initialParams[key] = value === 'true';
            } else {
                initialParams[key] = value;
            }
        });

        setSearchParams(prev => ({
            ...prev,
            ...initialParams
        }));

        fetchFilterOptions(initialParams.itemType || 'all');
    }, [location.search]);

    useEffect(() => {
        performSearch();
    }, [
        searchParams.page,
        searchParams.itemType,
        searchParams.sortBy,
        debouncedSearch,
        searchParams.category,
        searchParams.minPrice,
        searchParams.maxPrice,
        searchParams.location,
        searchParams.radius,
        searchParams.skills,
        searchParams.tags,
        searchParams.acceptsCustomOrders,
        searchParams.acceptsBookings,
        searchParams.availability,
        searchParams.minRating
    ]);

    useEffect(() => {
        if (debouncedSearch.length >= 2) {
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearch, searchParams.itemType]);

    const fetchFilterOptions = async (itemType) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/search/filters?itemType=${itemType}`
            );
            
            if (response.ok) {
                const data = await response.json();
                setFilterOptions(data);
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/search/suggestions?q=${encodeURIComponent(debouncedSearch)}&itemType=${searchParams.itemType}`
            );
            
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const performSearch = useCallback(async () => {
        setLoading(true);
        
        try {
            const queryParams = new URLSearchParams();
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    queryParams.append(key, value);
                }
            });

            if (geolocation && searchParams.radius && searchParams.radius !== '') {
                queryParams.append('lat', geolocation.latitude);
                queryParams.append('lng', geolocation.longitude);
            }

            const response = await fetch(
                `http://localhost:5000/api/search?${queryParams.toString()}`
            );
            
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.results);
                setPagination(data.pagination);
                setFilters(data.filters.applied);
                
                navigate(`/search?${queryParams.toString()}`, { replace: true });
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }, [searchParams, geolocation, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            page: 1
        }));
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchParams(prev => ({
            ...prev,
            q: suggestion.title,
            itemType: suggestion.itemType,
            category: suggestion.category,
            page: 1
        }));
        setSuggestions([]);
    };

    const handleClearFilters = () => {
        setSearchParams({
            q: '',
            itemType: 'all',
            category: '',
            minPrice: '',
            maxPrice: '',
            location: '',
            radius: '10',
            skills: '',
            tags: '',
            acceptsCustomOrders: false,
            acceptsBookings: false,
            availability: '',
            minRating: '',
            sortBy: 'relevance',
            page: 1,
            limit: 20
        });
        setGeolocation(null);
    };

    const handleUseMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGeolocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setSearchParams(prev => ({
                        ...prev,
                        location: 'Near me',
                        page: 1
                    }));
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Unable to get your location. Please enable location services.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    const handlePageChange = (newPage) => {
        setSearchParams(prev => ({ ...prev, page: newPage }));
        window.scrollTo(0, 0);
    };

    const getItemTypeIcon = (itemType) => {
        switch (itemType) {
            case 'product': return '🛍️';
            case 'portfolio': return '🎨';
            case 'user': return '👤';
            case 'training': return '📚';
            default: return '🔍';
        }
    };

    const renderSearchResult = (result) => {
        const { itemType, item } = result;
        
        switch (itemType) {
            case 'product':
                return (
                    <div key={`${itemType}-${item._id}`} className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                        <div className="relative">
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-48 object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold">
                                {getItemTypeIcon(itemType)} Product
                            </span>
                            {!item.isApproved && (
                                <span className="absolute top-2 right-2 bg-yellow-400 text-dark px-2 py-1 rounded text-xs font-bold">
                                    PENDING
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                            
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xl font-bold text-primary">৳{item.price}</span>
                                <span className="text-sm text-gray-600">Stock: {item.stock}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img
                                        src={item.seller?.profileImage || 'https://via.placeholder.com/32'}
                                        alt={item.seller?.name}
                                        className="w-6 h-6 rounded-full mr-2"
                                    />
                                    <span className="text-sm text-gray-600">{item.seller?.name}</span>
                                </div>
                                <Link
                                    to={`/marketplace/${item._id}`}
                                    className="bg-primary text-white px-4 py-1 rounded text-sm hover:bg-green-800 transition"
                                >
                                    View
                                </Link>
                            </div>
                        </div>
                    </div>
                );

            case 'portfolio':
                return (
                    <div key={`${itemType}-${item._id}`} className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                        <div className="relative">
                            <img
                                src={item.thumbnailUrl || item.mediaUrl}
                                alt={item.title}
                                className="w-full h-48 object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold">
                                {getItemTypeIcon(itemType)} Portfolio
                            </span>
                            {item.acceptsCustomOrders && (
                                <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                    Custom Orders
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                                {item.tags?.slice(0, 3).map(tag => (
                                    <span key={tag} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm text-gray-600">{item.category}</span>
                                <div className="text-sm">
                                    <span className="text-gray-600">👁️ {item.viewCount}</span>
                                    <span className="ml-2 text-gray-600">❤️ {item.favoriteCount}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img
                                        src={item.creator?.profileImage || 'https://via.placeholder.com/32'}
                                        alt={item.creator?.name}
                                        className="w-6 h-6 rounded-full mr-2"
                                    />
                                    <span className="text-sm text-gray-600">{item.creator?.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/portfolio/view/${item._id}`}
                                        className="bg-purple-600 text-white px-4 py-1 rounded text-sm hover:bg-purple-700 transition"
                                    >
                                        View
                                    </Link>
                                    {item.acceptsCustomOrders && (
                                        <Link
                                            to={`/custom-orders?creatorId=${item.creator?._id}&portfolioId=${item._id}`}
                                            className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition"
                                        >
                                            Request Custom
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'user':
  return (
    <div
      key={`${itemType}-${item._id}`}
      className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <img
            src={item.profileImage || 'https://via.placeholder.com/64'}
            alt={item.name}
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-gray-600 text-sm">
              {item.businessInfo?.type || 'Creator'}
            </p>
            {item.isVerified && (
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mt-1">
                ✅ Verified
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {item.bio}
        </p>

        <div className="flex justify-between items-center gap-2">
          <Link
            to={`/profile/${item._id}`}
            className="flex-1 bg-primary text-white text-center py-2 rounded hover:bg-green-800 transition"
          >
            View Profile
          </Link>

          {item.acceptsCustomOrders && (
            <Link
              to={`/custom-orders?creatorId=${item._id}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition"
            >
              Request Custom
            </Link>
          )}
        </div>
      </div>
    </div>
  );


            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🔍 Advanced Search</h1>
                    <p className="text-lg opacity-90">Find exactly what you're looking for with powerful filters</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            name="q"
                            value={searchParams.q}
                            onChange={handleInputChange}
                            placeholder="Search for products, portfolios, creators..."
                            className="w-full p-4 pl-12 text-lg border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500 shadow-lg"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                            🔍
                        </div>
                        
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-xl z-50 mt-1">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-2">{getItemTypeIcon(suggestion.itemType)}</span>
                                            <span className="font-medium">{suggestion.title}</span>
                                            <span className="ml-2 text-gray-500 text-sm">{suggestion.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center bg-white border px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                            {showFilters ? '▲' : '▼'} Filters
                        </button>
                        
                        <select
                            name="itemType"
                            value={searchParams.itemType}
                            onChange={handleInputChange}
                            className="border rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="product">Products</option>
                            <option value="portfolio">Portfolio Items</option>
                            <option value="user">Creators</option>
                        </select>
                        
                        <select
                            name="sortBy"
                            value={searchParams.sortBy}
                            onChange={handleInputChange}
                            className="border rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="relevance">Most Relevant</option>
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                        
                        {Object.keys(filters).length > 0 && (
                            <button
                                onClick={handleClearFilters}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {showFilters && (
                        <div className="lg:w-1/4">
                            <div className="bg-white p-6 rounded-lg shadow-lg sticky top-8">
                                <h3 className="font-bold text-lg mb-4">Refine Your Search</h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Category</label>
                                        <select
                                            name="category"
                                            value={searchParams.category}
                                            onChange={handleInputChange}
                                            className="w-full border rounded p-2"
                                        >
                                            <option value="">All Categories</option>
                                            {filterOptions.categories?.map(cat => (
                                                <option key={cat.name} value={cat.name}>
                                                    {cat.name} ({cat.count})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Price Range</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                name="minPrice"
                                                value={searchParams.minPrice}
                                                onChange={handleInputChange}
                                                placeholder="Min"
                                                className="w-1/2 border rounded p-2"
                                                min="0"
                                            />
                                            <input
                                                type="number"
                                                name="maxPrice"
                                                value={searchParams.maxPrice}
                                                onChange={handleInputChange}
                                                placeholder="Max"
                                                className="w-1/2 border rounded p-2"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Location</label>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                name="location"
                                                value={searchParams.location}
                                                onChange={handleInputChange}
                                                placeholder="City or district"
                                                className="w-full border rounded p-2"
                                            />
                                            <button
                                                onClick={handleUseMyLocation}
                                                className="w-full bg-blue-100 text-blue-800 py-2 rounded hover:bg-blue-200 text-sm"
                                            >
                                                📍 Use My Location
                                            </button>
                                            {geolocation && (
                                                <div className="text-sm text-gray-600">
                                                    <select
                                                        name="radius"
                                                        value={searchParams.radius}
                                                        onChange={handleInputChange}
                                                        className="w-full border rounded p-1"
                                                    >
                                                        <option value="5">Within 5 km</option>
                                                        <option value="10">Within 10 km</option>
                                                        <option value="25">Within 25 km</option>
                                                        <option value="50">Within 50 km</option>
                                                        <option value="100">Within 100 km</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Skills</label>
                                        <select
                                            name="skills"
                                            value={searchParams.skills}
                                            onChange={handleInputChange}
                                            className="w-full border rounded p-2"
                                        >
                                            <option value="">All Skills</option>
                                            {filterOptions.skills?.map(skill => (
                                                <option key={skill.name} value={skill.name}>
                                                    {skill.name} ({skill.count})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tags</label>
                                        <select
                                            name="tags"
                                            value={searchParams.tags}
                                            onChange={handleInputChange}
                                            className="w-full border rounded p-2"
                                        >
                                            <option value="">All Tags</option>
                                            {filterOptions.tags?.map(tag => (
                                                <option key={tag.name} value={tag.name}>
                                                    {tag.name} ({tag.count})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                                        <select
                                            name="minRating"
                                            value={searchParams.minRating}
                                            onChange={handleInputChange}
                                            className="w-full border rounded p-2"
                                        >
                                            <option value="">Any Rating</option>
                                            <option value="4.5">4.5+ Stars</option>
                                            <option value="4.0">4.0+ Stars</option>
                                            <option value="3.5">3.5+ Stars</option>
                                            <option value="3.0">3.0+ Stars</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Availability</label>
                                        <select
                                            name="availability"
                                            value={searchParams.availability}
                                            onChange={handleInputChange}
                                            className="w-full border rounded p-2"
                                        >
                                            <option value="">Any Availability</option>
                                            <option value="available">Available</option>
                                            <option value="limited">Limited Stock</option>
                                            <option value="unavailable">Out of Stock</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="acceptsCustomOrders"
                                                checked={searchParams.acceptsCustomOrders}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            Accepts Custom Orders
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="acceptsBookings"
                                                checked={searchParams.acceptsBookings}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            Accepts Bookings
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`${showFilters ? 'lg:w-3/4' : 'w-full'}`}>
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-xl">Searching...</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <p className="text-gray-600">
                                        Found {pagination.total || 0} results
                                        {searchParams.q && ` for "${searchParams.q}"`}
                                    </p>
                                </div>

                                {searchResults.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-lg shadow">
                                        <div className="text-6xl mb-4">🔍</div>
                                        <h3 className="text-xl font-bold mb-2">No results found</h3>
                                        <p className="text-gray-600 mb-6">
                                            Try adjusting your search or filters
                                        </p>
                                        <button
                                            onClick={handleClearFilters}
                                            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {searchResults.map(renderSearchResult)}
                                        </div>

                                        {pagination.totalPages > 1 && (
                                            <div className="mt-8 flex justify-center">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handlePageChange(searchParams.page - 1)}
                                                        disabled={searchParams.page === 1}
                                                        className={`px-4 py-2 rounded ${searchParams.page === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-50'}`}
                                                    >
                                                        Previous
                                                    </button>
                                                    
                                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                        const pageNum = Math.max(1, Math.min(
                                                            searchParams.page - 2,
                                                            pagination.totalPages - 4
                                                        )) + i;
                                                        
                                                        if (pageNum > 0 && pageNum <= pagination.totalPages) {
                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => handlePageChange(pageNum)}
                                                                    className={`px-4 py-2 rounded ${searchParams.page === pageNum ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    
                                                    <button
                                                        onClick={() => handlePageChange(searchParams.page + 1)}
                                                        disabled={searchParams.page === pagination.totalPages}
                                                        className={`px-4 py-2 rounded ${searchParams.page === pagination.totalPages ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-50'}`}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdvancedSearchPage;
