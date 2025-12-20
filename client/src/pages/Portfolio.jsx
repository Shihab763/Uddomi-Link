import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Portfolio() {
    const [portfolios, setPortfolios] = useState([]);
    const [myPortfolios, setMyPortfolios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('browse');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'artwork',
        media: [{ url: '', type: 'image', caption: '', thumbnail: false }],
        tags: '',
        skills: '',
        priceRange: { min: '', max: '', currency: 'BDT' },
        availability: 'available'
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const isCreator = user && user.roles && (user.roles.includes('business-owner') || user.roles.includes('artist'));

    useEffect(() => {
        fetchPortfolios();
        if (isCreator) {
            fetchMyPortfolios();
        }
    }, []);

    const fetchPortfolios = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/portfolios');
            if (response.ok) {
                const data = await response.json();
                setPortfolios(data);
            }
        } catch (error) {
            console.error('Error fetching portfolios:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyPortfolios = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/portfolios/my/portfolios', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMyPortfolios(data);
            }
        } catch (error) {
            console.error('Error fetching my portfolios:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Process tags and skills
        const processedData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
            media: formData.media.filter(m => m.url.trim() !== '')
        };

        try {
            const response = await fetch('http://localhost:5000/api/portfolios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(processedData)
            });

            if (response.ok) {
                alert('Portfolio created successfully!');
                setShowForm(false);
                setFormData({
                    title: '',
                    description: '',
                    category: 'artwork',
                    media: [{ url: '', type: 'image', caption: '', thumbnail: false }],
                    tags: '',
                    skills: '',
                    priceRange: { min: '', max: '', currency: 'BDT' },
                    availability: 'available'
                });
                fetchPortfolios();
                fetchMyPortfolios();
            }
        } catch (error) {
            alert('Error creating portfolio');
        }
    };

    const addMediaField = () => {
        setFormData({
            ...formData,
            media: [...formData.media, { url: '', type: 'image', caption: '', thumbnail: false }]
        });
    };

    const updateMediaField = (index, field, value) => {
        const newMedia = [...formData.media];
        newMedia[index][field] = value;
        setFormData({ ...formData, media: newMedia });
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
            <div className="bg-gradient-to-r from-primary to-green-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🎨 Creative Portfolios</h1>
                    <p className="text-lg opacity-90">Showcase your work and discover talented creators</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg mb-8">
                    {/* Tabs */}
                    <div className="grid grid-cols-3 border-b">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'browse'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🌟 Browse ({portfolios.length})
                        </button>
                        {isCreator && (
                            <>
                                <button
                                    onClick={() => setActiveTab('my')}
                                    className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'my'
                                            ? 'bg-secondary text-dark'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    📁 My Portfolios ({myPortfolios.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('create')}
                                    className={`py-4 px-6 font-bold text-lg transition ${activeTab === 'create'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    ✨ Create New
                                </button>
                            </>
                        )}
                    </div>

                    {/* Browse Tab */}
                    {activeTab === 'browse' && (
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {portfolios.map(portfolio => (
                                    <div key={portfolio._id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                                        <div className="relative h-48">
                                            {portfolio.media.find(m => m.thumbnail) ? (
                                                <img 
                                                    src={portfolio.media.find(m => m.thumbnail).url} 
                                                    alt={portfolio.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : portfolio.media[0] ? (
                                                <img 
                                                    src={portfolio.media[0].url} 
                                                    alt={portfolio.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                                                {portfolio.category}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-lg">{portfolio.title}</h3>
                                                <span className="text-secondary font-bold">
                                                    {portfolio.priceRange.min && `৳${portfolio.priceRange.min}`}
                                                    {portfolio.priceRange.max && ` - ৳${portfolio.priceRange.max}`}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{portfolio.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <img 
                                                        src={portfolio.creator.profileImage || 'https://via.placeholder.com/40'}
                                                        alt={portfolio.creator.name}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                    <span className="text-sm">{portfolio.creator.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">👁️ {portfolio.views}</span>
                                                    <span className="text-sm text-gray-500">❤️ {portfolio.likes}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Link 
                                                    to={`/portfolio/${portfolio._id}`}
                                                    className="flex-1 bg-primary text-white py-2 rounded text-center hover:bg-green-800 transition"
                                                >
                                                    View Details
                                                </Link>
                                                <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                                                    ❤️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* My Portfolios Tab */}
                    {activeTab === 'my' && isCreator && (
                        <div className="p-6">
                            <div className="mb-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold">My Portfolios</h2>
                                <button
                                    onClick={() => setActiveTab('create')}
                                    className="bg-primary text-white px-6 py-2 rounded hover:bg-green-800 transition"
                                >
                                    + Add New Portfolio
                                </button>
                            </div>

                            {myPortfolios.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 text-lg mb-4">No portfolios yet</p>
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="bg-primary text-white px-6 py-2 rounded hover:bg-green-800 transition"
                                    >
                                        Create Your First Portfolio
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {myPortfolios.map(portfolio => (
                                        <div key={portfolio._id} className="border rounded-lg p-4">
                                            <h3 className="font-bold text-xl mb-2">{portfolio.title}</h3>
                                            <p className="text-gray-600 mb-4">{portfolio.description.substring(0, 100)}...</p>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">
                                                    {portfolio.isPublished ? '🟢 Published' : '🟡 Draft'}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button className="text-primary hover:underline">Edit</button>
                                                    <button className="text-accent hover:underline">Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create Tab */}
                    {activeTab === 'create' && isCreator && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Create New Portfolio</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-dark font-medium mb-1">Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary bg-white"
                                            required
                                        >
                                            <option value="artwork">Artwork</option>
                                            <option value="handicraft">Handicraft</option>
                                            <option value="textile">Textile</option>
                                            <option value="pottery">Pottery</option>
                                            <option value="jewelry">Jewelry</option>
                                            <option value="performance">Performance</option>
                                            <option value="service">Service</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-dark font-medium mb-1">Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                        rows="4"
                                        required
                                    />
                                </div>

                                {/* Media Section */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-dark font-medium">Media (Images/Videos)</label>
                                        <button
                                            type="button"
                                            onClick={addMediaField}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            + Add More
                                        </button>
                                    </div>

                                    {formData.media.map((media, index) => (
                                        <div key={index} className="flex gap-4 mb-4 p-3 border rounded">
                                            <div className="flex-1">
                                                <label className="block text-sm text-gray-600 mb-1">URL *</label>
                                                <input
                                                    type="url"
                                                    value={media.url}
                                                    onChange={(e) => updateMediaField(index, 'url', e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-sm text-gray-600 mb-1">Type</label>
                                                <select
                                                    value={media.type}
                                                    onChange={(e) => updateMediaField(index, 'type', e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                >
                                                    <option value="image">Image</option>
                                                    <option value="video">Video</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm text-gray-600 mb-1">Caption</label>
                                                <input
                                                    type="text"
                                                    value={media.caption}
                                                    onChange={(e) => updateMediaField(index, 'caption', e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                    placeholder="Optional caption"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={media.thumbnail}
                                                        onChange={(e) => updateMediaField(index, 'thumbnail', e.target.checked)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm">Thumbnail</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                            placeholder="traditional, handmade, sustainable"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-dark font-medium mb-1">Skills (comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.skills}
                                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                            placeholder="weaving, painting, carving"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Min Price (৳)</label>
                                        <input
                                            type="number"
                                            value={formData.priceRange.min}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                priceRange: { ...formData.priceRange, min: e.target.value }
                                            })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary"
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
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-dark font-medium mb-1">Availability</label>
                                        <select
                                            value={formData.availability}
                                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                            className="w-full p-3 border rounded focus:outline-none focus:border-primary bg-white"
                                        >
                                            <option value="available">Available</option>
                                            <option value="busy">Busy</option>
                                            <option value="limited">Limited</option>
                                            <option value="unavailable">Unavailable</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="bg-primary text-white px-8 py-3 rounded hover:bg-green-800 transition font-bold"
                                    >
                                        Create Portfolio
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('browse')}
                                        className="bg-gray-300 text-dark px-8 py-3 rounded hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Portfolio;
