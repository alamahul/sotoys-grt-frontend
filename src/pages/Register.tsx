import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Register() {
  const navigate = useNavigate();
  const { register, verifyOtp } = useAuth();

  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP form state
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi harus minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      Swal.fire({
        title: 'OTP Terkirim!',
        text: 'Kode OTP telah dikirim ke email Anda. Silakan cek inbox.',
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
      });
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
      Swal.fire({
        title: 'Pendaftaran Gagal!',
        text: err.message || 'Gagal mendaftar. Silakan coba lagi.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifyOtp(email, otp);
      await Swal.fire({
        title: 'Registrasi Berhasil!',
        text: 'Akun Anda berhasil dibuat. Selamat berbelanja di SOTOYS GARUT!',
        icon: 'success',
        confirmButtonText: 'Mulai Belanja',
        confirmButtonColor: '#ea580c',
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'OTP tidak valid.');
      Swal.fire({
        title: 'Verifikasi Gagal!',
        text: err.message || 'Kode OTP tidak valid. Silakan coba lagi.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="text-3xl font-extrabold text-orange-600 tracking-tight flex items-center">
            SO<span className="text-orange-400">TOYS</span>
          </Link>
        </div>

        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          {step === 'REGISTER' ? 'Pendaftaran Akun Baru' : 'Verifikasi Keamanan'}
        </h2>

        {step === 'REGISTER' && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
              Masuk di sini
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">

          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-md flex items-start">
              <AlertCircle className="text-red-500 mt-0.5 mr-2 shrink-0" size={18} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 'REGISTER' && (
            <form className="space-y-6" onSubmit={handleRegisterSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 border p-2.5 bg-white"
                    placeholder="Budi Santoso"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Alamat Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 border p-2.5 bg-white"
                    placeholder="anda@contoh.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Kata Sandi
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 sm:text-sm rounded-md focus:ring-orange-500 border p-2.5 bg-white ${password.length > 0 && password.length < 6 ? 'border-red-500 focus:border-red-500 text-red-900' : 'border-gray-300 focus:border-orange-500'}`}
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                {password.length > 0 && password.length < 6 && (
                  <p className="mt-1 text-xs text-red-500">Kata sandi harus minimal 6 karakter.</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Konfirmasi Kata Sandi
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 sm:text-sm rounded-md focus:ring-orange-500 border p-2.5 bg-white ${confirmPassword.length > 0 && confirmPassword !== password ? 'border-red-500 focus:border-red-500 text-red-900' : 'border-gray-300 focus:border-orange-500'}`}
                    placeholder="Ulangi kata sandi"
                  />
                </div>
                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <p className="mt-1 text-xs text-red-500">Kata sandi tidak cocok.</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || (password.length > 0 && password.length < 6) || (confirmPassword.length > 0 && confirmPassword !== password)}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Daftar Sekarang'
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'OTP' && (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <ShieldCheck className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-600">
                  Kami telah mengirimkan kode sandi sekali pakai (OTP) ke email <strong>{email}</strong>.
                </p>
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                  Simulasi: Gunakan kode <strong>123456</strong>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="sr-only">
                  Kode OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="block w-full text-center tracking-widest text-2xl border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 border p-3 bg-white"
                  placeholder="••••••"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Verifikasi & Masuk <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep('REGISTER')}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Kembali Edit Data
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
