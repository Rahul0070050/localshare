'use client';

import React, { useState } from 'react';
import {
  Play,
  Square,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Globe,
  Radio,
  AlertTriangle,
  Wifi,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { ServerStatus } from '../../../shared/types';

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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#0f172a] to-[#0b101d] border border-slate-800/90 p-6 md:p-7 shadow-xl shadow-black/30">
      {/* Background glow when running */}
      {isRunning && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      )}

      {/* Error alert if any */}
      {status.error && (
        <div className="mb-5 flex items-center gap-2.5 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{status.error}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left Side: Status, Title, Description, and Live URL */}
        <div className="space-y-3 flex-1 min-w-0">
          {/* Status Badge Row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                isRunning
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              {isRunning ? 'Broadcasting on Local Wi-Fi' : 'Server Offline'}
            </span>

            {isRunning && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                <Radio className="w-3 h-3 text-blue-400 animate-spin" />
                Live Port {status.port}
              </span>
            )}

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              100% Offline • No Internet Required • Read-Only Security
            </span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {isRunning ? 'Sharing is Active on Your Local Network' : 'Start Sharing Folders Over Local Wi-Fi'}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {isRunning
                ? 'Any smartphone, tablet, or PC on the same Wi-Fi can view files and stream videos directly from their browser using the link below.'
                : 'Select the folders you want to share, then click Start Sharing. LocalShare creates a direct, high-speed connection over your local router.'}
            </p>
          </div>

          {/* Action / URL Bar when running */}
          {isRunning && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1.5 animate-in fade-in duration-300">
              {/* URL Pill */}
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-slate-900 border border-blue-500/30 shadow-inner">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-mono text-xs md:text-sm font-semibold text-blue-300 select-all tracking-tight">
                  {status.sharingUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Copy link to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Show QR Code */}
              <button
                onClick={onOpenQrModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/70 text-xs font-semibold text-slate-200 transition cursor-pointer shadow-sm"
                title="Scan with Mobile Camera"
              >
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>Show QR Code</span>
              </button>

              {/* Open in Browser */}
              <button
                onClick={onOpenBrowser}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition cursor-pointer"
                title="Open Web File Explorer and Media Player in your browser"
              >
                <ExternalLink className="w-4 h-4 text-white" />
                <span>Open in Browser (File Explorer & Player)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side Main Action Button */}
        <div className="flex items-center justify-start lg:justify-end shrink-0">
          <button
            onClick={onToggleServer}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition shadow-lg cursor-pointer ${
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
