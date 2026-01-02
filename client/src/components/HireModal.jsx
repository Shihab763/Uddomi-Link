import { useState } from 'react';

const HireModal = ({ sellerId, sellerName, onClose }) => {
    const [formData, setFormData] = useState({
        serviceType: '',
        description: '',
        amount: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;

        if (!token) {
            alert("Please login first");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/service-bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sellerId,
                    ...formData
                })
            });

            if (res.ok) {
                alert('Request sent successfully!');
                onClose();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to send request');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">✕</button>
                <h2 className="text-2xl font-bold mb-6">Hire {sellerName}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Service Type</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Custom Portrait" 
                            className="w-full p-2 border rounded"
                            required
                            onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea 
                            placeholder="Describe your requirements..." 
                            className="w-full p-2 border rounded"
                            required
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1">Offer Amount (BDT)</label>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            className="w-full p-2 border rounded"
                            required
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-green-700 text-white py-2 rounded font-bold hover:bg-green-800">
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HireModal;