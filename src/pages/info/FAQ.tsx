import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

// Data FAQ yang sudah dikategorikan
const faqData = [
  {
    id: 1,
    category: 'Pemesanan',
    question: 'Bagaimana cara memesan mainan di SOTOYS?',
    answer: 'Pilih produk yang Anda inginkan di halaman katalog, klik tombol "Masukkan Keranjang", lalu ikuti proses checkout dengan mengisi alamat pengiriman dan memilih metode pembayaran.'
  },
  {
    id: 2,
    category: 'Pemesanan',
    question: 'Apakah ada minimum pembelian?',
    answer: 'Tidak ada minimum pembelian. Anda bebas berbelanja dalam jumlah berapapun di toko kami.'
  },
  {
    id: 3,
    category: 'Pembayaran',
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer: 'Kami menerima Transfer Bank (BCA, Mandiri, BNI, BRI), Virtual Account, e-Wallet (OVO, GoPay, Dana, ShopeePay), dan Kartu Kredit/Debit.'
  },
  {
    id: 4,
    category: 'Pembayaran',
    question: 'Berapa lama batas waktu pembayaran?',
    answer: 'Batas waktu pembayaran adalah 24 jam setelah Anda menyelesaikan proses checkout. Jika melewati batas waktu tersebut, pesanan akan otomatis dibatalkan.'
  },
  {
    id: 5,
    category: 'Pengiriman',
    question: 'Kapan pesanan saya akan dikirim?',
    answer: 'Pesanan yang pembayarannya dikonfirmasi sebelum jam 15:00 WIB akan dikirim pada hari yang sama. Setelah jam tersebut, akan dikirim keesokan harinya (hari kerja).'
  },
  {
    id: 6,
    category: 'Pengiriman',
    question: 'Apakah SOTOYS melayani pengiriman ke luar pulau?',
    answer: 'Tentu! Kami melayani pengiriman ke seluruh wilayah di Indonesia menggunakan jasa ekspedisi terpercaya (JNE, J&T, SiCepat, AnterAja).'
  },
  {
    id: 7,
    category: 'Pengembalian',
    question: 'Bagaimana jika mainan yang saya terima rusak?',
    answer: 'Jangan khawatir! Anda dapat mengajukan retur maksimal 2x24 jam setelah barang diterima. Pastikan Anda menyertakan video unboxing sebagai bukti.'
  }
];

const categories = ['Semua', 'Pemesanan', 'Pembayaran', 'Pengiriman', 'Pengembalian'];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [openFaqId, setOpenFaqId] = useState(null);

  // Fungsi untuk buka/tutup accordion
  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  // Filter FAQ berdasarkan pencarian dan kategori
  const filteredFaqs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === 'Semua' || faq.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Pusat Bantuan & FAQ
          </h1>
          <p className="text-lg text-gray-600">
            Temukan jawaban untuk pertanyaan yang sering diajukan seputar SOTOYS.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm shadow-sm transition-shadow"
            placeholder="Cari pertanyaan atau kata kunci... (misal: pengiriman, rusak)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:border-orange-200"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openFaqId === faq.id ? (
                    <ChevronUp className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {openFaqId === faq.id && (
                  <div className="px-6 pb-5">
                    <div className="pt-2 border-t border-gray-50">
                      <p className="text-gray-600 text-sm leading-relaxed mt-3">
                        {faq.answer}
                      </p>
                      <span className="inline-block mt-3 px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded">
                        Kategori: {faq.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">Tidak ada pertanyaan yang cocok dengan pencarian Anda.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('Semua');
                }}
                className="mt-4 text-orange-600 font-medium hover:underline"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <div className="mt-16 text-center max-w-2xl mx-auto bg-orange-50 rounded-2xl p-8 border border-orange-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Masih butuh bantuan?</h3>
          <p className="text-gray-600 mb-6">
            Tim Customer Service kami siap membantu Anda setiap hari dari jam 09:00 - 17:00 WIB.
          </p>
          <button className="inline-flex items-center px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-sm hover:shadow">
            <MessageCircle size={20} className="mr-2" />
            Hubungi Customer Service
          </button>
        </div>
      </div>
    </div>
  );
}