#!/usr/bin/env node

/**
 * Simple service connectivity test without browser dependencies
 */

const http = require('http');

function testEndpoint(url, name) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✓ ${name}: OK (${res.statusCode})`);
          resolve({ success: true, data, status: res.statusCode });
        } else {
          console.log(`✗ ${name}: Failed (${res.statusCode})`);
          resolve({ success: false, data, status: res.statusCode });
        }
      });
    });

    request.on('error', (err) => {
      console.log(`✗ ${name}: Error - ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    request.setTimeout(5000, () => {
      console.log(`✗ ${name}: Timeout`);
      request.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Pokédex Services...\n');

  const tests = [
    { url: 'http://localhost:3000/health', name: 'Backend Health' },
    { url: 'http://localhost:3000/api/pokemon', name: 'Pokemon API' },
    { url: 'http://localhost:3000/api/pokemon/1', name: 'Pokemon Detail API' },
    { url: 'http://localhost:8081/', name: 'Frontend' },
  ];

  const results = [];

  for (const test of tests) {
    const result = await testEndpoint(test.url, test.name);
    results.push({ ...test, ...result });
  }

  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 All services are running correctly!');
    console.log('\nYou can now run the full E2E test suite:');
    console.log('cd e2e && npm test');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some services are not accessible.');
    console.log('Make sure Docker Compose is running: docker-compose up -d');
    process.exit(1);
  }
}

runTests().catch(console.error);