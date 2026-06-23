import React, { useState } from 'react';
import { X, ShoppingCart, CreditCard } from 'lucide-react';
import { Product } from '../types';

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

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleVariantSelect = (type: string, option: string) => {
    setSelectedVariant(prev => ({ ...prev, [type]: option }));
  };

  const getSelectedVariantString = () => {
    return Object.entries(selectedVariant)
      .map(([type, option]) => `${type}: ${option}`)
      .join(' | ');
  };

  const handleAddToCartClick = () => {
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
              src={product.images[0] || '/assets/uploads/products/placeholder.svg'}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg bg-gray-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/uploads/products/placeholder.svg';
              }}
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
                        onClick={() => handleVariantSelect(variation.variation_type, option.name)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                          selectedVariant[variation.variation_type] === option.name
                            ? 'border-orange-500 bg-orange-50 text-orange-600 font-medium'
                            : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                        }`}
                      >
                        {option.name}
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
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition"
                disabled={quantity <= 1}
              >-</button>
              <input
                type="number"
                className="w-12 text-center text-gray-900 focus:outline-none"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition"
                disabled={quantity >= product.stock}
              >+</button>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">Stok: {product.stock} buah</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCartClick}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 border border-orange-600 text-orange-600 hover:bg-orange-50 transition"
            >
              <ShoppingCart size={18} />
              <span>Masukkan Keranjang</span>
            </button>
            <button
              onClick={handleBuyNowClick}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 bg-orange-600 text-white hover:bg-orange-700 transition"
            >
              <CreditCard size={18} />
              <span>Beli Langsung</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}