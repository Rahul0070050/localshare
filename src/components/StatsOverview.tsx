'use client';

import React from 'react';
import { FolderCheck, Users, Activity, HardDrive } from 'lucide-react';
import { SharedFolder, ServerStatus } from '../shared/types';

interface StatsOverviewProps {
  folders: SharedFolder[];
  status: ServerStatus;
}

export function StatsOverview({ folders, status }: StatsOverviewProps) {
  const activeFolders = folders.filter((f) => f.enabled).length;
  const totalFolders = folders.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {/* Shared Folders */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/90 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Shared Folders</span>
          <FolderCheck className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">
            {activeFolders} <span className="text-xs font-normal text-slate-500">/ {totalFolders}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {activeFolders === 1 ? '1 folder shared' : `${activeFolders} folders active`}
          </div>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/90 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Connected Devices</span>
          <Users className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">
            {status.activeVisitorsCount}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({status.totalVisitorsCount} total)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {status.activeVisitorsCount === 1 ? '1 active visitor' : `${status.activeVisitorsCount} active visitors`}
          </div>
        </div>
      </div>

      {/* Total Requests */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/90 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">HTTP Requests</span>
          <Activity className="w-4 h-4 text-violet-400" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">
            {status.totalRequests}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Files & directories served
          </div>
        </div>
      </div>

      {/* Network Interface */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800/90 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Local IPv4</span>
          <HardDrive className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-3">
          <div className="text-lg font-mono font-bold text-slate-200 tracking-tight truncate">
            {status.primaryIp || '127.0.0.1'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Port {status.port}
          </div>
        </div>
      </div>
    </div>
  );
}
