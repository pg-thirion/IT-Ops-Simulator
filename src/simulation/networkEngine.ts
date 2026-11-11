import {
  NetworkHost,
  RouterConfig,
  ADUser,
  PingResult,
  NslookupResult,
  TracertResult,
  TracertHop,
  ProcessItem,
  DeviceItem,
  SharedFolder,
  PacketRecord,
} from '../types/network';
import {
  buildInitialNetworkHosts,
  buildInitialActiveDirectory,
  INITIAL_ROUTER_CONFIG,
  INITIAL_SHARED_FOLDERS,
} from './initialNetwork';

export class NetworkEngine {
  private hosts: Map<string, NetworkHost> = new Map();
  private adUsers: Map<string, ADUser> = new Map();
  private routerConfig: RouterConfig;
  private sharedFolders: SharedFolder[] = [];
  private packetLog: PacketRecord[] = [];

  // Valid router gateway interface IPs
  private routerInterfaces = [
    '192.168.1.1',
    '192.168.10.1',
    '192.168.20.1',
    '192.168.30.1',
    '192.168.40.1',
  ];

  // Well known external hosts for ping/nslookup
  private externalHosts: Record<string, string> = {
    '8.8.8.8': 'dns.google',
    '1.1.1.1': 'one.one.one.one',
    'example.com': '93.184.216.34',
    'google.com': '142.250.190.46',
    'microsoft.com': '20.112.52.29',
    'github.com': '140.82.121.4',
    'corp.local': '192.168.10.200',
  };

  constructor(
    initialHosts: NetworkHost[] = buildInitialNetworkHosts(),
    initialUsers: ADUser[] = buildInitialActiveDirectory(),
    initialRouter: RouterConfig = INITIAL_ROUTER_CONFIG,
    initialShares: SharedFolder[] = INITIAL_SHARED_FOLDERS
  ) {
    initialHosts.forEach((h) => this.hosts.set(h.id, { ...h }));
    initialUsers.forEach((u) => this.adUsers.set(u.username, { ...u }));
    this.routerConfig = { ...initialRouter };
    this.sharedFolders = [...initialShares];

    // Seed some initial packet captures
    this.recordPacket('192.168.10.50', '192.168.10.200', 'DNS', 64, 'Standard query 0x1a2b A corp.local', 'ok');
    this.recordPacket('192.168.10.200', '192.168.10.50', 'DNS', 80, 'Standard query response 0x1a2b A 192.168.10.200', 'ok');
  }

