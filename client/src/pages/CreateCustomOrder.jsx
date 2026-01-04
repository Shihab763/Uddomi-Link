import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CreateCustomOrder = () => {
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get('sellerId');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ ...formData, sellerId })
      });

      if (res.ok) {
        alert('Request sent! The creator has been notified.');
        navigate('/custom-orders');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-green-900">Request Custom Order</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-lg rounded-lg space-y-4">
        <div>
          <label className="block font-bold text-gray-700">Project Title</label>
          <input 
            type="text" 
            required
            className="w-full border p-2 rounded mt-1"
            placeholder="e.g. 50 Custom Painted Cat Beds"
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <div>
          <label className="block font-bold text-gray-700">Description</label>
          <textarea 
            required
            className="w-full border p-2 rounded mt-1 h-32"
            placeholder="Describe materials, colors, dimensions..."
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700">Budget (BDT)</label>
            <input 
              type="number" 
              required
              className="w-full border p-2 rounded mt-1"
              onChange={e => setFormData({...formData, budget: e.target.value})}
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700">Deadline</label>
            <input 
              type="date" 
              required
              className="w-full border p-2 rounded mt-1"
              onChange={e => setFormData({...formData, deadline: e.target.value})}
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-green-700 text-white font-bold py-3 rounded hover:bg-green-800 transition">
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default CreateCustomOrder;
