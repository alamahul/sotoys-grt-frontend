/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Search from './pages/Search';
import About from './pages/About';
import Promo from './pages/Promo';
import FAQ from './pages/info/FAQ';
import Shipping from './pages/info/Shipping';
import Terms from './pages/info/Terms';
import Privacy from './pages/info/Privacy';
import Returns from './pages/info/Returns';

import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking'; // Tracking is public

import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerDetailsOrder from './pages/customer/CustomerDetailsOrder';
import CustomerNotifications from './pages/customer/CustomerNotifications';
import CustomerWishlist from './pages/customer/CustomerWishlist';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerReturnProduct from './pages/customer/CustomerReturnProduct';
import CustomerReturnTracking from './pages/customer/CustomerReturnTracking';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDetailsOrders from './pages/admin/AdminDetailsOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminDetailsProducts from './pages/admin/AdminDetailsProducts';
import AdminAnalysis from './pages/admin/AdminAnalysis';
import AdminSetting from './pages/admin/AdminSetting';

import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import ScrollToTop from './components/ScrollToTop';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex-grow flex items-center justify-center mt-6 p-8 bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-500">Halaman ini sedang dalam tahap pengembangan.</p>
        <a href="/" className="text-orange-600 hover:text-orange-700 font-bold">Kembali Ke Halaman Utama</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
                <ScrollToTop />
                <div className="flex flex-col min-h-screen bg-gray-50 font-sans relative">
                  <Routes>
                    {/* Zone 1: Guest / Public */}
                    <Route element={<CustomerLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/promo" element={<Promo />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/shipping" element={<Shipping />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/returns" element={<Returns />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/tracking" element={<OrderTracking />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/search" element={<Search />} />

                      {/* Zone 2: Customer (Protected) */}
                      <Route element={<ProtectedRoute role="customer" />}>
                        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                        <Route path="/customer/orders" element={<CustomerOrders />} />
                        <Route path="/customer/orders/:id" element={<CustomerDetailsOrder />} />
                        <Route path="/customer/return/:orderId" element={<CustomerReturnProduct />} />
                        <Route path="/customer/returns" element={<CustomerReturnTracking />} />
                        <Route path="/customer/notifications" element={<CustomerNotifications />} />
                        <Route path="/wishlist" element={<CustomerWishlist />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/customer/profile" element={<CustomerProfile />} />
                      </Route>

                      <Route path="*" element={<PlaceholderPage title="404 - Halaman Tidak Ditemukan" />} />
                    </Route>

                    {/* Admin Specific Login Route */}
                    <Route path="/admin-sotoys-grt/login" element={<AdminLogin />} />

                    {/* Zone 3: Admin (Protected) */}
                    <Route element={<ProtectedRoute role="admin" />}>
                      <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/orders" element={<AdminOrders />} />
                        <Route path="/admin/orders/:id" element={<AdminDetailsOrders />} />
                        <Route path="/admin/products" element={<AdminProducts />} />
                        <Route path="/admin/products/:id" element={<AdminDetailsProducts />} />
                        <Route path="/admin/analysis" element={<AdminAnalysis />} />
                        <Route path="/admin/settings" element={<AdminSetting />} />
                      </Route>
                    </Route>
                  </Routes>
                </div>
              </Router>
            </ToastProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}