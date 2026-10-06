import React, { useState } from 'react';
import {
  Cloud,
  Check,
  Copy,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  X,
  Share2,
  HardDrive,
  Users,
  QrCode,
} from 'lucide-react';
import { getShareableBaseUrl } from '../../utils/urlHelper';
import { QRCodeModal } from './QRCodeModal';

interface FreeCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCloudSynced: boolean;
  isSyncing: boolean;
  onSyncNow: () => Promise<void>;
  onOpenGoogleDriveBackup?: () => void;
  themeMode?: 'midnight' | 'monochrome';
}

export const FreeCloudModal: React.FC<FreeCloudModalProps> = ({
  isOpen,
  onClose,
  isCloudSynced,
  isSyncing,
  onSyncNow,
  onOpenGoogleDriveBackup,
  themeMode = 'midnight',
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  if (!isOpen) return null;

  const isDark = themeMode === 'midnight';
  const liveShareUrl = getShareableBaseUrl();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleManualSync = async () => {
    await onSyncNow();
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-5 border transition-all ${
          isDark
            ? 'bg-[#0B0F19] text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
              }`}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Free Cloud Sync & Sharing</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Free Forever
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time cloud database for multi-device sync, staff attendance & sharing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Status Card */}
        <div
          className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Cloud Engine: Google Cloud Firestore (Free Tier)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Database Active</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Every order placed, inventory movement logged, and staff selfie clock-in syncs in real-time to the cloud without extra subscription costs. Multiple phones and laptops stay updated instantly.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isDark
                  ? 'bg-white text-slate-950 hover:bg-slate-100'
                  : 'bg-slate-950 text-white hover:bg-slate-800'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Broadcasting to Cloud...' : 'Sync Current Data to Cloud Now'}</span>
            </button>
          </div>

          {syncSuccess && (
            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
              <Check className="w-3.5 h-3.5" />
              <span>All stores, orders, timecards, and menu items synced to free cloud!</span>
            </div>
          )}
        </div>

        {/* Live Sharing URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            <span>Shareable Cloud App URL (Real-Time Synchronized)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={liveShareUrl}
              className={`flex-1 px-3 py-2 text-xs rounded-xl font-mono border select-all ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
            <button
              onClick={() => handleCopy(liveShareUrl, 'share-url')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
              }`}
            >
              {copiedKey === 'share-url' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
            <a
              href={liveShareUrl}
              target="_blank"
              rel="noreferrer"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Anyone opening this link connects to the same live database for orders, rider rotation & kitchen KDS.
          </span>
        </div>

        {/* Secondary Google Drive Backup Option */}
        {onOpenGoogleDriveBackup && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs font-bold block">Need an Offline Excel Backup?</span>
                <span className="text-[10px] text-slate-400 block">
                  Export complete store P&L and timecards to your personal Google Drive
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenGoogleDriveBackup();
              }}
              className="text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer shrink-0"
            >
              Open Drive Sync ➔
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
