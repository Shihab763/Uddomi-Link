import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RoleRequestModal from '../components/RoleRequestModal';
import ReportSellerModal from "../components/ReportSellerModal";
import BookSellerModal from "../components/BookSellerModal";
import OfferMentorshipModal from "../components/OfferMentorshipModal";
import HireModal from '../components/HireModal';

function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    

    const [activeTab, setActiveTab] = useState('profile'); 
    const [wishlistItems, setWishlistItems] = useState([]);
    

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportError, setReportError] = useState("");
    const [reportSuccess, setReportSuccess] = useState("");
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState("");
    const [showMentorshipModal, setShowMentorshipModal] = useState(false);
    const [mentorshipSubmitting, setMentorshipSubmitting] = useState(false);
    const [mentorshipError, setMentorshipError] = useState("");
    const [mentorshipSuccess, setMentorshipSuccess] = useState("");
    const [showHireModal, setShowHireModal] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isRegularUser = currentUser?.roles?.includes('user') &&
        !currentUser?.roles?.includes('business-owner') &&
        !currentUser?.roles?.includes('ngo');

    const currentUserId = currentUser?._id;
    const isNgoUser = currentUser?.roles?.includes("ngo");
    
    useEffect(() => {
        fetchProfile();
  
        setActiveTab('profile'); 
    }, [userId]);


    useEffect(() => {
        if (activeTab === 'wishlist') {
            fetchWishlist();
        }
    }, [activeTab]);

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

    const fetchWishlist = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/wishlist/my', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            setWishlistItems(data.items || []);
        } catch (err) {
            console.error("Failed to fetch wishlist", err);
        }
    };

    const handleMoveToCart = async (item) => {

        const cartKey = `cart_${currentUser._id}`;
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        
        const existingItem = cart.find(c => c.productId === item.product._id);
        if (existingItem) {
            existingItem.quantity += item.savedQuantity;
        } else {
            cart.push({
                productId: item.product._id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                quantity: item.savedQuantity,
                stock: item.product.stock
            });
        }
        localStorage.setItem(cartKey, JSON.stringify(cart));


        await fetch(`http://localhost:5000/api/wishlist/${item.product._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        alert(`Moved ${item.savedQuantity} × ${item.product.name} to Cart!`);
        fetchWishlist(); 
    };

    const handleRemoveWishlist = async (productId) => {
        if (!confirm('Remove from wishlist?')) return;
        await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        fetchWishlist();
    };

  
   
    const handleRoleRequest = async (role, reason) => { try { const response = await fetch('http://localhost:5000/api/role-requests', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` }, body: JSON.stringify({ requestedRole: role, reason }) }); if (response.ok) { alert('Role request submitted! Admin will review it soon.'); } else { const data = await response.json(); alert(data.message || 'Error submitting request'); } } catch (error) { alert('Error submitting request'); } };
    const handleReportSubmit = async ({ reason, details }) => { setReportSubmitting(true); setReportError(""); setReportSuccess(""); try { const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"; const token = currentUser?.token || currentUser?.accessToken || ""; const res = await fetch(`${API_BASE}/api/reports`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), }, body: JSON.stringify({ sellerId: viewedUserId, reason, details, }), }); if (!res.ok) { const msg = await res.text(); throw new Error(msg || "Failed to submit report"); } setReportSuccess("Report submitted successfully."); setShowReportModal(false); } catch (err) { setReportError("Could not submit report right now."); } finally { setReportSubmitting(false); } };
    const handleBookingSubmit = async ({ date, timeSlot, note }) => { setBookingSubmitting(true); setBookingError(""); setBookingSuccess(""); try { const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"; const token = currentUser?.token || currentUser?.accessToken || ""; if (!token) { setBookingError("You must be logged in to book a seller."); setBookingSubmitting(false); return; } if (!viewedUserId) { setBookingError("Seller not loaded yet. Please try again."); setBookingSubmitting(false); return; } const res = await fetch(`${API_BASE}/api/bookings`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, }, body: JSON.stringify({ providerId: viewedUserId, date, timeSlot, note: note || "", }), }); if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.message || "Failed to create booking"); } setBookingSuccess("✅ Booking request submitted!"); setShowBookingModal(false); } catch (err) { setBookingError(err.message || "Could not submit booking right now."); } finally { setBookingSubmitting(false); } };
    const handleMentorshipSubmit = async ({ message }) => { setMentorshipSubmitting(true); setMentorshipError(""); setMentorshipSuccess(""); try { const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"; const token = currentUser?.token || currentUser?.accessToken || ""; const res = await fetch(`${API_BASE}/api/mentorship/offers`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), }, body: JSON.stringify({ businessOwnerId: viewedUserId, message: message || "", }), }); if (!res.ok) { const text = await res.text(); throw new Error(text || "Failed to send mentorship offer"); } setMentorshipSuccess("Mentorship offer sent."); setShowMentorshipModal(false); } catch (err) { setMentorshipError(err.message || "Could not send mentorship offer."); } finally { setMentorshipSubmitting(false); } };


    if (loading) return <div className="min-h-screen bg-light flex items-center justify-center">Loading...</div>;
    if (!profileData) return <div className="min-h-screen bg-light flex items-center justify-center">User not found</div>;

    const { user, products, stats } = profileData;
    const viewedUser = user;
    const viewedUserId = viewedUser?._id;
    const isLoggedIn = !!currentUser;
    const isSellerProfile = viewedUser?.roles?.includes("business-owner");
    const isOwnProfile = currentUserId && viewedUserId && currentUserId === viewedUserId;
    const profile = user.profile || {};
    
    // Check if user is allowed to have wishlist (Customer or NGO)
    const canHaveWishlist = (currentUser?.roles?.includes('user') || currentUser?.roles?.includes('ngo')) && 
                            !currentUser?.roles?.includes('business-owner') && 
                            !currentUser?.roles?.includes('admin');

    return (
        <div className="min-h-screen bg-light">
             <RoleRequestModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} onSubmit={handleRoleRequest} />
             {/* */}
             <ReportSellerModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} onSubmit={handleReportSubmit} sellerName={viewedUser?.name} />
             <BookSellerModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} onSubmit={handleBookingSubmit} sellerName={viewedUser?.name} />
             <OfferMentorshipModal isOpen={showMentorshipModal} onClose={() => setShowMentorshipModal(false)} onSubmit={handleMentorshipSubmit} businessOwnerName={viewedUser?.name} />
             {showHireModal && <HireModal sellerId={viewedUserId} sellerName={viewedUser?.name} onClose={() => setShowHireModal(false)} />}

            {/* Header / Cover Photo */}
            <div className="h-64 bg-gradient-to-r from-primary to-secondary" style={profile.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />

            <div className="container mx-auto px-4">
                <div className="relative -mt-20 mb-8">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <img src={profile.profilePicture || 'https://via.placeholder.com/150'} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" />
                            
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-dark">{user.name}</h1>
                                {profile.businessName && <p className="text-xl text-gray-600">{profile.businessName}</p>}
                                {profile.businessType && <p className="text-sm text-gray-500">{profile.businessType}</p>}

                                {isOwnProfile && (
                                    <div className="mt-4 flex gap-3 justify-center md:justify-start">
                                        <Link to="/profile/edit" className="inline-block bg-secondary text-dark px-6 py-2 rounded hover:bg-yellow-500 transition font-bold">✏️ Edit Profile</Link>
                                        
                                        {/**/}
                                        {currentUser?.roles?.includes("business-owner") && <Link to="/booking-requests" className="inline-block bg-primary text-white px-6 py-2 rounded">📩 Booking Requests</Link>}
                                        {currentUser?.roles?.includes("ngo") && <Link to="/ngo/trainings" className="inline-block bg-primary text-white px-6 py-2 rounded">🎓 Trainings</Link>}
                                        {isRegularUser && <button onClick={() => setShowRoleModal(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded">⭐ Upgrade Account</button>}
                                    </div>
                                )}
                            </div>

                             <div className="flex gap-6 text-center">
                                <div><p className="text-2xl font-bold text-primary">{stats.productCount}</p><p className="text-sm text-gray-600">Products</p></div>
                                <div><p className="text-2xl font-bold text-purple-600">{stats.profileViews}</p><p className="text-sm text-gray-600">Views</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/**/}
                {isOwnProfile && canHaveWishlist && (
                    <div className="flex gap-4 mb-6 border-b border-gray-300">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`pb-2 px-4 font-bold text-lg ${activeTab === 'profile' ? 'border-b-4 border-primary text-primary' : 'text-gray-500'}`}
                        >
                            Profile
                        </button>
                        <button 
                            onClick={() => setActiveTab('wishlist')}
                            className={`pb-2 px-4 font-bold text-lg ${activeTab === 'wishlist' ? 'border-b-4 border-primary text-primary' : 'text-gray-500'}`}
                        >
                            ❤️ Wishlist
                        </button>
                    </div>
                )}

                {/**/}
                {activeTab === 'profile' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            {profile.bio && (
                                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                    <h2 className="text-2xl font-bold mb-4">About</h2>
                                    <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                                </div>
                            )}

                            {products.length > 0 && (
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h2 className="text-2xl font-bold mb-4">Products</h2>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {products.map(product => (
                                            <Link key={product._id} to={`/marketplace/${product._id}`} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
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

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Contact Info</h2>
                                {profile.phone && <div className="mb-3"><p className="text-sm text-gray-600">Phone</p><p className="font-semibold">📞 {profile.phone}</p></div>}
                                {profile.address && (profile.address.city || profile.address.district) && <div className="mb-3"><p className="text-sm text-gray-600">Location</p><p className="font-semibold">📍 {profile.address.city}, {profile.address.district}</p></div>}
                                {user.email && <div className="mb-3"><p className="text-sm text-gray-600">Email</p><p className="font-semibold">✉️ {user.email}</p></div>}
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Member Info</h2>
                                <p className="text-sm text-gray-600 mb-2">Member since: <span className="font-semibold">{new Date(stats.memberSince).toLocaleDateString()}</span></p>
                            </div>

                            {/* Action Buttons for visitors */}
                            {isLoggedIn && isSellerProfile && !isOwnProfile && (
                                <>
                                    <div className="bg-white rounded-lg shadow-lg p-6">
                                        <h2 className="text-lg font-bold mb-3 text-red-600">Report Seller</h2>
                                        <button onClick={() => setShowReportModal(true)} className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">🚩 Report This Seller</button>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-lg p-6">
                                        <h2 className="text-lg font-bold mb-3 text-primary">Book Seller</h2>
                                        <button onClick={() => setShowBookingModal(true)} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-bold text-white">📅 Book Seller</button>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-lg p-6">
                                        <h2 className="text-lg font-bold mb-3 text-green-700">Hire for Project</h2>
                                        <button onClick={() => setShowHireModal(true)} className="w-full rounded-md bg-green-700 px-4 py-2 text-sm font-bold text-white">🤝 Hire Now</button>
                                    </div>
                                     <div className="bg-white rounded-lg shadow-lg p-6">
                                        <h2 className="text-lg font-bold mb-3 text-orange-600">Request Custom Order</h2>
                                        <Link to={`/create-custom-order?sellerId=${viewedUserId}`} className="block w-full text-center rounded-md bg-orange-600 px-4 py-2 text-sm font-bold text-white">✨ Request Custom Order</Link>
                                    </div>
                                </>
                            )}
                             {isLoggedIn && isNgoUser && isSellerProfile && !isOwnProfile && (
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h2 className="text-lg font-bold mb-3 text-dark">Offer Mentorship</h2>
                                    <button onClick={() => setShowMentorshipModal(true)} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-bold text-white">🤝 Offer Mentorship</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* wishlist */}
                {activeTab === 'wishlist' && (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-2xl font-bold mb-6">My Wishlist ({wishlistItems.length})</h2>
                        
                        {wishlistItems.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                                <Link to="/marketplace" className="bg-primary text-white px-6 py-2 rounded font-bold">Browse Marketplace</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {wishlistItems.map(item => (
                                    <div key={item._id} className="flex flex-col md:flex-row items-center border p-4 rounded-lg gap-6">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded" />
                                        
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-dark">{item.product.name}</h3>
                                            <p className="text-gray-500">Saved Quantity: <span className="font-bold text-black">{item.savedQuantity}</span></p>
                                            <p className="text-primary font-bold text-lg">৳{item.product.price}</p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => handleMoveToCart(item)}
                                                className="bg-secondary text-dark px-4 py-2 rounded font-bold hover:bg-yellow-500 transition"
                                            >
                                                🛒 Move to Cart
                                            </button>
                                            <button 
                                                onClick={() => handleRemoveWishlist(item.product._id)}
                                                className="bg-red-100 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-200 transition"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
            
             {/**/}
            {reportSuccess && <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700 mx-auto max-w-lg">{reportSuccess}</div>}
            {bookingSuccess && <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700 mx-auto max-w-lg">{bookingSuccess}</div>}
        </div>
    );
}

export default UserProfile;
