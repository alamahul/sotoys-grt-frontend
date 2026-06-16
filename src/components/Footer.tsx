import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">SOTOYS</h3>
            <p className="text-sm">Toko mainan online terpercaya dengan harga lebih murah. Temukan koleksi mainan terbaru untuk semua usia.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-orange-500 transition-colors">Cara Belanja</Link></li>
              <li><Link to="/shipping" className="hover:text-orange-500 transition-colors">Pengiriman</Link></li>
              <li><Link to="/tracking" className="hover:text-orange-500 transition-colors">Lacak Pesanan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Kebijakan</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-orange-500 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-500 transition-colors">Kebijakan Privasi</Link></li>
              <li><Link to="/returns" className="hover:text-orange-500 transition-colors">Kebijakan Pengembalian</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Hubungi Kami</h4>
            <p className="text-sm">Email: support@sotoys.com</p>
            <p className="text-sm">WhatsApp: +62 812-3456-7890</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} SOTOYS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
