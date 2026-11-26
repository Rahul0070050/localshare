import { ConnectedDevice } from '../shared/types';

export class VisitorTracker {
  private devices = new Map<string, ConnectedDevice>();
  private totalRequests = 0;

  public recordRequest(ipRaw?: string, userAgent = ''): void {
    this.totalRequests++;

    const ip = this.cleanIp(ipRaw);
    if (!ip) return;

    const now = Date.now();
    const existing = this.devices.get(ip);

    if (existing) {
      existing.lastSeen = now;
      existing.requestCount++;
      if (userAgent && (!existing.userAgent || existing.userAgent === 'Unknown')) {
        existing.userAgent = userAgent;
        existing.deviceType = this.detectDeviceType(userAgent);
      }
    } else {
      this.devices.set(ip, {
        ip,
        userAgent: userAgent || 'Unknown',
        deviceType: this.detectDeviceType(userAgent),
        firstSeen: now,
        lastSeen: now,
        requestCount: 1,
        isActive: true,
      });
    }
  }

  public getDevices(): ConnectedDevice[] {
    const now = Date.now();
    const activeThresholdMs = 2 * 60 * 1000; // 2 minutes

    return Array.from(this.devices.values())
      .map((dev) => ({
        ...dev,
        isActive: now - dev.lastSeen < activeThresholdMs,
      }))
      .sort((a, b) => b.lastSeen - a.lastSeen);
  }

  public getActiveCount(): number {
    const now = Date.now();
    const activeThresholdMs = 2 * 60 * 1000;
    let count = 0;
    for (const dev of Array.from(this.devices.values())) {
      if (now - dev.lastSeen < activeThresholdMs) {
        count++;
      }
    }
    return count;
  }

  public getTotalVisitorsCount(): number {
    return this.devices.size;
  }

  public getTotalRequests(): number {
    return this.totalRequests;
  }

  public reset(): void {
    this.devices.clear();
    this.totalRequests = 0;
  }

  private cleanIp(ip?: string): string {
    if (!ip) return '127.0.0.1';
    // Remove IPv4-mapped IPv6 prefix (::ffff:192.168.1.1)
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    if (ip === '::1') {
      return '127.0.0.1';
    }
    return ip;
  }

  private detectDeviceType(ua: string): ConnectedDevice['deviceType'] {
    const lower = ua.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(lower)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(lower)) {
      return 'mobile';
    }
    if (/windows nt|macintosh|mac os x|linux|x11|cros/i.test(lower)) {
      return 'desktop';
    }
    return 'unknown';
  }
}
