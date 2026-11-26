'use client';

import React from 'react';
import { Smartphone, Monitor, Tablet, HelpCircle, Clock, Activity, ShieldAlert } from 'lucide-react';
import { ConnectedDevice } from '../../../shared/types';
import { formatTimeAgo } from '../lib/utils';

interface DevicesListProps {
  devices: ConnectedDevice[];
}

export function DevicesList({ devices }: DevicesListProps) {
  const activeDevices = devices.filter((d) => d.isActive);
  const recentDevices = devices.filter((d) => !d.isActive);

  const getDeviceIcon = (type: ConnectedDevice['deviceType']) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-amber-400" />;
      case 'desktop':
        return <Monitor className="w-4 h-4 text-blue-400" />;
      default:
        return <Monitor className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Connected Devices & Activity</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {devices.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Devices on your Wi-Fi that visited the sharing URL. Active devices visited within the last 2 minutes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {activeDevices.length} Active
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
            {recentDevices.length} Recent
          </span>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="border border-slate-800/80 rounded-xl p-6 text-center text-slate-400 text-xs bg-slate-900/40">
          No external devices have connected yet. Scan the QR code or open the sharing link on another device to start.
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {devices.map((device) => (
            <div
              key={device.ip + device.firstSeen}
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                device.isActive
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-950/50 border-slate-900/80 opacity-75'
              }`}
            >
              {/* Left: Device icon, IP, User Agent */}
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <div
                  className={`p-2 rounded-lg ${
                    device.isActive ? 'bg-slate-800' : 'bg-slate-900'
                  }`}
                >
                  {getDeviceIcon(device.deviceType)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {device.ip}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.2 rounded-full ${
                        device.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {device.isActive ? 'Active Now' : 'Recent Visitor'}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {device.deviceType}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 truncate mt-0.5" title={device.userAgent}>
                    {device.userAgent || 'Web Browser'}
                  </div>
                </div>
              </div>

              {/* Right: Requests and Last Seen */}
              <div className="text-right shrink-0">
                <div className="text-xs font-semibold text-slate-300">
                  {device.requestCount} {device.requestCount === 1 ? 'request' : 'requests'}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(device.lastSeen)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
