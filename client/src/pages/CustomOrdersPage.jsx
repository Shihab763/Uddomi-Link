import { useEffect, useState } from 'react';

const CustomOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  // Check if user is a creator/business-owner
  const isCreator = user?.roles?.includes('business-owner');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    // If Creator -> fetch '/received', If Customer -> fetch '/sent'
    const endpoint = isCreator ? '/received' : '/sent';
    try {
      const res = await fetch(`http://localhost:5000/api/custom-orders${endpoint}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/custom-orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchOrders(); // Refresh list to show updated status
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-900">
        {isCreator ? 'Incoming Custom Requests' : 'My Custom Order Requests'}
      </h1>

      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{order.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {isCreator ? `From: ${order.buyerId?.name}` : `To: ${order.sellerId?.name}`}
              </p>
              <p className="text-gray-800 my-2 bg-gray-50 p-3 rounded">{order.description}</p>
              <div className="flex gap-4 text-sm font-semibold mt-2">
                <span className="text-green-700">Budget: ৳{order.budget}</span>
                <span className="text-red-700">Due: {new Date(order.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <span className={`px-4 py-1 rounded-full text-sm font-bold capitalize
                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'}`}>
                {order.status}
              </span>

              {/* Only Creators see Accept/Reject buttons for Pending orders */}
              {isCreator && order.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatus(order._id, 'accepted')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Accept
                  </button>
                  <button 
                    onClick={() => handleStatus(order._id, 'rejected')}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-gray-500 text-center py-10">No custom orders found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomOrdersPage;
