import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

function PortfolioPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('my-portfolio');
    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPortfolio, setEditingPortfolio] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        mediaType: 'image',
        mediaUrl: '',
        thumbnailUrl: '',
        category: 'painting',
        tags: '',
        skills: '',
        acceptsCustomOrders: false,
        priceRange: { min: '', max: '' }
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || (!user.roles.includes('business-owner') && !user.roles.includes('artist'))) {
            navigate('/');
            return;
        }
        fetchMyPortfolios();
    }, [navigate, user]);

    const fetchMyPortfolios = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/portfolio/creator/my-portfolios', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPortfolios(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingPortfolio
            ? `http://localhost:5000/api/portfolio/${editingPortfolio._id}`
            : 'http://localhost:5000/api/portfolio';

        const method = editingPortfolio ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...formData,
                    priceRange: {
                        min: parseFloat(formData.priceRange.min) || 0,
                        max: parseFloat(formData.priceRange.max) || 0
                    }
                })
            });

            if (response.ok) {
                alert(editingPortfolio ? 'Portfolio updated!' : 'Portfolio created!');
                setShowForm(false);
                setEditingPortfolio(null);
                setFormData({
                    title: '',
                    description: '',
                    mediaType: 'image',
                    mediaUrl: '',
                    thumbnailUrl: '',
                    category: 'painting',
                    tags: '',
                    skills: '',
                    acceptsCustomOrders: false,
                    priceRange: { min: '', max: '' }
                });
                fetchMyPortfolios();
            } else {
                const data = await response.json();
                alert(data.message || 'Error saving portfolio');
            }
        } catch (error) {
            alert('Error saving portfolio');
        }
    };

    const handleEdit = (portfolio) => {
        setEditingPortfolio(portfolio);
        setFormData({
            title: portfolio.title,
            description: portfolio.description,
            mediaType: portfolio.mediaType,
            mediaUrl: portfolio.mediaUrl,
            thumbnailUrl: portfolio.thumbnailUrl || portfolio.mediaUrl,
            category: portfolio.category,
            tags: portfolio.tags.join(', '),
            skills: portfolio.skills.join(', '),
            acceptsCustomOrders: portfolio.acceptsCustomOrders,
            priceRange: {
                min: portfolio.priceRange?.min || '',
                max: portfolio.priceRange?.max || ''
            }
        });
        setShowForm(true);
    };

    const handleDelete = async (portfolioId, portfolioTitle) => {
        if (!window.confirm(`Delete ${portfolioTitle}?`)) return;

        try {
            const response = await fetch(`http://localhost:5000/api/portfolio/${portfolioId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('Portfolio deleted!');
                fetchMyPortfolios();
            }
        } catch (error) {
            alert('Error deleting portfolio');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingPortfolio(null);
        setFormData({
            title: '',
            description: '',
            mediaType: 'image',
            mediaUrl: '',
            thumbnailUrl: '',
            category: 'painting',
            tags: '',
            skills: '',
            acceptsCustomOrders: false,
            priceRange: { min: '', max: '' }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🎨 Portfolio Management</h1>
                    <p className="text-lg opacity-90">Showcase your work and attract custom orders</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg mb-8">
                    <div className="grid grid-cols-2 border-b">
                        <button
                            onClick={() => setActiveTab('my-portfolio')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'my-portfolio'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🖼️ My Portfolio ({portfolios.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('discover')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'discover'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🔍 Discover Creators
                        </button>
                    </div>

                    {activeTab === 'my-portfolio' && (
                        <div className="p-6">
                            <div className="mb-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-dark">My Portfolio Items</h2>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-bold"
                                >
                                    + Add Portfolio Item
                                </button>
                            </div>

                            {showForm && (
                                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                                    <h2 className="text-2xl font-bold mb-4">
                                        {editingPortfolio ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-dark font-medium mb-1">Title *</label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-purple-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Category *</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-purple-500 bg-white"
                                                    required
                                                >
                                                    <option value="painting">Painting</option>
                                                    <option value="music">Music</option>
                                                    <option value="dance">Dance</option>
                                                    <option value="craft">Craft</option>
                                                    <option value="textile">Textile</option>
                                                    <option value="agriculture">Agriculture</option>
                                                    <option value="food">Food</option>
                                                    <option value="design">Design</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Media Type *</label>
                                                <select
                                                    value={formData.mediaType}
                                                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-purple-500 bg-white"
                                                    required
                                                >
                                                    <option value="image">Image</option>
                                                    <option value="video">Video</option>
                                                    <option value="document">Document</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Accepts Custom Orders</label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.acceptsCustomOrders}
                                                        onChange={(e) => setFormData({ ...formData, acceptsCustomOrders: e.target.checked })}
                                                        className="mr-2"
                                                    />
                                                    Yes, I accept custom orders
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-dark font-medium mb-1">Media URL *</label>
                                            <input
                                                type="url"
                                                value={formData.mediaUrl}
                                                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:border-purple-500"
                                                placeholder="https://example.com/image.jpg"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-dark font-medium mb-1">Thumbnail URL (optional)</label>
                                            <input
                                                type="url"
                                                value={formData.thumbnailUrl}
                                                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:border-purple-500"
                                                placeholder="https://example.com/thumbnail.jpg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-dark font-medium mb-1">Description *</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:border-purple-500"
                                                rows="3"
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-dark font-medium mb-1">Tags (comma separated)</label>
                                                <input
                                                    type="text"
                                                    value={formData.tags}
                                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-purple-500"
                                                    placeholder="handmade, traditional, organic"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Skills (comma separated)</label>
                                                <input
                                                    type="text"
                                                    value={formData.skills}
                                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-purple-500"
                                                    placeholder="pottery, painting, weaving"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-dark font-medium mb-1">Min Price (৳)</label>
                                                <input
                                                    type="number"
                                                    value={formData.priceRange.min}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        priceRange: { ...formData.priceRange, min: e.target.value }
                                                    })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-purple-500"
                                                    min="0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-dark font-medium mb-1">Max Price (৳)</label>
                                                <input
                                                    type="number"
                                                    value={formData.priceRange.max}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        priceRange: { ...formData.priceRange, max: e.target.value }
                                                    })}
                                                    className="w-full p-2 border rounded focus:outline-none focus:border-purple-500"
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition font-bold"
                                            >
                                                {editingPortfolio ? 'Update' : 'Create'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {portfolios.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 text-lg mb-4">No portfolio items yet</p>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition font-bold"
                                    >
                                        Add Your First Portfolio Item
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {portfolios.map(portfolio => (
                                        <div key={portfolio._id} className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                                            <div className="relative">
                                                {portfolio.mediaType === 'image' ? (
                                                    <img
                                                        src={portfolio.thumbnailUrl || portfolio.mediaUrl}
                                                        alt={portfolio.title}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                ) : portfolio.mediaType === 'video' ? (
                                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                                        <span className="text-4xl">▶️</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                                        <span className="text-4xl">📄</span>
                                                    </div>
                                                )}
                                                {portfolio.acceptsCustomOrders && (
                                                    <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                        Custom Orders Available
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-lg mb-2">{portfolio.title}</h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{portfolio.description}</p>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {portfolio.tags.slice(0, 3).map(tag => (
                                                        <span key={tag} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-sm text-gray-600">{portfolio.category}</span>
                                                    <div className="text-sm">
                                                        <span className="text-gray-600">👁️ {portfolio.viewCount}</span>
                                                        <span className="ml-2 text-gray-600">❤️ {portfolio.favoriteCount}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(portfolio)}
                                                        className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-bold"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(portfolio._id, portfolio.title)}
                                                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'discover' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Discover Creators</h2>
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search portfolios by title, skill, or tag..."
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <p className="text-center text-gray-600 py-8">
                                Browse portfolios of other creators to get inspired
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PortfolioPage;
