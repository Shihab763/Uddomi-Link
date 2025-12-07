import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        alert(`Welcome back, ${data.name}!`);
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-light flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-secondary">
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">Welcome Back</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-dark font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
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
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-secondary text-dark py-2 rounded hover:bg-yellow-500 transition font-bold"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-dark">
          New here?{' '}
          <Link to="/signup" className="text-primary font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;