import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SellersDirectory() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/profile/sellers');

            if (response.ok) {
                const data = await response.json();
                setSellers(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSellers = sellers.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.profile?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.profile?.businessType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-primary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🏪 Browse Sellers</h1>
                    <p className="text-lg opacity-90">Discover amazing businesses and artisans</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search */}
                <div className="mb-8">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search sellers by name, business, or category..."
                        className="w-full max-w-2xl p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary text-lg"
                    />
                </div>

                {/* Seller Grid */}
                {filteredSellers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No sellers found</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSellers.map(seller => (
                            <Link
                                key={seller._id}
                                to={`/profile/${seller._id}`}
                                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                            >
                                {/* Cover/Profile */}
                                <div className="relative h-32 bg-gradient-to-r from-primary to-secondary">
                                    {seller.profile?.coverPhoto && (
                                        <img
                                            src={seller.profile.coverPhoto}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <img
                                        src={seller.profile?.profilePicture || 'https://via.placeholder.com/100'}
                                        alt={seller.name}
                                        className="absolute -bottom-10 left-4 w-20 h-20 rounded-full border-4 border-white object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="pt-12 p-4">
                                    <h3 className="text-xl font-bold text-dark mb-1">{seller.name}</h3>
                                    {seller.profile?.businessName && (
                                        <p className="text-gray-700 font-semibold">{seller.profile.businessName}</p>
                                    )}
                                    {seller.profile?.businessType && (
                                        <p className="text-sm text-gray-500 mb-3">{seller.profile.businessType}</p>
                                    )}

                                    {seller.profile?.bio && (
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {seller.profile.bio}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>📦 {seller.productCount} products</span>
                                        <span>👁️ {seller.profile?.profileViews || 0} views</span>
                                    </div>

                                    {seller.profile?.address?.city && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            📍 {seller.profile.address.city}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SellersDirectory;
