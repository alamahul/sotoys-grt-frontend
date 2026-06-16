import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScannerModal({ isOpen, onClose }: ScannerModalProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [scannerId] = useState(`qr-reader-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!isOpen) return;

    // Simulate small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        scannerId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          // On Success
          scanner.clear();
          onClose();
          
          showToast(`Berhasil memindai: ${decodedText}`, 'success');
          
          // Simple routing logic based on scanned content
          if (decodedText.startsWith('ORD-') || decodedText.startsWith('TRK-')) {
            navigate('/tracking'); // Optionally, we could pass state to auto-fill the form
          } else if (decodedText.startsWith('PROD-')) {
            const prodId = decodedText.split('-')[1]; // assuming format PROD-1
            navigate(`/product/${prodId}`);
          } else {
             // Treat it as a global search or tracking search
             showToast(`Hasil pindai tidak dalam format yang dikenali`, 'info');
          }
        },
        (errorMessage) => {
          // On Error (frequent during scanning, safe to ignore)
          // console.log(errorMessage);
        }
      );

      return () => {
        scanner.clear().catch(error => {
          console.error('Failed to clear scanner', error);
        });
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, scannerId, onClose, navigate, showToast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Pindai Kode</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Arahkan kamera ke QR Code atau Barcode pada kemasan mainan atau resi pesanan Anda.
          </p>
          <div id={scannerId} className="w-full overflow-hidden rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
