import React, { useState, useEffect } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'BLOCKED';
  joinedAt: string;
}

const mockUsers: User[] = [
  { id: 'u1', name: 'Budi Santoso', email: 'budi@example.com', status: 'ACTIVE', joinedAt: '2023-10-12' },
  { id: 'u2', name: 'Siti Aminah', email: 'siti@example.com', status: 'ACTIVE', joinedAt: '2023-10-15' },
  { id: 'u3', name: 'Arif Setiawan', email: 'arif@example.com', status: 'BLOCKED', joinedAt: '2023-10-20' },
  { id: 'u4', name: 'Dewi Lestari', email: 'dewi@example.com', status: 'ACTIVE', joinedAt: '2023-10-22' },
];

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const { showToast } = useToast();

  useEffect(() => {
    // Gabungkan dengan user dari localStorage jika ada
    const storedUsersStr = localStorage.getItem('sotoys_users_db');
    if (storedUsersStr) {
      try {
        const storedUsers = JSON.parse(storedUsersStr);
        const mappedUsers = storedUsers.map((u: any) => ({
          id: u.id || `local-${Math.random().toString(36).substr(2, 9)}`,
          name: u.name,
          email: u.email,
          status: 'ACTIVE',
          joinedAt: new Date().toISOString().split('T')[0]
        }));
        
        // Filter agar tidak ada duplikat email
        const newMocks = mockUsers.filter(mu => !mappedUsers.some((su: any) => su.email === mu.email));
        setUsers([...mappedUsers, ...newMocks]);
      } catch (e) {
        console.error("Gagal memuat pengguna lokal", e);
      }
    }
  }, []);

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        showToast(`Status akun ${user.name} telah diubah menjadi ${newStatus === 'ACTIVE' ? 'Aktif' : 'Diblokir'}`, newStatus === 'ACTIVE' ? 'success' : 'error');
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manajemen Pengguna</h2>
          <p className="text-sm text-gray-500 mt-1">Daftar pelanggan terdaftar dan status akun mereka.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm">
              <th className="p-4 font-semibold text-gray-700">Nama</th>
              <th className="p-4 font-semibold text-gray-700">Email</th>
              <th className="p-4 font-semibold text-gray-700">Tanggal Bergabung</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4 text-gray-600">{user.joinedAt}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'ACTIVE' ? 'AKTIF' : 'DIBLOKIR'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => toggleStatus(user.id)}
                    className={`inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md shadow-sm text-white ${
                      user.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors focus:ring-${user.status === 'ACTIVE' ? 'red' : 'green'}-500`}
                  >
                    {user.status === 'ACTIVE' ? (
                      <><ShieldOff size={14} className="mr-1.5" /> Blokir Akun</>
                    ) : (
                      <><Shield size={14} className="mr-1.5" /> Aktifkan Akun</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Belum ada pengguna yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
