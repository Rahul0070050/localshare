'use client';

import React from 'react';
import { Share2, Settings, Wifi, Radio } from 'lucide-react';

interface HeaderProps {
  version: string;
  isSharing: boolean;
  onOpenSettings: () => void;
}

export function Header({ version, isSharing, onOpenSettings }: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md px-6 flex items-center justify-between drag-region sticky top-0 z-30 select-none">
      {/* Brand & App Info */}
      <div className="flex items-center gap-3 no-drag">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
          <Share2 className="w-4 h-4 stroke-[2.4]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-white">LocalShare</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
            v{version || '1.0.0'}
          </span>
        </div>
      </div>

      {/* Center Live Status Indicator */}
      <div className="no-drag hidden sm:flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
        <span
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isSharing
              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/80 animate-pulse'
              : 'bg-slate-600'
          }`}
        />
        <span className="font-medium text-[11px] tracking-wide uppercase text-slate-400">
          {isSharing ? 'Local Wi-Fi Server Active' : 'Server Offline'}
        </span>
        {isSharing && (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-2.5 h-2.5 animate-spin" />
            LIVE
          </span>
        )}
      </div>

      {/* Right Controls - Extra right margin for Windows window controls */}
      <div className="flex items-center gap-2.5 no-drag pr-32">
        <button
          onClick={onOpenSettings}
          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          title="Settings & Configuration"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
