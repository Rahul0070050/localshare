import { h } from 'preact';
import { ShareIcon, SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNavigateHome: () => void;
}

export function Header({ theme, onToggleTheme, onNavigateHome }: HeaderProps) {
  return (
    <header class="client-header">
      <div class="header-inner">
        <div class="brand-wrapper" onClick={onNavigateHome}>
          <div class="brand-badge-icon">
            <ShareIcon size={22} />
          </div>
          <div>
            <div class="brand-title">
              <span>LocalShare</span>
              <span class="live-badge">
                <span class="live-badge-dot" />
                Local Wi-Fi
              </span>
            </div>
            <div class="brand-subtitle">High-Speed Local Network File Explorer</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            class="btn-toggle"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