  // --- Packet Logger for Wireshark App ---
  public recordPacket(
    sourceIp: string,
    destIp: string,
    protocol: PacketRecord['protocol'],
    length: number,
    info: string,
    status: PacketRecord['status'] = 'ok'
  ) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(
      Math.random() * 900 + 100
    )}`;

    const record: PacketRecord = {
      id: `pkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      sourceIp,
      destIp,
      protocol,
      length,
      info,
      status,
    };

    this.packetLog.unshift(record);
    if (this.packetLog.length > 200) {
      this.packetLog.pop();
    }
  }

  public getPacketLog(): PacketRecord[] {
    return [...this.packetLog];
  }

  public clearPacketLog() {
    this.packetLog = [];
  }

  // --- Getters ---
  public getAllHosts(): NetworkHost[] {
    return Array.from(this.hosts.values());
  }

  public getHost(hostId: string): NetworkHost | undefined {
    return this.hosts.get(hostId);
  }

  public getHostByIp(ip: string): NetworkHost | undefined {
    return Array.from(this.hosts.values()).find((h) => h.nic.ip === ip);
  }

  public getAllADUsers(): ADUser[] {
    return Array.from(this.adUsers.values());
  }

  public getADUser(username: string): ADUser | undefined {
    return this.adUsers.get(username);
  }

  public getRouterConfig(): RouterConfig {
    return { ...this.routerConfig };
  }

  public getSharedFolders(): SharedFolder[] {
    return [...this.sharedFolders];
  }

  public setSharedFolderOnline(shareNameOrId: string, isOnline: boolean): boolean {
    const share = this.sharedFolders.find(
      (s) => s.id.toLowerCase() === shareNameOrId.toLowerCase() || s.name.toLowerCase() === shareNameOrId.toLowerCase()
    );
    if (!share) return false;
    share.isOnline = isOnline;
    return true;
  }

  // --- Mutators ---
  public updateHostNic(hostId: string, updates: Partial<NetworkHost['nic']>): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;
    host.nic = { ...host.nic, ...updates };
    this.hosts.set(hostId, { ...host });
    return true;
  }

  public setHostVlan(hostId: string, vlan: number): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;
    host.vlan = vlan;
    this.hosts.set(hostId, { ...host });
    return true;
  }

  public setHostOnline(hostId: string, isOnline: boolean): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;
    host.isOnline = isOnline;
    this.hosts.set(hostId, { ...host });
    return true;
  }

  public updateServiceStatus(
    hostId: string,
    serviceId: string,
    status: 'running' | 'stopped' | 'crashed' | 'hung'
  ): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;
    const svc = host.services.find((s) => s.id === serviceId);
    if (!svc) return false;
    svc.status = status;
    this.hosts.set(hostId, { ...host });
    return true;
  }

  public updateRouterConfig(updates: Partial<RouterConfig>) {
    this.routerConfig = { ...this.routerConfig, ...updates };
  }

  public unlockADUser(username: string): boolean {
    const user = this.adUsers.get(username);
    if (!user) return false;
    user.isLocked = false;
    user.badPasswordCount = 0;
    this.adUsers.set(username, { ...user });
    return true;
  }

  public resetADPassword(username: string): boolean {
    const user = this.adUsers.get(username);
    if (!user) return false;
    user.passwordExpired = false;
    user.badPasswordCount = 0;
    this.adUsers.set(username, { ...user });
    return true;
  }

  public setADUserEnabled(username: string, isEnabled: boolean): boolean {
    const user = this.adUsers.get(username);
    if (!user) return false;
    user.isEnabled = isEnabled;
    this.adUsers.set(username, { ...user });
    return true;
  }

  public addUserToGroup(username: string, groupName: string): boolean {
    const user = this.adUsers.get(username);
    if (!user) return false;
    if (!user.groups.includes(groupName)) {
      user.groups.push(groupName);
      this.adUsers.set(username, { ...user });
    }
    return true;
  }

  public removeUserFromGroup(username: string, groupName: string): boolean {
    const user = this.adUsers.get(username);
    if (!user) return false;
    user.groups = user.groups.filter((g) => g !== groupName);
    this.adUsers.set(username, { ...user });
    return true;
  }

  // --- Process & Task Manager Mutators ---
  public getProcesses(hostId: string): ProcessItem[] {
    const host = this.hosts.get(hostId);
    return host ? [...host.processes] : [];
  }

  public killProcess(hostId: string, pid: number): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;
    const initialLen = host.processes.length;
    host.processes = host.processes.filter((p) => p.pid !== pid);
    if (host.processes.length < initialLen) {
      // Recalculate CPU load
      host.cpuUsage = Math.max(5, Math.min(100, host.processes.reduce((acc, p) => acc + p.cpu, 0)));
      this.hosts.set(hostId, { ...host });
      return true;
    }
    return false;
  }

  public killProcessByName(hostId: string, procName: string): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;
    const initialLen = host.processes.length;
    host.processes = host.processes.filter(
      (p) => p.name.toLowerCase() !== procName.toLowerCase()
    );
    if (host.processes.length < initialLen) {
      host.cpuUsage = Math.max(5, Math.min(100, host.processes.reduce((acc, p) => acc + p.cpu, 0)));
      this.hosts.set(hostId, { ...host });
      return true;
    }
    return false;
  }

  // --- EDR Host Isolation Mutators ---
  public isolateHost(hostId: string): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;
    host.isIsolated = true;
    this.hosts.set(hostId, { ...host });
    this.recordPacket(
      host.nic.ip,
      '192.168.10.50',
      'TCP',
      64,
      `EDR Containment: Host ${hostId} isolated from network`,
      'warning'
    );
    return true;
  }

  public unisolateHost(hostId: string): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;
    host.isIsolated = false;
    this.hosts.set(hostId, { ...host });
    this.recordPacket(
      host.nic.ip,
      '192.168.10.50',
      'TCP',
      64,
      `EDR Containment: Host ${hostId} unisolated. Normal connectivity restored`,
      'ok'
    );
    return true;
  }

  public isHostIsolated(hostId: string): boolean {
    const host = this.hosts.get(hostId);
    return host ? !!host.isIsolated : false;
  }

  public isAdminSubnet(ip: string): boolean {
    return this.isSameSubnet(ip, '192.168.10.1', '255.255.255.0');
  }

  // --- Device Manager Mutators ---
  public getDevices(hostId: string): DeviceItem[] {
    const host = this.hosts.get(hostId);
    return host ? [...host.devices] : [];
  }

  public setDeviceStatus(hostId: string, deviceId: string, status: 'enabled' | 'disabled'): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;
    const dev = host.devices.find((d) => d.id === deviceId);
    if (!dev) return false;
    dev.status = status;

    // If it's a network adapter, sync to nic.isUp
    if (dev.category === 'Network Adapters') {
      host.nic.isUp = status === 'enabled';
    }

    this.hosts.set(hostId, { ...host });
    return true;
  }

  // --- DHCP Release / Renew ---
  public releaseDhcp(hostId: string): boolean {
    const host = this.hosts.get(hostId);
    if (!host || !host.nic.dhcpEnabled) return false;
    host.nic.ip = '0.0.0.0';
    host.nic.subnetMask = '0.0.0.0';
    host.nic.gateway = '0.0.0.0';
    host.nic.primaryDns = '0.0.0.0';
    this.hosts.set(hostId, { ...host });
    this.recordPacket(host.nic.ip, '255.255.255.255', 'DHCP', 300, 'DHCP Release', 'ok');
    return true;
  }

  public renewDhcp(hostId: string): boolean {
    const host = this.hosts.get(hostId);
    if (!host) return false;

    // Check if DHCP service is available
    const dc = this.getHost('DC-SRV-01');
    const dhcpSvc = dc?.services.find((s) => s.id === 'dhcpserver');
    const isDhcpRunning = dc?.isOnline && dhcpSvc?.status === 'running';

    if (!isDhcpRunning && !this.routerConfig.dhcpEnabled) {
      // APIPA 169.254.x.x autoconfiguration
      host.nic.ip = `169.254.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
      host.nic.subnetMask = '255.255.0.0';
      host.nic.gateway = '';
      host.nic.primaryDns = '';
      this.hosts.set(hostId, { ...host });
      this.recordPacket('0.0.0.0', '255.255.255.255', 'DHCP', 300, 'DHCP Discover (No response, assigned APIPA)', 'warning');
      return false;
    }

    // Assign appropriate DHCP IP based on VLAN
    host.nic.dhcpEnabled = true;
    host.nic.subnetMask = '255.255.255.0';
    host.nic.gateway = `192.168.${host.vlan}.1`;
    host.nic.primaryDns = this.routerConfig.dhcpDnsServer || '192.168.10.200';
    host.nic.secondaryDns = '8.8.8.8';

    // Assign lease
    const vlanPart = host.vlan;
    const lastOctet = Math.floor(Math.random() * 140) + 50;
    host.nic.ip = `192.168.${vlanPart}.${lastOctet}`;

    this.hosts.set(hostId, { ...host });
    this.recordPacket(host.nic.ip, '192.168.10.200', 'DHCP', 342, `DHCP ACK - IP ${host.nic.ip} assigned`, 'ok');
    return true;
  }

  // --- Packet transit & Ping simulation ---
  public ping(sourceHostId: string, targetInput: string): PingResult {
    const source = this.hosts.get(sourceHostId);
    if (!source || !source.isOnline || !source.nic.isUp) {
      return {
        host: targetInput,
        ipResolved: '',
        success: false,
        packetsSent: 4,
        packetsReceived: 0,
        packetLoss: 100,
        timesMs: [],
        errorMessage: 'Media disconnected or interface down.',
      };
    }

    // Resolve target to IP if hostname
    let targetIp = targetInput.trim();
    if (!this.isValidIpv4(targetIp)) {
      const dnsResult = this.nslookup(sourceHostId, targetInput);
      if (!dnsResult.success || !dnsResult.resolvedIp) {
        this.recordPacket(source.nic.ip, '255.255.255.255', 'ICMP', 32, `Ping request failed to resolve ${targetInput}`, 'error');
        return {
          host: targetInput,
          ipResolved: '',
          success: false,
          packetsSent: 4,
          packetsReceived: 0,
          packetLoss: 100,
          timesMs: [],
          errorMessage: `Ping request could not find host ${targetInput}. Please check the name and try again.`,
        };
      }
      targetIp = dnsResult.resolvedIp;
    }

    // Ping loopback
    if (targetIp === '127.0.0.1' || targetIp === source.nic.ip) {
      this.recordPacket(source.nic.ip, targetIp, 'ICMP', 32, 'Echo (ping) request/reply - loopback', 'ok');
      return {
        host: targetInput,
        ipResolved: targetIp,
        success: true,
        packetsSent: 4,
        packetsReceived: 4,
        packetLoss: 0,
        timesMs: [1, 1, 1, 1],
        ttl: 128,
      };
    }

    // EDR Containment Check: Isolated host cannot send traffic outside admin subnet (192.168.10.0/24)
    if (source.isIsolated && !this.isAdminSubnet(targetIp)) {
      this.recordPacket(
        source.nic.ip,
        targetIp,
        'ICMP',
        32,
        `EDR Containment: Outbound packet to ${targetIp} blocked for isolated host ${sourceHostId}`,
        'error'
      );
      return {
        host: targetInput,
        ipResolved: targetIp,
        success: false,
        packetsSent: 4,
        packetsReceived: 0,
        packetLoss: 100,
        timesMs: [],
        errorMessage: `Destination host unreachable: Host ${sourceHostId} is isolated from network by EDR containment policy.`,
      };
    }

    // Destination Isolation Check: Non-admin host cannot reach isolated destination
    const targetHost = this.getHostByIp(targetIp);
    if (targetHost && targetHost.isIsolated && !this.isAdminSubnet(source.nic.ip)) {
      this.recordPacket(
        source.nic.ip,
        targetIp,
        'ICMP',
        32,
        `EDR Containment: Inbound packet from non-admin host ${sourceHostId} dropped for isolated ${targetHost.id}`,
        'error'
      );
      return {
        host: targetInput,
        ipResolved: targetIp,
        success: false,
        packetsSent: 4,
        packetsReceived: 0,
        packetLoss: 100,
        timesMs: [],
        errorMessage: `Request timed out (Destination ${targetHost.id} is network-isolated).`,
      };
    }

    // Check if target is on same subnet
    const sameSubnet = this.isSameSubnet(source.nic.ip, targetIp, source.nic.subnetMask);

    if (sameSubnet) {
      const destHost = this.getHostByIp(targetIp);
      if (destHost && destHost.isOnline && destHost.nic.isUp) {
        const ms = [Math.floor(1 + Math.random() * 3), 1, 2, 1];
        this.recordPacket(source.nic.ip, targetIp, 'ICMP', 32, 'Echo (ping) request/reply - local subnet', 'ok');
        return {
          host: targetInput,
          ipResolved: targetIp,
          success: true,
          packetsSent: 4,
          packetsReceived: 4,
          packetLoss: 0,
          timesMs: ms,
          ttl: 128,
        };
      } else {
        this.recordPacket(source.nic.ip, targetIp, 'ICMP', 32, 'Echo (ping) request - destination unreachable', 'error');
        return {
          host: targetInput,
          ipResolved: targetIp,
          success: false,
          packetsSent: 4,
          packetsReceived: 0,
          packetLoss: 100,
          timesMs: [],
          errorMessage: 'Destination host unreachable.',
        };
      }
    }

    // Cross-subnet / WAN target: needs a VALID default gateway
    if (!source.nic.gateway || source.nic.gateway === '0.0.0.0') {
      this.recordPacket(source.nic.ip, targetIp, 'ICMP', 32, 'Echo (ping) failed - no default gateway', 'error');
      return {
        host: targetInput,
        ipResolved: targetIp,
        success: false,
        packetsSent: 4,
        packetsReceived: 0,
        packetLoss: 100,
        timesMs: [],
        errorMessage: 'Destination host unreachable (No default gateway configured).',
      };
    }

    // Gateway must be on host's local subnet
    if (!this.isSameSubnet(source.nic.ip, source.nic.gateway, source.nic.subnetMask)) {
      this.recordPacket(source.nic.ip, source.nic.gateway, 'ARP', 28, 'Who has gateway? Default gateway is on different subnet!', 'error');
      return {
        host: targetInput,
        ipResolved: targetIp,
        success: false,
        packetsSent: 4,
        packetsReceived: 0,
        packetLoss: 100,
        timesMs: [],
        errorMessage: `Destination host unreachable: Gateway ${source.nic.gateway} is not on local subnet ${source.nic.subnetMask}.`,
      };
    }

    // Gateway IP must actually be an active router interface
    const isGatewayValid = this.routerInterfaces.includes(source.nic.gateway);
    const router = this.getHost('RTR-CORE-01');
    if (!isGatewayValid || !router || !router.isOnline) {
      this.recordPacket(source.nic.ip, source.nic.gateway, 'ARP', 28, `ARP request for ${source.nic.gateway}: No response from gateway router`, 'error');
      return {
        host: targetInput,
        ipResolved: targetIp,
        success: false,
        packetsSent: 4,
        packetsReceived: 0,
        packetLoss: 100,
        timesMs: [],
        errorMessage: 'Default gateway unreachable. Request timed out.',
      };
    }

    // Check if target is internal host on another VLAN
    const destHost = this.getHostByIp(targetIp);
    if (destHost) {
      if (destHost.isOnline && destHost.nic.isUp) {
        // Also verify destHost has a working gateway to return packets!
        const destGatewayValid =
          destHost.nic.gateway &&
          this.isSameSubnet(destHost.nic.ip, destHost.nic.gateway, destHost.nic.subnetMask) &&
          this.routerInterfaces.includes(destHost.nic.gateway);

        if (!destGatewayValid) {
          this.recordPacket(destHost.nic.ip, source.nic.ip, 'ICMP', 32, 'Echo reply failed - destination host has invalid default gateway', 'error');
          return {
            host: targetInput,
            ipResolved: targetIp,
            success: false,
            packetsSent: 4,
            packetsReceived: 0,
            packetLoss: 100,
            timesMs: [],
            errorMessage: 'Request timed out (Return path dropped: target host gateway invalid).',
          };
        }

        const ms = [Math.floor(2 + Math.random() * 3), 2, 3, 2];
        this.recordPacket(source.nic.ip, targetIp, 'ICMP', 32, `Echo (ping) request/reply routed via ${source.nic.gateway}`, 'ok');
        return {
          host: targetInput,
          ipResolved: targetIp,
          success: true,
          packetsSent: 4,
          packetsReceived: 4,
          packetLoss: 0,
          timesMs: ms,
          ttl: 127,
        };
      } else {
        this.recordPacket(source.nic.ip, targetIp, 'ICMP', 32, 'Echo (ping) request - target host offline', 'error');
        return {
          host: targetInput,
          ipResolved: targetIp,
          success: false,
          packetsSent: 4,
          packetsReceived: 0,
          packetLoss: 100,
          timesMs: [],
          errorMessage: 'Request timed out.',
        };
      }
    }

    // Target is external (WAN / Internet e.g. 8.8.8.8)
    if (this.routerConfig.firewallEnabled && this.routerConfig.blockedPorts.includes(0)) {
      this.recordPacket(source.nic.ip, targetIp, 'ICMP', 32, 'Firewall drop: outbound ICMP blocked', 'error');
      return {
        host: targetInput,
        ipResolved: targetIp,
        success: false,
        packetsSent: 4,
        packetsReceived: 0,
        packetLoss: 100,
        timesMs: [],
        errorMessage: 'Request timed out (Firewall blocked egress).',
      };
    }

    // Target is reachable public address
    this.recordPacket(source.nic.ip, targetIp, 'ICMP', 32, `WAN Echo request/reply via ISP GW ${this.routerConfig.wanGateway}`, 'ok');
    const publicLatencies = [18, 22, 19, 21];
    return {
      host: targetInput,
      ipResolved: targetIp,
      success: true,
      packetsSent: 4,
      packetsReceived: 4,
      packetLoss: 0,
      timesMs: publicLatencies,
      ttl: 54,
    };
  }

  // --- DNS Resolution (nslookup) ---
  public nslookup(sourceHostId: string, queryInput: string, dnsServerOverride?: string): NslookupResult {
    const source = this.hosts.get(sourceHostId);
    const dnsServer = (dnsServerOverride || source?.nic.primaryDns || '192.168.10.200').trim();
    const query = queryInput.trim().toLowerCase();

    // Check if source interface is up
    if (!source || !source.isOnline || !source.nic.isUp) {
      return {
        query,
        dnsServerUsed: dnsServer,
        success: false,
        errorMessage: 'DNS request failed: Network adapter is disconnected or down.',
      };
    }

    // EDR Containment Check: Isolated host cannot query DNS outside admin subnet
    if (source.isIsolated && !this.isAdminSubnet(dnsServer)) {
      this.recordPacket(
        source.nic.ip,
        dnsServer,
        'DNS',
        64,
        `EDR Containment: DNS query to ${dnsServer} blocked for isolated host ${sourceHostId}`,
        'error'
      );
      return {
        query,
        dnsServerUsed: dnsServer,
        success: false,
        errorMessage: `DNS request timed out: Host ${sourceHostId} is isolated from network by EDR containment policy.`,
      };
    }

    // CASE 1: Public DNS Server (8.8.8.8 or 1.1.1.1)
    if (dnsServer === '8.8.8.8' || dnsServer === '1.1.1.1') {
      // Must have working gateway to reach public internet
      const canReachInternet =
        source.nic.gateway &&
        this.isSameSubnet(source.nic.ip, source.nic.gateway, source.nic.subnetMask) &&
        this.routerInterfaces.includes(source.nic.gateway);

      if (!canReachInternet) {
        this.recordPacket(source.nic.ip, dnsServer, 'DNS', 64, `Standard query A ${query} - Gateway unreachable`, 'error');
        return {
          query,
          dnsServerUsed: dnsServer,
          success: false,
          errorMessage: 'DNS request timed out.\n    timeout was 2 seconds (Unable to route to public DNS without gateway).',
        };
      }

      // Check if firewall blocks Port 53
      if (this.routerConfig.firewallEnabled && this.routerConfig.blockedPorts.includes(53)) {
        this.recordPacket(source.nic.ip, dnsServer, 'DNS', 64, `Standard query A ${query} - Dropped by firewall port 53`, 'error');
        return {
          query,
          dnsServerUsed: dnsServer,
          success: false,
          errorMessage: 'DNS request timed out.\n    timeout was 2 seconds (Border firewall blocked port 53).',
        };
      }

      // Public DNS resolves public domains
      if (this.externalHosts[query]) {
        this.recordPacket(source.nic.ip, dnsServer, 'DNS', 78, `Standard query response A ${this.externalHosts[query]}`, 'ok');
        return {
          query,
          dnsServerUsed: dnsServer,
          success: true,
          resolvedIp: this.externalHosts[query],
        };
      }

      // Public DNS does NOT resolve internal corp.local domains
      if (query.endsWith('.corp.local')) {
        this.recordPacket(source.nic.ip, dnsServer, 'DNS', 64, `Standard query response: NXDOMAIN for ${query}`, 'warning');
        return {
          query,
          dnsServerUsed: dnsServer,
          success: false,
          errorMessage: `*** ${dnsServer} can't find ${query}: Non-existent domain (Public DNS does not know internal zone)`,
        };
      }

      return {
        query,
        dnsServerUsed: dnsServer,
        success: false,
        errorMessage: `*** ${dnsServer} can't find ${query}: Non-existent domain`,
      };
    }

    // CASE 2: Internal DNS Server (e.g. 192.168.10.200 DC-SRV-01)
    const dnsHost = this.getHostByIp(dnsServer);

    // If the DNS IP does not correspond to an online host
    if (!dnsHost || !dnsHost.isOnline) {
      this.recordPacket(source.nic.ip, dnsServer, 'DNS', 64, `Standard query A ${query} - Server ${dnsServer} not found`, 'error');
      return {
        query,
        dnsServerUsed: dnsServer,
        success: false,
        errorMessage: 'DNS request timed out.\n    timeout was 2 seconds.',
      };
    }

    // Check if source can reach the DNS server
    const sameSubnet = this.isSameSubnet(source.nic.ip, dnsServer, source.nic.subnetMask);
    if (!sameSubnet) {
      const hasGateway =
        source.nic.gateway &&
        this.isSameSubnet(source.nic.ip, source.nic.gateway, source.nic.subnetMask) &&
        this.routerInterfaces.includes(source.nic.gateway);

      if (!hasGateway) {
        this.recordPacket(source.nic.ip, dnsServer, 'DNS', 64, `Standard query A ${query} - No gateway to reach DNS server`, 'error');
        return {
          query,
          dnsServerUsed: dnsServer,
          success: false,
          errorMessage: 'DNS request timed out.\n    timeout was 2 seconds (No gateway to reach DNS subnet).',
        };
      }
    }

    // If it's DC-SRV-01, check if DNS Server service is running
    const dnsService = dnsHost.services.find((s) => s.id === 'dns');
    if (dnsService && dnsService.status !== 'running') {
      this.recordPacket(source.nic.ip, dnsServer, 'DNS', 64, `Standard query A ${query} - DNS daemon crashed on ${dnsHost.id}`, 'error');
      return {
        query,
        dnsServerUsed: dnsServer,
        success: false,
        errorMessage: `DNS request timed out.\n*** Can't find server address for '${dnsServer}': Server failed`,
      };
    }

    // Internal domain resolution (e.g. dc-srv-01, fs-srv-01, pc-fin-04)
    for (const host of this.hosts.values()) {
      if (
        host.hostname.toLowerCase() === query ||
        host.id.toLowerCase() === query ||
        `${host.id.toLowerCase()}.corp.local` === query
      ) {
        this.recordPacket(source.nic.ip, dnsServer, 'DNS', 88, `Standard query response A ${host.nic.ip}`, 'ok');
        return {
          query,
          dnsServerUsed: dnsServer,
          success: true,
          resolvedIp: host.nic.ip,
        };
      }
    }

    // Known external domains (e.g. example.com, google.com) forwarded by DC
    if (this.externalHosts[query]) {
      // Check if router allows port 53 egress
      if (this.routerConfig.firewallEnabled && this.routerConfig.blockedPorts.includes(53)) {
        this.recordPacket(dnsServer, '8.8.8.8', 'DNS', 64, `Forwarder query A ${query} - Blocked by firewall`, 'error');
        return {
          query,
          dnsServerUsed: dnsServer,
          success: false,
          errorMessage: `DNS request timed out.\n*** Forwarders unreachable on port 53.`,
        };
      }

      this.recordPacket(source.nic.ip, dnsServer, 'DNS', 82, `Standard query response (recursive) A ${this.externalHosts[query]}`, 'ok');
      return {
        query,
        dnsServerUsed: dnsServer,
        success: true,
        resolvedIp: this.externalHosts[query],
      };
    }

    return {
      query,
      dnsServerUsed: dnsServer,
      success: false,
      errorMessage: `*** ${dnsServer} can't find ${query}: Non-existent domain`,
    };
  }

  // --- Trace Route simulation ---
  public tracert(sourceHostId: string, targetInput: string): TracertResult {
    const source = this.hosts.get(sourceHostId);
    if (!source || !source.isOnline) {
      return { target: targetInput, hops: [], completed: false };
    }

    let targetIp = targetInput.trim();
    if (!this.isValidIpv4(targetIp)) {
      const dns = this.nslookup(sourceHostId, targetInput);
      if (!dns.success || !dns.resolvedIp) {
        return { target: targetInput, hops: [], completed: false };
      }
      targetIp = dns.resolvedIp;
    }

    const hops: TracertHop[] = [];

    // Hop 1: Local Default Gateway
    hops.push({
      hop: 1,
      ip: source.nic.gateway || '192.168.1.1',
      hostname: 'gateway.corp.local',
      timeMs: 1,
    });

    if (targetIp === source.nic.gateway) {
      return { target: targetIp, hops, completed: true };
    }

    // Hop 2: Core Switch / Router
    hops.push({
      hop: 2,
      ip: '192.168.1.1',
      hostname: 'rtr-core-01.corp.local',
      timeMs: 2,
    });

    const destHost = this.getHostByIp(targetIp);
    if (destHost) {
      hops.push({
        hop: 3,
        ip: destHost.nic.ip,
        hostname: destHost.hostname,
        timeMs: 4,
      });
      return { target: targetIp, hops, completed: true };
    }

    // External hops
    hops.push({
      hop: 3,
      ip: this.routerConfig.wanGateway,
      hostname: 'isp-gateway-gw01.net',
      timeMs: 14,
    });
    hops.push({
      hop: 4,
      ip: '198.51.100.25',
      hostname: 'core-backbone-lon.transit.net',
      timeMs: 22,
    });
    hops.push({
      hop: 5,
      ip: targetIp,
      hostname: this.externalHosts[targetInput.toLowerCase()] || targetIp,
      timeMs: 28,
    });

    return { target: targetIp, hops, completed: true };
  }

  // --- Network Share Access Check ---
  public testShareAccess(sourceUsername: string, shareName: string): { success: boolean; message: string } {
    const user = this.getADUser(sourceUsername);
    if (!user) return { success: false, message: `User '${sourceUsername}' not found in Active Directory.` };

    const share = this.sharedFolders.find(
      (s) => s.name.toLowerCase() === shareName.toLowerCase() || s.id.toLowerCase() === shareName.toLowerCase()
    );
    if (!share) return { success: false, message: `Network path '\\\\FS-SRV-01\\${shareName}' was not found.` };

    if (!share.isOnline) {
      return {
        success: false,
        message: `The network path '\\\\FS-SRV-01\\${share.name}' could not be reached. The share is currently offline.`,
      };
    }

    // Check if user's workstation is isolated by EDR
    if (user.assignedHostId) {
      const host = this.getHost(user.assignedHostId);
      if (host && host.isIsolated) {
        return {
          success: false,
          message: `Network access blocked. Workstation '${host.id}' is under active EDR isolation containment.`,
        };
      }
    }

    // Check if FS-SRV-01 is online and has working LanmanServer
    const fs = this.getHost('FS-SRV-01');
    if (!fs || !fs.isOnline || !fs.nic.isUp) {
      return { success: false, message: `The network path '\\\\FS-SRV-01\\${shareName}' could not be reached. Server is offline.` };
    }

    // Check permissions
    const hasGroup = share.allowedGroups.some((grp) => user.groups.includes(grp));
    if (!hasGroup) {
      return {
        success: false,
        message: `Access is denied. User '${user.username}' is not a member of ${share.allowedGroups.join(' or ')}.`,
      };
    }

    return { success: true, message: `Connected to \\\\FS-SRV-01\\${share.name} successfully.` };
  }

  // --- Helpers ---
  public isValidIpv4(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every((p) => {
      const n = parseInt(p, 10);
      return !isNaN(n) && n >= 0 && n <= 255 && p === n.toString();
    });
  }

  public isSameSubnet(ip1: string, ip2: string, mask: string): boolean {
    if (!this.isValidIpv4(ip1) || !this.isValidIpv4(ip2) || !this.isValidIpv4(mask)) return false;
    const p1 = ip1.split('.').map(Number);
    const p2 = ip2.split('.').map(Number);
    const m = mask.split('.').map(Number);
    for (let i = 0; i < 4; i++) {
      if ((p1[i] & m[i]) !== (p2[i] & m[i])) return false;
    }
    return true;
  }
}
