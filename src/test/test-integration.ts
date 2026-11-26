import fs from 'fs';
import path from 'path';
import http from 'http';
import assert from 'assert';
import { LocalSharingServer } from '../server/index';
import { ConfigStore } from '../main/store';
import { getLocalNetworkInterfaces, getPrimaryLocalIp } from '../main/network';

async function runIntegrationSuite() {
  console.log('=============================================');
  console.log('LOCALSHARE COMPREHENSIVE INTEGRATION TEST SUITE');
  console.log('=============================================\n');

  // 1. Verify build artifacts
  console.log('Test 1: Verifying Desktop UI and Electron Build Outputs...');
  const nextHtml = path.join(__dirname, '../../out/index.html');
  const mainJs = path.join(__dirname, '../../dist-electron/main/index.js');
  const preloadJs = path.join(__dirname, '../../dist-electron/preload/index.js');

  assert(fs.existsSync(nextHtml), 'out/index.html must exist');
  assert(fs.existsSync(mainJs), 'dist-electron/main/index.js must exist');
  assert(fs.existsSync(preloadJs), 'dist-electron/preload/index.js must exist');
  console.log('✓ Next.js static export & Electron build files verified.\n');

  // 2. Test Network interface detection
  console.log('Test 2: Verifying Cross-Platform Network Interface Detection...');
  const interfaces = getLocalNetworkInterfaces();
  const primaryIp = getPrimaryLocalIp();
  console.log(`✓ Detected ${interfaces.length} network interfaces:`);
  interfaces.forEach((iface) => {
    console.log(`   - [${iface.name}] IPv4: ${iface.address} (Internal: ${iface.internal})`);
  });
  console.log(`✓ Primary Local IPv4 determined: ${primaryIp}\n`);
  assert(primaryIp.length > 0, 'Must have a primary IP');

  // 3. Test ConfigStore
  console.log('Test 3: Verifying Configuration Store & Folder Operations...');
  const store = new ConfigStore();
  const initialFolders = store.getFolders();
  console.log(`✓ Loaded initial folders: ${initialFolders.length}`);

  const testFolder1 = path.join(__dirname, '../../test-integration-folder1');
  const testFolder2 = path.join(__dirname, '../../test-integration-folder2');
  if (fs.existsSync(testFolder1)) fs.rmSync(testFolder1, { recursive: true, force: true });
  if (fs.existsSync(testFolder2)) fs.rmSync(testFolder2, { recursive: true, force: true });
  fs.mkdirSync(testFolder1, { recursive: true });
  fs.mkdirSync(testFolder2, { recursive: true });

  fs.writeFileSync(path.join(testFolder1, 'doc.pdf'), '%PDF-1.4 sample PDF');
  fs.writeFileSync(path.join(testFolder1, 'image.png'), 'fake png data');
  fs.writeFileSync(path.join(testFolder2, 'video.mp4'), 'fake mp4 video bytes 1234567890');

  const added1 = store.addFolder(testFolder1, 'Documents & Photos');
  const added2 = store.addFolder(testFolder2, 'Videos');
  assert.strictEqual(added1.displayName, 'Documents & Photos');
  assert.strictEqual(added2.displayName, 'Videos');

  store.renameFolder(added1.id, 'Renamed Docs');
  const renamed = store.getFolders().find((f) => f.id === added1.id);
  assert.strictEqual(renamed?.displayName, 'Renamed Docs');

  store.toggleFolder(added2.id, false); // Disable folder 2
  const disabled = store.getFolders().find((f) => f.id === added2.id);
  assert.strictEqual(disabled?.enabled, false);
  console.log('✓ Folder add, rename, and enable/disable operations verified.\n');

  // 4. Test Local Server with real multi-folder sharing
  console.log('Test 4: Verifying Local HTTP Server Multi-Folder Access...');
  const testPort = 3991;
  const server = new LocalSharingServer(
    () => store.getFolders(),
    () => store.getSettings()
  );

  await server.start(testPort);
  assert.strictEqual(server.isRunning(), true);
  console.log(`✓ Sharing server active on http://127.0.0.1:${testPort}`);

  const makeReq = (urlPath: string, headers: Record<string, string> = {}): Promise<{ status: number; body: string; headers: http.IncomingHttpHeaders }> => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: testPort,
          path: urlPath,
          headers,
        },
        (res) => {
          let b = '';
          res.on('data', (c) => (b += c));
          res.on('end', () => resolve({ status: res.statusCode || 0, body: b, headers: res.headers }));
        }
      );
      req.on('error', reject);
      req.end();
    });
  };

  // Browse root: should only list enabled folder (Folder 1), NOT disabled Folder 2
  const browseRoot = await makeReq('/api/browse');
  const rootData = JSON.parse(browseRoot.body);
  assert.strictEqual(rootData.items.length, 1, 'Only enabled folders must appear at root');
  assert.strictEqual(rootData.items[0].name, 'Renamed Docs');
  console.log('✓ Disabled folder correctly hidden from network.');

  // Access disabled folder directly: should return 404
  const accessDisabled = await makeReq(`/api/browse?folder=${added2.id}`);
  assert.strictEqual(accessDisabled.status, 404, 'Disabled folder direct access must return 404');
  console.log('✓ Direct request to disabled folder correctly returned 404.');

  // Access enabled folder: should list files
  const browseFolder1 = await makeReq(`/api/browse?folder=${added1.id}`);
  assert.strictEqual(browseFolder1.status, 200);
  const folder1Data = JSON.parse(browseFolder1.body);
  assert.strictEqual(folder1Data.items.length, 2);
  const pdfItem = folder1Data.items.find((i: any) => i.name === 'doc.pdf');
  assert(pdfItem && pdfItem.category === 'document', 'PDF category check');
  console.log('✓ Folder contents and automatic category metadata verified.');

  // 5. Test File Downloading and Previews
  console.log('Test 5: Verifying File Download & Stream Header Integrity...');
  const downloadRes = await makeReq(`/api/download?folder=${added1.id}&path=doc.pdf`);
  assert.strictEqual(downloadRes.status, 200);
  assert(downloadRes.headers['content-disposition']?.includes('attachment; filename="doc.pdf"'));
  assert.strictEqual(downloadRes.headers['content-type'], 'application/pdf');

  const previewRes = await makeReq(`/api/preview?folder=${added1.id}&path=doc.pdf`);
  assert.strictEqual(previewRes.status, 200);
  assert(previewRes.headers['content-disposition']?.includes('inline; filename="doc.pdf"'));
  console.log('✓ Download (attachment) and Preview (inline) headers verified.\n');

  // 6. Test Path Traversal and Security Boundaries
  console.log('Test 6: Stress Testing Path Traversal Defense & Security Boundaries...');
  const forbiddenAttempts = [
    `/api/browse?folder=${added1.id}&path=../`,
    `/api/browse?folder=${added1.id}&path=../../`,
    `/api/browse?folder=${added1.id}&path=..%2f..%2f`,
    `/api/download?folder=${added1.id}&path=../../../etc/passwd`,
    `/api/download?folder=${added1.id}&path=..\\..\\Windows\\System32\\cmd.exe`,
    `/api/download?folder=${added1.id}&path=doc.pdf%00secret.txt`,
  ];

  for (const attackUrl of forbiddenAttempts) {
    const res = await makeReq(attackUrl);
    assert(
      res.status === 403 || res.status === 400 || res.status === 404,
      `Traversal attack [${attackUrl}] must fail safely! Received status: ${res.status}`
    );
  }
  console.log(`✓ All ${forbiddenAttempts.length} path traversal attack vectors safely thwarted.\n`);

  // 7. Test Visitor & Device Tracking
  console.log('Test 7: Verifying Visitor & Device Tracking Analytics...');
  const tracker = server.getTracker();
  const devices = tracker.getDevices();
  assert(devices.length > 0);
  console.log(`✓ Tracked ${devices.length} devices, Total requests: ${tracker.getTotalRequests()}`);
  console.log(`   - Client: ${devices[0].ip}, Active: ${devices[0].isActive}, Requests: ${devices[0].requestCount}\n`);

  // 8. Clean up
  console.log('Test 8: Shutting Down Server and Cleaning Up Test Fixtures...');
  await server.stop();
  assert.strictEqual(server.isRunning(), false);

  store.removeFolder(added1.id);
  store.removeFolder(added2.id);
  fs.rmSync(testFolder1, { recursive: true, force: true });
  fs.rmSync(testFolder2, { recursive: true, force: true });
  console.log('✓ Clean teardown successful.\n');

  console.log('================================================================');
  console.log('ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY WITH ZERO FAILURES!');
  console.log('================================================================');
}

runIntegrationSuite().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
