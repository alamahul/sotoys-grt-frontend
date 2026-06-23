import React from 'react';
import { Store, Target, Users, MapPin } from 'lucide-react';
import GoogleMapAddress from '../components/GoogleMapsAddress';
export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <div className="bg-orange-600 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Tentang SOTOYS GARUT</h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed">
            Menghadirkan kebahagiaan dan keceriaan bagi keluarga Indonesia melalui koleksi mainan edukatif dan berkualitas tinggi sejak 2020.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Store className="text-orange-600 mr-3" size={32} /> Cerita Kami
            </h2>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>
                Berawal dari kecintaan kami terhadap perkembangan anak melalui media bermain, SOTOYS GARUT didirikan dengan misi sederhana: menyediakan akses ke mainan yang tidak hanya menyenangkan, tetapi juga merangsang kreativitas dan kecerdasan.
              </p>
              <p>
                Dari sebuah toko kecil di pusat kota Garut, kami kini telah berkembang menjadi platform e-commerce terpercaya yang melayani pelanggan di seluruh pelosok Nusantara. Komitmen kami tetap sama: kualitas, keamanan, dan senyum anak-anak.
              </p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1609713292783-5e45ec29b62d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Toko Sotoys" className="w-full h-100 object-cover" />
          </div>
        </div>

        {/* Value Section */}
        <div className="bg-gray-50 rounded-3xl p-10 md:p-16 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Nilai Inti Kami</h2>
            <p className="text-gray-500 mt-4">Prinsip yang membimbing setiap layanan kami</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kualitas Terjamin</h3>
              <p className="text-gray-600">Semua produk telah melewati seleksi ketat dan memenuhi standar SNI untuk keamanan anak Anda.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fokus Pelanggan</h3>
              <p className="text-gray-600">Kepuasan pelanggan adalah prioritas utama. Tim kami berdedikasi memberikan layanan terbaik.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Jangkauan Luas</h3>
              <p className="text-gray-600">Berlokasi di Garut, kami mendistribusikan kebahagiaan ke setiap rumah di seluruh Indonesia dengan cepat.</p>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Kunjungi Toko Offline Kami</h2>
          <p className="text-gray-600 text-lg mb-8">
            Ingin melihat koleksi mainan kami secara langsung? Silakan datang ke toko fisik kami di Garut. Tim kami siap menyambut dan membantu Anda.
          </p>
          <div className="inline-flex items-center bg-orange-50 border border-orange-200 px-6 py-4 rounded-xl text-orange-800 font-medium">
            <MapPin className="mr-3 text-orange-600" size={24} />
            <span>RT02 RW06, Kp.Cikarag, Mekarsari, Kec. Cibatu, Kabupaten Garut, Jawa Barat 44185</span>
            
          </div>
            <GoogleMapAddress />
        </div>
      </div>
    </div>
  );
}
