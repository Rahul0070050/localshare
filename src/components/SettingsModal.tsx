'use client';

import React, { useState } from 'react';
import { X, Lock, Server, Sun, Moon, Laptop, Power, Minimize2, Info, Check } from 'lucide-react';
import { ServerSettings } from '../shared/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ServerSettings;
  version: string;
  onSave: (newSettings: Partial<ServerSettings>) => Promise<void>;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  version,
  onSave,
}: SettingsModalProps) {
  const [port, setPort] = useState(settings.port || 3000);
  const [theme, setTheme] = useState(settings.theme || 'dark');
  const [passwordProtection, setPasswordProtection] = useState(settings.passwordProtection || false);
  const [password, setPassword] = useState(settings.password || '');
  const [autoStartSharing, setAutoStartSharing] = useState(settings.autoStartSharing || false);
  const [minimizeToTray, setMinimizeToTray] = useState(settings.minimizeToTray || false);
  const [launchAtStartup, setLaunchAtStartup] = useState(settings.launchAtStartup || false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        port: Number(port),
        theme,
        passwordProtection,
        password: passwordProtection ? password : '',
        autoStartSharing,
        minimizeToTray,
        launchAtStartup,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Preferences</h3>
        <p className="text-xs text-slate-400 mb-6">Configure network sharing and application behavior</p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Server Port */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Local Server Port</div>
                  <div className="text-xs text-slate-400">HTTP port used to broadcast files (default: 3000)</div>
                </div>
              </div>
              <input
                type="number"
                min="1024"
                max="65535"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-24 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-mono text-white text-right focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password Protection */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Password Protection</div>
                  <div className="text-xs text-slate-400">Require mobile/browser users to enter a passcode</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={passwordProtection}
                  onChange={(e) => setPasswordProtection(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {passwordProtection && (
              <div className="pt-2 animate-in fade-in duration-150">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Share Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access passcode"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none"
                  required={passwordProtection}
                />
              </div>
            )}
          </div>

          {/* Launch & Tray Settings */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                  <Power className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Auto-start Sharing</div>
                  <div className="text-xs text-slate-400">Start the local server automatically when app opens</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoStartSharing}
                  onChange={(e) => setAutoStartSharing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Minimize2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Minimize to System Tray</div>
                  <div className="text-xs text-slate-400">Keep sharing files in the background when closed</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={minimizeToTray}
                  onChange={(e) => setMinimizeToTray(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Launch at Startup</div>
                  <div className="text-xs text-slate-400">Start LocalShare automatically when OS boots</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={launchAtStartup}
                  onChange={(e) => setLaunchAtStartup(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>

          {/* Theme selector */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-sm font-semibold text-white">Interface Theme</div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((t) => {
                const Icon = t.icon;
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition ${
                      active
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Version info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>LocalShare Desktop v{version}</span>
            </div>
            <span>Cross-Platform (Windows & Linux)</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
