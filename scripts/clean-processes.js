/**
 * Automatically terminates any running instances of LocalShare before building.
 * Prevents Windows file locks ("output file is locked for writing").
 */
const { execSync } = require('child_process');

function killRunningProcesses() {
  try {
    if (process.platform === 'win32') {
      // Gracefully attempt taskkill on all LocalShare binaries
      try {
        execSync('taskkill /F /IM "LocalShare.exe" /T 2>nul', { stdio: 'ignore' });
      } catch {}
      try {
        execSync('taskkill /F /IM "LocalShare 1.0.0.exe" /T 2>nul', { stdio: 'ignore' });
      } catch {}
    } else {
      execSync('pkill -f LocalShare 2>/dev/null || true', { stdio: 'ignore' });
    }
  } catch {
    // Ignore errors if process wasn't running
  }
}

killRunningProcesses();
