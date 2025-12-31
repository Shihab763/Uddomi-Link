import { useEffect, useState } from 'react';

function AnalyticsPage() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/seller/analytics', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="min-h-screen bg-light flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-light container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">📊 My Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Total Orders</p>
          <p className="text-4xl font-bold">{data.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Revenue</p>
          <p className="text-4xl font-bold">৳{data.revenue}</p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
