import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

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
  login: (email: string, password: string) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    const existingUser = usersDb.find((u: any) => u.email === email);

    if (!existingUser) {
      throw new Error('User tidak ditemukan.');
    }

    if (existingUser.passwordHash !== _mockHashPassword(password)) {
      throw new Error('Email atau password salah.');
    }

    const { passwordHash, ...userData } = existingUser;
    
    // Ensure existing generic users become customers
    if (!userData.role) userData.role = 'customer';

    const sessionToken = _generateMockJWT(userData);

    localStorage.setItem('sotoys_token', sessionToken);
    localStorage.setItem('sotoys_user', JSON.stringify(userData));
    
    setToken(sessionToken);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    if (usersDb.some((u: any) => u.email === email)) {
      throw new Error('Email sudah terdaftar.');
    }

    // We don't save the user yet, wait for OTP validation
    // In a real app, we'd send an OTP to the email now.
    localStorage.setItem('sotoys_pending_register', JSON.stringify({
      id: `u${Date.now()}`,
      name,
      email,
      passwordHash: _mockHashPassword(password),
      role: 'customer'
    }));
    
    // Simulate sending OTP (assuming fixed OTP '123456' for mock)
    console.log('Mock OTP sent: 123456');
  };

  const verifyOtp = async (email: string, otp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

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

    // Save to simulated DB
    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    usersDb.push(pendingUser);
    localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));
    localStorage.removeItem('sotoys_pending_register');

    // Auto login
    const { passwordHash, ...userData } = pendingUser;
    const sessionToken = _generateMockJWT(userData);

    localStorage.setItem('sotoys_token', sessionToken);
    localStorage.setItem('sotoys_user', JSON.stringify(userData));
    
    setToken(sessionToken);
    setUser(userData);
  };

  const updateProfile = async (name: string, email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!user) throw new Error('Harap login terlebih dahulu');

    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    
    // Check if new email is already taken by someone else
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
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!user) throw new Error('Harap login terlebih dahulu');

    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    const idx = usersDb.findIndex((u: any) => u.id === user.id);

    if (idx === -1 || usersDb[idx].passwordHash !== _mockHashPassword(oldPw)) {
      throw new Error('Password lama salah');
    }

    usersDb[idx].passwordHash = _mockHashPassword(newPw);
    localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));
  };

  const saveAddress = async (addr: Omit<Address, 'id'> & { id?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!user) throw new Error('Harap login terlebih dahulu');

    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    const idx = usersDb.findIndex((u: any) => u.id === user.id);
    if (idx === -1) throw new Error('User tidak ditemukan');

    const userInDb = usersDb[idx];
    const currentAddresses: Address[] = userInDb.addresses || [];

    let updatedAddresses: Address[];
    const id = addr.id || `addr-${Date.now()}`;
    const newAddr: Address = { ...addr, id };

    if (addr.isPrimary) {
      currentAddresses.forEach(a => a.isPrimary = false);
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

    usersDb[idx].addresses = updatedAddresses;
    localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));

    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('sotoys_user', JSON.stringify(updatedUser));
  };

  const deleteAddress = async (addressId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!user) throw new Error('Harap login terlebih dahulu');

    const usersDb = JSON.parse(localStorage.getItem('sotoys_users_db') || '[]');
    const idx = usersDb.findIndex((u: any) => u.id === user.id);
    if (idx === -1) throw new Error('User tidak ditemukan');

    const userInDb = usersDb[idx];
    const currentAddresses: Address[] = userInDb.addresses || [];
    let updatedAddresses = currentAddresses.filter(a => a.id !== addressId);

    if (currentAddresses.find(a => a.id === addressId)?.isPrimary && updatedAddresses.length > 0) {
      updatedAddresses[0].isPrimary = true;
    }

    usersDb[idx].addresses = updatedAddresses;
    localStorage.setItem('sotoys_users_db', JSON.stringify(usersDb));

    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('sotoys_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem('sotoys_token');
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
