import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Download,
  Upload,
  Lock,
  ExternalLink,
  Shield,
  FileJson,
  AlertCircle,
} from 'lucide-react';
import {
  googleSignIn,
  logoutGoogle,
  uploadBackupToGoogleDrive,
  listGoogleDriveBackups,
  getAccessToken,
} from '../../services/firebaseAuth';
import {
  Store,
  MenuItem,
  Order,
  InventoryItem,
  Staff,
  Timecard,
  Rider,
  PromoCode,
} from '../../types';

interface GoogleDriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  allStores: Store[];
  menuItems: MenuItem[];
  orders: Order[];
  inventory: InventoryItem[];
  staffList: Staff[];
  timecards: Timecard[];
  riders: Rider[];
  promos: PromoCode[];
  onRestoreData?: (data: any) => void;
}

export const GoogleDriveBackupModal: React.FC<GoogleDriveBackupModalProps> = ({
  isOpen,
  onClose,
  store,
  allStores,
  menuItems,
  orders,
  inventory,
  staffList,
  timecards,
  riders,
  promos,
  onRestoreData,
}) => {
  if (!isOpen) return null;

  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastBackup, setLastBackup] = useState<{
    fileId: string;
    name: string;
    timestamp: string;
    link?: string;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [existingBackups, setExistingBackups] = useState<any[]>([]);

  useEffect(() => {
    // Check if already authenticated
    getAccessToken().then((token) => {
      if (token) {
        setIsConnected(true);
        loadDriveBackups();
      }
    });
  }, []);

  const loadDriveBackups = async () => {
    try {
      const files = await listGoogleDriveBackups();
      setExistingBackups(files);
    } catch (e) {
      console.warn('Failed to load drive backups:', e);
    }
  };

  const handleConnectGoogle = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setIsConnected(true);
        setUserEmail(result.user.email);
        setStatusMessage(`Connected as ${result.user.email}! Google Drive ready for automated synchronization.`);
        await loadDriveBackups();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err.message || 'Google Drive authentication could not be completed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    await logoutGoogle();
    setIsConnected(false);
    setUserEmail(null);
    setStatusMessage('Google Drive disconnected.');
  };

  const createBackupPayload = () => {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      storeId: store.id,
      storeName: store.name,
      platformFeeRate: 5,
      data: {
        stores: allStores,
        menuItems: menuItems.filter((i) => i.storeId === store.id),
        orders: orders.filter((o) => o.storeId === store.id),
        inventory: inventory.filter((i) => i.storeId === store.id),
        staffList: staffList.filter((s) => s.storeId === store.id),
        timecards: timecards.filter((t) => t.storeId === store.id),
        riders,
        promos,
      },
    };
  };

  const handleBackupNowToDrive = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const payload = createBackupPayload();
      const fileName = `GemStore_Backup_${store.name.replace(/\s+/g, '_')}_${new Date()
        .toISOString()
        .split('T')[0]}_${Date.now()}.json`;

      const result = await uploadBackupToGoogleDrive(fileName, payload);
      setLastBackup({
        fileId: result.fileId,
        name: result.name,
        timestamp: new Date().toLocaleTimeString(),
        link: result.webViewLink,
      });

      setStatusMessage(`Backup successfully saved to your Google Drive (${result.name})!`);
      await loadDriveBackups();
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Backup failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadLocalBackup = () => {
    const payload = createBackupPayload();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `GemStore_Backup_${store.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data && onRestoreData) {
          onRestoreData(parsed.data);
          setStatusMessage('Backup restored successfully into memory and storage!');
        } else {
          setStatusMessage('Invalid backup format.');
        }
      } catch (err) {
        setStatusMessage('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-700 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">Google Drive Cloud Backups</h2>
              <p className="text-xs text-emerald-100">
                Automated synchronization & disaster recovery for your store data
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Connection Status Card */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-gray-900">Google Drive Sync</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isConnected ? '● Connected' : '○ Not Connected'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {isConnected
                  ? `Authorized for: ${userEmail || 'Active Google Account'}`
                  : 'Connect your Google account to enable cloud storage backups.'}
              </p>
            </div>

            {isConnected ? (
              <button
                onClick={handleDisconnectGoogle}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>{isSyncing ? 'Connecting...' : 'Connect Google Drive'}</span>
              </button>
            )}
          </div>

          {/* Sync Trigger Card */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-xs text-emerald-950 block">Automated Sync Mode</strong>
                <span className="text-[11px] text-emerald-700">
                  Automatically syncs orders, stock movements, and timecards to Google Drive.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded-sm cursor-pointer"
              />
            </div>

            <button
              onClick={handleBackupNowToDrive}
              disabled={!isConnected || isSyncing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Uploading to Google Drive...' : 'Backup Now to Google Drive'}</span>
            </button>

            {lastBackup && (
              <div className="text-[11px] text-emerald-800 bg-white p-2.5 rounded-xl border border-emerald-200">
                <strong>Last Cloud Backup:</strong> {lastBackup.timestamp} ({lastBackup.name})
              </div>
            )}
          </div>

          {/* Existing Drive Backups List */}
          {existingBackups.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Recent Drive Backup Archives
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {existingBackups.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileJson className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-gray-900 font-medium truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(file.createdTime).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline / Local File Export & Restore */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Offline Backups & Recovery
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadLocalBackup}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Local JSON</span>
              </button>

              <label className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFromFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
