'use client';

import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ExternalLink, Smartphone, AlertCircle } from 'lucide-react';
import { NetworkInterfaceInfo } from '../../../shared/types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharingUrl: string;
  qrDataUrl: string;
  interfaces: NetworkInterfaceInfo[];
  port: number;
  onSelectInterfaceIp?: (ip: string) => void;
}

export function QRCodeModal({
  isOpen,
  onClose,
  sharingUrl,
  qrDataUrl,
  interfaces,
  port,
}: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sharingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#0f172a] to-[#0b101d] border border-slate-800/90 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Scan with Mobile Device</h3>
          <p className="text-xs text-slate-400 mt-1">
            Connect to the same Wi-Fi network and scan using your camera app
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-xl flex items-center justify-center mx-auto max-w-[260px] shadow-lg shadow-black/40">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="LocalShare QR Code" className="w-full aspect-square" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* Sharing URL Bar */}
        <div className="mt-5 bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="font-mono text-xs text-blue-400 truncate select-all">{sharingUrl}</div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Alternate interfaces if multiple */}
        {interfaces.length > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Available Network Adapters:</span>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {interfaces.map((iface) => (
                <div
                  key={iface.address}
                  className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800"
                >
                  <span className="text-slate-300 font-mono">{iface.address}:{port}</span>
                  <span className="text-slate-500 text-[10px] truncate max-w-[120px]">{iface.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>No internet required. Both devices must be on the same local Wi-Fi or router.</span>
        </div>
      </div>
    </div>
  );
}
