import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RoleRequestModal from '../components/RoleRequestModal';
import ReportSellerModal from "../components/ReportSellerModal";
import BookSellerModal from "../components/BookSellerModal";

function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportError, setReportError] = useState("");
    const [reportSuccess, setReportSuccess] = useState("");
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState("");



    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isRegularUser = currentUser?.roles?.includes('user') &&
        !currentUser?.roles?.includes('business-owner') &&
        !currentUser?.roles?.includes('ngo');

    const currentUserId = currentUser?._id;
        

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            setError("");
            setLoading(true);
            setProfileData(null);

            const headers = {};
            if (currentUser && currentUser.token) {
                headers['Authorization'] = `Bearer ${currentUser.token}`;
            }

            const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
            } else {
                setError("User not found or failed to load.");
                setProfileData(null);
            }
        } catch (error) {
            console.error('Error:', error);
            setError("Failed to load profile.");
            setProfileData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleRequest = async (role, reason) => {
        try {
            const response = await fetch('http://localhost:5000/api/role-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({ requestedRole: role, reason })
            });

            if (response.ok) {
                alert('Role request submitted! Admin will review it soon.');
            } else {
                const data = await response.json();
                alert(data.message || 'Error submitting request');
            }
        } catch (error) {
            alert('Error submitting request');
        }
    };

    const handleReportSubmit = async ({ reason, details }) => {
        setReportSubmitting(true);
        setReportError("");
        setReportSuccess("");

        try {
    // We’ll wire backend later, but this is already clean and ready.
    // This will NOT break the UI if backend isn’t ready yet — it will show an error message.

            const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const token = currentUser?.token || currentUser?.accessToken || "";

            const res = await fetch(`${API_BASE}/api/reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                sellerId: viewedUserId,
                reason,
                details,
            }),
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "Failed to submit report");
        }

        setReportSuccess("Report submitted successfully.");
        setShowReportModal(false);
      } catch (err) {
        setReportError("Could not submit report right now. (Backend will be added next.)");
      } finally {
        setReportSubmitting(false);
      }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }


    if (!profileData) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">User not found</p>
            </div>
        );
    }
    const handleBookingSubmit = async ({ date, timeSlot, note }) => {
    setBookingSubmitting(true);
    setBookingError("");
    setBookingSuccess("");

    try {
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const token = currentUser?.token || currentUser?.accessToken || "";

        if (!token) {
            setBookingError("You must be logged in to book a seller.");
            setBookingSubmitting(false);
            return;
        }

        if (!viewedUserId) {
            setBookingError("Seller not loaded yet. Please try again.");
            setBookingSubmitting(false);
            return;
        }

        const res = await fetch(`${API_BASE}/api/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                providerId: viewedUserId,
                date,
                timeSlot,
                note: note || "",
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "Failed to create booking");
        }

        setBookingSuccess("✅ Booking request submitted!");
        setShowBookingModal(false);
    } catch (err) {
        setBookingError(err.message || "Could not submit booking right now.");
    } finally {
        setBookingSubmitting(false);
    }
};


    


    const { user, products, stats } = profileData;
    const viewedUser = user;
    const viewedUserId = viewedUser?._id;

    const isLoggedIn = !!currentUser;
    const isSellerProfile = viewedUser?.roles?.includes("business-owner");
    const isOwnProfile = currentUserId && viewedUserId && currentUserId === viewedUserId;

    const profile = user.profile || {};

    return (
        <div className="min-h-screen bg-light">
            {/* Role Request Modal */}
            <RoleRequestModal
                isOpen={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                onSubmit={handleRoleRequest}
            />

            {/* Cover Photo */}
            <div
                className="h-64 bg-gradient-to-r from-primary to-secondary"
                style={profile.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            />

            <div className="container mx-auto px-4">
                {/* Profile Header */}
                <div className="relative -mt-20 mb-8">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Profile Picture */}
                            <img
                                src={profile.profilePicture || 'https://via.placeholder.com/150'}
                                alt={user.name}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                            />

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-dark">{user.name}</h1>
                                {profile.businessName && (
                                    <p className="text-xl text-gray-600">{profile.businessName}</p>
                                )}
                                {profile.businessType && (
                                    <p className="text-sm text-gray-500">{profile.businessType}</p>
                                )}

                                {isOwnProfile && (
                                    <div className="mt-4 flex gap-3 justify-center md:justify-start">
                                        <Link
                                            to="/profile/edit"
                                            className="inline-block bg-secondary text-dark px-6 py-2 rounded hover:bg-yellow-500 transition font-bold"
                                        >
                                            ✏️ Edit Profile
                                        </Link>
                                        {currentUser?.roles?.includes("business-owner") && (
                                            <Link
                                                to="/booking-requests"
                                                className="inline-block bg-primary text-white px-6 py-2 rounded hover:opacity-90 transition font-bold"
                                            >
                                                📩 Booking Requests
                                            </Link>
                                        )}
                                        
                                        {currentUser?.roles?.includes("ngo") && (
                                            <Link
                                                to="/ngo/trainings"
                                                className="inline-block bg-primary text-white px-6 py-2 rounded hover:opacity-90 transition font-bold"
                                            >
                                                🎓 Trainings
                                            </Link>
                                        )}


                                        {isRegularUser && (
                                            <button
                                                onClick={() => setShowRoleModal(true)}
                                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded hover:from-purple-700 hover:to-blue-700 transition font-bold"
                                            >
                                                ⭐ Upgrade Account
                                            </button>
                                        )}
                                    </div>
                                )}
                                

                            </div>

                            {/* Stats */}
                            <div className="flex gap-6 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-primary">{stats.productCount}</p>
                                    <p className="text-sm text-gray-600">Products</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-purple-600">{stats.profileViews}</p>
                                    <p className="text-sm text-gray-600">Views</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column - About */}
                    <div className="md:col-span-2">
                        {/* Bio */}
                        {profile.bio && (
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                <h2 className="text-2xl font-bold mb-4">About</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                            </div>
                        )}

                        {/* Products */}
                        {products.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-bold mb-4">Products</h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {products.map(product => (
                                        <Link
                                            key={product._id}
                                            to={`/marketplace/${product._id}`}
                                            className="border rounded-lg overflow-hidden hover:shadow-md transition"
                                        >
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-32 object-cover"
                                            />
                                            <div className="p-2">
                                                <p className="font-semibold text-sm">{product.name}</p>
                                                <p className="text-primary font-bold">৳{product.price}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Contact & Info */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Contact Info</h2>

                            {profile.phone && (
                                <div className="mb-3">
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-semibold">📞 {profile.phone}</p>
                                </div>
                            )}

                            {profile.address && (profile.address.city || profile.address.district) && (
                                <div className="mb-3">
                                    <p className="text-sm text-gray-600">Location</p>
                                    <p className="font-semibold">
                                        📍 {profile.address.city && `${profile.address.city}, `}
                                        {profile.address.district && `${profile.address.district}, `}
                                        {profile.address.country}
                                    </p>
                                </div>
                            )}

                            {user.email && (
                                <div className="mb-3">
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-semibold">✉️ {user.email}</p>
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Social Links</h2>
                                <div className="space-y-2">
                                    {profile.socialLinks.facebook && (
                                        <a
                                            href={profile.socialLinks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:underline"
                                        >
                                            📘 Facebook
                                        </a>
                                    )}
                                    {profile.socialLinks.instagram && (
                                        <a
                                            href={profile.socialLinks.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-pink-600 hover:underline"
                                        >
                                            📷 Instagram
                                        </a>
                                    )}
                                    {profile.socialLinks.twitter && (
                                        <a
                                            href={profile.socialLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-400 hover:underline"
                                        >
                                            🐦 Twitter
                                        </a>
                                    )}
                                    {profile.socialLinks.linkedin && (
                                        <a
                                            href={profile.socialLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-700 hover:underline"
                                        >
                                            💼 LinkedIn
                                        </a>
                                    )}
                                    {profile.socialLinks.website && (
                                        <a
                                            href={profile.socialLinks.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-gray-700 hover:underline"
                                        >
                                            🌐 Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Member Info */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Member Info</h2>
                            <p className="text-sm text-gray-600 mb-2">
                                Member since: <span className="font-semibold">{new Date(stats.memberSince).toLocaleDateString()}</span>
                            </p>
                            {profile.yearsInBusiness && (
                                <p className="text-sm text-gray-600">
                                    Years in business: <span className="font-semibold">{profile.yearsInBusiness}</span>
                                </p>
                            )}
                        </div>
                        {/* Report Seller */}
                        {isLoggedIn && isSellerProfile && !isOwnProfile && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-lg font-bold mb-3 text-red-600">Report Seller</h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    If you believe this seller has violated platform rules, you may report them for admin review.
                                </p>
                                <button
                                    onClick={() => {
                                        setReportError("");
                                        setReportSuccess("");
                                        setShowReportModal(true);
                                    }}
                                    className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                >
                                    🚩 Report This Seller
                                </button>

                            </div>
                        )}
                        {isLoggedIn && isSellerProfile && !isOwnProfile && (
                            <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
                                <h2 className="text-lg font-bold mb-3 text-primary">Book Seller</h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    Request a date and time to book this seller/service provider.
                                </p>
                                <button
                                    onClick={() => {
                                        setBookingError("");
                                        setBookingSuccess("");
                                        setShowBookingModal(true);
                                    }}
                                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                                
                                >
                                    📅 Book Seller
                                </button>
                            </div>    
                        )}

                    </div>
                </div>
            </div>
            {reportError && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {reportError}
                </div>
            )}

            {reportSuccess && (
                <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {reportSuccess}
                </div>
            )}
            
            {bookingError && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {bookingError}
                </div>
            )}

            {bookingSuccess && (
                <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {bookingSuccess}
                </div>
            )}


            <ReportSellerModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReportSubmit}
                sellerName={viewedUser?.name || viewedUser?.fullName || viewedUser?.email}
            />
            
            <BookSellerModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                onSubmit={handleBookingSubmit}
                sellerName={viewedUser?.name || viewedUser?.fullName || viewedUser?.email}
            />


        </div>
    );
}

export default UserProfile;
