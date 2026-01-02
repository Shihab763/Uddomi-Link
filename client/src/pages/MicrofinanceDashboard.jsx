import { useState, useEffect } from 'react';

const MicrofinanceDashboard = () => {
    const [loans, setLoans] = useState([]);
    const [formData, setFormData] = useState({
        providerName: 'BRAC Bank',
        amount: '',
        purpose: ''
    });
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchLoans();
        // Poll for updates (since the bank replies after 5 seconds)
        const interval = setInterval(fetchLoans, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchLoans = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/microfinance/my-loans', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setLoans(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/microfinance/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("Application Submitted! The bank is processing it...");
                setFormData({ ...formData, amount: '', purpose: '' });
                fetchLoans();
            }
        } catch (error) {
            alert("Application failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2 text-green-800">🏦 Microfinance Portal</h1>
            <p className="text-gray-600 mb-8">Access fast funding from our partners like BRAC and Grameen.</p>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Application Form */}
                <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-green-600">
                    <h2 className="text-xl font-bold mb-4">Apply for Funding</h2>
                    <form onSubmit={handleApply} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Select Provider</label>
                            <select 
                                className="w-full p-2 border rounded mt-1"
                                value={formData.providerName}
                                onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                            >
                                <option>BRAC Bank</option>
                                <option>Grameen Bank</option>
                                <option>ASA Microfinance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Amount (BDT)</label>
                            <input 
                                type="number" 
                                className="w-full p-2 border rounded mt-1"
                                placeholder="e.g., 50000"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Purpose</label>
                            <textarea 
                                className="w-full p-2 border rounded mt-1"
                                placeholder="Why do you need this loan?"
                                required
                                value={formData.purpose}
                                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-green-700 text-white font-bold py-2 rounded hover:bg-green-800 transition"
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>

                {/* Loan History */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Application History</h2>
                    <div className="space-y-3 h-80 overflow-y-auto">
                        {loans.length === 0 ? <p className="text-gray-500">No applications yet.</p> : loans.map(loan => (
                            <div key={loan._id} className="bg-white p-4 rounded shadow-sm border-l-4" style={{
                                borderColor: loan.status === 'Approved' ? 'green' : loan.status === 'Rejected' ? 'red' : 'orange'
                            }}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold">{loan.providerName}</h3>
                                        <p className="text-sm text-gray-600">Amount: ৳{loan.amount}</p>
                                        <p className="text-xs text-gray-400">{new Date(loan.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                                        loan.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                        loan.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {loan.status}
                                    </span>
                                </div>
                                {loan.rejectionReason && (
                                    <p className="text-xs text-red-600 mt-2 bg-red-50 p-1 rounded">Reason: {loan.rejectionReason}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MicrofinanceDashboard;