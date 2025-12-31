import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Wishlist() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [wishlist, setWishlist] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/wishlist/my', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then(setWishlist);
  }, []);

  if (!wishlist) {
    return <div className="min-h-screen bg-light flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-light container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">❤️ My Wishlist</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {wishlist.products.map((p) => (
          <Link key={p._id} to={`/marketplace/${p._id}`} className="bg-white p-4 rounded shadow">
            <img src={p.imageUrl} className="h-40 w-full object-cover rounded mb-2" />
            <h3 className="font-bold">{p.name}</h3>
          </Link>
        ))}

        {wishlist.portfolios.map((p) => (
          <Link key={p._id} to={`/portfolio/view/${p._id}`} className="bg-white p-4 rounded shadow">
            <img src={p.mediaUrl} className="h-40 w-full object-cover rounded mb-2" />
            <h3 className="font-bold">{p.title}</h3>
          </Link>
        ))}

        {wishlist.sellers.map((s) => (
          <Link key={s._id} to={`/profile/${s._id}`} className="bg-white p-4 rounded shadow">
            <img src={s.profileImage} className="h-40 w-full object-cover rounded mb-2" />
            <h3 className="font-bold">{s.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
