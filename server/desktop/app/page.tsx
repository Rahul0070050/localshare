'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { ServerCard } from '../components/ServerCard';
import { StatsOverview } from '../components/StatsOverview';
import { FolderManager } from '../components/FolderManager';
import { DevicesList } from '../components/DevicesList';
import { SettingsModal } from '../components/SettingsModal';
import { QRCodeModal } from '../components/QRCodeModal';
import {
  SharedFolder,
  ServerStatus,
  ConnectedDevice,
  ServerSettings,
  NetworkInterfaceInfo,
} from '../../../shared/types';

export default function DesktopDashboard() {
  const [status, setStatus] = useState<ServerStatus>({
    running: false,
    port: 3000,
    localIps: [],
    primaryIp: '127.0.0.1',
    sharingUrl: '',
    totalRequests: 0,
    activeVisitorsCount: 0,
    totalVisitorsCount: 0,
  });

  const [folders, setFolders] = useState<SharedFolder[]>([]);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [settings, setSettings] = useState<ServerSettings>({
    port: 3000,
    theme: 'dark',
    passwordProtection: false,
    autoStartSharing: false,
    minimizeToTray: false,
    launchAtStartup: false,
  });
  const [interfaces, setInterfaces] = useState<NetworkInterfaceInfo[]>([]);
  const [version, setVersion] = useState('1.0.0');
  const [qrDataUrl, setQrDataUrl] = useState('');

  const [isLoadingServer, setIsLoadingServer] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Check if running inside Electron
  const isElectron = typeof window !== 'undefined' && Boolean(window.localShare);

  const refreshAll = useCallback(async () => {
    if (!isElectron || !window.localShare) return;

    try {
      const [serverStatus, folderList, currentSettings, deviceList, netIfaces, appVer] =
        await Promise.all([
          window.localShare.getServerStatus(),
          window.localShare.getSharedFolders(),
          window.localShare.getSettings(),
          window.localShare.getConnectedDevices(),
          window.localShare.getNetworkInterfaces(),
          window.localShare.getAppVersion(),
        ]);

      setStatus(serverStatus);
      setFolders(folderList);
      setSettings(currentSettings);
      setDevices(deviceList);
      setInterfaces(netIfaces);
      if (appVer) setVersion(appVer);

      // Generate QR code if sharing URL is available
      if (serverStatus.sharingUrl) {
        const qr = await window.localShare.generateQRCode(serverStatus.sharingUrl);
        setQrDataUrl(qr);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, [isElectron]);

  useEffect(() => {
    refreshAll();

    if (!isElectron || !window.localShare) return;

    // Subscribe to IPC server events
    const unsubStatus = window.localShare.onServerStatusChanged(async (newStatus) => {
      setStatus(newStatus);
      if (newStatus.sharingUrl && window.localShare) {
        const qr = await window.localShare.generateQRCode(newStatus.sharingUrl);
        setQrDataUrl(qr);
      }
    });

    const unsubDevices = window.localShare.onDevicesUpdated((newDevices) => {
      setDevices(newDevices);
    });

    return () => {
      unsubStatus();
      unsubDevices();
    };
  }, [refreshAll, isElectron]);

  const handleToggleServer = async () => {
    if (!isElectron || !window.localShare) return;

    setIsLoadingServer(true);
    try {
      if (status.running) {
        await window.localShare.stopServer();
      } else {
        const res = await window.localShare.startServer();
        if (!res.success) {
          setStatus((prev) => ({ ...prev, error: res.error }));
        }
      }
      const updated = await window.localShare.getServerStatus();
      setStatus(updated);
      if (updated.sharingUrl) {
        const qr = await window.localShare.generateQRCode(updated.sharingUrl);
        setQrDataUrl(qr);
      }
    } catch (err: any) {
      console.error('Server toggle error:', err);
      setStatus((prev) => ({ ...prev, error: err.message }));
    } finally {
      setIsLoadingServer(false);
    }
  };

  const handleAddFolder = async () => {
    if (!isElectron || !window.localShare) return;

    try {
      const selectedPaths = await window.localShare.selectFolderDialog();
      if (!selectedPaths || selectedPaths.length === 0) return;

      for (const p of selectedPaths) {
        await window.localShare.addFolder(p);
      }

      const updated = await window.localShare.getSharedFolders();
      setFolders(updated);
    } catch (err) {
      console.error('Add folder error:', err);
    }
  };

  const handleRemoveFolder = async (id: string) => {
    if (!isElectron || !window.localShare) return;
    await window.localShare.removeFolder(id);
    const updated = await window.localShare.getSharedFolders();
    setFolders(updated);
  };

  const handleToggleFolder = async (id: string, enabled: boolean) => {
    if (!isElectron || !window.localShare) return;
    await window.localShare.toggleFolder(id, enabled);
    const updated = await window.localShare.getSharedFolders();
    setFolders(updated);
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    if (!isElectron || !window.localShare) return;
    await window.localShare.renameFolder(id, newName);
    const updated = await window.localShare.getSharedFolders();
    setFolders(updated);
  };

  const handleOpenFolder = async (targetPath: string) => {
    if (!isElectron || !window.localShare) return;
    await window.localShare.openFolderInExplorer(targetPath);
  };

  const handleOpenBrowser = async () => {
    if (!status.sharingUrl || !isElectron || !window.localShare) return;
    await window.localShare.openExternalUrl(status.sharingUrl);
  };

  const handleSaveSettings = async (newSettings: Partial<ServerSettings>) => {
    if (!isElectron || !window.localShare) return;
    const updated = await window.localShare.updateSettings(newSettings);
    setSettings(updated);
    const updatedStatus = await window.localShare.getServerStatus();
    setStatus(updatedStatus);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        version={version}
        isSharing={status.running}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-5 md:p-7 space-y-6">
        {/* Main Server Control Card */}
        <ServerCard
          status={status}
          isLoading={isLoadingServer}
          onToggleServer={handleToggleServer}
          onOpenQrModal={() => setIsQrModalOpen(true)}
          onOpenBrowser={handleOpenBrowser}
        />

        {/* Stats Grid */}
        <StatsOverview folders={folders} status={status} />

        {/* Folder Management Section */}
        <FolderManager
          folders={folders}
          onAddFolder={handleAddFolder}
          onRemoveFolder={handleRemoveFolder}
          onToggleFolder={handleToggleFolder}
          onRenameFolder={handleRenameFolder}
          onOpenFolder={handleOpenFolder}
        />

        {/* Connected Devices & Analytics Section */}
        <DevicesList devices={devices} />
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        version={version}
        onSave={handleSaveSettings}
      />

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        sharingUrl={status.sharingUrl}
        qrDataUrl={qrDataUrl}
        interfaces={interfaces}
        port={status.port}
      />
    </div>
  );
}
