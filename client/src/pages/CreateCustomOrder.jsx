import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function CreateCustomOrder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const creatorId = params.get('creatorId');
  const portfolioId = params.get('portfolioId');

  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const submit = async () => {
    if (!details.trim()) {
      setError('Please describe what you want');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          creatorId,
          portfolioId,
          details,
          budget: budget || undefined,
          deadline: deadline || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit custom order');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">✨ Request Custom Work</h1>

        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <textarea
          className="w-full border p-3 rounded mb-4"
          rows="5"
          placeholder="Describe what you want..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        <input
          type="number"
          className="w-full border p-3 rounded mb-4"
          placeholder="Budget (optional)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <input
          type="date"
          className="w-full border p-3 rounded mb-6"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded font-bold hover:bg-green-800 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Custom Order'}
        </button>
      </div>
    </div>
  );
}

export default CreateCustomOrder;
