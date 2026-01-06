import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StarDisplay, StarInput } from '../components/StarRating';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [editingReview, setEditingReview] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`);
            if (response.ok) {
                const data = await response.json();
                setProduct(data);
            } else {
                alert('Product not found');
                navigate('/marketplace');
            }
        } catch (error) {
            alert('Error loading product');
            navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/reviews/product/${id}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

   
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) { alert('Please login to write a review'); return; }
        try {
            const url = editingReview ? `http://localhost:5000/api/reviews/${editingReview._id}` : 'http://localhost:5000/api/reviews';
            const method = editingReview ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method, headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}`},
                body: JSON.stringify({ productId: id, rating: newReview.rating, comment: newReview.comment })
            });
            if (response.ok) {
                alert(editingReview ? 'Review updated!' : 'Review posted!');
                setNewReview({ rating: 5, comment: '' }); setShowReviewForm(false); setEditingReview(null); fetchReviews(); fetchProduct();
            } else { const data = await response.json(); alert(data.message || 'Error submitting review'); }
        } catch (error) { alert('Error submitting review'); }
    };

    const handleEditReview = (review) => { setEditingReview(review); setNewReview({ rating: review.rating, comment: review.comment }); setShowReviewForm(true); };
    const handleDeleteReview = async (reviewId) => { if (!confirm('Delete this review?')) return; try { const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${user.token}` } }); if (response.ok) { alert('Review deleted'); fetchReviews(); fetchProduct(); } } catch (error) { alert('Error deleting review'); } };


    const addToCart = () => {
        if (quantity > product.stock) {
            alert(`Only ${product.stock} items available in stock`);
            return;
        }

        const cartKey = user ? `cart_${user._id}` : 'cart_guest';
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const existingItem = cart.find(item => item.productId === product._id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity,
                stock: product.stock
            });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
        alert(`${quantity} × ${product.name} added to cart!`);
    };


    const addToWishlist = async () => {
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
                    quantity: quantity 
                })
            });

            if (res.ok) {
                alert(`❤️ Saved ${quantity} × ${product.name} to Wishlist!`);
            } else {
                const data = await res.json();
                alert(data.message || 'Could not add to wishlist');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || !product) return <div className="min-h-screen bg-light flex items-center justify-center">Loading...</div>;

    const userReview = reviews.find(r => r.user?._id === user?._id);

    return (
        <div className="min-h-screen bg-light">
            <div className="container mx-auto px-4 py-8">
                <Link to="/marketplace" className="inline-block mb-6 text-primary hover:text-green-800 font-medium">
                    ← Back to Marketplace
                </Link>

                <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-96 object-cover rounded-lg shadow-md" />
                        </div>

                        <div className="p-8">
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-secondary text-dark text-sm font-semibold rounded-full uppercase">
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="text-4xl font-bold text-dark mb-4">{product.name}</h1>
                            
                            {/* Rating */}
                            {product.rating?.count > 0 && (
                                <div className="mb-4 flex items-center gap-2">
                                    <StarDisplay rating={product.rating.average} />
                                    <span className="text-gray-600">({product.rating.count} reviews)</span>
                                </div>
                            )}

                            <div className="flex items-baseline gap-4 mb-6">
                                <span className="text-4xl font-bold text-primary">৳{product.price}</span>
                                <span className="text-gray-600">
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-dark mb-2">Description</h2>
                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-dark font-medium mb-2">Quantity</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="bg-gray-300 hover:bg-gray-400 text-dark font-bold w-10 h-10 rounded">-</button>
                                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock} className="bg-gray-300 hover:bg-gray-400 text-dark font-bold w-10 h-10 rounded disabled:opacity-50">+</button>
                                </div>
                            </div>

                            {/**/}
                            <div className="flex gap-4">
                                <button
                                    onClick={addToCart}
                                    disabled={product.stock === 0}
                                    className="flex-grow bg-primary text-white font-bold py-4 rounded-lg hover:bg-green-800 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                                </button>
                                
                                <button
                                    onClick={addToWishlist}
                                    className="bg-pink-100 text-red-500 font-bold py-4 px-6 rounded-lg hover:bg-pink-200 transition text-2xl border-2 border-pink-200"
                                    title="Add to Wishlist"
                                >
                                    ❤️
                                </button>

                                <Link
                                    to="/cart"
                                    className="bg-secondary text-dark font-bold py-4 px-8 rounded-lg hover:bg-yellow-500 transition text-lg text-center"
                                >
                                    View Cart
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
                
                {/**/}
                 <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
                    {user && !userReview && !showReviewForm && (
                        <button onClick={() => setShowReviewForm(true)} className="mb-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-800 transition font-bold">
                            ✏️ Write a Review
                        </button>
                    )}
                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-xl font-bold mb-4">{editingReview ? 'Edit Review' : 'Write Your Review'}</h3>
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Rating</label>
                                <StarInput rating={newReview.rating} setRating={(r) => setNewReview({ ...newReview, rating: r })} />
                            </div>
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Comment</label>
                                <textarea value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} className="w-full p-3 border rounded" rows="4" required />
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-bold">{editingReview ? 'Update Review' : 'Post Review'}</button>
                                <button type="button" onClick={() => { setShowReviewForm(false); setEditingReview(null); setNewReview({ rating: 5, comment: '' }); }} className="bg-gray-500 text-white px-6 py-2 rounded">Cancel</button>
                            </div>
                        </form>
                    )}
                    {reviews.map(review => (
                        <div key={review._id} className="border-b pb-6 last:border-0 mb-4">
                             <div className="flex items-start gap-4">
                                <img src={review.user?.profile?.profilePicture || 'https://via.placeholder.com/50'} alt={review.user?.name} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-lg">{review.user?.name}</p>
                                            <StarDisplay rating={review.rating} showNumber={false} />
                                        </div>
                                        <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-gray-700 mb-3">{review.comment}</p>
                                    {review.user?._id === user?._id && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditReview(review)} className="text-sm text-primary hover:underline">Edit</button>
                                            <button onClick={() => handleDeleteReview(review._id)} className="text-sm text-accent hover:underline">Delete</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
