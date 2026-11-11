import { test, expect } from '@playwright/test';

test.describe('IT Ops Simulator E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Desktop environment and start menu load properly', async ({ page }) => {
    // Check Title
    await expect(page).toHaveTitle(/IT Ops Simulator/i);

    // Check Watermark
    await expect(page.locator('text=IT OPS SIMULATOR')).toBeVisible();
    await expect(page.locator('text=61 NODES')).toBeVisible();

    // Check Start button
    const startBtn = page.getByRole('button', { name: 'Start', exact: true });
    await expect(startBtn).toBeVisible();

    // Open Start Menu
    await startBtn.click();
    await expect(page.locator('text=Enterprise IT Suite')).toBeVisible();

    // Check that pinned tools appear in Start Menu
    const startMenu = page.locator('#start-menu-panel');
    await expect(startMenu.getByText('Helpdesk Tickets')).toBeVisible();
    await expect(startMenu.getByText('PowerShell / Terminal')).toBeVisible();
    await expect(startMenu.getByText('Remote Desktop (RDP)')).toBeVisible();
    await expect(startMenu.getByText('Task Manager (taskmgr.exe)')).toBeVisible();
    await expect(startMenu.getByText('Device Manager (devmgmt.msc)')).toBeVisible();
    await expect(startMenu.getByText('Active Directory Users')).toBeVisible();
    await expect(startMenu.getByText('Wireshark Packet Analyzer')).toBeVisible();

    // Close Start Menu
    await startBtn.click();
    await expect(page.locator('#start-menu-panel')).not.toBeVisible();
  });

  test('Ticket Queue inspection and INC-1042 failure check', async ({ page }) => {
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Verify Sarah Mitchell INC-1042 is present
    await expect(ticketsWin.getByText('INC-1042').first()).toBeVisible();
    await expect(ticketsWin.getByText('Finance department has no internet').first()).toBeVisible();

    // Click on INC-1042
    await ticketsWin.getByText('INC-1042').first().click();

    // Verify caller statement
    await expect(ticketsWin.getByText(/My computer says it's connected to the network, but I can't open any websites/i)).toBeVisible();

    // Click Verify Network & Resolve Ticket button
    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    // Should fail validation because DNS is still 192.168.10.250
    await expect(ticketsWin.getByText(/Verification Test Failed/i)).toBeVisible();
    await expect(ticketsWin.getByText(/PC-FIN-04 primary DNS is set to 192.168.10.250/i)).toBeVisible();
  });

  test('Fix INC-1042 via Remote Desktop adapter properties and verify resolution', async ({ page }) => {
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await ticketsWin.getByText('INC-1042').first().click();

    // Click button to open Remote Desktop for PC-FIN-04
    const rdpBtn = ticketsWin.getByRole('button', { name: /Remote Desktop \(PC-FIN-04\)/i });
    await rdpBtn.click();

    // Verify RDP window opened
    const rdpWin = page.locator('div[data-window-id="remote-desktop"]');
    await expect(rdpWin).toBeVisible();
    await expect(rdpWin.getByText(/Connected to PC-FIN-04/i)).toBeVisible();

    // Ensure Adapter Properties tab is active
    await rdpWin.getByRole('button', { name: /Adapter Properties/i }).click();

    // Find Preferred DNS input and change it to 192.168.10.200
    const dnsInput = rdpWin.locator('input[value="192.168.10.250"]');
    await expect(dnsInput).toBeVisible();
    await dnsInput.fill('192.168.10.200');

    // Click Apply & Save Configuration
    await rdpWin.getByRole('button', { name: /Apply & Save Configuration/i }).click();
    await expect(rdpWin.getByText(/Network Adapter settings saved successfully/i)).toBeVisible();

    // Switch focus back to Tickets window via Taskbar
    await page.locator('button[title="Helpdesk Tickets"]').click();

    // Click Verify Network & Resolve Ticket
    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await verifyBtn.click();

    // Verify success
    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('Active Directory management and INC-1043 unlock', async ({ page }) => {
    // Open Active Directory from taskbar or start menu
    const adIcon = page.getByTitle('Active Directory (dsa.msc)');
    await adIcon.click();

    const adWin = page.locator('div[data-window-id="active-directory"]');
    await expect(adWin).toBeVisible();

    // Filter OU=Engineering
    await adWin.getByRole('button', { name: /OU=Engineering/i }).click();

    // Select Liam Kumar inside Active Directory
    await adWin.getByText('Liam Kumar').first().click();
    await expect(adWin.getByText('Account Locked Out')).toBeVisible();

    // Click Unlock User Account
    const unlockBtn = adWin.getByRole('button', { name: /Unlock User Account/i });
    await expect(unlockBtn).toBeVisible();
    await unlockBtn.click();

    await expect(adWin.getByText(/unlocked successfully/i)).toBeVisible();
    await expect(adWin.getByText('Active & Unlocked')).toBeVisible();

    // Switch to Tickets window via Taskbar
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await ticketsWin.getByText('INC-1043').first().click();

    // Verify ticket resolves
    await ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i }).click();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('Task Manager rogue miner kill and INC-1058 resolution', async ({ page }) => {
    // Open Task Manager
    const taskmgrIcon = page.getByTitle('Task Manager (taskmgr.exe)');
    await taskmgrIcon.click();

    const taskmgrWin = page.locator('div[data-window-id="task-manager"]');
    await expect(taskmgrWin).toBeVisible();

    // Select SQL-PROD-01 from host dropdown if not default
    const hostSelect = taskmgrWin.locator('select').filter({ hasText: /SQL-PROD-01/i });
    if (await hostSelect.isVisible()) {
      await hostSelect.selectOption('SQL-PROD-01');
    }

    // Locate xmrig_miner.exe
    const rogueRow = taskmgrWin.locator('tr').filter({ hasText: 'xmrig_miner.exe' });
    await expect(rogueRow).toBeVisible();
    await rogueRow.click();

    // Click End Task
    const endTaskBtn = taskmgrWin.getByRole('button', { name: /End Task/i });
    await expect(endTaskBtn).toBeVisible();
    await endTaskBtn.click();

    // Verify process removed
    await expect(taskmgrWin.getByText(/terminated successfully/i)).toBeVisible();
    await expect(taskmgrWin.locator('tr').filter({ hasText: 'xmrig_miner.exe' })).not.toBeVisible();

    // Verify INC-1058 in Ticket Queue via Taskbar
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await ticketsWin.getByText('INC-1058').first().click();

    await ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i }).click();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('Terminal CLI executes diagnostic commands with authentic output', async ({ page }) => {
    // Open Terminal
    const termIcon = page.getByTitle('Admin Terminal');
    await termIcon.click();

    const termWin = page.locator('div[data-window-id="terminal"]');
    await expect(termWin).toBeVisible();

    // Run quick CLI button 'ipconfig /all'
    const ipconfigQuick = termWin.getByRole('button', { name: 'ipconfig /all' });
    await ipconfigQuick.click();

    await expect(termWin.getByText(/Windows IP Configuration/i).first()).toBeVisible();
    await expect(termWin.getByText(/Ethernet adapter/i).first()).toBeVisible();

    // Run quick CLI button 'ping 8.8.8.8'
    const pingQuick = termWin.getByRole('button', { name: 'ping 8.8.8.8' });
    await pingQuick.click();

    await expect(termWin.getByText(/Reply from 8.8.8.8: bytes=32/i).first()).toBeVisible();
  });

  test('Wireshark Packet Sniffer captures and displays network telemetry', async ({ page }) => {
    // Open Packet Sniffer
    const snifferIcon = page.getByTitle('Wireshark Packet Sniffer');
    await snifferIcon.click();

    const snifferWin = page.locator('div[data-window-id="packet-sniffer"]');
    await expect(snifferWin).toBeVisible();
    await expect(snifferWin.getByText(/CAPTURING eth0/i)).toBeVisible();

    // Should have captured packets
    const packetRows = snifferWin.locator('tbody tr');
    await expect(packetRows.first()).toBeVisible();

    // Click a packet row to inspect frame breakdown
    await packetRows.first().click();
    await expect(snifferWin.getByText(/Packet Frame Breakdown/i)).toBeVisible();
    await expect(snifferWin.getByText(/Internet Protocol Version 4/i)).toBeVisible();
  });

  test('Window close button cleanly closes windows and allows reopening', async ({ page }) => {
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Click close button on Tickets window
    const closeBtn = ticketsWin.locator('button[data-window-control="close"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Tickets window should be closed and unmounted
    await expect(ticketsWin).not.toBeAttached();

    // Reopen Tickets from taskbar
    await page.locator('button[title="Helpdesk Tickets"]').click();
    await expect(ticketsWin).toBeVisible();

    // Open Terminal from taskbar
    const termIcon = page.locator('button[title="Admin Terminal"]');
    await termIcon.click();
    const termWin = page.locator('div[data-window-id="terminal"]');
    await expect(termWin).toBeVisible();

    // Close Terminal window
    const termCloseBtn = termWin.locator('button[data-window-control="close"]');
    await termCloseBtn.click();
    await expect(termWin).not.toBeAttached();
  });

  test('Newly opened windows appear on top and stacking order updates on focus', async ({ page }) => {
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Open Active Directory from taskbar
    await page.locator('button[title="Active Directory (dsa.msc)"]').click();
    const adWin = page.locator('div[data-window-id="active-directory"]');
    await expect(adWin).toBeVisible();

    // Active Directory must have higher z-index than Tickets
    const ticketsZ1 = await ticketsWin.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex) || 0);
    const adZ1 = await adWin.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex) || 0);
    expect(adZ1).toBeGreaterThan(ticketsZ1);

    // Open Task Manager
    await page.locator('button[title="Task Manager (taskmgr.exe)"]').click();
    const taskmgrWin = page.locator('div[data-window-id="task-manager"]');
    await expect(taskmgrWin).toBeVisible();

    // Task Manager must be on top of Active Directory
    const taskmgrZ = await taskmgrWin.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex) || 0);
    expect(taskmgrZ).toBeGreaterThan(adZ1);

    // Click Tickets window to focus it
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsZ2 = await ticketsWin.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex) || 0);
    expect(ticketsZ2).toBeGreaterThan(taskmgrZ);

    // Minimize Tickets window
    await ticketsWin.locator('button[data-window-control="minimize"]').click();
    await expect(ticketsWin).toBeHidden();

    // Restore Tickets from Taskbar
    await page.locator('button[title="Helpdesk Tickets"]').click();
    await expect(ticketsWin).toBeVisible();
    const ticketsZ3 = await ticketsWin.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex) || 0);
    expect(ticketsZ3).toBeGreaterThan(taskmgrZ);
  });

  test('Email Client: inspect raw headers, quarantine phishing email MSG-101, and resolve INC-1060', async ({ page }) => {
    // Open Email Client from taskbar
    await page.locator('button[title="Email Client"]').click();
    const mailWin = page.locator('div[data-window-id="email-client"]');
    await expect(mailWin).toBeVisible();

    // Select MSG-101 email (Partner Corp Billing / Outstanding Vendor Invoice)
    await mailWin.getByText(/Outstanding Vendor Invoice/i).first().click();

    // Inspect Raw Headers modal
    const inspectBtn = mailWin.getByRole('button', { name: /Inspect Raw Headers/i });
    await expect(inspectBtn).toBeVisible();
    await inspectBtn.click();

    // Verify raw headers modal contents and SPF/DKIM spoof detection
    await expect(mailWin.getByText(/FAILED AUTHENTICATION \/ SPOOFED IDENTITY/i)).toBeVisible();
    await expect(mailWin.getByText(/Header Trace Log:/i)).toBeVisible();

    // Close raw headers modal
    await mailWin.getByText('Close', { exact: true }).click();
    await expect(mailWin.getByText(/Header Trace Log:/i)).not.toBeVisible();

    // Quarantine email
    const quarantineBtn = mailWin.getByRole('button', { name: /Quarantine Email/i });
    await expect(quarantineBtn).toBeVisible();
    await quarantineBtn.click();
    await expect(mailWin.getByText(/moved to quarantine/i)).toBeVisible();

    // Switch focus to Tickets window
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Select INC-1060
    await ticketsWin.getByText('INC-1060').first().click();

    // Verify and resolve ticket
    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('EDR Falcon Console: filter active detections, isolate PC-FIN-08, terminate DET-101, and resolve INC-1061', async ({ page }) => {
    // Open EDR Security Console from taskbar
    await page.locator('button[title="EDR Security Console"]').click();
    const edrWin = page.locator('div[data-window-id="edr-console"]');
    await expect(edrWin).toBeVisible();

    // Ensure Active detections tab is selected
    const activeTab = edrWin.getByRole('button', { name: /^Active/i }).first();
    await activeTab.click();

    // Select DET-101 threat detection
    const detRow = edrWin.getByText('DET-101').first();
    await expect(detRow).toBeVisible();
    await detRow.click();
    await expect(edrWin.getByText('PC-FIN-08').first()).toBeVisible();

    // Isolate host PC-FIN-08 from network
    const isolateBtn = edrWin.getByRole('button', { name: /Isolate Host/i });
    await expect(isolateBtn).toBeVisible();
    await isolateBtn.click();
    await expect(edrWin.getByText(/quarantined & isolated/i)).toBeVisible();

    // Terminate beacon threat process
    const terminateBtn = edrWin.getByRole('button', { name: /Terminate Threat/i });
    await expect(terminateBtn).toBeVisible();
    await terminateBtn.click();
    await expect(edrWin.getByText(/terminated on host|Marked as Remediated/i)).toBeVisible();

    // Switch focus to Tickets window
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Select INC-1061
    await ticketsWin.getByText('INC-1061').first().click();

    // Verify and resolve ticket
    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('Group Policy Management: link GPO-02 to Finance OU, verify effective policy, and resolve INC-1062', async ({ page }) => {
    // Open Group Policy from taskbar
    await page.locator('button[title="Group Policy (GPMC)"]').click();
    const gpoWin = page.locator('div[data-window-id="group-policy"]');
    await expect(gpoWin).toBeVisible();

    // Select Finance OU from left tree
    await gpoWin.getByRole('button', { name: /^OU=Finance/i }).click();

    // Select GPO-02 (Removable Storage Restriction)
    await gpoWin.getByText('Removable Storage Restriction').first().click();

    // Test unlinking and relinking to Finance OU
    const unlinkBtn = gpoWin.getByRole('button', { name: /Unlink from OU=Finance/i });
    if (await unlinkBtn.isVisible()) {
      await unlinkBtn.click();
      await expect(gpoWin.getByText(/unlinked from OU 'Finance'/i)).toBeVisible();
    }

    const linkBtn = gpoWin.getByRole('button', { name: /Link to OU=Finance/i });
    await expect(linkBtn).toBeVisible();
    await linkBtn.click();
    await expect(gpoWin.getByText(/linked to OU 'Finance'/i)).toBeVisible();

    // Verify Effective Policy Tester (RSOP) evaluates USB storage as BLOCKED for Finance host
    await expect(gpoWin.getByText('Effective Policy Tester (RSOP)')).toBeVisible();
    await expect(gpoWin.getByText('OU=Finance').first()).toBeVisible();
    await expect(gpoWin.getByText('BLOCKED').first()).toBeVisible();

    // Switch focus to Tickets window
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Select INC-1062
    await ticketsWin.getByText('INC-1062').first().click();

    // Verify and resolve ticket
    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('Backup & Disaster Recovery: restore ERP_Production_DB from SNAP-102, and resolve INC-1063', async ({ page }) => {
    // Open Backup & DR from taskbar
    await page.locator('button[title="Backup & DR"]').click();
    const backupWin = page.locator('div[data-window-id="backup-manager"]');
    await expect(backupWin).toBeVisible();

    // Switch server filter to SQL-PROD-01
    const sqlServerBtn = backupWin.getByRole('button', { name: 'SQL-PROD-01', exact: true });
    await expect(sqlServerBtn).toBeVisible();
    await sqlServerBtn.click();

    // Select SNAP-102 snapshot
    const snap102 = backupWin.getByText('SNAP-102').first();
    await expect(snap102).toBeVisible();
    await snap102.click();

    // Verify ERP_Production_DB is listed under included databases
    await expect(backupWin.getByText('ERP_Production_DB').first()).toBeVisible();

    // Click Restore SQL Database button
    const restoreBtn = backupWin.getByRole('button', { name: /Restore SQL Database/i });
    await expect(restoreBtn).toBeVisible();
    await restoreBtn.click();

    // Modal appears: verify target database and execute restore
    await expect(backupWin.getByText(/Confirm Point-in-Time Restore/i)).toBeVisible();
    const executeBtn = backupWin.getByRole('button', { name: /Execute Restore/i });
    await expect(executeBtn).toBeVisible();
    await executeBtn.click();

    // Wait for restore progress and toast notification
    await expect(backupWin.getByText(/successfully restored to point-in-time/i)).toBeVisible({ timeout: 10000 });

    // Switch focus to Tickets window
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Select INC-1063
    await ticketsWin.getByText('INC-1063').first().click();

    // Verify and resolve ticket
    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('Hardware Workbench: diagnose POST 55, swap RAM module from inventory shelf, verify POST 00, and resolve INC-1064', async ({ page }) => {
    // Open Hardware Workbench from taskbar
    await page.locator('button[title="Hardware Workbench"]').click();
    const hwWin = page.locator('div[data-window-id="hardware-bench"]');
    await expect(hwWin).toBeVisible();

    // Verify initial POST 55 memory fault
    await expect(hwWin.getByText('55', { exact: true })).toBeVisible();
    await expect(hwWin.getByText(/Memory Not Detected \/ Incompatible Module/i)).toBeVisible();

    // Power off workstation before component swap
    const powerOffBtn = hwWin.getByRole('button', { name: /Power Off/i });
    await expect(powerOffBtn).toBeVisible();
    await powerOffBtn.click();
    await expect(hwWin.getByText('POWER: OFF')).toBeVisible();

    // Select DIMM Slot 1
    await hwWin.getByText('DIMM Slot 1').first().click();

    // Locate 16GB DDR5 module on inventory shelf and click Install
    const ramInventoryCard = hwWin.locator('div.group').filter({ hasText: /16GB DDR5-5600 Module/i }).first();
    await expect(ramInventoryCard).toBeVisible();
    await ramInventoryCard.getByRole('button', { name: 'Install' }).click();

    await expect(hwWin.getByText(/Installed '16GB DDR5-5600 Module' into RAM_SLOT_1/i)).toBeVisible();

    // Reapply fresh thermal paste compound from inventory shelf
    const pasteInventoryCard = hwWin.locator('div.group').filter({ hasText: /Thermal Grizzly/i }).first();
    await expect(pasteInventoryCard).toBeVisible();
    await pasteInventoryCard.getByRole('button', { name: 'Install' }).click();
    await expect(hwWin.getByText(/thermal transfer restored/i)).toBeVisible();

    // Re-power on workstation
    const powerOnBtn = hwWin.getByRole('button', { name: /Power On/i });
    await expect(powerOnBtn).toBeVisible();
    await powerOnBtn.click();

    // Verify POST 00 code and repaired badge
    await expect(hwWin.getByText('00', { exact: true })).toBeVisible();
    await expect(hwWin.getByText(/Normal POST - All Hardware Verified/i)).toBeVisible();
    await expect(hwWin.getByText(/Hardware Repaired! Ready for deployment/i)).toBeVisible();

    // Switch focus to Tickets window
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Select INC-1064
    await ticketsWin.getByText('INC-1064').first().click();

    // Verify and resolve ticket
    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('VoIP Softphone: answer incoming call CALL-04, extract diagnostic clue, and resolve INC-1065', async ({ page }) => {
    // Select INC-1065 in Helpdesk Tickets
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();
    await ticketsWin.getByText('INC-1065').first().click();

    // Click Open VoIP Softphone button from ticket inspector
    const openPhoneBtn = ticketsWin.getByRole('button', { name: /Open VoIP Softphone/i });
    await expect(openPhoneBtn).toBeVisible();
    await openPhoneBtn.click();

    const phoneWin = page.locator('div[data-window-id="voip-phone"]');
    await expect(phoneWin).toBeVisible();

    // Verify incoming call from Elena Klein (CALL-04) is ringing
    await expect(phoneWin.getByText(/Incoming Call from Elena Klein/i)).toBeVisible();

    // Answer incoming call
    const answerBtn = phoneWin.getByRole('button', { name: /Answer Call|Answer Phone Line/i }).first();
    await expect(answerBtn).toBeVisible();
    await answerBtn.click();

    // Verify speech bubble from Elena Klein
    await expect(phoneWin.getByText(/Hello IT Support! The lobby visitor registration terminal/i)).toBeVisible();

    // Select diagnostic troubleshooting dialogue choice
    const diagChoice = phoneWin.getByText(/Can you check which network port the reception terminal connects to/i);
    await expect(diagChoice).toBeVisible();
    await diagChoice.click();

    // Verify technical clue notification extracted
    await expect(phoneWin.getByText(/Technical Clue Discovered!/i)).toBeVisible();
    await expect(phoneWin.getByText(/Reception desk Ethernet drop connects to Switch Port Gi1\/0\/12/i).first()).toBeVisible();

    // Switch focus to Tickets window
    await page.locator('button[title="Helpdesk Tickets"]').click();
    await ticketsWin.getByText('INC-1065').first().click();

    // Verify discovered clue appears inside the ticket card
    await expect(ticketsWin.getByText(/Discovered Call Clues \(VoIP Softphone\)/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Reception desk Ethernet drop connects to Switch Port Gi1\/0\/12 on VLAN 20/i)).toBeVisible();

    // Verify and resolve ticket
    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('Puzzle Hint: verify no inline spoilers by default, request Senior Sysadmin Clue, verify XP deduction and hint display', async ({ page }) => {
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Select INC-1042
    await ticketsWin.getByText('INC-1042').first().click();

    // Verify anti-spoiler: Senior Sysadmin Clue is NOT displayed by default
    await expect(ticketsWin.getByText(/Senior Sysadmin Clue:/i)).not.toBeVisible();
    await expect(ticketsWin.getByText(/Verify whether the DNS server configured on PC-FIN-04 is responsive/i)).not.toBeVisible();

    // Verify the Request Senior Sysadmin Clue (-25 XP) button is present
    const clueBtn = ticketsWin.getByRole('button', { name: /Request Senior Sysadmin Clue \(-25 XP\)/i });
    await expect(clueBtn).toBeVisible();

    // Initially XP is 0, so button is disabled with "(Requires 25 XP)" note
    await expect(clueBtn).toBeDisabled();
    await expect(ticketsWin.getByText(/\(Requires 25 XP\)/i)).toBeVisible();

    // Resolve a ticket (INC-1043) to earn 120 XP
    await page.locator('button[title="Active Directory (dsa.msc)"]').click();
    const adWin = page.locator('div[data-window-id="active-directory"]');
    await expect(adWin).toBeVisible();
    await adWin.getByRole('button', { name: /OU=Engineering/i }).click();
    await adWin.getByText('Liam Kumar').first().click();
    await adWin.getByRole('button', { name: /Unlock User Account/i }).click();

    await page.locator('button[title="Helpdesk Tickets"]').click();
    await ticketsWin.getByText('INC-1043').first().click();
    await ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i }).click();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();

    // Open Career Store to verify earned XP (120 XP)
    await page.locator('button[title="Career & Tech Store"]').click();
    const storeWin = page.locator('div[data-window-id="career-store"]');
    await expect(storeWin).toBeVisible();
    await expect(storeWin.getByText(/120 \/ 400 XP/i)).toBeVisible();

    // Switch back to Helpdesk Tickets and select INC-1042
    await page.locator('button[title="Helpdesk Tickets"]').click();
    await ticketsWin.getByText('INC-1042').first().click();

    // Now user has 120 XP >= 25 XP: button is enabled and "(Requires 25 XP)" note is gone
    await expect(clueBtn).toBeEnabled();
    await expect(ticketsWin.getByText(/\(Requires 25 XP\)/i)).not.toBeVisible();

    // Click Request Senior Sysadmin Clue (-25 XP)
    await clueBtn.click();

    // Verify hint is revealed with Senior Sysadmin Clue header
    await expect(ticketsWin.getByText(/Senior Sysadmin Clue:/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Verify whether the DNS server configured on PC-FIN-04 is responsive/i)).toBeVisible();
    await expect(clueBtn).not.toBeVisible();

    // Verify XP deduction in Career Store (120 - 25 = 95 XP)
    await page.locator('button[title="Career & Tech Store"]').click();
    await expect(storeWin).toBeVisible();
    await expect(storeWin.getByText(/95 \/ 400 XP/i)).toBeVisible();
  });

  test('Single click inside an unfocused scrolled window registers immediately and preserves scrollTop', async ({ page }) => {
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Open Terminal window so Tickets window becomes unfocused and has lower z-index
    await page.locator('button[title="Admin Terminal"]').click();
    const termWin = page.locator('div[data-window-id="terminal"]');
    await expect(termWin).toBeVisible();
    await termWin.evaluate((el: HTMLElement) => {
      el.style.left = '750px';
      el.style.top = '40px';
    });

    // Scroll the ticket list container down to the bottom inside the unfocused Tickets window
    const scrollContainer = ticketsWin.locator('div.overflow-y-auto').first();
    await scrollContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const initialScrollTop = await scrollContainer.evaluate((el) => el.scrollTop);
    expect(initialScrollTop).toBeGreaterThan(400);

    // Single-click a ticket item inside the unfocused Tickets window
    await ticketsWin.getByText('INC-1064').first().click();

    // Verify the single click selected INC-1064 on the first click AND preserved scrollTop (did not reset to 0)
    await expect(ticketsWin.getByRole('heading', { name: /Marketing PC fails to boot with repeated beeps/i })).toBeVisible();
    const afterClickScrollTop = await scrollContainer.evaluate((el) => el.scrollTop);
    expect(afterClickScrollTop).toBe(initialScrollTop);
  });
});

test.describe('NOC & Enterprise Infrastructure Expansion Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Server Rack Room: TDR cable test, patch replacement, RAID-5 hot-swap, and INC-1066 resolution', async ({ page }) => {
    // Open Server Rack Room from taskbar
    await page.locator('button[title="Server Rack Room"]').click();
    const rackWin = page.locator('div[data-window-id="rack-room"]');
    await expect(rackWin).toBeVisible();
    await expect(rackWin.getByText(/RACK ALERT: LAYER-1 \/ RAID DEGRADED/i)).toBeVisible();

    // Run TDR test on CBL-104
    const cable104Card = rackWin.getByTestId('cable-card-CBL-104');
    await expect(cable104Card).toBeVisible();
    await cable104Card.getByRole('button', { name: /Run TDR Test/i }).click();
    await expect(cable104Card.getByText(/TDR FAIL: NEXT\/FEXT near-end crosstalk/i)).toBeVisible();

    // Replace & Patch Cable CBL-104
    await cable104Card.getByRole('button', { name: /Replace & Patch Cable/i }).click();
    await expect(rackWin.getByText(/Replaced CBL-104 with certified Cat6A patch cord/i)).toBeVisible();
    await expect(cable104Card.getByText(/TDR PASS: CBL-104/i)).toBeVisible();

    // Hot-Swap Drive Bay 3 on FS-SRV-01 RAID-5 array
    const fsRaidCard = rackWin.getByTestId('raid-array-FS-SRV-01');
    await expect(fsRaidCard).toBeVisible();
    await fsRaidCard.getByRole('button', { name: /Hot-Swap Drive Bay 3/i }).click();
    await expect(rackWin.getByText(/Hot-swapped Drive Bay 3 on FS-SRV-01/i)).toBeVisible();
    await expect(rackWin.getByText(/RACK TELEMETRY: NOMINAL/i)).toBeVisible();

    // Resolve INC-1066 in Helpdesk Tickets
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();
    await ticketsWin.getByText('INC-1066').first().click();

    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();
    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('SIEM Threat Console: query logs, pin attack chain, block attacker IP, revoke svc_backup, and resolve INC-1067', async ({ page }) => {
    // Open SIEM Threat Console from taskbar
    await page.locator('button[title="SIEM Threat Console"]').click();
    const siemWin = page.locator('div[data-window-id="siem-console"]');
    await expect(siemWin).toBeVisible();

    // Filter logs by Attacker IP 185.220.101.44
    await siemWin.getByRole('button', { name: /Attacker IP 185\.220\.101\.44/i }).click();

    // Pin two correlated attack chain logs (LOG-1006 and LOG-1007)
    await siemWin.getByRole('button', { name: 'Pin Log LOG-1006' }).click();
    await siemWin.getByRole('button', { name: 'Pin Log LOG-1007' }).click();

    // Block attacker IP 185.220.101.44
    await siemWin.getByRole('button', { name: /Block Attacker IP \(185\.220\.101\.44\)/i }).click();
    await expect(siemWin.getByText(/Blocked: 185\.220\.101\.44/i)).toBeVisible();

    // Revoke compromised account svc_backup
    await siemWin.getByRole('button', { name: /Revoke Account \(svc_backup\)/i }).click();
    await expect(siemWin.getByText(/Revoked: svc_backup/i)).toBeVisible();

    // Verify SIEM case badge updates to contained
    await expect(siemWin.getByText(/Incident Contained & IOCs Blocked/i)).toBeVisible();

    // Resolve INC-1067 in Helpdesk Tickets
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();
    await ticketsWin.getByText('INC-1067').first().click();

    const verifyBtn = ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i });
    await verifyBtn.click();
    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('Change Control (CAB): HA failover, rollback plan, CAB approval, CR-202 execution, SSL renewal, and INC-1068 / INC-1071 resolution', async ({ page }) => {
    // Open Change Control (CAB) from taskbar
    await page.locator('button[title="Change Control (CAB)"]').click();
    const cabWin = page.locator('div[data-window-id="change-control"]');
    await expect(cabWin).toBeVisible();

    // Verify CR-202 is selected and in Draft status
    await expect(cabWin.getByTestId('selected-cr-status')).toHaveText('Draft');

    // Enable HA Failover Replica
    await cabWin.getByRole('button', { name: /Enable HA Failover Replica/i }).click();
    await expect(cabWin.getByText('ACTIVE (SYNCED)')).toBeVisible();

    // Attach Rollback Plan
    await cabWin.getByRole('button', { name: /Attach Rollback Plan/i }).click();
    await expect(cabWin.getByText('ATTACHED', { exact: true })).toBeVisible();

    // Request CAB Approval
    await cabWin.getByRole('button', { name: /Request CAB Approval/i }).click();
    await expect(cabWin.getByTestId('selected-cr-status')).toHaveText('Approved');

    // Execute Maintenance
    await cabWin.getByRole('button', { name: /Execute Maintenance/i }).click();
    await expect(cabWin.getByTestId('selected-cr-status')).toHaveText('Completed');

    // Renew TLS Certificate for WEB-INTRA-01
    await expect(cabWin.getByText('EXPIRED CERTIFICATE')).toBeVisible();
    await cabWin.getByRole('button', { name: /Renew TLS Certificate/i }).click();
    await expect(cabWin.getByText('Valid TLS 1.3 Certificate')).toBeVisible();

    // Switch to Helpdesk Tickets and resolve INC-1068 and INC-1071
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();

    // Resolve INC-1068
    await ticketsWin.getByText('INC-1068').first().click();
    await ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i }).click();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();

    // Resolve INC-1071
    await ticketsWin.getByText('INC-1071').first().click();
    await ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i }).click();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('DHCP & DNS Manager: purge rogue leases on VLAN 40, fix portal.corp.local A record, and resolve INC-1069', async ({ page }) => {
    // Open DHCP & DNS Manager from taskbar
    await page.locator('button[title="DHCP & DNS Manager"]').click();
    const dhcpWin = page.locator('div[data-window-id="dhcp-dns"]');
    await expect(dhcpWin).toBeVisible();

    // SCOPE-VLAN40 is selected by default; purge rogue leases
    await expect(dhcpWin.getByText(/SCOPE-VLAN40: Sales Floor/i)).toBeVisible();
    await dhcpWin.getByRole('button', { name: /Purge Rogue Leases/i }).click();
    await expect(dhcpWin.getByText(/Purged 12 rogue DHCP leases from SCOPE-VLAN40/i)).toBeVisible();

    // Switch to DNS Zone (corp.local) tab
    await dhcpWin.getByRole('button', { name: /DNS Zone \(corp\.local\)/i }).click();
    await expect(dhcpWin.getByText(/Authoritative Forward Lookup Zone: corp\.local/i)).toBeVisible();

    // Fix corrupted portal.corp.local A record -> 192.168.10.202
    const portalRow = dhcpWin.getByTestId('dns-row-REC-PORTAL');
    await expect(portalRow).toBeVisible();
    const fixBtn = portalRow.getByRole('button', { name: /Fix Record -> 192\.168\.10\.202/i });
    await expect(fixBtn).toBeVisible();
    await fixBtn.click();
    await expect(dhcpWin.getByText(/Updated DNS record portal\.corp\.local \(A\) -> 192\.168\.10\.202/i)).toBeVisible();

    // Resolve INC-1069 in Helpdesk Tickets
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();
    await ticketsWin.getByText('INC-1069').first().click();

    await ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i }).click();
    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('Automation Script Studio: execute PLAYBOOK-ENG-REMEDIATE on OU=Engineering and resolve INC-1070', async ({ page }) => {
    // Open Automation Script Studio from taskbar
    await page.locator('button[title="Automation Script Studio"]').click();
    const scriptWin = page.locator('div[data-window-id="script-studio"]');
    await expect(scriptWin).toBeVisible();

    // Verify PLAYBOOK-ENG-REMEDIATE and OU=Engineering are selected
    await expect(scriptWin.getByText('PLAYBOOK-ENG-REMEDIATE').first()).toBeVisible();
    const scopeSelect = scriptWin.getByLabel('Target Scope');
    await expect(scopeSelect).toHaveValue('OU=Engineering');

    // Click Execute Playbook
    await scriptWin.getByRole('button', { name: /Execute Playbook/i }).click();

    // Verify live stdout logs and Playbook Execution Succeeded badge
    await expect(scriptWin.getByText(/Playbook Execution Succeeded/i)).toBeVisible();
    await expect(scriptWin.getByText(/Successfully flushed the DNS Resolver Cache/i).first()).toBeVisible();

    // Resolve INC-1070 in Helpdesk Tickets
    await page.locator('button[title="Helpdesk Tickets"]').click();
    const ticketsWin = page.locator('div[data-window-id="tickets"]');
    await expect(ticketsWin).toBeVisible();
    await ticketsWin.getByText('INC-1070').first().click();

    await ticketsWin.getByRole('button', { name: /Verify Network & Resolve Ticket/i }).click();
    await expect(ticketsWin.getByText(/Network Verification Successful!/i)).toBeVisible();
    await expect(ticketsWin.getByText(/Ticket Verified & Closed/i)).toBeVisible();
  });

  test('End-of-Shift Report Card modal displays SLA grade and starts next shift', async ({ page }) => {
    // Click End Shift button in Taskbar
    const endShiftBtn = page.getByRole('button', { name: /End Shift/i });
    await expect(endShiftBtn).toBeVisible();
    await endShiftBtn.click();

    // Verify ShiftReportModal opens with SLA grade badge and metrics
    const modal = page.getByTestId('shift-report-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/End of Shift Report — Day 1/i)).toBeVisible();
    await expect(modal.getByTestId('shift-grade-badge')).toContainText(/Grade [SABCF]/);
    await expect(modal.getByText(/Overall Shift SLA Rating/i)).toBeVisible();

    // Click Start Next Shift
    await modal.getByRole('button', { name: /Start Next Shift/i }).click();

    // Verify modal closes and taskbar advances to Day 2
    await expect(modal).not.toBeVisible();
    await expect(page.getByText('Day 2', { exact: true })).toBeVisible();
  });
});

