import os from 'os';
import { NetworkInterfaceInfo } from '../../shared/types';

/**
 * Returns available IPv4 network interfaces on the local Wi-Fi or LAN.
 */
export function getLocalNetworkInterfaces(): NetworkInterfaceInfo[] {
  const interfaces = os.networkInterfaces();
  const results: NetworkInterfaceInfo[] = [];

  for (const [name, netList] of Object.entries(interfaces)) {
    if (!netList) continue;

    for (const net of netList) {
      // Look for non-internal IPv4
      const isIPv4 = net.family === 'IPv4' || (net as any).family === 4;
      if (isIPv4 && !net.internal) {
        // Skip link-local addresses (169.254.x.x)
        if (net.address.startsWith('169.254.')) {
          continue;
        }

        results.push({
          name,
          address: net.address,
          family: 'IPv4',
          internal: net.internal,
        });
      }
    }
  }

  // Sort: prioritize Wi-Fi and physical LAN adapters over virtual interfaces (WSL, Docker, Hyper-V)
  results.sort((a, b) => {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();

    const score = (str: string, addr: string): number => {
      let s = 0;
      if (str.includes('wi-fi') || str.includes('wlan') || str.includes('wireless')) s += 10;
      if (str.includes('eth') || str.includes('enp') || str.includes('ethernet')) s += 8;
      if (str.includes('vethernet') || str.includes('docker') || str.includes('wsl') || str.includes('virtual')) s -= 5;
      // Prefer standard private LAN IPs
      if (addr.startsWith('192.168.')) s += 4;
      else if (addr.startsWith('10.')) s += 3;
      else if (addr.startsWith('172.')) s += 2;
      return s;
    };

    return score(bLower, b.address) - score(aLower, a.address);
  });

  return results;
}

/**
 * Returns the primary local IPv4 address, or 127.0.0.1 fallback
 */
export function getPrimaryLocalIp(): string {
  const interfaces = getLocalNetworkInterfaces();
  if (interfaces.length > 0) {
    return interfaces[0].address;
  }
  return '127.0.0.1';
}
