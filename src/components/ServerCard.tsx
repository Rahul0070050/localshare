'use client';

import React, { useState } from 'react';
import {
  Play,
  Square,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Wifi,
  AlertTriangle,
  Globe,
  Radio,
} from 'lucide-react';
import { ServerStatus } from '../shared/types';

interface ServerCardProps {
  status: ServerStatus;
  isLoading: boolean;
  onToggleServer: () => Promise<void>;
  onOpenQrModal: () => void;
  onOpenBrowser: () => void;
}

export function ServerCard({
  status,
  isLoading,
  onToggleServer,
  onOpenQrModal,
  onOpenBrowser,
}: ServerCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!status.sharingUrl) return;
    navigator.clipboard.writeText(status.sharingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRunning = status.running;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#111827] to-[#0d131f] border border-slate-800 p-6 shadow-xl shadow-black/40">
      {/* Background glow when running */}
      {isRunning && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      )}

      {/* Error alert if any */}
      {status.error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{status.error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Side Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isRunning ? 'bg-emerald-500 shadow-lg shadow-emerald-500/60 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isRunning ? 'Broadcasting on Local Wi-Fi' : 'Server is Offline'}
            </span>
            {isRunning && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Radio className="w-3 h-3 animate-spin" />
                Live Port {status.port}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isRunning ? 'Sharing is Active' : 'Start Sharing Your Folders'}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              {isRunning
                ? 'Any smartphone, tablet or computer on the same Wi-Fi can browse and download files using the link below.'
                : 'Select the folders you want to share, then click Start Sharing to create a temporary local link.'}
            </p>
          </div>

          {/* URL Bar when running */}
          {isRunning && (
            <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-blue-500/30 shadow-inner">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-mono text-sm font-semibold text-blue-300 select-all tracking-tight">
                  {status.sharingUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Copy Link to Clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={onOpenQrModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                title="Show QR Code for Mobile"
              >
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>Show QR Code</span>
              </button>

              <button
                onClick={onOpenBrowser}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                title="Preview in Browser"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span>Open in Browser</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side Main Action Button */}
        <div className="flex items-center justify-start md:justify-end shrink-0">
          <button
            onClick={onToggleServer}
            disabled={isLoading}
            className={`flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition shadow-lg ${
              isRunning
                ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 shadow-rose-950/20'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
            } disabled:opacity-50`}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 fill-rose-300" />
                <span>Stop Sharing</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Sharing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
