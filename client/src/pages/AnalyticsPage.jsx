import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/seller', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) return <div className="min-h-screen bg-light flex items-center justify-center">Loading Analytics...</div>;

  return (
    <div className="min-h-screen bg-light p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-6">📊 Seller Analytics</h1>

        {/**/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/*  Total Revenue */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 font-bold text-sm uppercase">Total Revenue</h3>
            <p className="text-3xl font-bold text-dark mt-2">৳ {data?.overview?.totalRevenue?.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">Lifetime Earnings</p>
          </div>

          {/*  Most Sold Product */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 font-bold text-sm uppercase">Best Selling (Qty)</h3>
            {data?.highlights?.bestSeller ? (
              <div className="mt-2">
                 <p className="font-bold text-dark truncate">{data.highlights.bestSeller.name}</p>
                 <p className="text-2xl text-blue-600 font-bold">{data.highlights.bestSeller.totalQuantity} <span className="text-sm text-gray-500">units</span></p>
              </div>
            ) : (
              <p className="text-gray-400 mt-2">No sales yet</p>
            )}
          </div>

          {/*  Highest Revenue Product */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-gray-500 font-bold text-sm uppercase">Highest Earner</h3>
            {data?.highlights?.topEarner ? (
              <div className="mt-2">
                 <p className="font-bold text-dark truncate">{data.highlights.topEarner.name}</p>
                 <p className="text-2xl text-purple-600 font-bold">৳ {data.highlights.topEarner.totalRevenue.toLocaleString()}</p>
              </div>
            ) : (
               <p className="text-gray-400 mt-2">No revenue yet</p>
            )}
          </div>

          {/*  Most Clicked/Viewed Product */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
            <h3 className="text-gray-500 font-bold text-sm uppercase">Most Viewed</h3>
            {data?.highlights?.mostViewed ? (
              <div className="mt-2">
                 <p className="font-bold text-dark truncate">{data.highlights.mostViewed.name}</p>
                 <p className="text-2xl text-orange-600 font-bold">{data.highlights.mostViewed.views} <span className="text-sm text-gray-500">clicks</span></p>
              </div>
            ) : (
               <p className="text-gray-400 mt-2">No views yet</p>
            )}
          </div>
        </div>

        {/**/}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-xl font-bold mb-4">Product Performance (Revenue vs Quantity)</h3>
            <div className="h-80 w-full">
                {data?.allProductsStats && data.allProductsStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.allProductsStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="totalRevenue" name="Revenue (৳)" fill="#8884d8" />
                            <Bar yAxisId="right" dataKey="totalQuantity" name="Units Sold" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Not enough data to display chart
                    </div>
                )}
            </div>
        </div>

        <div className="flex justify-center">
            <Link to="/my-products" className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-green-700">
                Manage Products
            </Link>
        </div>

      </div>
    </div>
  );
}

export default AnalyticsPage;
