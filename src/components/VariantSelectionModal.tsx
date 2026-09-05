import React, { useState } from 'react';
import { X, ShoppingCart, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';
import { Product } from '../types';
import { getImageUrl, handleImageError } from '../utils/api';

interface VariantSelectionModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (quantity: number, variant: { type: string; option: string } | null) => void;
  onBuyNow: (quantity: number, variant: { type: string; option: string } | null) => void;
}

export default function VariantSelectionModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onBuyNow 
}: VariantSelectionModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleVariantSelect = (type: string, optionName: string, optionImage?: string | null) => {
    setSelectedVariant(prev => ({ ...prev, [type]: optionName }));
    if (optionImage) {
      setPreviewImage(optionImage);
    }
  };

  const getSelectedVariantString = () => {
    return Object.entries(selectedVariant)
      .map(([type, option]) => `${type}: ${option}`)
      .join(' | ');
  };

  const handleAddToCartClick = () => {
    if (product.stock <= 0) {
      Swal.fire({
        title: 'Stok Habis!',
        text: `Maaf, stok untuk produk "${product.name}" saat ini sedang kosong.`,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
      });
      return;
    }
    const variant = product.variations && Object.keys(selectedVariant).length > 0
      ? { 
          type: product.variations[0]?.variation_type || '', 
          option: Object.values(selectedVariant)[0] || '' 
        }
      : null;
    onAddToCart(quantity, variant);
    onClose();
  };

  const handleBuyNowClick = () => {
    if (product.stock <= 0) {
      Swal.fire({
        title: 'Stok Habis!',
        text: `Maaf, stok untuk produk "${product.name}" saat ini sedang kosong.`,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ea580c',
      });
      return;
    }
    const variant = product.variations && Object.keys(selectedVariant).length > 0
      ? { 
          type: product.variations[0]?.variation_type || '', 
          option: Object.values(selectedVariant)[0] || '' 
        }
      : null;
    onBuyNow(quantity, variant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Pilih Varian Produk</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-3 mb-4">
            <img
              src={getImageUrl(previewImage || product.images[0])}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg bg-gray-100 border border-gray-200"
              onError={handleImageError}
            />
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
              <p className="text-orange-600 font-bold mt-1">{formatCurrency(product.price)}</p>
              {Object.keys(selectedVariant).length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Varian: <span className="font-medium">{getSelectedVariantString()}</span>
                </p>
              )}
            </div>
          </div>

          {product.variations && product.variations.length > 0 && (
            <div className="space-y-4 mb-4">
              {product.variations.map((variation, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{variation.variation_type}</h4>
                  <div className="flex flex-wrap gap-2">
                    {variation.variation_options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleVariantSelect(variation.variation_type, option.name, option.image)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl border-2 transition-all cursor-pointer ${
                          selectedVariant[variation.variation_type] === option.name
                            ? 'border-orange-600 bg-orange-50 text-orange-600 font-bold shadow-xs'
                            : 'border-gray-200 hover:border-orange-200 bg-white text-gray-700'
                        }`}
                      >
                        {option.image && (
                          <img
                            src={getImageUrl(option.image)}
                            alt={option.name}
                            className="w-5 h-5 object-cover rounded shrink-0 border border-gray-200"
                            onError={handleImageError}
                          />
                        )}
                        <span>{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6">
            <span className="text-sm font-semibold text-gray-700 block mb-2">Jumlah</span>
            <div className="flex items-center border border-gray-300 rounded-md w-32">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1 || product.stock <= 0}
              >-</button>
              <input
                type="number"
                className="w-12 text-center text-gray-900 focus:outline-none"
                value={product.stock <= 0 ? 0 : quantity}
                disabled={product.stock <= 0}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity >= product.stock || product.stock <= 0}
              >+</button>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              {product.stock <= 0 ? (
                <span className="text-red-500 font-semibold">Stok Habis (0)</span>
              ) : (
                `Stok: ${product.stock} buah`
              )}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCartClick}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 border transition ${
                product.stock <= 0
                  ? 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 cursor-pointer'
                  : 'border-orange-600 text-orange-600 hover:bg-orange-50'
              }`}
            >
              <ShoppingCart size={18} />
              <span>{product.stock <= 0 ? 'Stok Habis' : 'Masukkan Keranjang'}</span>
            </button>
            <button
              onClick={handleBuyNowClick}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition ${
                product.stock <= 0
                  ? 'bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-pointer'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              <CreditCard size={18} />
              <span>{product.stock <= 0 ? 'Stok Habis' : 'Beli Langsung'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}