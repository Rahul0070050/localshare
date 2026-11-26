import fs from 'fs';
import path from 'path';
import http from 'http';
import assert from 'assert';
import { LocalSharingServer } from '../server/index';
import { SharedFolder, ServerSettings } from '../shared/types';

async function runTests() {
  console.log('--- Starting LocalSharingServer Test Suite ---');

  // Setup temp directory
  const testDir = path.join(__dirname, '../../test-fixtures');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const subDir = path.join(testDir, 'subfolder');
  fs.mkdirSync(subDir);

  const testFile = path.join(testDir, 'hello.txt');
  fs.writeFileSync(testFile, 'Hello from LocalShare test file! 1234567890');

  const nestedFile = path.join(subDir, 'nested.txt');
  fs.writeFileSync(nestedFile, 'Nested content');

  let folders: SharedFolder[] = [
    {
      id: 'folder-1',
      originalPath: testDir,
      displayName: 'Test Shared Folder',
      enabled: true,
      createdAt: Date.now(),
    },
  ];

  let settings: ServerSettings = {
    port: 3987,
    theme: 'dark',
    passwordProtection: false,
    autoStartSharing: false,
    minimizeToTray: false,
    launchAtStartup: false,
  };

  const server = new LocalSharingServer(
    () => folders,
    () => settings
  );

  console.log('1. Testing server startup...');
  const { port } = await server.start(3987);
  assert.strictEqual(port, 3987, 'Server should start on port 3987');
  assert.strictEqual(server.isRunning(), true, 'Server should report running state');
  console.log('✓ Server running on port', port);

  // Helper for HTTP requests
  const makeRequest = (
    path: string,
    options: http.RequestOptions = {}
  ): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path,
          ...options,
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            resolve({ status: res.statusCode || 0, headers: res.headers, body: data });
          });
        }
      );
      req.on('error', reject);
      if (options.method === 'POST' && (options as any).body) {
        req.write((options as any).body);
      }
      req.end();
    });
  };

  console.log('2. Testing root HTML web explorer...');
  const rootRes = await makeRequest('/');
  assert.strictEqual(rootRes.status, 200);
  assert(rootRes.body.includes('LocalShare'), 'Root should contain LocalShare UI');
  console.log('✓ Web File Explorer served');

  console.log('3. Testing /api/browse at root...');
  const browseRoot = await makeRequest('/api/browse');
  assert.strictEqual(browseRoot.status, 200);
  const rootJson = JSON.parse(browseRoot.body);
  assert.strictEqual(rootJson.items.length, 1);
  assert.strictEqual(rootJson.items[0].name, 'Test Shared Folder');
  console.log('✓ Root folder listing returned correctly');

  console.log('4. Testing /api/browse inside folder...');
  const browseFolder = await makeRequest('/api/browse?folder=folder-1');
  assert.strictEqual(browseFolder.status, 200);
  const folderJson = JSON.parse(browseFolder.body);
  assert.strictEqual(folderJson.items.length, 2);
  const fileItem = folderJson.items.find((i: any) => i.name === 'hello.txt');
  assert(fileItem, 'hello.txt must be listed');
  assert.strictEqual(fileItem.isDirectory, false);
  console.log('✓ Subdirectory browsing succeeded');

  console.log('5. Testing security against path traversal attacks...');
  // Directory traversal attacks
  const attack1 = await makeRequest('/api/browse?folder=folder-1&path=../');
  assert.strictEqual(attack1.status, 403, 'Path traversal ../ must be rejected with 403');

  const attack2 = await makeRequest('/api/browse?folder=folder-1&path=..%2F..%2Fwindows');
  assert.strictEqual(attack2.status, 403, 'Encoded traversal must be rejected with 403');

  const attack3 = await makeRequest('/api/download?folder=folder-1&path=..%2F..%2Fetc%2Fpasswd');
  assert.strictEqual(attack3.status, 403, 'Download traversal must be rejected with 403');

  const attackNull = await makeRequest('/api/download?folder=folder-1&path=hello.txt%00.png');
  assert.strictEqual(attackNull.status, 403, 'Null byte attack must be rejected with 403');
  console.log('✓ All path traversal and injection attacks successfully blocked');

  console.log('6. Testing file download with original filename...');
  const downloadRes = await makeRequest('/api/download?folder=folder-1&path=hello.txt');
  assert.strictEqual(downloadRes.status, 200);
  assert(downloadRes.headers['content-disposition']?.includes('filename="hello.txt"'));
  assert(downloadRes.body.includes('Hello from LocalShare test file!'));
  console.log('✓ File download verified');

  console.log('7. Testing Range requests (HTTP 206 Partial Content for video/audio seek)...');
  const rangeRes = await makeRequest('/api/preview?folder=folder-1&path=hello.txt', {
    headers: { Range: 'bytes=0-4' },
  });
  assert.strictEqual(rangeRes.status, 206, 'Must return 206 Partial Content');
  assert.strictEqual(rangeRes.body, 'Hello');
  assert.strictEqual(rangeRes.headers['content-length'], '5');
  console.log('✓ HTTP 206 Range seeking verified');

  console.log('8. Testing Visitor and Device tracking...');
  const tracker = server.getTracker();
  const devices = tracker.getDevices();
  assert(devices.length >= 1, 'At least 1 device should be recorded');
  assert.strictEqual(devices[0].isActive, true);
  console.log('✓ Device tracking verified:', devices[0].ip, 'requests:', devices[0].requestCount);

  console.log('9. Testing Password Protection Gate...');
  settings.passwordProtection = true;
  settings.password = 'secret-share-pwd';

  // Request should now be rejected without auth
  const unauthBrowse = await makeRequest('/api/browse?folder=folder-1');
  assert.strictEqual(unauthBrowse.status, 401, 'Protected share must return 401');

  // Submit correct password
  const authRes = await makeRequest('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'secret-share-pwd' }),
  } as any);
  assert.strictEqual(authRes.status, 200);
  const authJson = JSON.parse(authRes.body);
  assert(authJson.token, 'Should receive session token');

  // Request with token in Authorization header
  const authedBrowse = await makeRequest('/api/browse?folder=folder-1', {
    headers: { Authorization: `Bearer ${authJson.token}` },
  });
  assert.strictEqual(authedBrowse.status, 200, 'Authenticated request must succeed');
  console.log('✓ Password protection verified');

  console.log('10. Testing server shutdown...');
  await server.stop();
  assert.strictEqual(server.isRunning(), false, 'Server should be stopped');
  console.log('✓ Server cleanly shut down');

  // Clean test fixtures
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log('\n--- ALL 10 LOCAL SERVER TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
