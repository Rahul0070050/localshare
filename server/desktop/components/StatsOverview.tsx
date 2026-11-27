'use client';

import React from 'react';
import { FolderCheck, Users, Activity, HardDrive } from 'lucide-react';
import { SharedFolder, ServerStatus } from '../../../shared/types';

interface StatsOverviewProps {
  folders: SharedFolder[];
  status: ServerStatus;
}

export function StatsOverview({ folders, status }: StatsOverviewProps) {
  const activeFolders = folders.filter((f) => f.enabled).length;
  const totalFolders = folders.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Shared Folders Card */}
      <div className="p-5 rounded-xl bg-gradient-to-b from-[#0f172a] to-[#0b101d] border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-md shadow-black/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shared Folders</span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FolderCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-baseline gap-1.5">
            <span>{activeFolders}</span>
            <span className="text-xs font-medium text-slate-500">/ {totalFolders} total</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {activeFolders === 1 ? '1 folder active' : `${activeFolders} folders active`}
          </div>
        </div>
      </div>

      {/* 2. Connected Devices Card */}
      <div className="p-5 rounded-xl bg-gradient-to-b from-[#0f172a] to-[#0b101d] border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-md shadow-black/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Connected Devices</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-baseline gap-1.5">
            <span>{status.activeVisitorsCount}</span>
            <span className="text-xs font-medium text-slate-500">
              ({status.totalVisitorsCount} total)
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {status.activeVisitorsCount === 1 ? '1 active visitor right now' : `${status.activeVisitorsCount} active visitors right now`}
          </div>
        </div>
      </div>

      {/* 3. HTTP Requests Card */}
      <div className="p-5 rounded-xl bg-gradient-to-b from-[#0f172a] to-[#0b101d] border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-md shadow-black/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">HTTP Requests</span>
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {status.totalRequests.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Files & directories served
          </div>
        </div>
      </div>

      {/* 4. Local IPv4 Card */}
      <div className="p-5 rounded-xl bg-gradient-to-b from-[#0f172a] to-[#0b101d] border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-md shadow-black/20 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Local IPv4</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xl lg:text-2xl font-mono font-bold text-slate-200 tracking-tight truncate select-all">
            {status.primaryIp || '127.0.0.1'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Listening on Port {status.port}
          </div>
        </div>
      </div>
    </div>
  );
}
