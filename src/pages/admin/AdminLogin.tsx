import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const from = location.state?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Wait for login to set user, we need to check if they are admin
      // Since context login is mock async, we can check localStorage directly for role
      const storedUser = JSON.parse(localStorage.getItem('sotoys_user') || '{}');

      if (storedUser.role !== 'admin') {
        throw new Error('Akses Ditolak. Akun ini tidak memiliki hak akses administrator.');
      }

      showToast('Autentikasi Admin Berhasil', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Kredensial tidak valid.');
      showToast('Gagal masuk sebagai admin', 'error');
      // Logout automatically if they managed to login as a non-admin through here
      localStorage.removeItem('sotoys_token');
      localStorage.removeItem('sotoys_user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-500/20 rounded-full border border-red-500/30">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">SOTOYS<span className="text-red-500">_GRT</span> ADMIN</h2>
        <p className="mt-2 text-center text-sm text-gray-400 uppercase tracking-widest font-semibold">
          Portal Akses Terbatas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-2xl shadow-red-900/20 sm:rounded-xl sm:px-10 border border-gray-700">

          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 p-4 rounded-md flex items-start">
              <AlertCircle className="text-red-400 mt-0.5 mr-3 shrink-0" size={18} />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Administrator
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-600 bg-gray-900 text-white rounded-md focus:ring-red-500 focus:border-red-500 border p-2.5 transition-colors"
                  placeholder="admin@sotoys.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Kode Keamanan (Password)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-600 bg-gray-900 text-white rounded-md focus:ring-red-500 focus:border-red-500 border p-2.5 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    OTORISASI AKSES <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Akses ke sistem ini direkam dan dipantau. Tindakan ilegal akan ditindak tegas.
          </div>
        </div>
      </div>
    </div>
  );
}
