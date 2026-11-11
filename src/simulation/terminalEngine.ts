import { NetworkEngine } from './networkEngine';

export interface TerminalOutputLine {
  text: string;
  type: 'output' | 'error' | 'command' | 'system' | 'success';
}

export class TerminalEngine {
  private networkEngine: NetworkEngine;

  constructor(networkEngine: NetworkEngine) {
    this.networkEngine = networkEngine;
  }

  private parseArgs(cmdLine: string): string[] {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(cmdLine)) !== null) {
      if (match[1] !== undefined) {
        matches.push(match[1]);
      } else if (match[2] !== undefined) {
        matches.push(match[2]);
      } else {
        matches.push(match[0]);
      }
    }
    return matches;
  }

  public execute(currentHostId: string, commandLine: string): TerminalOutputLine[] {
    const raw = commandLine.trim();
    if (!raw) return [];

    const host = this.networkEngine.getHost(currentHostId);
    if (!host) {
      return [{ text: `Host ${currentHostId} not found.`, type: 'error' }];
    }

    const parts = this.parseArgs(raw);
    const cmd = (parts[0] || '').toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'cls':
      case 'clear':
        return [];

      case 'help':
      case 'get-help':
        return [
          { text: 'IT Operations Terminal v10.0 (Windows PowerShell & CMD Compatible)', type: 'system' },
          { text: '====================================================================', type: 'system' },
          { text: '  ipconfig [/all | /release | /renew | /flushdns]   View or renew network settings', type: 'output' },
          { text: '  ping <host | ip> [-n count]                       Send ICMP echo requests', type: 'output' },
          { text: '  nslookup <domain> [dns_server]                   Query DNS name servers', type: 'output' },
          { text: '  tracert <host | ip>                              Trace path to destination', type: 'output' },
          { text: '  arp -a                                           Display ARP IP-to-MAC resolution table', type: 'output' },
          { text: '  netstat [-ano]                                   Active TCP/IP connections', type: 'output' },
          { text: '  route print                                      Display IPv4 routing table', type: 'output' },
          { text: '  tasklist | Get-Process                           List currently running processes', type: 'output' },
          { text: '  taskkill /pid <id> /f                            Force kill process by PID', type: 'output' },
          { text: '  taskkill /im <name> /f                           Force kill process by executable name', type: 'output' },
          { text: '  Test-NetConnection -ComputerName <host> -Port <p> Test TCP port connectivity', type: 'output' },
          { text: '  curl <url> | Invoke-WebRequest                   Test HTTP/HTTPS web endpoints', type: 'output' },
          { text: '  systeminfo                                       Display OS and hardware config', type: 'output' },
          { text: '  whoami                                           Show current logged in user', type: 'output' },
          { text: '  hostname                                         Show current computer name', type: 'output' },
          { text: '  net user [username] [/active:yes]                Manage Active Directory user', type: 'output' },
          { text: '  net group <group> <user> /add                    Add user to security group', type: 'output' },
          { text: '  net view [\\\\server]                              View shared folders on server', type: 'output' },
          { text: '  Get-Service                                      List running/stopped services', type: 'output' },
          { text: '  Start-Service <name>                             Start a service', type: 'output' },
          { text: '  Restart-Service <name>                           Restart a service', type: 'output' },
          { text: '  Stop-Service <name>                              Stop a service', type: 'output' },
          { text: '  Get-NetIPConfiguration                           Show network interface config', type: 'output' },
          { text: '  Set-DnsClientServerAddress -ServerAddresses <ip> Set DNS servers for interface', type: 'output' },
          { text: '  gpupdate /force                                  Update Active Directory Group Policy', type: 'output' },
          { text: '  Restart-Computer                                 Reboot local machine', type: 'output' },
          { text: '  cls | clear                                      Clear terminal screen', type: 'output' },
        ];

      case 'hostname':
        return [{ text: host.hostname, type: 'output' }];

      case 'whoami':
        return [{ text: `CORP\\${host.activeDirectoryUsername || 'Administrator'}`, type: 'output' }];

      case 'ipconfig':
        return this.handleIpconfig(host.id, args);

      case 'ping':
        return this.handlePing(host.id, args);

      case 'nslookup':
        return this.handleNslookup(host.id, args);

      case 'tracert':
      case 'traceroute':
        return this.handleTracert(host.id, args);

      case 'arp':
        if (args[0] === '-a' || args.length === 0) {
          return this.handleArp(host.id);
        }
        return [{ text: 'Usage: arp -a', type: 'error' }];

      case 'netstat':
        return this.handleNetstat(host.id, args);

      case 'route':
        if (args[0]?.toLowerCase() === 'print') {
          return this.handleRoutePrint(host.id);
        }
        return [{ text: 'Usage: route print', type: 'error' }];

      case 'tasklist':
      case 'get-process':
      case 'ps':
        return this.handleTasklist(host.id);

      case 'taskkill':
      case 'stop-process':
      case 'kill':
        return this.handleTaskkill(host.id, args);

      case 'test-netconnection':
      case 'tnc':
        return this.handleTestNetConnection(host.id, args);

      case 'curl':
      case 'invoke-webrequest':
      case 'wget':
        return this.handleCurl(host.id, args);

      case 'gpupdate':
        return [
          { text: 'Updating policy...', type: 'output' },
          { text: 'Computer Policy update has completed successfully.', type: 'success' },
          { text: 'User Policy update has completed successfully.', type: 'success' },
        ];

      case 'systeminfo':
        return this.handleSysteminfo(host.id);

      case 'net':
        return this.handleNet(host.id, args);

      case 'dir':
      case 'ls':
      case 'get-childitem':
        return this.handleDir(host.id, args);

      case 'get-service':
        return this.handleGetService(host.id, args);

      case 'start-service':
        return this.handleServiceControl(host.id, args[0], 'start');

      case 'restart-service':
        return this.handleServiceControl(host.id, args[0], 'restart');

      case 'stop-service':
        return this.handleServiceControl(host.id, args[0], 'stop');

      case 'get-netipconfiguration':
        return this.handleGetNetIPConfiguration(host.id);

      case 'set-dnsclientserveraddress':
        return this.handleSetDnsClientServerAddress(host.id, raw);

      case 'restart-computer':
        return [
          { text: `System shutdown initiated on ${host.hostname}...`, type: 'system' },
          { text: 'Restarting network stack and core services...', type: 'output' },
          { text: 'Reboot completed successfully.', type: 'success' },
        ];

      default:
        return [
          {
            text: `'${cmd}' is not recognized as an internal or external command, operable program or batch file. Type 'help' for available commands.`,
            type: 'error',
          },
        ];
    }
  }

  // --- Handlers ---

  private handleIpconfig(hostId: string, args: string[]): TerminalOutputLine[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    const sub = args[0]?.toLowerCase();

    if (sub === '/release') {
      const ok = this.networkEngine.releaseDhcp(hostId);
      if (ok) {
        return [
          { text: 'Windows IP Configuration', type: 'output' },
          { text: '', type: 'output' },
          { text: `Ethernet adapter ${host.nic.name}:`, type: 'output' },
          { text: '   Connection-specific DNS Suffix  . : corp.local', type: 'output' },
          { text: '   IPv4 Address. . . . . . . . . . . : 0.0.0.0', type: 'output' },
          { text: '   Subnet Mask . . . . . . . . . . . : 0.0.0.0', type: 'output' },
          { text: '   Default Gateway . . . . . . . . . : ', type: 'output' },
          { text: 'The IP address for interface Ethernet has been released.', type: 'system' },
        ];
      }
      return [{ text: 'Interface is not configured for DHCP.', type: 'error' }];
    }

    if (sub === '/renew') {
      const ok = this.networkEngine.renewDhcp(hostId);
      const updated = this.networkEngine.getHost(hostId);
      return [
        { text: 'Windows IP Configuration', type: 'output' },
        { text: '', type: 'output' },
        { text: `Ethernet adapter ${updated?.nic.name}:`, type: 'output' },
        { text: '   Connection-specific DNS Suffix  . : corp.local', type: 'output' },
        { text: `   IPv4 Address. . . . . . . . . . . : ${updated?.nic.ip}`, type: ok ? 'success' : 'error' },
        { text: `   Subnet Mask . . . . . . . . . . . : ${updated?.nic.subnetMask}`, type: 'output' },
        { text: `   Default Gateway . . . . . . . . . : ${updated?.nic.gateway}`, type: 'output' },
        { text: `   DNS Servers . . . . . . . . . . . : ${updated?.nic.primaryDns}`, type: 'output' },
      ];
    }

    if (sub === '/flushdns') {
      return [
        { text: 'Windows IP Configuration', type: 'output' },
        { text: '', type: 'output' },
        { text: 'Successfully flushed the DNS Resolver Cache.', type: 'success' },
      ];
    }

    const isAll = sub === '/all';
    const lines: TerminalOutputLine[] = [
      { text: 'Windows IP Configuration', type: 'output' },
      { text: '', type: 'output' },
    ];

    if (isAll) {
      lines.push(
        { text: `   Host Name . . . . . . . . . . . . : ${host.id}`, type: 'output' },
        { text: '   Primary Dns Suffix  . . . . . . . : corp.local', type: 'output' },
        { text: '   Node Type . . . . . . . . . . . . : Hybrid', type: 'output' },
        { text: '   IP Routing Enabled. . . . . . . . : No', type: 'output' },
        { text: '   WINS Proxy Enabled. . . . . . . . : No', type: 'output' },
        { text: '   DNS Suffix Search List. . . . . . : corp.local', type: 'output' },
        { text: '', type: 'output' }
      );
    }

    lines.push(
      { text: `Ethernet adapter ${host.nic.name}:`, type: 'output' },
      { text: '   Connection-specific DNS Suffix  . : corp.local', type: 'output' },
      { text: `   Physical Address. . . . . . . . . : ${host.nic.mac}`, type: 'output' },
      { text: `   DHCP Enabled. . . . . . . . . . . : ${host.nic.dhcpEnabled ? 'Yes' : 'No'}`, type: 'output' },
      { text: '   Autoconfiguration Enabled . . . . : Yes', type: 'output' },
      { text: `   IPv4 Address. . . . . . . . . . . : ${host.nic.ip}`, type: 'output' },
      { text: `   Subnet Mask . . . . . . . . . . . : ${host.nic.subnetMask}`, type: 'output' },
      { text: `   Default Gateway . . . . . . . . . : ${host.nic.gateway}`, type: 'output' },
      { text: `   DNS Servers . . . . . . . . . . . : ${host.nic.primaryDns}`, type: 'output' }
    );

    if (host.nic.secondaryDns) {
      lines.push({ text: `                                       ${host.nic.secondaryDns}`, type: 'output' });
    }

    return lines;
  }

  private handlePing(hostId: string, args: string[]): TerminalOutputLine[] {
    if (args.length === 0) {
      return [{ text: 'Usage: ping [-n count] <target_name | target_ip>', type: 'error' }];
    }

    let target = args[0];
    if (target === '-n' && args[2]) {
      target = args[2];
    } else if (args[1] && !args[1].startsWith('-')) {
      target = args[1];
    }

    const res = this.networkEngine.ping(hostId, target);

    if (!res.success && res.errorMessage && !res.ipResolved) {
      return [{ text: res.errorMessage, type: 'error' }];
    }

    const lines: TerminalOutputLine[] = [
      { text: `Pinging ${res.host} [${res.ipResolved}] with 32 bytes of data:`, type: 'output' },
    ];

    if (res.success) {
      res.timesMs.forEach((time) => {
        lines.push({
          text: `Reply from ${res.ipResolved}: bytes=32 time=${time}ms TTL=${res.ttl || 128}`,
          type: 'output',
        });
      });
      const avg = Math.round(res.timesMs.reduce((a, b) => a + b, 0) / res.timesMs.length);
      lines.push(
        { text: '', type: 'output' },
        { text: `Ping statistics for ${res.ipResolved}:`, type: 'output' },
        { text: `    Packets: Sent = ${res.packetsSent}, Received = ${res.packetsReceived}, Lost = 0 (0% loss),`, type: 'output' },
        { text: 'Approximate round trip times in milli-seconds:', type: 'output' },
        { text: `    Minimum = ${Math.min(...res.timesMs)}ms, Maximum = ${Math.max(...res.timesMs)}ms, Average = ${avg}ms`, type: 'output' }
      );
    } else {
      lines.push(
        { text: 'Request timed out.', type: 'error' },
        { text: 'Request timed out.', type: 'error' },
        { text: 'Request timed out.', type: 'error' },
        { text: 'Request timed out.', type: 'error' },
        { text: '', type: 'output' },
        { text: `Ping statistics for ${res.ipResolved || target}:`, type: 'output' },
        { text: `    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)`, type: 'error' }
      );
    }

    return lines;
  }

  private handleNslookup(hostId: string, args: string[]): TerminalOutputLine[] {
    if (args.length === 0) {
      return [{ text: 'Usage: nslookup <hostname> [dns_server]', type: 'error' }];
    }

    const query = args[0];
    const serverOverride = args[1];
    const res = this.networkEngine.nslookup(hostId, query, serverOverride);

    const lines: TerminalOutputLine[] = [
      { text: `Server:  ${res.dnsServerUsed === '8.8.8.8' ? 'dns.google' : 'dc-srv-01.corp.local'}`, type: 'output' },
      { text: `Address:  ${res.dnsServerUsed}`, type: 'output' },
      { text: '', type: 'output' },
    ];

    if (res.success && res.resolvedIp) {
      lines.push(
        { text: `Non-authoritative answer:`, type: 'output' },
        { text: `Name:    ${res.query}`, type: 'output' },
        { text: `Address: ${res.resolvedIp}`, type: 'success' }
      );
    } else {
      lines.push({ text: res.errorMessage || 'DNS request timed out.', type: 'error' });
    }

    return lines;
  }

  private handleTracert(hostId: string, args: string[]): TerminalOutputLine[] {
    if (args.length === 0) {
      return [{ text: 'Usage: tracert <target_name | target_ip>', type: 'error' }];
    }

    const res = this.networkEngine.tracert(hostId, args[0]);
    const lines: TerminalOutputLine[] = [
      { text: `Tracing route to ${res.target} over a maximum of 30 hops:`, type: 'output' },
      { text: '', type: 'output' },
    ];

    if (res.hops.length === 0) {
      lines.push({ text: 'Unable to resolve target system name or default gateway down.', type: 'error' });
      return lines;
    }

    res.hops.forEach((hop) => {
      lines.push({
        text: `  ${hop.hop}    ${hop.timeMs} ms    ${hop.timeMs + 1} ms    ${hop.timeMs} ms  ${hop.hostname || hop.ip} [${hop.ip}]`,
        type: 'output',
      });
    });

    lines.push({ text: '', type: 'output' }, { text: 'Trace complete.', type: 'success' });
    return lines;
  }

  private handleArp(hostId: string): TerminalOutputLine[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    return [
      { text: `Interface: ${host.nic.ip} --- 0x1`, type: 'system' },
      { text: '  Internet Address      Physical Address      Type', type: 'system' },
      { text: `  ${host.nic.gateway.padEnd(20)} 52-54-00-1a-00-01     dynamic`, type: 'output' },
      { text: `  192.168.10.200       52-54-00-dc-01-01     dynamic`, type: 'output' },
      { text: `  192.168.10.210       52-54-00-fs-01-01     dynamic`, type: 'output' },
      { text: '  224.0.0.22           01-00-5e-00-00-16     static', type: 'output' },
      { text: '  255.255.255.255      ff-ff-ff-ff-ff-ff     static', type: 'output' },
    ];
  }

  private handleTasklist(hostId: string): TerminalOutputLine[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    const lines: TerminalOutputLine[] = [
      { text: 'Image Name                     PID Session Name        Session#    Mem Usage', type: 'system' },
      { text: '========================= ======== ================ =========== ============', type: 'system' },
    ];

    host.processes.forEach((p) => {
      const namePad = p.name.padEnd(25);
      const pidPad = p.pid.toString().padStart(8);
      const memPad = `${p.ramMb.toLocaleString()} K`.padStart(12);
      lines.push({
        text: `${namePad} ${pidPad} Console                    1 ${memPad}`,
        type: p.status === 'malicious' ? 'error' : p.status === 'hung' ? 'error' : 'output',
      });
    });

    return lines;
  }

  private handleTaskkill(hostId: string, args: string[]): TerminalOutputLine[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    if (args.length === 0) {
      return [{ text: 'Usage: taskkill /pid <PID> [/f]  OR  taskkill /im <image_name> [/f]', type: 'error' }];
    }

    if (args[0]?.toLowerCase() === '/pid') {
      const pid = parseInt(args[1], 10);
      if (isNaN(pid)) return [{ text: 'Invalid PID number.', type: 'error' }];
      const proc = host.processes.find((p) => p.pid === pid);
      if (!proc) return [{ text: `ERROR: The process with PID ${pid} could not be found.`, type: 'error' }];

      const ok = this.networkEngine.killProcess(hostId, pid);
      if (ok) {
        return [{ text: `SUCCESS: The process with PID ${pid} (${proc.name}) has been terminated.`, type: 'success' }];
      }
      return [{ text: `ERROR: Access denied. Cannot terminate critical system process ${proc.name}.`, type: 'error' }];
    }

    if (args[0]?.toLowerCase() === '/im') {
      const imName = args[1];
      if (!imName) return [{ text: 'Image name required.', type: 'error' }];
      const ok = this.networkEngine.killProcessByName(hostId, imName);
      if (ok) {
        return [{ text: `SUCCESS: The process "${imName}" has been terminated.`, type: 'success' }];
      }
      return [{ text: `ERROR: The process "${imName}" could not be found.`, type: 'error' }];
    }

    return [{ text: 'Usage: taskkill /pid <PID> [/f]  OR  taskkill /im <image_name> [/f]', type: 'error' }];
  }

  private handleTestNetConnection(hostId: string, args: string[]): TerminalOutputLine[] {
    let target = '192.168.10.200';
    let port = 80;

    for (let i = 0; i < args.length; i++) {
      if (args[i].toLowerCase() === '-computername' && args[i + 1]) {
        target = args[i + 1];
      } else if (args[i].toLowerCase() === '-port' && args[i + 1]) {
        port = parseInt(args[i + 1], 10);
      }
    }

    const pingRes = this.networkEngine.ping(hostId, target);
    if (!pingRes.success) {
      return [
        { text: `ComputerName           : ${target}`, type: 'output' },
        { text: `RemoteAddress          : ${pingRes.ipResolved || 'Unreachable'}`, type: 'output' },
        { text: `RemotePort             : ${port}`, type: 'output' },
        { text: `InterfaceAlias         : Ethernet`, type: 'output' },
        { text: `PingSucceeded          : False`, type: 'error' },
        { text: `TcpTestSucceeded       : False`, type: 'error' },
      ];
    }

    return [
      { text: `ComputerName           : ${target}`, type: 'output' },
      { text: `RemoteAddress          : ${pingRes.ipResolved}`, type: 'output' },
      { text: `RemotePort             : ${port}`, type: 'output' },
      { text: `InterfaceAlias         : Ethernet`, type: 'output' },
      { text: `PingSucceeded          : True`, type: 'success' },
      { text: `TcpTestSucceeded       : True`, type: 'success' },
    ];
  }

  private handleCurl(hostId: string, args: string[]): TerminalOutputLine[] {
    if (args.length === 0) {
      return [{ text: 'Usage: curl <url>', type: 'error' }];
    }

    const url = args[0].replace(/^https?:\/\//i, '');
    const pingRes = this.networkEngine.ping(hostId, url);

    if (!pingRes.success) {
      return [
        { text: `curl: (6) Could not resolve host: ${url}`, type: 'error' },
      ];
    }

    return [
      { text: `HTTP/1.1 200 OK`, type: 'success' },
      { text: `Content-Type: text/html; charset=UTF-8`, type: 'output' },
      { text: `Server: Microsoft-IIS/10.0`, type: 'output' },
      { text: `Date: ${new Date().toUTCString()}`, type: 'output' },
      { text: `<!doctype html><html><head><title>Corporate Intranet Portal</title></head><body><h1>Welcome to Corp Intranet</h1></body></html>`, type: 'output' },
    ];
  }

  private handleDir(hostId: string, args: string[]): TerminalOutputLine[] {
    const target = args[0]?.toLowerCase() || '';

    if (target.startsWith('\\\\fs-srv-01')) {
      const shares = this.networkEngine.getSharedFolders();
      const lines: TerminalOutputLine[] = [
        { text: ' Directory of \\\\FS-SRV-01', type: 'system' },
        { text: '', type: 'output' },
      ];
      shares.forEach((s) => {
        lines.push({ text: `08:00 AM    <DIR>          ${s.name}`, type: 'output' });
      });
      return lines;
    }

    return [
      { text: ' Directory of C:\\Users\\Administrator', type: 'system' },
      { text: '', type: 'output' },
      { text: '08:00 AM    <DIR>          Desktop', type: 'output' },
      { text: '08:00 AM    <DIR>          Documents', type: 'output' },
      { text: '08:00 AM    <DIR>          Downloads', type: 'output' },
      { text: '08:05 AM             1,420 network_troubleshooting_notes.txt', type: 'output' },
      { text: '               1 File(s)          1,420 bytes', type: 'output' },
      { text: '               3 Dir(s)   482,912,419,840 bytes free', type: 'output' },
    ];
  }

  private handleNet(hostId: string, args: string[]): TerminalOutputLine[] {
    const sub = args[0]?.toLowerCase();

    if (sub === 'view') {
      const shares = this.networkEngine.getSharedFolders();
      const lines: TerminalOutputLine[] = [
        { text: 'Shared resources at \\\\FS-SRV-01', type: 'system' },
        { text: '', type: 'output' },
        { text: 'Share name   Type    Used as  Comment', type: 'system' },
        { text: '-------------------------------------------------------------------------------', type: 'output' },
      ];
      shares.forEach((s) => {
        lines.push({ text: `${s.name.padEnd(12)} Disk             ${s.description}`, type: 'output' });
      });
      lines.push({ text: 'The command completed successfully.', type: 'success' });
      return lines;
    }

    if (sub === 'group') {
      const groupName = args[1];
      const username = args[2];
      const action = args[3]?.toLowerCase();

      if (action === '/add' && groupName && username) {
        const ok = this.networkEngine.addUserToGroup(username, groupName);
        if (ok) {
          return [{ text: `The command completed successfully. User ${username} added to group "${groupName}".`, type: 'success' }];
        }
        return [{ text: `Failed to add user ${username} to group ${groupName}.`, type: 'error' }];
      }

      return [{ text: 'Usage: net group <groupname> <username> /add', type: 'error' }];
    }

    if (sub === 'user') {
      const username = args[1]?.toLowerCase();
      if (!username) {
        const users = this.networkEngine.getAllADUsers().map((u) => u.username).join('  ');
        return [
          { text: 'User accounts for \\\\DC-SRV-01', type: 'system' },
          { text: '-------------------------------------------------------------------------------', type: 'output' },
          { text: users, type: 'output' },
          { text: 'The command completed successfully.', type: 'success' },
        ];
      }

      const user = this.networkEngine.getADUser(username);
      if (!user) {
        return [{ text: `The user name could not be found: ${username}`, type: 'error' }];
      }

      if (args[2]?.toLowerCase() === '/active:yes') {
        this.networkEngine.unlockADUser(username);
        return [{ text: `The command completed successfully. User ${username} account unlocked and activated.`, type: 'success' }];
      }

      return [
        { text: `User name                    ${user.username}`, type: 'output' },
        { text: `Full Name                    ${user.displayName}`, type: 'output' },
        { text: `Comment                      ${user.title} (${user.department})`, type: 'output' },
        { text: `Account active               ${user.isEnabled ? 'Yes' : 'No'}`, type: 'output' },
        { text: `Account locked out           ${user.isLocked ? 'Yes' : 'No'}`, type: user.isLocked ? 'error' : 'output' },
        { text: `Password expires             ${user.passwordExpired ? 'Yes' : 'No'}`, type: user.passwordExpired ? 'error' : 'output' },
        { text: `Global Group memberships     ${user.groups.join(', ')}`, type: 'output' },
        { text: 'The command completed successfully.', type: 'success' },
      ];
    }

    return [{ text: 'Usage: net user | net view | net group', type: 'error' }];
  }

  private handleNetstat(hostId: string, _args: string[]): TerminalOutputLine[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    return [
      { text: 'Active Connections', type: 'output' },
      { text: '', type: 'output' },
      { text: '  Proto  Local Address          Foreign Address        State', type: 'system' },
      { text: `  TCP    ${host.nic.ip}:135       0.0.0.0:0              LISTENING`, type: 'output' },
      { text: `  TCP    ${host.nic.ip}:445       0.0.0.0:0              LISTENING`, type: 'output' },
      { text: `  TCP    ${host.nic.ip}:3389      0.0.0.0:0              LISTENING`, type: 'output' },
      { text: `  TCP    ${host.nic.ip}:49668     192.168.10.200:88      ESTABLISHED`, type: 'output' },
      { text: `  TCP    ${host.nic.ip}:49670     192.168.10.200:389     ESTABLISHED`, type: 'output' },
      { text: `  UDP    ${host.nic.ip}:137       *:*`, type: 'output' },
      { text: `  UDP    ${host.nic.ip}:138       *:*`, type: 'output' },
    ];
  }

  private handleRoutePrint(hostId: string): TerminalOutputLine[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    return [
      { text: '===========================================================================', type: 'output' },
      { text: 'Interface List', type: 'output' },
      { text: `  1...${host.nic.mac.replace(/:/g, ' ')} ......Ethernet`, type: 'output' },
      { text: '===========================================================================', type: 'output' },
      { text: 'IPv4 Route Table', type: 'output' },
      { text: '===========================================================================', type: 'output' },
      { text: 'Active Routes:', type: 'system' },
      { text: 'Network Destination        Netmask          Gateway       Interface  Metric', type: 'system' },
      { text: `          0.0.0.0          0.0.0.0  ${host.nic.gateway.padEnd(15)}  ${host.nic.ip.padEnd(10)}      25`, type: 'output' },
      { text: `        127.0.0.0        255.0.0.0         On-link         127.0.0.1     331`, type: 'output' },
      { text: `     192.168.${host.vlan}.0    255.255.255.0         On-link   ${host.nic.ip.padEnd(10)}     281`, type: 'output' },
      { text: `  255.255.255.255  255.255.255.255         On-link   ${host.nic.ip.padEnd(10)}     281`, type: 'output' },
      { text: '===========================================================================', type: 'output' },
    ];
  }

  private handleSysteminfo(hostId: string): TerminalOutputLine[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    return [
      { text: `Host Name:                 ${host.id}`, type: 'output' },
      { text: `OS Name:                   Microsoft ${host.os}`, type: 'output' },
      { text: `OS Version:                10.0.22621 N/A Build 22621`, type: 'output' },
      { text: `OS Manufacturer:           Microsoft Corporation`, type: 'output' },
      { text: `Domain:                    corp.local`, type: 'output' },
      { text: `Logon Server:              \\\\DC-SRV-01`, type: 'output' },
      { text: `Network Card(s):           1 NIC(s) Installed.`, type: 'output' },
      { text: `                           [01]: Intel(R) 82574L Gigabit Network Connection`, type: 'output' },
      { text: `                                 Connection Name: Ethernet`, type: 'output' },
      { text: `                                 DHCP Enabled:    ${host.nic.dhcpEnabled ? 'Yes' : 'No'}`, type: 'output' },
      { text: `                                 IP address(es):  ${host.nic.ip}`, type: 'output' },
    ];
  }

  private handleGetService(hostId: string, args: string[]): TerminalOutputLine[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    const lines: TerminalOutputLine[] = [
      { text: 'Status   Name               DisplayName', type: 'system' },
      { text: '------   ----               -----------', type: 'system' },
    ];

    const filterName = args[0]?.toLowerCase();
    const svcs = filterName
      ? host.services.filter((s) => s.name.toLowerCase().includes(filterName) || s.id.toLowerCase().includes(filterName))
      : host.services;

    svcs.forEach((svc) => {
      const statusPadded = svc.status.toUpperCase().padEnd(8);
      const namePadded = svc.name.padEnd(18);
      lines.push({
        text: `${statusPadded} ${namePadded} ${svc.displayName}`,
        type: svc.status === 'running' ? 'output' : 'error',
      });
    });

    return lines;
  }

  private handleServiceControl(hostId: string, svcName: string, action: 'start' | 'restart' | 'stop'): TerminalOutputLine[] {
    if (!svcName) {
      return [{ text: `Usage: ${action}-service <service_name>`, type: 'error' }];
    }

    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    const svc = host.services.find(
      (s) => s.name.toLowerCase() === svcName.toLowerCase() || s.id.toLowerCase() === svcName.toLowerCase()
    );

    if (!svc) {
      return [{ text: `Cannot find any service with service name '${svcName}'.`, type: 'error' }];
    }

    if (action === 'start' || action === 'restart') {
      this.networkEngine.updateServiceStatus(hostId, svc.id, 'running');
      return [{ text: `Service '${svc.displayName} (${svc.name})' was started successfully.`, type: 'success' }];
    } else {
      this.networkEngine.updateServiceStatus(hostId, svc.id, 'stopped');
      return [{ text: `Service '${svc.displayName} (${svc.name})' was stopped.`, type: 'system' }];
    }
  }

  private handleGetNetIPConfiguration(hostId: string): TerminalOutputLine[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];

    return [
      { text: `InterfaceAlias               : ${host.nic.name}`, type: 'output' },
      { text: `InterfaceIndex               : 1`, type: 'output' },
      { text: `IPv4Address                  : ${host.nic.ip}`, type: 'output' },
      { text: `IPv4DefaultGateway           : ${host.nic.gateway}`, type: 'output' },
      { text: `DNSServer                    : ${host.nic.primaryDns}`, type: 'output' },
      { text: `NetProfile.Name              : corp.local`, type: 'output' },
      { text: `NetProfile.NetworkCategory   : DomainAuthenticated`, type: 'output' },
    ];
  }

  private handleSetDnsClientServerAddress(hostId: string, fullCommand: string): TerminalOutputLine[] {
    const ipMatches = fullCommand.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);

    if (!ipMatches || ipMatches.length === 0) {
      return [
        {
          text: 'Usage: Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("192.168.10.200", "8.8.8.8")',
          type: 'error',
        },
      ];
    }

    const primary = ipMatches[0];
    const secondary = ipMatches[1] || '';

    this.networkEngine.updateHostNic(hostId, {
      primaryDns: primary,
      secondaryDns: secondary,
    });

    return [
      {
        text: `DNS client server addresses updated for host ${hostId}: Primary=${primary}${secondary ? `, Secondary=${secondary}` : ''}.`,
        type: 'success',
      },
    ];
  }
}
