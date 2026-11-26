'use client';

import React from 'react';
import { Share2, Settings, ShieldCheck, Wifi } from 'lucide-react';

interface HeaderProps {
  version: string;
  isSharing: boolean;
  onOpenSettings: () => void;
}

export function Header({ version, isSharing, onOpenSettings }: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#0c121e]/90 backdrop-blur-md px-5 flex items-center justify-between drag-region sticky top-0 z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3 no-drag">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Share2 className="w-4 h-4 stroke-[2.4]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base tracking-tight text-white">LocalShare</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            v{version || '1.0.0'}
          </span>
        </div>
      </div>

      {/* Center Status Pill */}
      <div className="no-drag flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
        <Wifi className={`w-3.5 h-3.5 ${isSharing ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
        <span>{isSharing ? 'Local Wi-Fi Server Active' : 'Server Offline'}</span>
        <span
          className={`w-2 h-2 rounded-full ${
            isSharing ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
          }`}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 no-drag">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white transition-colors duration-150 flex items-center gap-1.5 text-xs font-medium"
          title="Settings & Configuration"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
