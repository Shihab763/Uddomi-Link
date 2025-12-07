import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        businessOwners: 0,
        investors: 0,
        regularUsers: 0
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // check user is admin
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchUsers();
    }, [navigate, user]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);

                const stats = {
                    total: data.length,
                    admins: data.filter(u => u.role === 'admin').length,
                    businessOwners: data.filter(u => u.role === 'business-owner').length,
                    investors: data.filter(u => u.role === 'investor').length,
                    regularUsers: data.filter(u => u.role === 'user').length
                };
                setStats(stats);
            } else {
                alert('Failed to fetch users');
            }
        } catch (error) {
            console.error(error);
            alert('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('User deleted successfully');
                fetchUsers();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting user');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                alert('User role updated successfully');
                fetchUsers();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error updating role');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-gradient-to-r from-primary to-green-700 text-white py-8 shadow-lg">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🔐 Admin Panel</h1>
                    <p className="text-lg opacity-90">Manage users and system settings</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-primary text-center">
                        <p className="text-gray-600 text-sm">Total Users</p>
                        <p className="text-3xl font-bold text-primary">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-red-500 text-center">
                        <p className="text-gray-600 text-sm">Admins</p>
                        <p className="text-3xl font-bold text-red-500">{stats.admins}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-blue-500 text-center">
                        <p className="text-gray-600 text-sm">Business Owners</p>
                        <p className="text-3xl font-bold text-blue-500">{stats.businessOwners}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-yellow-500 text-center">
                        <p className="text-gray-600 text-sm">Investors</p>
                        <p className="text-3xl font-bold text-yellow-500">{stats.investors}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-gray-500 text-center">
                        <p className="text-gray-600 text-sm">Regular Users</p>
                        <p className="text-3xl font-bold text-gray-500">{stats.regularUsers}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-primary text-white px-6 py-4">
                        <h2 className="text-2xl font-bold">User Management</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{u.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-600">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                disabled={u._id === user._id}
                                                className="px-3 py-1 rounded-full text-sm font-semibold border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    borderColor: u.role === 'admin' ? '#ef4444' : u.role === 'business-owner' ? '#3b82f6' : u.role === 'investor' ? '#eab308' : '#6b7280',
                                                    color: u.role === 'admin' ? '#ef4444' : u.role === 'business-owner' ? '#3b82f6' : u.role === 'investor' ? '#eab308' : '#6b7280'
                                                }}
                                            >
                                                <option value="user">User</option>
                                                <option value="business-owner">Business Owner</option>
                                                <option value="investor">Investor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleDeleteUser(u._id, u.name)}
                                                disabled={u._id === user._id}
                                                className="bg-accent text-white px-4 py-1 rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
