import { useEffect, useState } from 'react';

function CustomOrders() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/custom-orders/my', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-light flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-light container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">✨ My Custom Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center">
          No custom orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white p-6 rounded shadow">
              <h3 className="font-bold text-lg">{o.creator?.name}</h3>
              <p className="text-gray-600 mt-2">{o.details}</p>
              <p className="mt-2 text-sm">
                Status:{' '}
                <span className="font-semibold capitalize">{o.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomOrders;
