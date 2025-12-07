import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        alert('Registration Successful! Please login.');
        navigate('/login');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-light flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-primary">
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">Join the Network</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-dark font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-dark font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-dark font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
              placeholder="********"
              required
            />
          </div>

          <div>
            <label className="block text-dark font-medium mb-1">I am a:</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary bg-white"
            >
              <option value="user">Regular User</option>
              <option value="business-owner">Business Owner</option>
              <option value="investor">Investor</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-green-800 transition font-bold"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-dark">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;