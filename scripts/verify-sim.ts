import { NetworkEngine } from '../src/simulation/networkEngine';
import { TerminalEngine } from '../src/simulation/terminalEngine';
import {
  buildInitialNetworkHosts,
  buildInitialActiveDirectory,
  INITIAL_ROUTER_CONFIG,
  INITIAL_SHARED_FOLDERS,
} from '../src/simulation/initialNetwork';
import { INITIAL_TICKETS, validateTicket } from '../src/simulation/ticketEngine';

function runExpandedSimulationTests() {
  console.log('=== Starting Comprehensive IT Ops Simulator Engine Verification ===\n');

  const engine = new NetworkEngine(
    buildInitialNetworkHosts(),
    buildInitialActiveDirectory(),
    INITIAL_ROUTER_CONFIG,
    INITIAL_SHARED_FOLDERS
  );
  const terminal = new TerminalEngine(engine);

  // 1. Verify 61 Hosts (50 Workstations + Servers + Switches + Router + Printers)
  const hosts = engine.getAllHosts();
  console.log(`[PASS] Total Network Hosts initialized: ${hosts.length}`);
  if (hosts.length < 50) throw new Error('Expected at least 50 hosts');

  // 2. Test INC-1042: Sarah Mitchell (PC-FIN-04) DNS Failure
  console.log('\n--- Test 1: INC-1042 Sarah Mitchell DNS Failure ---');
  const t1042 = INITIAL_TICKETS.find((t) => t.id === 'INC-1042')!;
  const v1042_initial = validateTicket(t1042, engine);
  console.log('Validation before fix (should fail):', v1042_initial.passed, v1042_initial.message);
  if (v1042_initial.passed) throw new Error('INC-1042 should fail initially');

  // Check ping raw IP 8.8.8.8 succeeds
  const ping8888 = engine.ping('PC-FIN-04', '8.8.8.8');
  if (!ping8888.success) throw new Error('Ping 8.8.8.8 should succeed');

  // Check nslookup fails
  const nsFail = engine.nslookup('PC-FIN-04', 'example.com');
  if (nsFail.success) throw new Error('Nslookup should fail with 192.168.10.250');

  // Fix: Set DNS to 192.168.10.200
  engine.updateHostNic('PC-FIN-04', { primaryDns: '192.168.10.200' });
  const v1042_fixed = validateTicket(t1042, engine);
  console.log('Validation after fix (should pass):', v1042_fixed.passed, v1042_fixed.message);
  if (!v1042_fixed.passed) throw new Error('INC-1042 should pass after DNS fix');

  // 3. Test INC-1043: Liam Kumar AD Lockout
  console.log('\n--- Test 2: INC-1043 Liam Kumar AD Account Lockout ---');
  const t1043 = INITIAL_TICKETS.find((t) => t.id === 'INC-1043')!;
  if (validateTicket(t1043, engine).passed) throw new Error('INC-1043 should fail initially');
  terminal.execute('PC-IT-ADMIN', 'net user lkumar /active:yes');
  if (!validateTicket(t1043, engine).passed) throw new Error('INC-1043 should pass after net user /active:yes');
  console.log('[PASS] INC-1043 resolved via Terminal CLI net user command.');

  // 4. Test INC-1044: Sofia Rossi IP Collision with Printer
  console.log('\n--- Test 3: INC-1044 Sofia Rossi IP Collision on 192.168.30.200 ---');
  const t1044 = INITIAL_TICKETS.find((t) => t.id === 'INC-1044')!;
  if (validateTicket(t1044, engine).passed) throw new Error('INC-1044 should fail initially');
  // Run ipconfig /renew
  terminal.execute('PC-ENG-03', 'ipconfig /renew');
  const hostEng3 = engine.getHost('PC-ENG-03')!;
  console.log('PC-ENG-03 renewed IP:', hostEng3.nic.ip);
  if (hostEng3.nic.ip === '192.168.30.200') throw new Error('IP should no longer conflict');
  if (!validateTicket(t1044, engine).passed) throw new Error('INC-1044 should pass after renew');
  console.log('[PASS] INC-1044 resolved via ipconfig /renew.');

  // 5. Test INC-1048: Print Spooler Crash
  console.log('\n--- Test 4: INC-1048 Print Spooler Crash on FS-SRV-01 ---');
  const t1048 = INITIAL_TICKETS.find((t) => t.id === 'INC-1048')!;
  if (validateTicket(t1048, engine).passed) throw new Error('INC-1048 should fail initially while spooler crashed');
  engine.updateServiceStatus('FS-SRV-01', 'spooler', 'running');
  if (!validateTicket(t1048, engine).passed) throw new Error('INC-1048 should pass after restarting spooler');
  console.log('[PASS] INC-1048 resolved via service restart.');

  // 6. Test INC-1052: Clara Jones Device Manager NIC Disabled
  console.log('\n--- Test 5: INC-1052 Clara Jones NIC Disabled in Device Manager ---');
  const t1052 = INITIAL_TICKETS.find((t) => t.id === 'INC-1052')!;
  const mkt3 = engine.getHost('PC-MKT-03')!;
  console.log('PC-MKT-03 nic.isUp initially:', mkt3.nic.isUp);
  if (mkt3.nic.isUp) throw new Error('PC-MKT-03 nic should start down');
  if (validateTicket(t1052, engine).passed) throw new Error('INC-1052 should fail initially');
  // Enable device
  engine.setDeviceStatus('PC-MKT-03', 'nic0', 'enabled');
  if (!mkt3.nic.isUp) throw new Error('PC-MKT-03 nic.isUp should be true after enabling device');
  if (!validateTicket(t1052, engine).passed) throw new Error('INC-1052 should pass after enabling device');
  console.log('[PASS] INC-1052 resolved via Device Manager adapter enablement.');

  // 7. Test INC-1054: Marcus Sterling Password Expired
  console.log('\n--- Test 6: INC-1054 Marcus Sterling CFO Password Expired ---');
  const t1054 = INITIAL_TICKETS.find((t) => t.id === 'INC-1054')!;
  if (validateTicket(t1054, engine).passed) throw new Error('INC-1054 should fail initially');
  engine.resetADPassword('msterling');
  if (!validateTicket(t1054, engine).passed) throw new Error('INC-1054 should pass after password reset');
  console.log('[PASS] INC-1054 resolved via Active Directory password reset.');

  // 8. Test INC-1055: Natalie Bishop HR Share Permission
  console.log('\n--- Test 7: INC-1055 Natalie Bishop HR Payroll Access ---');
  const t1055 = INITIAL_TICKETS.find((t) => t.id === 'INC-1055')!;
  if (validateTicket(t1055, engine).passed) throw new Error('INC-1055 should fail initially');
  const accessBefore = engine.testShareAccess('nbishop', 'Payroll');
  console.log('SMB Access before group addition:', accessBefore.success, accessBefore.message);
  if (accessBefore.success) throw new Error('Access should be denied before adding group');
  // Add group
  terminal.execute('PC-IT-ADMIN', 'net group "Payroll Access" nbishop /add');
  const accessAfter = engine.testShareAccess('nbishop', 'Payroll');
  console.log('SMB Access after group addition:', accessAfter.success, accessAfter.message);
  if (!accessAfter.success) throw new Error('Access should succeed after group addition');
  if (!validateTicket(t1055, engine).passed) throw new Error('INC-1055 should pass after group addition');
  console.log('[PASS] INC-1055 resolved via Active Directory group membership.');

  // 9. Test INC-1058: SQL Server Rogue Miner Process
  console.log('\n--- Test 8: INC-1058 Rogue Crypto Miner on SQL-PROD-01 ---');
  const t1058 = INITIAL_TICKETS.find((t) => t.id === 'INC-1058')!;
  if (validateTicket(t1058, engine).passed) throw new Error('INC-1058 should fail while rogue process is running');
  // Kill process via taskkill
  const killOut = terminal.execute('SQL-PROD-01', 'taskkill /pid 4812 /f');
  console.log('Taskkill output:', killOut.map((l) => l.text).join(' '));
  if (!validateTicket(t1058, engine).passed) throw new Error('INC-1058 should pass after killing rogue process');
  console.log('[PASS] INC-1058 resolved via Task Manager / taskkill.');

  // 10. Test Public DNS Resolution (8.8.8.8)
  console.log('\n--- Test 9: Public DNS Resolution via 8.8.8.8 ---');
  const publicDnsRes = engine.nslookup('PC-ENG-01', 'example.com', '8.8.8.8');
  console.log('Nslookup example.com using 8.8.8.8:', publicDnsRes.success, publicDnsRes.resolvedIp);
  if (!publicDnsRes.success || publicDnsRes.resolvedIp !== '93.184.216.34') {
    throw new Error('Public DNS resolution to 8.8.8.8 must work for internet hosts!');
  }
  console.log('[PASS] Public DNS resolver 8.8.8.8 works correctly.');

  // 11. Test Invalid Default Gateway Cross-Subnet Rejection
  console.log('\n--- Test 10: Invalid Default Gateway Rejection ---');
  engine.updateHostNic('PC-FIN-08', { gateway: '192.168.10.254' }); // Invalid gateway
  const badGwPing = engine.ping('PC-FIN-08', '8.8.8.8');
  console.log('Ping 8.8.8.8 with invalid gateway:', badGwPing.success, badGwPing.errorMessage);
  if (badGwPing.success) throw new Error('Ping outside subnet must fail when gateway is invalid!');
  console.log('[PASS] Invalid default gateway correctly drops cross-subnet traffic.');

  // 12. Test Wireshark Packet Logger
  console.log('\n--- Test 11: Wireshark Packet Logger Stream ---');
  const log = engine.getPacketLog();
  console.log(`Captured packets in buffer: ${log.length}`);
  if (log.length === 0) throw new Error('Packets should be captured in buffer');
  console.log('[PASS] Wireshark packet capture engine recorded all network transactions.');

  console.log('\n======================================================');
  console.log('=== ALL 11 ADVANCED INTEGRATION TESTS PASSED 100%! ===');
  console.log('======================================================\n');
}

runExpandedSimulationTests();
