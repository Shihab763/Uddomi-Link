import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-light">
      <div
        className="relative h-64 md:h-80 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-secondary shadow-sm">
              Welcome to a crafty place
            </h1>
            <p className="text-xl md:text-2xl font-light">
              Welcome back, {user.name}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 -mt-10 relative z-10">
        {user.role === 'business-owner' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
              <h2 className="text-2xl font-bold text-dark mb-4">My Businesses</h2>
              <p className="text-gray-600 mb-6">Manage your listings and track investors.</p>
              <button className="bg-primary text-white px-6 py-2 rounded hover:bg-green-800 transition w-full">
                + Add New Business
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-secondary">
              <h2 className="text-2xl font-bold text-dark mb-4">Investment Requests</h2>
              <p className="text-gray-600">You have 0 pending requests from investors.</p>
            </div>
          </div>
        )}

        {user.role === 'investor' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-secondary">
              <h2 className="text-2xl font-bold text-dark mb-4">Investment Portfolio</h2>
              <p className="text-gray-600 mb-6">Track your ROI and active assets.</p>
              <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                Chart Placeholder
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
              <h2 className="text-2xl font-bold text-dark mb-4">Find Opportunities</h2>
              <p className="text-gray-600 mb-6">Browse verified rural businesses seeking capital.</p>
              <button className="bg-primary text-white px-6 py-2 rounded hover:bg-green-800 transition w-full">
                Browse Marketplace
              </button>
            </div>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-8 rounded-lg shadow-xl text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">🔐 Administrator Access</h2>
            <p className="text-lg mb-6 opacity-90">
              You have full system access. Manage users, monitor activity, and configure settings.
            </p>
            <Link
              to="/admin"
              className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-bold text-lg shadow-lg"
            >
              Go to Admin Panel →
            </Link>
          </div>
        )}

        {user.role === 'user' && (
          <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-accent text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-dark mb-4">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">
              To start buying or selling businesses, you need to upgrade your account role.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-primary text-white px-6 py-2 rounded hover:bg-green-800 transition">
                Become an Investor
              </button>
              <button className="bg-secondary text-dark px-6 py-2 rounded hover:bg-yellow-500 transition">
                Register Business
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;