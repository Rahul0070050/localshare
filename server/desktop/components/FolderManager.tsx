'use client';

import React, { useState } from 'react';
import {
  FolderPlus,
  Folder,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  FolderOpen,
  FolderCheck,
} from 'lucide-react';
import { SharedFolder } from '../../../shared/types';

interface FolderManagerProps {
  folders: SharedFolder[];
  onAddFolder: () => Promise<void>;
  onRemoveFolder: (id: string) => Promise<void>;
  onToggleFolder: (id: string, enabled: boolean) => Promise<void>;
  onRenameFolder: (id: string, newName: string) => Promise<void>;
  onOpenFolder: (path: string) => Promise<void>;
}

export function FolderManager({
  folders,
  onAddFolder,
  onRemoveFolder,
  onToggleFolder,
  onRenameFolder,
  onOpenFolder,
}: FolderManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (folder: SharedFolder) => {
    setEditingId(folder.id);
    setEditName(folder.displayName);
  };

  const saveRename = async (id: string) => {
    if (editName.trim()) {
      await onRenameFolder(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="rounded-xl bg-gradient-to-b from-[#0f172a] to-[#0b101d] border border-slate-800/80 p-6 shadow-lg shadow-black/20 space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderCheck className="w-5 h-5 text-blue-400" />
            <span>Shared Folders</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {folders.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Only folders explicitly enabled below are accessible on your Wi-Fi network.
          </p>
        </div>

        <button
          onClick={onAddFolder}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add Folder</span>
        </button>
      </div>

      {/* Folders List or Empty State */}
      {folders.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-xl p-10 text-center space-y-4 bg-slate-900/30">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <FolderOpen className="w-7 h-7 stroke-1" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-white">No folders shared yet</div>
            <div className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Click &quot;Add Folder&quot; to pick any directory from your computer to share with local devices.
            </div>
          </div>
          <button
            onClick={onAddFolder}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition cursor-pointer shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
            <span>Select Folder from Computer</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {folders.map((folder) => {
            const isEditing = editingId === folder.id;

            return (
              <div
                key={folder.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 ${
                  folder.enabled
                    ? 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700/80'
                    : 'bg-slate-950/40 border-slate-900/70 opacity-60'
                }`}
              >
                {/* Left: Icon & Names */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-3">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      folder.enabled
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                    }`}
                  >
                    <Folder className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 max-w-md">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(folder.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="px-2.5 py-1 bg-slate-800 border border-blue-500 rounded-lg text-xs text-white focus:outline-none w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => saveRename(folder.id)}
                          className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                          title="Save Name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">
                          {folder.displayName}
                        </span>
                        <button
                          onClick={() => startEditing(folder)}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded transition cursor-pointer"
                          title="Edit Display Name"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                            folder.enabled
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                          }`}
                        >
                          {folder.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    )}

                    <div
                      className="text-xs font-mono text-slate-400 truncate mt-0.5 select-all"
                      title={folder.originalPath}
                    >
                      {folder.originalPath}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Open in File Explorer button */}
                  <button
                    onClick={() => onOpenFolder(folder.originalPath)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Open in native Windows File Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {/* Enable / Disable Switch */}
                  <label className="relative inline-flex items-center cursor-pointer ml-1" title={folder.enabled ? 'Disable sharing' : 'Enable sharing'}>
                    <input
                      type="checkbox"
                      checked={folder.enabled}
                      onChange={(e) => onToggleFolder(folder.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFolder(folder.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition ml-1 cursor-pointer"
                    title="Stop sharing this folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
