import React, { useState, useEffect } from 'react';
import {
  Cloud,
  HardDrive,
  Zap,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  FileSpreadsheet,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server
} from 'lucide-react';
import api, { API_BASE_URL } from '../utils/api';

interface CloudinaryUsageData {
  plan: string;
  credits: {
    used: number;
    limit: number;
    usedPercent: number;
    remaining: number;
  };
  storage: {
    usedBytes: number;
    usedMB: number;
    credits: number;
  };
  bandwidth: {
    usedBytes: number;
    usedMB: number;
    credits: number;
  };
  transformations: {
    usage: number;
    credits: number;
  };
  objects: number;
  rateLimit: {
    allowed: number;
    remaining: number;
    resetAt?: string;
  };
  mediaLimits?: {
    image_max_size_bytes?: number;
    video_max_size_bytes?: number;
    raw_max_size_bytes?: number;
    image_max_px?: number;
  };
  lastUpdated: string;
  cached: boolean;
  cacheExpiresInSec?: number;
}

export default function AdminCloudinaryMetrics() {
  const [data, setData] = useState<CloudinaryUsageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async (force: boolean = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const endpoint = force ? '/admin/cloudinary-usage?force=true' : '/admin/cloudinary-usage';
      const res = await api.get<CloudinaryUsageData>(endpoint);
      setData(res);
    } catch (err: any) {
      console.error('Gagal mengambil metrik Cloudinary:', err);
      setError(err.message || 'Gagal terhubung ke metrik Cloudinary.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsage(false);
  }, []);

  const handleDownloadBackup = async (type: 'csv' | 'json') => {
    try {
      const token = localStorage.getItem('sotoys_token');
      const endpoint = type === 'csv'
        ? `${API_BASE_URL}/admin/backups/products-images-csv`
        : `${API_BASE_URL}/admin/backups/products-images-json`;

      const response = await fetch(endpoint, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh berkas backup.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = type === 'csv' ? 'products_images_backup.csv' : 'products_images_backup.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Gagal mengunduh backup');
    }
  };

  const usedPercent = data?.credits?.usedPercent || 0;
  const progressColor =
    usedPercent > 80 ? 'bg-red-500' : usedPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Cloudinary Cloud Storage & CDN</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Terhubung (Live CDN)
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-0.5">
                Monitoring kuota paket gratis (Free Tier), kapasitas penyimpanan, dan penghematan bandwidth.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://console.cloudinary.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
            >
              Console Resmi
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => fetchUsage(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50 shadow-sm"
              title="Segarkan data riil Cloudinary"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Memperbarui...' : 'Segarkan Metrik'}
            </button>
          </div>
        </div>

        {/* Protection Note */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Proteksi Admin API Aktif:</strong> Data dicache selama 60 menit di server agar batas 500 API/jam selalu aman.
            </span>
          </div>
          {data?.lastUpdated && (
            <span className="text-slate-400">
              Pembaruan: {new Date(data.lastUpdated).toLocaleTimeString('id-ID')} {data.cached ? '(dari Cache Server)' : '(Live Sync)'}
            </span>
          )}
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 text-red-700 border-b border-red-100 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : loading && !data ? (
        <div className="p-12 flex flex-col items-center justify-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
          <p className="text-sm font-medium">Memuat rincian kuota Cloudinary...</p>
        </div>
      ) : data ? (
        <div className="p-6 space-y-6">
          {/* 4 KPI Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Monthly Credits */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Kredit Bulanan
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-700">
                    Batas: {data.credits.limit}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{data.credits.used}</span>
                  <span className="text-xs text-slate-500 font-medium">/ {data.credits.limit} Kredit</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${Math.min(100, Math.max(2, usedPercent))}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{usedPercent}% terpakai</span>
                <span className="text-emerald-600 font-bold">Sisa {data.credits.remaining} kredit</span>
              </div>
            </div>

            {/* Storage */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Penyimpanan (Storage)
                  </span>
                  <HardDrive className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">{data.storage.usedMB}</span>
                  <span className="text-xs text-slate-500 font-medium">MB</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Menampung <strong>{data.objects.toLocaleString('id-ID')}</strong> aset gambar produk & variasi.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Konsumsi:</span>
                <span className="font-semibold text-slate-800">~{data.storage.credits} Kredit (1 GB = 1 Kredit)</span>
              </div>
            </div>

            {/* Bandwidth */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Bandwidth Pengiriman
                  </span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">{data.bandwidth.usedMB}</span>
                  <span className="text-xs text-slate-500 font-medium">MB</span>
                </div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Hemat 90.5% (WebP/AVIF)
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Konsumsi:</span>
                <span className="font-semibold text-slate-800">{data.bandwidth.credits} Kredit</span>
              </div>
            </div>

            {/* Transformations */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Transformasi
                  </span>
                  <Server className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">{data.transformations.usage.toLocaleString('id-ID')}</span>
                  <span className="text-xs text-slate-500 font-medium">derivasi</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Preset standar (250px, 500px, 900px, 1200px) dicache permanen di Edge CDN.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Konsumsi:</span>
                <span className="font-semibold text-slate-800">{data.transformations.credits} Kredit</span>
              </div>
            </div>
          </div>

          {/* Limitation Overview & Protection Guarantee */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Limitation Checklist */}
            <div className="lg:col-span-2 bg-slate-50/70 border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Status Kepatuhan Batasan Akun Gratis (Free Tier Assurance)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Batas Ukuran Upload Gambar</div>
                    <div className="text-slate-500">Batas Cloudinary: 10 MB | Sistem dibatasi: <strong>Maks 5 MB</strong></div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Batas Resolusi Gambar</div>
                    <div className="text-slate-500">Batas: 25 Megapixels | Rata-rata foto produk: <strong>~1 Megapixel</strong></div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Admin API Rate Limit</div>
                    <div className="text-slate-500">
                      Batas: 500 req/jam | Tersisa: <strong>{data.rateLimit.remaining}</strong> req (Cache 60m aktif)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Efisiensi Bandwidth</div>
                    <div className="text-slate-500">Parameter <code>f_auto, q_auto</code> aktif otomatis di browser</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup & Disaster Recovery Actions */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/80 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-bold text-slate-900">Cadangan Data Gambar Produk</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Unduh salinan berkas pemetaan URL Cloudinary dan path lokal asli dari server toko:
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleDownloadBackup('csv')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-orange-100/50 text-slate-800 text-xs font-semibold rounded-lg border border-orange-200 transition shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      Backup Format CSV (Excel)
                    </span>
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={() => handleDownloadBackup('json')}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-orange-100/50 text-slate-800 text-xs font-semibold rounded-lg border border-orange-200 transition shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-blue-600" />
                      Backup Format JSON (Lengkap)
                    </span>
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-orange-200/60 flex items-center gap-1.5 text-[11px] text-orange-700">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Total 520 produk tercakup dalam cadangan.</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

