import React, { useState } from 'react';
import { Database, Server, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

interface BackupEntry {
  id: string;
  timestamp: string;
  type: 'AUTO' | 'MANUAL';
  size: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
}

const mockLogs: LogEntry[] = [
  { id: 'log-1', timestamp: '2023-11-01 14:32:45', action: 'CREATE_ORDER', user: 'system', details: 'Order ORD-12348 created', status: 'SUCCESS' },
  { id: 'log-2', timestamp: '2023-11-01 13:15:22', action: 'UPDATE_STOCK', user: 'admin@sotoys.com', details: 'Product PROD-4 stock updated from 15 to 50', status: 'SUCCESS' },
  { id: 'log-3', timestamp: '2023-11-01 10:05:11', action: 'LOGIN_ATTEMPT', user: 'unknown', details: 'Failed login attempt for admin@sotoys.com from IP 192.168.1.10', status: 'WARNING' },
  { id: 'log-4', timestamp: '2023-10-31 23:59:59', action: 'DB_BACKUP_AUTO', user: 'system', details: 'Daily automated backup completed successfully', status: 'SUCCESS' },
  { id: 'log-5', timestamp: '2023-10-31 16:20:05', action: 'DELETE_USER', user: 'admin@sotoys.com', details: 'Deleted inactive user account u-9812', status: 'SUCCESS' },
];

const mockBackups: BackupEntry[] = [
  { id: 'bck-1', timestamp: '2023-10-31 23:59:59', type: 'AUTO', size: '154.2 MB', status: 'COMPLETED' },
  { id: 'bck-2', timestamp: '2023-10-30 23:59:59', type: 'AUTO', size: '153.8 MB', status: 'COMPLETED' },
  { id: 'bck-3', timestamp: '2023-10-29 14:30:00', type: 'MANUAL', size: '151.0 MB', status: 'COMPLETED' },
];

export default function AdminDatabaseLogs() {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [backups, setBackups] = useState<BackupEntry[]>(mockBackups);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const { showToast } = useToast();

  const handleManualBackup = () => {
    setIsBackingUp(true);
    showToast('Proses pencadangan database dimulai...', 'info');
    
    setTimeout(() => {
      const newBackup: BackupEntry = {
        id: `bck-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'MANUAL',
        size: '155.1 MB',
        status: 'COMPLETED'
      };
      
      setBackups([newBackup, ...backups]);
      setIsBackingUp(false);
      showToast('Pencadangan database berhasil diselesaikan', 'success');
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': 
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" /> Sukses</span>;
      case 'WARNING': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"><AlertCircle size={12} className="mr-1" /> Peringatan</span>;
      case 'ERROR': 
      case 'FAILED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><AlertCircle size={12} className="mr-1" /> Gagal</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"><RefreshCw size={12} className="mr-1 animate-spin" /> Prosesing</span>;
      default: 
        return null;
    }
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Backups Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-4">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Status Pencadangan Database</h2>
              <p className="text-sm text-gray-500 mt-1">Riwayat pencadangan data sistem SOTOYS.</p>
            </div>
          </div>
          <button 
            onClick={handleManualBackup}
            disabled={isBackingUp}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition flex items-center disabled:bg-gray-400"
          >
            <RefreshCw size={16} className={`mr-2 ${isBackingUp ? 'animate-spin' : ''}`} />
            {isBackingUp ? 'Mencadangkan...' : 'Cadangkan Sekarang'}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-semibold text-gray-700">Waktu</th>
                <th className="p-4 font-semibold text-gray-700">Tipe</th>
                <th className="p-4 font-semibold text-gray-700">Ukuran</th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {backups.map(backup => (
                <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center">
                    <Clock size={16} className="text-gray-400 mr-2" /> {backup.timestamp}
                  </td>
                  <td className="p-4 text-gray-600">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {backup.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{backup.size}</td>
                  <td className="p-4">{getStatusBadge(backup.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center bg-white">
          <div className="p-2 bg-gray-50 text-gray-600 rounded-lg mr-4 border border-gray-200">
            <Server size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Log Aktivitas Sistem</h2>
            <p className="text-sm text-gray-500 mt-1">Audit trail aktivitas dan operasi kritikal pada sistem.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-semibold text-gray-700">Waktu / Timestamp</th>
                <th className="p-4 font-semibold text-gray-700">Aksi</th>
                <th className="p-4 font-semibold text-gray-700">Pengguna</th>
                <th className="p-4 font-semibold text-gray-700">Detail Lengkap</th>
                <th className="p-4 font-semibold text-gray-700 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-4">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-800 border border-gray-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700 font-medium">{log.user}</td>
                  <td className="p-4 text-gray-600 max-w-xs md:max-w-md truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="p-4 text-right">{getStatusBadge(log.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
