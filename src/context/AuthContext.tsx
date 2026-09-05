import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../utils/api';

export interface Address {
  id: string;
  label: string; // e.g. Rumah, Kantor
  recipientName: string;
  phone: string;
  details: string; // Alamat Lengkap
  city: string;
  province: string;
  postalCode: string;
  isPrimary: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'customer' | 'admin';
  addresses?: Address[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  updatePassword: (oldPw: string, newPw: string) => Promise<void>;
  saveAddress: (address: Omit<Address, 'id'> & { id?: string }) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// **MOCK BACKEND FUNCTIONS**
// In a real application, these would be server-side API calls.
const _mockHashPassword = (password: string) => btoa(password); // Very basic simulation of hashing
const _generateMockJWT = (user: User) => `eyJhbGciOiJIUzI1NiIsInR5cCI...${btoa(JSON.stringify(user))}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage synchronously to avoid flash redirect on refresh
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('sotoys_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('sotoys_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Seed admin account
    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    if (!usersDb.some((u: any) => u.email === 'admin@sotoys.com')) {
      usersDb.push({
        id: 'admin-1',
        name: 'Super Admin',
        email: 'admin@sotoys.com',
        passwordHash: _mockHashPassword('admin123'),
        role: 'admin'
      });
      localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));
    }

    // Mark loading complete (session already restored via useState initializer)
    setIsLoading(false);
  }, []);

  // Listen to global session expired events triggered by api.ts
  useEffect(() => {
    let isShowingExpiredAlert = false;

    const handleSessionExpired = (e: any) => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('sotoys_token');
      localStorage.removeItem('sotoys_refresh_token');
      localStorage.removeItem('sotoys_user');

      if (!isShowingExpiredAlert) {
        isShowingExpiredAlert = true;
        Swal.fire({
          title: 'Sesi Telah Berakhir',
          text: e?.detail?.message || 'Sesi login Anda telah berakhir demi keamanan akun. Silakan masuk kembali.',
          icon: 'warning',
          confirmButtonText: 'Masuk Kembali',
          confirmButtonColor: '#ea580c',
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          isShowingExpiredAlert = false;
          if (window.location.pathname !== '/login') {
            window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
          }
        });
      }
    };

    window.addEventListener('sotoys:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('sotoys:session-expired', handleSessionExpired);
    };
  }, []);

  // Sync user addresses with backend if logged in
  useEffect(() => {
    if (token && user) {
      api.get('/addresses')
        .then(res => {
          if (res?.addresses && Array.isArray(res.addresses)) {
            setUser(prev => {
              if (!prev) return null;
              const updated = { ...prev, addresses: res.addresses };
              localStorage.setItem('sotoys_user', JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const rawUser = res.user;
      const normalizedRole = (rawUser.role || 'CUSTOMER').toLowerCase() as 'customer' | 'admin';
      const userData: User = {
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        role: normalizedRole,
        addresses: rawUser.addresses || [],
      };

      const sessionToken = res.token;
      localStorage.setItem('sotoys_token', sessionToken);
      localStorage.setItem('sotoys_user', JSON.stringify(userData));

      if (rememberMe && res.refreshToken) {
        localStorage.setItem('sotoys_refresh_token', res.refreshToken);
      } else {
        localStorage.removeItem('sotoys_refresh_token');
      }

      setToken(sessionToken);
      setUser(userData);
    } catch (apiError: any) {
      if (
        apiError.message &&
        (apiError.message.includes('Invalid credentials') ||
          apiError.message.includes('salah') ||
          apiError.message.includes('tidak ditemukan'))
      ) {
        throw new Error('Email atau password salah.');
      }

      // Fallback to mock DB if offline
      console.warn('Backend unavailable, trying mock database:', apiError.message);
      const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
      const existingUser = usersDb.find((u: any) => u.email === email);

      if (!existingUser) {
        throw new Error('User tidak ditemukan.');
      }

      if (existingUser.passwordHash !== _mockHashPassword(password)) {
        throw new Error('Email atau password salah.');
      }

      const { passwordHash, ...userData } = existingUser;
      if (!userData.role) userData.role = 'customer';

      const sessionToken = _generateMockJWT(userData);
      localStorage.setItem('sotoys_token', sessionToken);
      localStorage.setItem('sotoys_user', JSON.stringify(userData));

      setToken(sessionToken);
      setUser(userData);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('sotoys_pending_email', email);
      if (res.otp) {
        console.log(`[SOTOYS Auth] OTP: ${res.otp}`);
        localStorage.setItem('sotoys_last_otp', res.otp);
      }
    } catch (apiError: any) {
      if (
        apiError.message &&
        (apiError.message.includes('already exists') ||
          apiError.message.includes('terdaftar'))
      ) {
        throw new Error('Email sudah terdaftar.');
      }

      // Fallback
      console.warn('Backend unavailable, using mock register:', apiError.message);
      const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
      if (usersDb.some((u: any) => u.email === email)) {
        throw new Error('Email sudah terdaftar.');
      }

      localStorage.setItem(
        'sotoys_pending_register',
        JSON.stringify({
          id: `u${Date.now()}`,
          name,
          email,
          passwordHash: _mockHashPassword(password),
          role: 'customer',
        })
      );
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const rawUser = res.user;
      const normalizedRole = (rawUser.role || 'CUSTOMER').toLowerCase() as 'customer' | 'admin';
      const userData: User = {
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        role: normalizedRole,
        addresses: rawUser.addresses || [],
      };

      const sessionToken = res.token;
      localStorage.setItem('sotoys_token', sessionToken);
      localStorage.setItem('sotoys_user', JSON.stringify(userData));
      if (res.refreshToken) {
        localStorage.setItem('sotoys_refresh_token', res.refreshToken);
      }

      setToken(sessionToken);
      setUser(userData);
    } catch (apiError: any) {
      if (
        apiError.message &&
        (apiError.message.includes('Invalid or expired OTP') ||
          apiError.message.includes('tidak valid'))
      ) {
        throw new Error('Kode OTP tidak valid atau sudah kadaluarsa.');
      }

      // Fallback
      console.warn('Backend unavailable, using mock OTP:', apiError.message);
      if (otp !== '123456') {
        throw new Error('Kode OTP tidak valid.');
      }

      const pendingUserStr = localStorage.getItem('sotoys_pending_register');
      if (!pendingUserStr) {
        throw new Error('Sesi pendaftaran tidak valid atau kadaluarsa.');
      }

      const pendingUser = JSON.parse(pendingUserStr);
      if (pendingUser.email !== email) {
        throw new Error('Email tidak cocok dengan sesi.');
      }

      const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
      usersDb.push(pendingUser);
      localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));
      localStorage.removeItem('sotoys_pending_register');

      const { passwordHash, ...userData } = pendingUser;
      const sessionToken = _generateMockJWT(userData);

      localStorage.setItem('sotoys_token', sessionToken);
      localStorage.setItem('sotoys_user', JSON.stringify(userData));

      setToken(sessionToken);
      setUser(userData);
    }
  };

  const updateProfile = async (name: string, email: string) => {
    if (!user) throw new Error('Harap login terlebih dahulu');

    try {
      await api.put('/users/profile', { name, email });
      const updatedUser = { ...user, name, email };
      setUser(updatedUser);
      localStorage.setItem('sotoys_user', JSON.stringify(updatedUser));
      return;
    } catch (apiErr: any) {
      console.warn('Backend update profile failed, checking local:', apiErr.message);
      if (apiErr.message && apiErr.message.includes('already')) {
        throw new Error('Email sudah digunakan oleh pengguna lain');
      }
    }

    // Local fallback
    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    if (email !== user.email && usersDb.some((u: any) => u.email === email)) {
      throw new Error('Email sudah digunakan oleh pengguna lain');
    }

    const idx = usersDb.findIndex((u: any) => u.id === user.id);
    if (idx !== -1) {
      usersDb[idx].name = name;
      usersDb[idx].email = email;
      localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));
    }

    const updatedUser = { ...user, name, email };
    setUser(updatedUser);
    localStorage.setItem('sotoys_user', JSON.stringify(updatedUser));
  };

  const updatePassword = async (oldPw: string, newPw: string) => {
    if (!user) throw new Error('Harap login terlebih dahulu');

    try {
      await api.put('/users/password', { oldPassword: oldPw, newPassword: newPw });
      return;
    } catch (apiErr: any) {
      console.warn('Backend update password failed, checking local:', apiErr.message);
      if (
        apiErr.message &&
        (apiErr.message.includes('Incorrect') ||
          apiErr.message.includes('salah') ||
          apiErr.message.includes('Password lama'))
      ) {
        throw new Error('Password lama salah');
      }
    }

    // Local fallback
    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    const idx = usersDb.findIndex((u: any) => u.id === user.id);
    if (idx !== -1) {
      if (usersDb[idx].passwordHash !== _mockHashPassword(oldPw)) {
        throw new Error('Password lama salah');
      }
      usersDb[idx].passwordHash = _mockHashPassword(newPw);
      localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));
    }
  };

  const saveAddress = async (addr: Omit<Address, 'id'> & { id?: string }) => {
    if (!user) throw new Error('Harap login terlebih dahulu');

    try {
      let savedAddr: Address | null = null;
      if (addr.id && !addr.id.startsWith('addr-')) {
        const res = await api.put(`/addresses/${addr.id}`, addr);
        savedAddr = res.address;
      } else {
        const { id: _, ...payload } = addr;
        const res = await api.post('/addresses', payload);
        savedAddr = res.address;
      }

      if (addr.isPrimary && savedAddr?.id) {
        await api.patch(`/addresses/${savedAddr.id}/primary`, {}).catch(() => {});
      }

      const listRes = await api.get('/addresses').catch(() => null);
      const updatedAddresses: Address[] = listRes?.addresses || (
        addr.id
          ? (user.addresses || []).map(a => a.id === addr.id ? (savedAddr || a) : (addr.isPrimary ? { ...a, isPrimary: false } : a))
          : [...(user.addresses || []).map(a => addr.isPrimary ? { ...a, isPrimary: false } : a), (savedAddr || { ...addr, id: `addr-${Date.now()}` })]
      );

      const updatedUser = { ...user, addresses: updatedAddresses };
      setUser(updatedUser);
      localStorage.setItem('sotoys_user', JSON.stringify(updatedUser));
      return;
    } catch (apiErr: any) {
      console.warn('Backend address save failed, using local session sync:', apiErr.message);
    }

    // Safe fallback that never throws "User tidak ditemukan"
    const currentAddresses: Address[] = user.addresses ? [...user.addresses] : [];
    let updatedAddresses: Address[];
    const id = addr.id || `addr-${Date.now()}`;
    const newAddr: Address = { ...addr, id };

    if (addr.isPrimary) {
      currentAddresses.forEach(a => { a.isPrimary = false; });
    }

    if (addr.id) {
      updatedAddresses = currentAddresses.map(a => a.id === addr.id ? newAddr : a);
    } else {
      if (currentAddresses.length === 0) {
        newAddr.isPrimary = true;
      }
      updatedAddresses = [...currentAddresses, newAddr];
    }

    if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isPrimary)) {
      updatedAddresses[0].isPrimary = true;
    }

    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    const idx = usersDb.findIndex((u: any) => u.id === user.id);
    if (idx !== -1) {
      usersDb[idx].addresses = updatedAddresses;
      localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));
    }

    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('sotoys_user', JSON.stringify(updatedUser));
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) throw new Error('Harap login terlebih dahulu');

    try {
      if (!addressId.startsWith('addr-')) {
        await api.delete(`/addresses/${addressId}`);
      }
      const listRes = await api.get('/addresses').catch(() => null);
      if (listRes?.addresses) {
        const updatedUser = { ...user, addresses: listRes.addresses };
        setUser(updatedUser);
        localStorage.setItem('sotoys_user', JSON.stringify(updatedUser));
        return;
      }
    } catch (apiErr: any) {
      console.warn('Backend address delete failed, using local session sync:', apiErr.message);
    }

    const currentAddresses: Address[] = user.addresses ? [...user.addresses] : [];
    let updatedAddresses = currentAddresses.filter(a => a.id !== addressId);
    if (currentAddresses.find(a => a.id === addressId)?.isPrimary && updatedAddresses.length > 0) {
      updatedAddresses[0].isPrimary = true;
    }

    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    const idx = usersDb.findIndex((u: any) => u.id === user.id);
    if (idx !== -1) {
      usersDb[idx].addresses = updatedAddresses;
      localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));
    }

    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('sotoys_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } catch (_) {}
    localStorage.removeItem('sotoys_token');
    localStorage.removeItem('sotoys_refresh_token');
    localStorage.removeItem('sotoys_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, verifyOtp, logout, updateProfile, updatePassword, saveAddress, deleteAddress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
