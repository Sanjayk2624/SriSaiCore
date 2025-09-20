// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Users</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-sm">{user.name}</td>
                <td className="p-3 text-sm">{user.email}</td>
                <td className="p-3 text-sm">
                  <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                    user.role === 'admin' ? 'bg-green-600' : 'bg-blue-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
