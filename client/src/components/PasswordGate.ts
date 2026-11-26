export function renderPasswordGate(): string {
  return `
    <div id="passwordGateSection" style="display: none;">
      <div class="password-box">
        <div class="password-badge-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 style="font-size: 1.3rem; font-weight: 700; color: var(--text-main);">Protected Share</h2>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.4rem;">
          The host computer requires a passcode to access these shared files.
        </p>

        <div style="position: relative;">
          <input
            type="password"
            id="passwordGateInput"
            class="password-input-control"
            placeholder="Enter access passcode"
            onkeydown="if(event.key==='Enter') LocalShareClient.submitPasswordAuth()"
          />
        </div>

        <button
          class="action-btn primary"
          style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 600;"
          onclick="LocalShareClient.submitPasswordAuth()"
        >
          Unlock & Browse Files
        </button>

        <div id="passwordGateError" style="color: var(--danger); font-size: 0.82rem; margin-top: 0.85rem; display: none;">
          Incorrect passcode. Please verify with the host computer.
        </div>
      </div>
    </div>
  `;
}
