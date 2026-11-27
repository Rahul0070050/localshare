'use client';

import React from 'react';
import { Smartphone, Monitor, Tablet, HelpCircle, Clock, Activity, Users } from 'lucide-react';
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
    <div className="rounded-xl bg-gradient-to-b from-[#0f172a] to-[#0b101d] border border-slate-800/80 p-6 shadow-lg shadow-black/20 space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Connected Devices</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {devices.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of smartphones, tablets, and computers on your Wi-Fi.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {activeDevices.length} Active
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold text-[11px]">
            {recentDevices.length} History
          </span>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center space-y-3 bg-slate-900/30">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-6 h-6 stroke-1" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">No devices connected yet</div>
            <div className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              When a phone or PC on your Wi-Fi opens the sharing link or scans the QR code, it will appear here in real time.
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {devices.map((device) => (
            <div
              key={device.ip + device.firstSeen}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 ${
                device.isActive
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700/80'
                  : 'bg-slate-950/40 border-slate-900/70 opacity-75'
              }`}
            >
              {/* Left: Device icon, IP, User Agent */}
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    device.isActive ? 'bg-slate-800 border border-slate-700/60' : 'bg-slate-900 border border-slate-800'
                  }`}
                >
                  {getDeviceIcon(device.deviceType)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {device.ip}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                        device.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {device.isActive ? 'Active Now' : 'Recent Visitor'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 capitalize">
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
                <div className="text-xs font-bold text-slate-200">
                  {device.requestCount} {device.requestCount === 1 ? 'request' : 'requests'}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
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
