import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function CustomOrderRequests() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isCreator =
    user?.roles?.includes('business-owner') ||
    user?.roles?.includes('artist');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const API_BASE = 'http://localhost:5000';
  const token = user?.token || '';

  if (!user) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <Link to="/login" className="text-primary font-bold">
          Please login
        </Link>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Only creators can manage custom orders
          </p>
          <Link to="/dashboard" className="text-primary mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/custom-orders/creator`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load custom orders');
        }

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const pendingOrders = useMemo(
    () => orders.filter(o => o.status === 'pending'),
    [orders]
  );

  const updateStatus = async (id, status) => {
    try {
      setError('');
      setMsg('');

      const res = await fetch(`${API_BASE}/api/custom-orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update order');
      }

      const updated = await res.json();
      setOrders(prev =>
        prev.map(o => (o._id === updated._id ? updated : o))
      );

      setMsg(`Order ${status}`);
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-1">✨ Custom Order Requests</h1>
          <p className="text-gray-600 text-sm">
            Review and respond to custom work requests
          </p>

          {msg && (
            <div className="mt-4 bg-green-50 text-green-700 p-3 rounded">
              {msg}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded">
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded shadow text-center">
            Loading custom orders...
          </div>
        ) : pendingOrders.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center">
            <p className="text-lg font-semibold">No pending custom orders</p>
            <Link
              to="/dashboard"
              className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map(o => (
              <div key={o._id} className="bg-white p-6 rounded shadow">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-lg">
                      {o.requester?.name || 'Requester'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {o.requester?.email}
                    </p>

                    <p className="mt-3 text-gray-700 whitespace-pre-wrap">
                      {o.details}
                    </p>

                    {o.budget && (
                      <p className="mt-2 text-sm">
                        Budget: ৳{o.budget}
                      </p>
                    )}

                    {o.deadline && (
                      <p className="text-sm">
                        Deadline:{' '}
                        {new Date(o.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <button
                      onClick={() => updateStatus(o._id, 'accepted')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => updateStatus(o._id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      ❌ Reject
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

export default CustomOrderRequests;
