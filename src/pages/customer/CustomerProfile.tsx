import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, CheckCircle, ChevronLeft, AlertCircle, Save, MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function CustomerProfile() {
  const { user, isAuthenticated, updateProfile, updatePassword, saveAddress, deleteAddress } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Address Form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressId, setAddressId] = useState<string | undefined>(undefined);
  const [addressLabel, setAddressLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isPrimaryAddress, setIsPrimaryAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const handleEditAddress = (addr: any) => {
    setAddressId(addr.id);
    setAddressLabel(addr.label);
    setRecipientName(addr.recipientName);
    setPhone(addr.phone);
    setDetails(addr.details);
    setCity(addr.city);
    setProvince(addr.province);
    setPostalCode(addr.postalCode);
    setIsPrimaryAddress(addr.isPrimary);
    setShowAddressForm(true);
  };

  const handleAddAddressClick = () => {
    setAddressId(undefined);
    setAddressLabel('Rumah');
    setRecipientName(user?.name || '');
    setPhone('');
    setDetails('');
    setCity('');
    setProvince('');
    setPostalCode('');
    setIsPrimaryAddress(false);
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      await saveAddress({
        id: addressId,
        label: addressLabel,
        recipientName,
        phone,
        details,
        city,
        province,
        postalCode,
        isPrimary: isPrimaryAddress
      });
      showToast(addressId ? 'Alamat berhasil diperbarui' : 'Alamat baru berhasil ditambahkan', 'success');
      setShowAddressForm(false);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan alamat', 'error');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = (addrId: string, label: string) => {
    Swal.fire({
      title: 'Hapus Alamat?',
      text: `Apakah Anda yakin ingin menghapus alamat "${label}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAddress(addrId);
          showToast('Alamat berhasil dihapus', 'success');
        } catch (err: any) {
          showToast(err.message || 'Gagal menghapus alamat', 'error');
        }
      }
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [isAuthenticated, user, navigate]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      await updateProfile(name, email);
      showToast('Profil berhasil diperbarui', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui profil', 'error');
      // Reset to original values on failure
      if (user) {
        setName(user.name);
        setEmail(user.email);
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Password baru dan konfirmasi tidak cocok', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(oldPassword, newPassword);
      showToast('Password berhasil diperbarui', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-[calc(100vh-200px)]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Profil Pengguna</h1>

      <Link to="/customer/dashboard" className="w-70 mb-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center text-sm hover:bg-orange-500 hover:text-white">
        <ChevronLeft size={16} className="mr-1" /> Kembali ke Dashboard
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Profile Details Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
            <User className="mr-2 text-orange-500" /> Informasi Pribadi
          </h2>

          <form onSubmit={handleProfileSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile || (name === user.name && email === user.email)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition"
              >
                {isUpdatingProfile ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
            <Lock className="mr-2 text-orange-500" /> Ubah Kata Sandi
          </h2>

          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ulangi kata sandi baru"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword || !oldPassword || !newPassword || !confirmPassword}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isUpdatingPassword ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memperbarui...
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Perbarui Kata Sandi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Address Management Section */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MapPin className="mr-2 text-orange-500" /> Daftar Alamat Pengiriman
            </h2>
            <button
              onClick={handleAddAddressClick}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none transition-colors"
            >
              <Plus className="mr-1" size={16} /> Tambah Alamat
            </button>
          </div>

          {!user.addresses || user.addresses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <MapPin className="mx-auto text-gray-300 mb-3" size={48} />
              <h3 className="text-base font-bold text-gray-700 mb-1">Belum Ada Alamat</h3>
              <p className="text-sm text-gray-500 mb-4">Tambahkan alamat pengiriman agar proses belanja Anda lebih cepat.</p>
              <button
                onClick={handleAddAddressClick}
                className="px-4 py-2 border border-orange-600 text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition text-sm"
              >
                + Tambah Alamat Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border relative transition-all ${
                    addr.isPrimary
                      ? 'border-orange-500 bg-orange-50/30 ring-1 ring-orange-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {addr.label}
                      </span>
                      {addr.isPrimary && (
                        <span className="text-xs font-semibold bg-orange-600 text-white px-2 py-0.5 rounded">
                          Utama
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="p-1 text-gray-400 hover:text-orange-600 rounded transition"
                        title="Edit Alamat"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id, addr.label)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                        title="Hapus Alamat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="font-bold text-sm text-gray-800 mb-1">{addr.recipientName}</p>
                  <p className="text-xs text-gray-500 mb-2">{addr.phone}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {addr.details}, {addr.city}, {addr.province}, {addr.postalCode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Address Modal Overlay */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-lg w-full p-6 relative animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {addressId ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Baru'}
            </h3>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Label Alamat</label>
                  <select
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="Rumah">Rumah</option>
                    <option value="Kantor">Kantor</option>
                    <option value="Toko">Toko</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Nama Lengkap"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor Telepon</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Contoh: 08123456789"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea
                  required
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kota/Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Kota"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Provinsi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="primaryAddressCheckbox"
                  checked={isPrimaryAddress}
                  disabled={addressId ? user?.addresses?.find(a => a.id === addressId)?.isPrimary : false}
                  onChange={(e) => setIsPrimaryAddress(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="primaryAddressCheckbox" className="ml-2 block text-sm text-gray-900 select-none">
                  Jadikan Alamat Utama
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 text-sm transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium text-sm transition disabled:bg-orange-300"
                >
                  {isSavingAddress ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
