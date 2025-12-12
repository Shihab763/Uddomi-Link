import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        profilePicture: '',
        coverPhoto: '',
        phone: '',
        address: {
            street: '',
            city: '',
            district: '',
            country: 'Bangladesh'
        },
        socialLinks: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            website: ''
        },
        businessName: '',
        businessType: '',
        yearsInBusiness: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const isBusinessOwner = user?.roles?.includes('business-owner');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyProfile();
    }, []);

    const fetchMyProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/profile/me/profile', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const profile = data.user.profile || {};

                setFormData({
                    bio: profile.bio || '',
                    profilePicture: profile.profilePicture || '',
                    coverPhoto: profile.coverPhoto || '',
                    phone: profile.phone || '',
                    address: profile.address || {
                        street: '',
                        city: '',
                        district: '',
                        country: 'Bangladesh'
                    },
                    socialLinks: profile.socialLinks || {
                        facebook: '',
                        instagram: '',
                        twitter: '',
                        linkedin: '',
                        website: ''
                    },
                    businessName: profile.businessName || '',
                    businessType: profile.businessType || '',
                    yearsInBusiness: profile.yearsInBusiness || ''
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/profile/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Profile updated successfully!');
                navigate(`/profile/${user._id}`);
            } else {
                alert('Error updating profile');
            }
        } catch (error) {
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-primary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">✏️ Edit Profile</h1>
                    <p className="text-lg opacity-90">Update your information</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Images */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Profile Images</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-dark font-medium mb-1">Profile Picture URL</label>
                                    <input
                                        type="url"
                                        value={formData.profilePicture}
                                        onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                        placeholder="https://example.com/profile.jpg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-dark font-medium mb-1">Cover Photo URL</label>
                                    <input
                                        type="url"
                                        value={formData.coverPhoto}
                                        onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                        placeholder="https://example.com/cover.jpg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">About</h2>
                            <label className="block text-dark font-medium mb-1">Bio (Max 500 characters)</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                rows="5"
                                maxLength="500"
                                placeholder="Tell us about yourself..."
                            />
                            <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500</p>
                        </div>

                        {/* Business Info */}
                        {isBusinessOwner && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Business Information</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Business Name</label>
                                        <input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Business Type</label>
                                        <input
                                            type="text"
                                            value={formData.businessType}
                                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                            className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                            placeholder="e.g., Handicrafts, Textiles"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-dark font-medium mb-1">Years in Business</label>
                                        <input
                                            type="number"
                                            value={formData.yearsInBusiness}
                                            onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                                            className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact Info */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-dark font-medium mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                        placeholder="+880..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-dark font-medium mb-1">City</label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, city: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-dark font-medium mb-1">District</label>
                                    <input
                                        type="text"
                                        value={formData.address.district}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, district: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-dark font-medium mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        value={formData.address.street}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, street: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Social Links</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-dark font-medium mb-1">📘 Facebook</label>
                                    <input
                                        type="url"
                                        value={formData.socialLinks.facebook}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-dark font-medium mb-1">📷 Instagram</label>
                                    <input
                                        type="url"
                                        value={formData.socialLinks.instagram}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-dark font-medium mb-1">🐦 Twitter</label>
                                    <input
                                        type="url"
                                        value={formData.socialLinks.twitter}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-dark font-medium mb-1">💼 LinkedIn</label>
                                    <input
                                        type="url"
                                        value={formData.socialLinks.linkedin}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-dark font-medium mb-1">🌐 Website</label>
                                    <input
                                        type="url"
                                        value={formData.socialLinks.website}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            socialLinks: { ...formData.socialLinks, website: e.target.value }
                                        })}
                                        className="w-full p-2 border rounded focus:outline-none focus:border-primary"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-green-800 transition font-bold disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/profile/${user._id}`)}
                                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
