import { useState } from 'react';

function CustomOrders() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [details, setDetails] = useState('');

  const submit = async () => {
    await fetch('http://localhost:5000/api/custom-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ details }),
    });
    alert('Request submitted');
  };

  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">✨ Custom Order</h2>
        <textarea
          className="w-full border p-3 rounded mb-4"
          rows="5"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <button
          onClick={submit}
          className="w-full bg-primary text-white py-2 rounded"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}

export default CustomOrders;
