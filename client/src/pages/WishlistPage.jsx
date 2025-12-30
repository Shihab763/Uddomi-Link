import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function WishlistPage() {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState({ items: [], categories: [] });
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchWishlist();
    }, [navigate, user]);

    const fetchWishlist = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/wishlist', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWishlist(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (itemType, itemId) => {
        try {
            const response = await fetch('http://localhost:5000/api/wishlist/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ itemType, itemId })
            });

            if (response.ok) {
                fetchWishlist();
                alert('Added to wishlist!');
            }
        } catch (error) {
            alert('Error adding to wishlist');
        }
    };

    const removeFromWishlist = async (itemType, itemId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/wishlist/remove/${itemType}/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                fetchWishlist();
                alert('Removed from wishlist');
            }
        } catch (error) {
            alert('Error removing from wishlist');
        }
    };

    const createCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const response = await fetch('http://localhost:5000/api/wishlist/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ categoryName: newCategoryName })
            });

            if (response.ok) {
                fetchWishlist();
                setNewCategoryName('');
                setShowCategoryForm(false);
                alert('Category created!');
            }
        } catch (error) {
            alert('Error creating category');
        }
    };

    const getItemTypeLabel = (itemType) => {
        switch (itemType) {
            case 'portfolio': return '🎨 Portfolio';
            case 'product': return '🛍️ Product';
            case 'creator': return '👤 Creator';
            case 'training': return '📚 Training';
            default: return itemType;
        }
    };

    const filteredItems = activeCategory === 'all' 
        ? wishlist.items 
        : wishlist.items.filter(item => {
            const category = wishlist.categories.find(cat => cat.name === activeCategory);
            return category && category.itemIds.includes(item.itemId._id);
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">❤️ My Wishlist</h1>
                    <p className="text-lg opacity-90">Save your favorite items for later</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg mb-8">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-dark">
                                Saved Items ({wishlist.items.length})
                            </h2>
                            <button
                                onClick={() => setShowCategoryForm(true)}
                                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition font-bold"
                            >
                                + New Category
                            </button>
                        </div>

                        {showCategoryForm && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-bold mb-2">Create New Category</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Category name..."
                                        className="flex-1 p-2 border rounded"
                                    />
                                    <button
                                        onClick={createCategory}
                                        className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
                                    >
                                        Create
                                    </button>
                                    <button
                                        onClick={() => setShowCategoryForm(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setActiveCategory('all')}
                                    className={`px-4 py-2 rounded-full ${activeCategory === 'all' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    All Items
                                </button>
                                {wishlist.categories.map(category => (
                                    <button
                                        key={category.name}
                                        onClick={() => setActiveCategory(category.name)}
                                        className={`px-4 py-2 rounded-full ${activeCategory === category.name ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        {category.name} ({category.itemIds.length})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {wishlist.items.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg mb-4">Your wishlist is empty</p>
                                <p className="text-gray-500 mb-6">Start exploring and save items you love!</p>
                                <div className="flex gap-4 justify-center">
                                    <Link
                                        to="/marketplace"
                                        className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition font-bold"
                                    >
                                        Browse Marketplace
                                    </Link>
                                    <Link
                                        to="/sellers"
                                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
                                    >
                                        Discover Sellers
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-600 mb-4">
                                    Showing {filteredItems.length} items {activeCategory !== 'all' && `in "${activeCategory}"`}
                                </p>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredItems.map(item => (
                                        <div key={`${item.itemType}-${item.itemId._id}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                                            <div className="relative">
                                                {item.itemType === 'portfolio' && (
                                                    <img
                                                        src={item.itemId.thumbnailUrl || item.itemId.mediaUrl}
                                                        alt={item.itemId.title}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                )}
                                                {item.itemType === 'product' && (
                                                    <img
                                                        src={item.itemId.imageUrl}
                                                        alt={item.itemId.name}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                )}
                                                {item.itemType === 'creator' && (
                                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                                        <img
                                                            src={item.itemId.profileImage}
                                                            alt={item.itemId.name}
                                                            className="w-24 h-24 rounded-full"
                                                        />
                                                    </div>
                                                )}
                                                {item.itemType === 'training' && (
                                                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                                        <span className="text-4xl">📚</span>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => removeFromWishlist(item.itemType, item.itemId._id)}
                                                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
                                                >
                                                    ❌
                                                </button>

                                                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold">
                                                    {getItemTypeLabel(item.itemType)}
                                                </span>
                                            </div>

                                            <div className="p-4">
                                                {item.itemType === 'portfolio' && (
                                                    <>
                                                        <h3 className="font-bold text-lg mb-2">{item.itemId.title}</h3>
                                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.itemId.description}</p>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-600">
                                                                By {item.itemId.creator?.name || 'Unknown'}
                                                            </span>
                                                            <Link
                                                                to={`/portfolio/${item.itemId._id}`}
                                                                className="text-pink-600 hover:text-pink-800 font-bold text-sm"
                                                            >
                                                                View →
                                                            </Link>
                                                        </div>
                                                    </>
                                                )}

                                                {item.itemType === 'product' && (
                                                    <>
                                                        <h3 className="font-bold text-lg mb-2">{item.itemId.name}</h3>
                                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.itemId.description}</p>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xl font-bold text-dark">৳{item.itemId.price}</span>
                                                            <Link
                                                                to={`/marketplace/${item.itemId._id}`}
                                                                className="text-pink-600 hover:text-pink-800 font-bold text-sm"
                                                            >
                                                                View →
                                                            </Link>
                                                        </div>
                                                    </>
                                                )}

                                                {item.itemType === 'creator' && (
                                                    <>
                                                        <h3 className="font-bold text-lg mb-2">{item.itemId.name}</h3>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-600">Creator</span>
                                                            <Link
                                                                to={`/profile/${item.itemId._id}`}
                                                                className="text-pink-600 hover:text-pink-800 font-bold text-sm"
                                                            >
                                                                View Profile →
                                                            </Link>
                                                        </div>
                                                    </>
                                                )}

                                                {item.itemType === 'training' && (
                                                    <>
                                                        <h3 className="font-bold text-lg mb-2">{item.itemId.title}</h3>
                                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.itemId.description}</p>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-600">Training</span>
                                                            <button className="text-pink-600 hover:text-pink-800 font-bold text-sm">
                                                                Watch →
                                                            </button>
                                                        </div>
                                                    </>
                                                )}

                                                <div className="mt-3 pt-3 border-t">
                                                    <p className="text-xs text-gray-500">
                                                        Added {new Date(item.addedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Wishlist Actions</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl mb-2">🛍️</div>
                            <h3 className="font-bold mb-2">Browse Marketplace</h3>
                            <p className="text-gray-600 text-sm mb-4">Find products to add to your wishlist</p>
                            <Link
                                to="/marketplace"
                                className="inline-block bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition text-sm"
                            >
                                Shop Now
                            </Link>
                        </div>

                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl mb-2">👥</div>
                            <h3 className="font-bold mb-2">Discover Creators</h3>
                            <p className="text-gray-600 text-sm mb-4">Follow talented creators and artists</p>
                            <Link
                                to="/sellers"
                                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm"
                            >
                                Browse Sellers
                            </Link>
                        </div>

                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl mb-2">📊</div>
                            <h3 className="font-bold mb-2">Wishlist Analytics</h3>
                            <p className="text-gray-600 text-sm mb-4">See insights about your saved items</p>
                            <Link
                                to="/analytics"
                                className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition text-sm"
                            >
                                View Analytics
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WishlistPage;
