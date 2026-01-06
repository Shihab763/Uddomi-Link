import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from '../components/StarRating';

function Marketplace() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['all', 'handicrafts', 'textiles', 'pottery', 'jewelry', 'food', 'furniture', 'other'];

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [selectedCategory, searchTerm, products]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    const addToCart = (product) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const cartKey = user ? `cart_${user._id}` : 'cart_guest';
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const existingItem = cart.find(item => item.productId === product._id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: 1,
                stock: product.stock
            });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    };


    const addToWishlist = async (product) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please login to use Wishlist');
            return;
        }

        if (user.roles.includes('business-owner') || user.roles.includes('admin')) {
            alert('Wishlist is only for Customers and NGOs');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/wishlist/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity: 1 
                })
            });

            if (res.ok) {
                alert('❤️ Added to Wishlist!');
            } else {
                const data = await res.json();
                alert(data.message || 'Could not add to wishlist');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-primary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🛍️ Marketplace</h1>
                    <p className="text-lg opacity-90">Discover unique products from local businesses</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition flex flex-col">
                                <Link to={`/marketplace/${product._id}`}>
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                </Link>

                                <div className="p-4 flex flex-col flex-1">
                                    <Link to={`/marketplace/${product._id}`}>
                                        <h3 className="font-bold text-lg mb-2 hover:text-primary">{product.name}</h3>
                                    </Link>

                                    {product.rating?.count > 0 && (
                                        <div className="mb-2">
                                            <StarDisplay rating={product.rating.average} showNumber={true} />
                                            <span className="text-xs text-gray-500 ml-1">({product.rating.count})</span>
                                        </div>
                                    )}

                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{product.description}</p>

                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-2xl font-bold text-primary">৳{product.price}</span>
                                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                                    </div>

                                    {/* */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => addToCart(product)}
                                            disabled={product.stock === 0}
                                            className="flex-1 bg-secondary text-dark font-bold py-2 rounded hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                        
                                        <button
                                            onClick={() => addToWishlist(product)}
                                            className="bg-gray-100 text-red-500 px-3 py-2 rounded hover:bg-gray-200 transition text-xl border border-gray-200"
                                            title="Add to Wishlist"
                                        >
                                            ❤️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Marketplace;
