import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Wishlist() {
    const [wishlist, setWishlist] = useState({
        products: [],
        portfolios: [],
        sellers: []
    });
    const [activeTab, setActiveTab] = useState('products');
    const [loading, setLoading] = useState(true);
    const [wishlistCount, setWishlistCount] = useState(0);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            fetchWishlist();
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/wishlist/my', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWishlist(data);
                const total = data.products.length + data.portfolios.length + data.sellers.length;
                setWishlistCount(total);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (itemId, itemType) => {
        try {
            const response = await fetch('http://localhost:5000/api/wishlist/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ itemId, itemType })
            });

            if (response.ok) {
                fetchWishlist();
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const clearWishlist = async () => {
        if (!window.confirm('Clear your entire wishlist?')) return;

        try {
            const response = await fetch('http://localhost:5000/api/wishlist/clear', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('Wishlist cleared!');
                fetchWishlist();
            }
        } catch (error) {
            console.error('Error clearing wishlist:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-gradient-to-r from-pink-600 to-red-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">❤️ My Wishlist</h1>
                    <p className="text-lg opacity-90">
                        {wishlistCount === 0 
                            ? 'Save your favorite items and creators' 
                            : `You have ${wishlistCount} item${wishlistCount !== 1 ? 's' : ''} saved`}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg">
                    {/* Tabs */}
                    <div className="grid grid-cols-4 border-b">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'products'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🛍️ Products ({wishlist.products.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('portfolios')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'portfolios'
                                    ? 'bg-secondary text-dark'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🎨 Portfolios ({wishlist.portfolios.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('sellers')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'sellers'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            👥 Sellers ({wishlist.sellers.length})
                        </button>
                        {wishlistCount > 0 && (
                            <button
                                onClick={clearWishlist}
                                className="py-4 px-6 font-bold text-lg bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                🗑️ Clear All
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        {wishlistCount === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">❤️</div>
                                <p className="text-gray-600 text-lg mb-4">Your wishlist is empty</p>
                                <p className="text-gray-500 mb-6">
                                    Save products, portfolios, or sellers you're interested in by clicking the heart icon
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Link
                                        to="/marketplace"
                                        className="bg-primary text-white px-6 py-3 rounded hover:bg-green-800 transition font-bold"
                                    >
                                        Browse Products
                                    </Link>
                                    <Link
                                        to="/portfolio"
                                        className="bg-secondary text-dark px-6 py-3 rounded hover:bg-yellow-500 transition font-bold"
                                    >
                                        Browse Portfolios
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Products Tab */}
                                {activeTab === 'products' && (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {wishlist.products.map((item) => (
                                            <div key={item._id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                                                <div className="relative">
                                                    {item.item.imageUrl && (
                                                        <img 
                                                            src={item.item.imageUrl} 
                                                            alt={item.item.name}
                                                            className="w-full h-48 object-cover"
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => removeFromWishlist(item.itemId, 'product')}
                                                        className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-50 text-red-500 hover:text-red-700"
                                                        title="Remove from wishlist"
                                                    >
                                                        ❤️
                                                    </button>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-lg mb-2">{item.item.name}</h3>
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.item.description}</p>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-xl font-bold text-primary">৳{item.item.price}</span>
                                                        <span className="text-sm text-gray-600">{item.item.category}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link
                                                            to={`/marketplace/${item.itemId}`}
                                                            className="flex-1 bg-primary text-white py-2 rounded text-center hover:bg-green-800 transition"
                                                        >
                                                            View Details
                                                        </Link>
                                                        <button
                                                            onClick={() => removeFromWishlist(item.itemId, 'product')}
                                                            className="px-4 py-2 bg-gray-100 text-red-500 rounded hover:bg-red-50 transition"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Portfolios Tab */}
                                {activeTab === 'portfolios' && (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {wishlist.portfolios.map((item) => (
                                            <div key={item._id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                                                <div className="relative h-48 bg-gray-200">
                                                    {item.item.media && item.item.media[0] && (
                                                        <img 
                                                            src={item.item.media[0].url} 
                                                            alt={item.item.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => removeFromWishlist(item.itemId, 'portfolio')}
                                                        className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-50 text-red-500 hover:text-red-700"
                                                    >
                                                        ❤️
                                                    </button>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-lg mb-2">{item.item.title}</h3>
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.item.description}</p>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-bold text-secondary">{item.item.category}</span>
                                                        {item.item.priceRange && (
                                                            <span className="text-primary font-bold">
                                                                ৳{item.item.priceRange.min || '0'}-{item.item.priceRange.max || '0'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link
                                                            to={`/portfolio/${item.itemId}`}
                                                            className="flex-1 bg-secondary text-dark py-2 rounded text-center hover:bg-yellow-500 transition"
                                                        >
                                                            View Portfolio
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Sellers Tab */}
                                {activeTab === 'sellers' && (
                                    <div className="space-y-4">
                                        {wishlist.sellers.map((item) => (
                                            <div key={item._id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                                        {item.item.profileImage ? (
                                                            <img 
                                                                src={item.item.profileImage} 
                                                                alt={item.item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-xl">👤</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold">{item.item.name}</h3>
                                                        <p className="text-gray-600 text-sm">{item.item.bio || 'Creative seller'}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Added on {new Date(item.addedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Link
                                                        to={`/profile/${item.itemId}`}
                                                        className="bg-primary text-white px-4 py-2 rounded hover:bg-green-800 transition text-sm"
                                                    >
                                                        View Profile
                                                    </Link>
                                                    <button
                                                        onClick={() => removeFromWishlist(item.itemId, 'seller')}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                        title="Remove from wishlist"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Wishlist;
